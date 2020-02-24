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

let isLoop = true;

let coins = [];
let uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights'],
    {
        diffuse: { type: 'c', value: new THREE.Color(0xf2cb01) },
        uTime: { value: 0 }
    }
]);

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

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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
    createLights();
    loadOBJ();

}

// 創建相機
function createCamera() {

    let fov = 60;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(200, 50, 0);
    camera.lookAt(scene.position);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    let pointLight = new THREE.PointLight(0x999999, 0.5);
    pointLight.position.set(100, 100, 100);
    pointLight.lookAt(scene.position);
    scene.add(pointLight);

    pointLight = new THREE.PointLight(0x999999, 0.5);
    pointLight.position.set(-100, 100, 100);
    pointLight.lookAt(scene.position);
    scene.add(pointLight);

}

function loadOBJ() {
    let OBJload = new OBJLoader();
    OBJload.load("coin/coin.obj", function (obj) {
        createCoins(obj);
    });
}

function createCoins(obj) {

    let geo = obj.children[0].geometry;

    geo.computeVertexNormals();
    geo.computeBoundingBox();

    // let mat = new THREE.ShaderMaterial({
    //     uniforms: uniforms,
    //     vertexShader: document.getElementById("vertex").textContent,
    //     fragmentShader: document.getElementById('fragment').textContent,
    //     side: THREE.DoubleSide,
    //     lights: true,
    //     flatShading: true
    // });

    console.log(geo);

    let loader = new THREE.TextureLoader();
    let mat = new THREE.MeshStandardMaterial({
        map: loader.load('coin/coin-texture.jpg')
    });

    let x, z;
    for (x = -24; x < 5; x++) {
        for (z = -4; z < 5; z++) {
            coins.push(createCoin(geo, mat, x, z));
        }
    }

}

function createCoin(geo, mat, x, z) {

    let coin = new THREE.Mesh(geo, mat);

    coin.position.z = geo.boundingBox.max.z * 10 * 1.5 * (2 * z - (Math.abs(x) % 2));
    coin.position.x = geo.boundingBox.max.x * 10 * 2 * x;
    let distance = Math.sqrt(coin.position.z * coin.position.z + coin.position.x * coin.position.x);
    coin.animationDelay = distance * 0.005 + 0.3;
    coin.position.y = -10;
    coin.scale.multiplyScalar(6);
    scene.add(coin);
    coinAnimation(coin);

    return coin;

}

function coinAnimation(coin) {
    TweenMax.to(coin.position, 3, { y: 25, ease: Elastic.easeOut, delay: coin.animationDelay });
    TweenMax.to(coin.rotation, 0.6, { y: 2 * Math.PI, z: Math.PI / 2, ease: Quint.easeInOut, delay: coin.animationDelay });
    TweenMax.to(coin.position, 2.4, { y: -10, ease: Elastic.easeIn, delay: coin.animationDelay + 1.5 });
    TweenMax.to(coin.rotation, 0.8, {
        y: 4 * Math.PI,
        z: 0,
        ease: Quint.easeInOut,
        delay: coin.animationDelay + 3.1,
        onComplete: repeatTweenAnimation.bind(window, coin)
    });
}

function repeatTweenAnimation(coin) {
    coin.rotation.y = 0;
    TweenMax.to(coin.position, 3, { y: 25, ease: Elastic.easeOut, delay: 3 });
    TweenMax.to(coin.rotation, 0.6, { y: 2 * Math.PI, z: Math.PI / 2, ease: Quint.easeInOut, delay: 3 });
    TweenMax.to(coin.position, 2.4, { y: -10, ease: Elastic.easeIn, delay: 3 + 2 });
    TweenMax.to(coin.rotation, 0.8, {
        y: 4 * Math.PI,
        z: 0,
        ease: Quint.easeInOut,
        delay: 3 + 2 + 1.6,
        onComplete: repeatTweenAnimation.bind(window, coin)
    });
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

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}
