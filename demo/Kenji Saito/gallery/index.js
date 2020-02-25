import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

class Triangle {
    constructor(parentIndex, index, x0, y0, x1, y1, x2, y2) {
        let unit = 3;
        this.parentIndex = parentIndex;
        this.index = index;

        // p 當前位置, o 畫展位置, r 初始位置
        this.p0 = new THREE.Vector3(x0 * unit, y0 * unit, 0);
        this.o0 = this.p0.clone();
        this.r0 = new THREE.Vector3();

        this.p1 = new THREE.Vector3(x1 * unit, y1 * unit, 0);
        this.o1 = this.p1.clone();
        this.r1 = new THREE.Vector3();

        this.p2 = new THREE.Vector3(x2 * unit, y2 * unit, 0);
        this.o2 = this.p2.clone();
        this.r2 = new THREE.Vector3();

        this.center = new THREE.Vector3(
            (this.o0.x + this.o1.x + this.o2.x) / 3,
            (this.o0.y + this.o1.y + this.o2.y) / 3,
            (this.o0.z + this.o1.z + this.o2.z) / 3,
        );

        this.dVec = new THREE.Vector3(this.center.x - this.p0.x, this.center.y - this.p0.y, this.center.z - this.p0.z);
        this.rad = 0.5 + 0.5 * Math.random();
        this.rate = 1;

        this.setRandom();
        this.p0.copy(this.r0);
        this.p1.copy(this.r1);
        this.p2.copy(this.r2);

    }

    setRandom() {
        // let rateX = this.center.x / 32;
        // let rateZ = this.center.y / 18;

        // let randomX = 30 * rateX;
        // let randomZ = 30 * rateZ - 200;
        let y = -120;

        let random = Math.PI * 2 * Math.random();
        let randomRad = 15 * Math.random();
        let randomTheta = 2 * Math.PI * Math.random();
        let randomXX = randomRad * Math.cos(randomTheta);
        let randomZZ = randomRad / 2 * Math.sin(randomTheta);

        for (let i = 0; i < 3; i++) {
            let theta = random + 1 / 3 * Math.PI * 2 * i;
            let x = this.rad * Math.cos(theta) + randomXX + (this.parentIndex - 1) * 40;
            let z = this.rad * Math.sin(theta) + randomZZ - 200;

            if (i = 0) this.r0.set(x, y, z);
            if (i = 1) this.r1.set(x, y, z);
            if (i = 2) this.r2.set(x, y, z);
        }
    }

    updateLoop(dt, verticeAttribute) {
        let random0 = 0;
        let random1 = 0;
        let random2 = 0;

        verticeAttribute.setXYZ(this.index * 3, this.p0.x + random0, this.p0.y + random0, this.p0.z + random0);
        verticeAttribute.setXYZ(this.index * 3 + 1, this.p1.x + random1, this.p1.y + random1, this.p1.z + random1);
        verticeAttribute.setXYZ(this.index * 3 + 2, this.p2.x + random2, this.p2.y + random2, this.p2.z + random2);
    }

    backToInitState() {
        // let duration = 1;
        let delay = 0; //0.5 * Math.random(); //0.6 + 0.4 * Math.random(); //Math.random() * 2 + 1;
        let random = 0.4 + 0.4 * Math.random(); //duration - delay;//0.4 + 0.4 * Math.random();
        if (this.tl0) this.tl0.pause();
        if (this.tl1) this.tl1.pause();
        if (this.tl2) this.tl2.pause();
        if (this.tl3) this.tl3.pause();

        this.tl0 = TweenLite.to(this.p0, random + 0.1 * Math.random(), { x: this.o0.x, y: this.o0.y, z: this.o0.z, delay: delay, ease: Quint.easeInOut });
        this.tl1 = TweenLite.to(this.p1, random + 0.1 * Math.random(), { x: this.o1.x, y: this.o1.y, z: this.o1.z, delay: delay, ease: Quint.easeInOut });
        this.tl2 = TweenLite.to(this.p2, random + 0.1 * Math.random(), { x: this.o2.x, y: this.o2.y, z: this.o2.z, delay: delay, ease: Quint.easeInOut });
        this.tl3 = TweenLite.to(this, 1.0, { rate: 0, delay: delay });
    }

    backToWall() {
        //var duration = 1;
        //var delay = 0.5 * Math.random(); //0.6 + 0.4 * Math.random(); //Math.random() * 2 + 1;
        //var random = duration - delay;
        var delay = 0; //0.6 + 0.4 * Math.random(); //Math.random() * 2 + 1;
        var random = 0.4 + 0.4 * Math.random();
        if (this.tl0) this.tl0.pause();
        if (this.tl1) this.tl1.pause();
        if (this.tl2) this.tl2.pause();
        if (this.tl3) this.tl3.pause();


        this.tl0 = TweenLite.to(this.p0, random + 0.1 * Math.random(), { x: this.r0.x, y: this.r0.y, z: this.r0.z, delay: delay, ease: Quint.easeInOut });
        this.tl1 = TweenLite.to(this.p1, random + 0.1 * Math.random(), { x: this.r1.x, y: this.r1.y, z: this.r1.z, delay: delay, ease: Quint.easeInOut });
        this.tl2 = TweenLite.to(this.p2, random + 0.1 * Math.random(), { x: this.r2.x, y: this.r2.y, z: this.r2.z, delay: delay, ease: Quint.easeInOut });
        this.tl3 = TweenLite.to(this, 1.0, { rate: 1, delay: delay });
    }
}

class CustomGeometry extends THREE.BufferGeometry {
    constructor(parentIndex, width, height) {
        super();

        this.xSize = width / 50;
        this.ySize = height / 50;

        this.halfX = this.xSize / 2;
        this.halfY = this.ySize / 2;
        this.bufferSize = (this.xSize + 1) * (this.ySize + 1);

        let vertices = new Float32Array(this.bufferSize * 3 * 6);
        this.triangles = [];

        let uvs = new Float32Array(this.bufferSize * 2 * 6);

        let uvNum = 0;
        let index = 0;
        for (let y = 0; y < this.ySize; y++) {
            for (let x = 0; x < this.xSize; x++) {

                this.triangles.push(
                    new Triangle(
                        parentIndex,
                        index++,
                        x - this.halfX,
                        y - this.halfY,
                        x - this.halfX,
                        y + 1 - this.halfY,
                        x + 1 - this.halfX,
                        y - this.halfY
                    )
                );
                this.triangles.push(
                    new Triangle(
                        parentIndex,
                        index++,
                        x + 1 - this.halfX,
                        y + 1 - this.halfY,
                        x + 1 - this.halfX,
                        y - this.halfY,
                        x - this.halfX,
                        y + 1 - this.halfY
                    ));

                uvs[uvNum++] = x / this.xSize;
                uvs[uvNum++] = y / this.ySize;

                uvs[uvNum++] = x / this.xSize;
                uvs[uvNum++] = (y + 1) / this.ySize;

                uvs[uvNum++] = (x + 1) / this.xSize;
                uvs[uvNum++] = y / this.ySize;

                uvs[uvNum++] = (x + 1) / this.xSize;
                uvs[uvNum++] = (y + 1) / this.ySize;

                uvs[uvNum++] = (x + 1) / this.xSize;
                uvs[uvNum++] = y / this.ySize;

                uvs[uvNum++] = (x) / this.xSize;
                uvs[uvNum++] = (y + 1) / this.ySize;

            }
        }

        this.verticesAttribute = new THREE.BufferAttribute(vertices, 3);
        this.setAttribute('position', this.verticesAttribute);

        this.uvAttribute = new THREE.BufferAttribute(uvs, 2);
        this.setAttribute('uv', this.uvAttribute);
    }

    updateLoop(dt) {
        this.triangles.forEach(function (triangle) {
            triangle.updateLoop(dt, this.verticesAttribute);
        }.bind(this));
        this.verticesAttribute.needsUpdate = true;
    }

    backToInitState() {
        this.triangles.forEach(function (triangle) {
            //triangle.updateLoop(dt, this.verticesAttribute);
            triangle.backToInitState();
        }.bind(this));
    }

    backToWall() {
        this.triangles.forEach(function (triangle) {
            //triangle.updateLoop(dt, this.verticesAttribute);
            triangle.backToWall();
        }.bind(this));
    }
}

class CustomMat extends THREE.ShaderMaterial {
    constructor(tex) {
        let uniforms = {
            tMap: { type: 't', value: tex }
        }
        super({
            uniforms: uniforms,
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent
        });
        this.side = THREE.DoubleSide;
        this.depthWrite = false;
        // this.uniforms = uniforms;
    }
}

class CustomMesh extends THREE.Mesh {
    constructor(index, texture) {
        super(new CustomGeometry(index, texture.image.width, texture.image.height), new CustomMat(texture));
    }
    updateLoop(dt) {
        this.geometry.updateLoop(dt);
    }
    backToInitState() {
        this.geometry.backToInitState();
    }
    backToWall() {
        this.geometry.backToWall();
    }
    animate() {
        this.isNormal = !this.isNormal;
        if (this.isNormal) {
            this.backToInitState();
        } else {
            this.backToWall();
        }
    }
}

let meshArr = [];
let meshURLArr = [
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/portrait00.jpg",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/portrait01.jpg",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/portrait02.jpg",
];
let meshCount = 0;
let click = 0;

let time = new THREE.Clock();
let isAnimation = true;

let light;

//建立場景
function init() {

    createRenderer();
    createScene();

    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    createCamera();
    createLights();
    loadImage();

}

// 創建相機
function createCamera() {

    let fov = 50;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 200;

}

// 創建光源
function createLights() {

    light = new THREE.PointLight(0xffffff, 1);
    light.position.copy(camera.position);
    scene.add(light);

}

function loadImage() {
    let loader = new THREE.TextureLoader();
    loader.crossOrigin = "Anonymous";
    meshURLArr.forEach(url => {
        loader.load(url, texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            let mesh = new CustomMesh(meshCount, texture);

            meshArr.push(mesh);
            scene.add(mesh);
            meshCount++;

            console.log(mesh.position);

        })
    })
}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function update() {
    let dt = time.getDelta();

    meshArr.forEach(mesh => {
        mesh.updateLoop(dt);
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
    window.addEventListener('click', changeImg);

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}

function changeImg() {
    let prevCount = click;
    click = (click + 1) % meshArr.length;

    meshArr[prevCount].backToWall(); // 回到原位
    meshArr[click].backToInitState(); // 展開畫布
}