import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let loader = new THREE.CubeTextureLoader();
let urls = [
    'posx.jpg', 'negx.jpg',
    'posy.jpg', 'negy.jpg',
    'posz.jpg', 'negz.jpg',
];
let sphereCamera;

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.background = loader.setPath('assets/GoldenGateBridge3/').load(urls);

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createSphere();
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

    let fov = 70;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 5000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 400, 1000);

    near = 1;
    far = 1000;
    let cubeResolution = 500;
    sphereCamera = new THREE.CubeCamera(near, far, cubeResolution);
    sphereCamera.position.set(0, 100, 0);
    scene.add(sphereCamera);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createSphere() {

    let sphereGeo = new THREE.SphereBufferGeometry(350, 50, 50);
    let sphereMat = new THREE.MeshBasicMaterial({ envMap: sphereCamera.renderTarget.texture });
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);
    sphereCamera.update(renderer,scene);
    controls.update(); // 適用於改變相機時使用，例如 enableDamping、autoRotate

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.rotateSpeed = 1;

}

function createEvent() {

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}