import * as THREE from '../../../../three.js/build/three.module.js';

// import Stats from '../../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;
let clock = new THREE.Clock();

let tUniform = {
    time: {
        type: 'f',
        value: 0.1
    },
    resolution: {
        type: 'v2',
        value: new THREE.Vector2(container_width, container_height)
    },
    mouse: {
        type: 'v4',
        value: new THREE.Vector2()
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

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xc4c4c4);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(500);
    // scene.add(axes);

    createCamera();
    LoadGLSL();

}

// 創建相機
function createCamera() {

    let fov = 75;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 100;
    // camera.lookAt(scene.position);

}

function LoadGLSL() {

    let loader = new THREE.FileLoader();
    loader.load('glsl/vs.glsl', (vs) => {
        loader.load('glsl/fs.glsl', (fs) => {
            createSea(vs, fs);
        });
    });

}

function createSea(vs, fs) {

    let mat = new THREE.ShaderMaterial({
        uniforms: tUniform,
        vertexShader: vs,
        fragmentShader: fs
    });
    let geo = new THREE.PlaneBufferGeometry(container_width, container_height, 40);
    let mesh = new THREE.Mesh(geo, mat);
    
    scene.add(mesh);

}

init();

// 渲染更新
function render() {

    tUniform.time.value += clock.getDelta();

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

    // renderer.domElement.addEventListener('mousedown', onMouseDown);
    // renderer.domElement.addEventListener('mouseup', onMouseUp);

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}

function onMouseDown(e) {
    
    let canvas = renderer.domElement;
    let rect = canvas.getBoundingClientRect();
    tUniform.mouse.value.x = (e.clientX - rect.left) / container_width * 2 - 1;
    tUniform.mouse.value.y = (e.clientY - rect.top) / container_height * -2 + 1;
}

function onMouseUp(e) {
    let canvas = renderer.domElement;
    let rect = canvas.getBoundingClientRect();
    tUniform.mouse.value.z = (e.clientX - rect.left) / container_width * 2 - 1;
    tUniform.mouse.value.w = (e.clientY - rect.top) / container_height * -2 + 1;
}