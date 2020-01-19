import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let loader = new THREE.TextureLoader();

let cloudParticles = [];
let flash, rain, rainGeo;
let rainCount = 15000;

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x11111f, 0.002);

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createDarkClouds();
    createFlash();
    createRaining();
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
    // camera.lookAt(scene.position);
    camera.position.z = 10;
    camera.rotation.set(1.16, -0.12, 0.27);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0x555555));

    let dirLight = new THREE.DirectionalLight(0xffeedd);
    dirLight.position.set(0, 0, 1);
    scene.add(dirLight);

}

// 創造烏雲
function createDarkClouds() {

    loader.load('assets/cloud.png', (texture) => {

        let cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
        let cloudMat = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
        });

        for (let p = 0; p < 250; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(
                Math.random() * 800 - 400,
                500,
                Math.random() * 500 - 450
            );
            cloud.rotation.set(1.16, -0.12, Math.random() * 360);
            cloud.material.opacity = 0.2;
            cloudParticles.push(cloud);
            scene.add(cloud);
        }
    });

}

// 創造閃電
function createFlash() {
    flash = new THREE.PointLight(0x062d89, 30, 500, 2);
    flash.position.set(200, 300, 100);
    scene.add(flash);
}

// 創造下雨
function createRaining() {

    rainGeo = new THREE.Geometry();
    for (let i = 0; i < rainCount; i++) {
        let rainDrop = new THREE.Vector3(
            Math.random() * 400 - 200,
            Math.random() * 500 - 250,
            Math.random() * 400 - 200
        );
        rainDrop.velocity = {};
        rainDrop.velocity = 0;
        rainGeo.vertices.push(rainDrop);
    }

    let rainMat = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.1,
        transparent: true
    });

    rain = new THREE.Points(rainGeo, rainMat);
    scene.add(rain);

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(scene.fog.color);

    container.appendChild(renderer.domElement);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function update() {

    cloudParticles.forEach(p => {
        p.rotation.z -= 0.002;
    });

    if (Math.random() > 0.93 || flash.power > 100) {
        if (flash.power < 100) {
            flash.position.set(
                Math.random() * 400,
                Math.random() * 200 + 300,
                100
            );
        }
        flash.power = Math.random() * 500 + 50;
    }

    rainGeo.vertices.forEach(p => {
        p.velocity -= Math.random() * 0.1 + 0.1;
        p.y += p.velocity;
        if (p.y < -200) {
            p.y = 200;
            p.velocity = 0;
        }
    });
    rainGeo.verticesNeedUpdate = true;
    rain.rotation.y += 0.002;
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