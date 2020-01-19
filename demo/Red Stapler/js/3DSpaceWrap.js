import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
// let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let starGeo, star, stars;
let loader = new THREE.TextureLoader();

//建立場景
function init() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createStars();
    createRenderer();
    // createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        update();
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
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

// 創造星星
function createStars(){

    starGeo = new THREE.Geometry();
    for(let i = 0; i< 6000; i++){
        star = new THREE.Vector3(
            Math.random()*600-300,
            Math.random()*600-300,
            Math.random()*600-300
        );
        star.velocity = 0;
        star.acceleration = 0.02;
        starGeo.vertices.push(star);
    }

    let sprite = loader.load("assets/star.png");
    let starMat = new THREE.PointsMaterial({
        map: sprite,
        color: 0xffffff,
        size: 0.7
    });

    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
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

function update(){

    starGeo.vertices.forEach( p => {
        p.velocity += p.acceleration;
        p.y -= p.velocity;
        if(p.y < -200) {
            p.y = 200;
            p.velocity = 0;
        }
    })

    starGeo.verticesNeedUpdate = true;
    stars.rotation.y += 0.002;

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