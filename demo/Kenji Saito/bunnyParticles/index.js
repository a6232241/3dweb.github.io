import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '../../../three.js/examples/jsm/loaders/OBJLoader.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;
let clock = new THREE.Clock();
let time = 0;
let isLoop = true;

let objLoader = new OBJLoader();
let objUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/bunny.obj";
let MAX_COUNT = 60000;
let utils = {
    range: (min, max) => {
        return min + (max - min) * Math.random();
    }
}

let targetArr = [];
let particles = [];
let AttributePos = [];

class Particle {
    constructor(x, y, z, index, targetIndex) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.prevX = this.x;
        this.prevY = this.y;
        this.prevZ = this.z;
        this.index = index;
        this.targetIndex = targetIndex;
    }

    // 將this的xyz移動到targetPos的xyz
    updateTarget(isDelay) {
        this.targetIndex = (this.targetIndex + 1) % targetArr.length;
        let targetPos = targetArr[this.targetIndex];
        TweenMax.to(this, 2, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            delay: isDelay ? utils.range(0, 2) : 0.0,
            onUpdate: this.onUpdateParticle,
            onUpdateScope: this,
            onComplete: this.updateTarget,
            onCompleteScope: this
        });
    }

    onUpdateParticle() {
        AttributePos.setXYZ(this.index * 2, this.prevX, this.prevY, this.prevZ);
        AttributePos.setXYZ(this.index * 2 + 1, this.x, this.y, this.z);

        this.prevX = this.x;
        this.prevY = this.y;
        this.prevZ = this.z;

    }

}

//建立場景
function init() {

    createRenderer();
    createScene();

    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    // createLights();
    createObject();

}

// 創建相機
function createCamera() {

    let fov = 75;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.y = 20;
    camera.position.z = 50;

}

function createObject() {
    objLoader.load(objUrl, (obj) => {
        createMesh(obj);
        TweenMax.ticker.addEventListener('tick', loop);
    });
}

function createMesh(obj) {

    let mat = new THREE.LineBasicMaterial({
        color: new THREE.Color('rgb(' + parseInt(0.2 * 255) + ', ' + parseInt(0.3 * 255) + ', ' + parseInt(0.4 * 255) + ')'),
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.6
    });

    let geo = obj.children[0].geometry;

    let indices = [];
    let positions = new Float32Array(MAX_COUNT * 3);
    let posArr = geo.attributes.position.array;
    let posCount = posArr.length / 3;
    let scale = 150;
    let size = 0.1;

    // 將obj的position距離放大，並存至targetArr
    for (let i = 0; i < posCount; i++) {
        let pos = new THREE.Vector3(
            posArr[3 * i + 0] * scale,
            posArr[3 * i + 1] * scale,
            posArr[3 * i + 2] * scale
        );

        targetArr.push(pos);
    }

    // 粒子數減半增加效能
    for (let i = 0; i < MAX_COUNT / 2; i++) {

        // 隨機找出targetArr其中的position
        let index = parseInt(targetArr.length * Math.random());
        let pos = targetArr[index];

        particles[i] = new Particle(pos.x, pos.y, pos.z, i, index);

        if (Math.random() < 0.9) {
            particles[i].updateTarget(true);
        }

        positions[6 * i + 0] = pos.x;
        positions[6 * i + 1] = pos.y;
        positions[6 * i + 2] = pos.z;

        positions[6 * i + 3] = pos.x + utils.range(-size, size);
        positions[6 * i + 4] = pos.y + utils.range(-size, size);
        positions[6 * i + 5] = pos.z + utils.range(-size, size);

        indices.push(2 * i);
        indices.push(2 * i + 1);

    }

    geo = new THREE.BufferGeometry();
    AttributePos = new THREE.BufferAttribute(positions, 3);
    geo.setAttribute('position', AttributePos);
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

    let line = new THREE.LineSegments(geo, mat);
    line.position.set(5, -15, 0);
    scene.add(line);

}

function loop(){
    let delta = clock.getDelta();
    time += delta;

    AttributePos.needsUpdate = true;

    camera.position.z = 20 * Math.cos(time / 3);
    camera.position.x = 20 * Math.sin(time / 3);
    camera.lookAt(scene.position);
}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

}

function createEvent() {

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', animationControl);

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}

function animationControl(e){
    switch(e.keyCode){
        case 27: // Esc
            isLoop = !isLoop;
            if(isLoop){
                clock.start();
                TweenMax.ticker.addEventListener('tick', loop);
            }else{
                clock.stop();
                TweenMax.ticker.removeEventListener('tick', loop);
            }
            break;
    }
}