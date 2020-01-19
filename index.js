import * as THREE from '../three.js/build/three.module.js';

import Stats from '../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

// let containerHalfX = container.clientWidth / 2;
// let containerHalfY = container.clientHeight / 2;

//建立場景
function init() {

    scene = new THREE.Scene();

    let axes = new THREE.AxesHelper(5);
    scene.add(axes);

    createCamera();
    createLights();
    createRenderer();
    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

// 創建相機
function createCamera() {

    let fov = 65;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 50;

    // let left = - container_width * 3;
    // let right = container_width * 3;
    // let top = container_height * 3;
    // let bottom = - container_height * 3;
    // let near = 1, far = 1000;
    // camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    // camera.position.z = 1000;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

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

function createEvent(){

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize(){

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    // camera.left = -containerHalfX;
    // camera.right = containerHalfX;
    // camera.top = containerHalfY;
    // camera.bottom = -containerHalfY;
    // camera.updateProjectionMatrix();

    renderer.setSize( container_width, container_height );

}