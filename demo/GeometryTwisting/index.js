import * as THREE from '../../three.js/build/three.module.js';

// import Stats from '../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let geo;

let degrees = 90;
let twistAmount = 10;

//建立場景
function init() {

    scene = new THREE.Scene();

    let axes = new THREE.AxesHelper(50);
    scene.add(axes);

    createCamera();
    createLights();
    createBox();
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
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 20, 40);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createBox() {

    geo = new THREE.BoxGeometry(20, 20, 20, 20, 20, 20);
    let mat = new THREE.MeshNormalMaterial({ wireframe: true });
    let cube = new THREE.Mesh(geo, mat);
    scene.add(cube);

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

    if(degrees >= 0){
        degrees --;
    }else{
        degrees = 180;
        twistAmount *= -1;
    }
    twist(geo);
    renderer.render(scene, camera);

}

function twist(geometry) {

    let quaternion = new THREE.Quaternion();
    
    let upVec = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < geometry.vertices.length; i++) {

        // 頂點的Y位置
        let posY = geometry.vertices[i].y;

        quaternion.setFromAxisAngle(upVec, (Math.PI / 180) * (posY / twistAmount));

        // posY > 3? twistAmount = -20 : twistAmount = 20;
        // console.log(posY);

        geometry.vertices[i].applyQuaternion(quaternion);
    }

    geometry.verticesNeedUpdate = true;

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

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