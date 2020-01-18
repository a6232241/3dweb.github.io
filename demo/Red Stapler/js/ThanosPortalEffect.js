import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
// let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let loader = new THREE.TextureLoader();

let clock = new THREE.Clock();

let portalParticles = [];
let smokeParticles = [];
let portalLight;

//建立場景
function init() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5000);
    // scene.add(axes);

    createCamera();
    createLights();
    createParticleSetup();
    createPotalLight();
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

    let fov = 80;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.lookAt(scene.position);
    camera.position.z = 1000;

}

// 創建光源
function createLights() {

    // scene.add(new THREE.AmbientLight(0xffffff));

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 0, 1);
    scene.add(dirLight);

}

// 製造煙霧效果
function createParticleSetup() {

    loader.load("assets/smoke.png", (texture) => {

        let portalGeo = new THREE.PlaneBufferGeometry(350, 350);
        let portalMat = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
        });

        let smokeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
        let smokeMat = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
        });

        for (let p = 880; p > 250; p--) {

            let particle = new THREE.Mesh(portalGeo, portalMat);
            particle.position.set(
                0.5 * p * Math.cos((4 * p * Math.PI) / 180),
                0.5 * p * Math.sin((4 * p * Math.PI) / 180),
                0.1 * p
            );
            particle.rotation.z = Math.random() * 360;
            portalParticles.push(particle);
            scene.add(particle);

        }

        for (let p = 0; p < 40; p++) {

            let smoke = new THREE.Mesh(smokeGeo, smokeMat);
            smoke.position.set(
                Math.random() * 1000 - 500,
                Math.random() * 400 - 200,
                25
            );
            smoke.rotation.z = Math.random() * 360;
            smoke.material.opacity = 0.4;
            smokeParticles.push(smoke);
            scene.add(smoke);

        }

    });

}

// 創造portalLight
function createPotalLight() {

    portalLight = new THREE.PointLight(0x062d89, 30, 600, 2);
    portalLight.position.set(0, 0, 250);
    scene.add(portalLight);

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);

    container.appendChild(renderer.domElement);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function update() {

    let delta = clock.getDelta();
    portalParticles.forEach(p => {
        p.rotation.z -= delta * 1.5;
    });
    smokeParticles.forEach(p => {
        p.rotation.z -= delta * 1.5;
    });

    if (Math.random() > 0.9) {
        portalLight.power = 350 + Math.random() * 500;
    }

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.autoRotate = true;
    // controls.autoRotateSpeed = 1;
    controls.addEventListener('change', renderer);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    controls.update();

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