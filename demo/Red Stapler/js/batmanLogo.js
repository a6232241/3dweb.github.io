// import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from '../../../three.js/examples/jsm/loaders/GLTFLoader.js';

// import * as POSTPROCESSING from '../../../three.js/postprocessing/build/postprocessing.esm.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let circle;
let composer, loader = new GLTFLoader();

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);

    // let axes = new THREE.AxesHelper(5000);
    // scene.add(axes);

    createCamera();
    createLights();
    createEntityLight();
    createBatmanLogo();
    // createGodRays();
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

    let fov = 60;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 50000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.lookAt(scene.position);
    camera.position.set(0, 310, 600);

}

// 創建光源
function createLights() {

    // scene.add(new THREE.AmbientLight(0xffffff));

    let dirLight = new THREE.DirectionalLight(0xffccaa, 3);
    dirLight.position.set(0, 0, -1);
    scene.add(dirLight);

}

// 創建實體光源
function createEntityLight() {

    let circleGeo = new THREE.CircleGeometry(220, 50);
    let circleMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
    circle = new THREE.Mesh(circleGeo, circleMat);
    circle.position.set(0, 100, -500);
    circle.scale.setX(1.2);
    scene.add(circle);

}

function createBatmanLogo() {

    loader.load("assets/batman_logo/scene.gltf", (gltf) => {
        let bat = gltf.scene.children[0];
        bat.scale.multiplyScalar(100);
        bat.position.set(160,-110,-100);
        scene.add(gltf.scene);
    })

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    createGodRays();

}

function createGodRays(){

    let areaImage = new Image();
    areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
    let searchImage = new Image();
    searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;

    let smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage,1);

    let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, circle, {
        resolutionScale: 1,
        density: 0.8,
        decay: 0.95,
        weight: 0.9,
        samples: 100
    });

    let renderPass = new POSTPROCESSING.RenderPass(scene,camera);
    let effectPass = new POSTPROCESSING.EffectPass(camera,godraysEffect);
    effectPass.renderToScreen = true;

    composer = new POSTPROCESSING.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(effectPass);

}

init();

// 渲染更新
function render() {

    // renderer.render(scene, camera);
    composer.render(0.1);

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;

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