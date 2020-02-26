import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

// function App() {
const conf = {
    el: 'canvas',
    gravity: -0.1,
    nx: 32,
    ny: 40,
    size: 2,
    stiffness: 2,
    mouseRadius: 10,
    mouseStrength: 0.4
}
// }

const { randFloat: rnd, randFloatSpread: rndFS } = THREE.Math;
const mouse = new THREE.Vector2(), oldMouse = new THREE.Vector2();
const verlet = new VerletJS(), polylines = [];
const uCx = { value: 0 }, uCy = { value: 0 };

//建立場景
function init() {

    createRenderer();
    createScene();

    // createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    verlet.gravity = new Vec2(0, conf.gravity);
    verlet.width = 256;
    verlet.height = 256;

    let axes = new THREE.AxesHelper(5);
    scene.add(axes);

    createCamera();
    // createLights();
    onWindowResize();
    loadTexture();

}

// 創建相機
function createCamera() {

    // let fov = 65;
    // let aspect = container_width / container_height;
    // let near = 0.1;
    // let far = 1000;
    camera = new THREE.PerspectiveCamera();
    // camera.position.z = 50;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function loadTexture() {
    const loader = new THREE.TextureLoader();
    loader.load('https://klevron.github.io/codepen/misc/curtain.jpg', texture => {
        createCurtain(texture);
    })
}

function createCurtain(texture) {
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uCx,
            uCy,
            tDiffuse: { value: texture },
            uSize: { value: conf.size / conf.nx }
        },
        vertexShader: document.getElementById('vertex').textContent,
        fragmentShader: document.getElementById('fragment').textContent,
        transparent: true,
    });

    const dx = verlet.width / conf.nx;
    const dy = -verlet.height / (conf.ny - 1);
    const ox = -dx * (conf.nx / 2 - 0.5);
    const oy = verlet.height / 2;

    const cScale = chroma.scale([0x051924, 0xc00a1c]); // a ~ b 的顏色
    for (let i = 0; i < conf.nx; i++) {
        const points = [];
        const vpoints = [];
        for (let j = 0; j < conf.ny; j++) {
            const x = ox + i * dx;
            const y = oy + j * dy;
            
            points.push(new THREE.Vector3(x, y, 0));
            vpoints.push(new Vec2(x, y));
        }
        const polyline = new Polyline({
            points,
            color1: cScale(rnd(0, 1)),
            color2: cScale(rnd(0, 1)),
            uvx: (i + 1) / conf.nx,
            uvdx: conf.size / conf.nx
        })
        polylines.push(polyline);
        polyline.segment = verlet.lineSegments(vpoints, conf.stiffness);
        polyline.segment.pin(0);
        // polyline.segment.particles.forEach(p => { p.pos.x += rndFS(5); });

        const mesh = new THREE.Mesh(polyline.geometry, mat);
        scene.add(mesh);
    }

    for (let i = 0; i < verlet.width; i++) {
        const ox = -verlet.width / 2;
        setTimeout(() => {
            _move(new THREE.Vector2(ox + i, 0), new THREE.Vector2(ox + i + 1, 0));
        }, i * 15);
    }
}

init();

// 渲染更新
function render() {

    verlet.frame(16);
    updatePoints();
    renderer.render(scene, camera);

}

function updatePoints() {
    polylines.forEach(line => {
        for (let i = 0; i < line.points.length; i++) {
            const p = line.segment.particles[i].pos;
            line.points[i].x = p.x;
            line.points[i].y = p.y;
        }
        line.updateGeometry();
    });
}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

}

function createEvent() {

    window.addEventListener('resize', onWindowResize, false);

    if ('ontouchstart' in window) {
        document.addEventListener('touchstart', updateMouse, false);
        document.addEventListener('touchmove', move, false);
    } else {
        document.addEventListener('mouseenter', updateMouse, false);
        document.addEventListener('mousemove', move, false);
        // document.addEventListener('mouseup', updateColors, false);
    }

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    uCx.value = 2 / verlet.width;
    uCy.value = 2 / verlet.height;

    renderer.setSize(container_width, container_height);

}

function move(e) {
    updateMouse(e);
    _move(oldMouse, mouse);
}

function _move(oV, nV) {
    const v1 = new THREE.Vector2();
    const v2 = new THREE.Vector2();
    polylines.forEach(line => {
        for (let i = 0; i < line.points.length; i++) {
            const p = line.segment.particles[i].pos;
            const l = v1.copy(oV).sub(v2.set(p.x, p.y)).length();
            if (l < conf.mouseRadius) {
                v1.copy(nV).sub(oV).multiplyScalar(conf.mouseStrength);
                p.x += v1.x; p.y += v1.y;
            }
        }
    });
}

function updateMouse(e) {
    if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX;
        e.y = e.changedTouches[0].pageY;
    }
    if (e.x === undefined) {
        e.x = e.pageX;
        e.y = e.pageY;
    }

    oldMouse.copy(mouse);
    mouse.set(
        (e.x - container_width / 2) * verlet.width / container_width,
        (container_height / 2 - e.y) * verlet.height / container_height
    );
}

function updateColors() {
    const c1 = chroma.random();
    const c2 = chroma.random();
    const cScale = chroma.scale([c1, c2]);
    polylines.forEach(line => {
        line.color1 = cScale(rnd(0, 1));
        line.color2 = cScale(rnd(0, 1));
        const cScale1 = chroma.scale([line.color1, line.color2]);
        const colors = line.geometry.attributes.color.array;
        const c = new THREE.Color();
        for (let i = 0; i < line.count; i++) {
            c.set(cScale1(i / line.count).hex());
            c.toArray(colors, (i * 2) * 3);
            c.toArray(colors, (i * 2 + 1) * 3);
        }
        line.geometry.attributes.color.needsUpdate = true;
    });
}

const Polyline = (function(){
    const tmp = new THREE.Vector3();

    class Polyline {
        constructor(params){
            const { points, color1, color2, uvx, uvdx } = params;
            this.points = points;
            this.count = points.length;
            this.color1 = color1;
            this.color2 = color2;
            this.uvx = uvx;
            this.uvdx = uvdx;
            this.init();
            this.updateGeometry();
        }

        init(){
            const cScale = chroma.scale([this.color1, this.color2]);
            this.geometry = new THREE.BufferGeometry();
            this.position = new Float32Array(this.count * 3 * 2);
            this.prev = new Float32Array(this.count * 3 * 2);
            this.next = new Float32Array(this.count * 3 * 2);

            const side = new Float32Array(this.count * 1 * 2);
            const uv = new Float32Array(this.count * 2 * 2);
            const color = new Float32Array(this.count * 3 * 2);
            const index = new Uint16Array((this.count - 1) * 3 * 2);

            const c = new THREE.Color();
            for (let i = 0; i < this.count; i++) {
                const i2 = i * 2;
                side.set([-1, 1], i2);
                const v = 1 - i / (this.count - 1);
                // uv.set([0, v, 1, v], i * 4);
                uv.set([this.uvx, v, this.uvx - this.uvdx, v], i * 4);
        
                c.set(cScale(v).hex());
                c.toArray(color, i2 * 3);
                c.toArray(color, (i2 + 1) * 3);
        
                if (i === this.count - 1) continue;
                index.set([i2 + 0, i2 + 1, i2 + 2], (i2 + 0) * 3);
                index.set([i2 + 2, i2 + 1, i2 + 3], (i2 + 1) * 3);
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(this.position, 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
            this.geometry.setAttribute('prev', new THREE.BufferAttribute(this.prev, 3));
            this.geometry.setAttribute('next', new THREE.BufferAttribute(this.next, 3));
            this.geometry.setAttribute('side', new THREE.BufferAttribute(side, 1));
            this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
            this.geometry.setIndex(new THREE.BufferAttribute(index, 1));
        }

        updateGeometry() {
            this.points.forEach((p, i) => {
            p.toArray(this.position, i * 3 * 2);
            p.toArray(this.position, i * 3 * 2 + 3);
    
            if (!i) {
            tmp.copy(p).sub(this.points[i + 1]).add(p);
            tmp.toArray(this.prev, i * 3 * 2);
            tmp.toArray(this.prev, i * 3 * 2 + 3);
            } else {
            p.toArray(this.next, (i - 1) * 3 * 2);
            p.toArray(this.next, (i - 1) * 3 * 2 + 3);
            }
    
            if (i === this.points.length - 1) {
            tmp.copy(p).sub(this.points[i - 1]).add(p);
            tmp.toArray(this.next, i * 3 * 2);
            tmp.toArray(this.next, i * 3 * 2 + 3);
            } else {
            p.toArray(this.prev, (i + 1) * 3 * 2);
            p.toArray(this.prev, (i + 1) * 3 * 2 + 3);
            }
        });
    
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.prev.needsUpdate = true;
        this.geometry.attributes.next.needsUpdate = true;
        }
    }

    return Polyline;
})();