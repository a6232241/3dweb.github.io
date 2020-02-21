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

let clock = new THREE.Clock(), isLoop;
let center;
let mesh, mesh1, mesh2;
let objLoader, bunnyURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/bunny.obj";
let scale = 60;

function range(min, max) {
    return min + (max - min) * Math.random();
}

class CustomGeometry extends THREE.BufferGeometry {
    constructor(geometry, rd = 1, rd2 = 3) {
        super()

        let count = geometry.attributes.position.count;
        let timeArray = new Float32Array(count);
        let randomPosArray = new Float32Array(count * 3);

        for (let i = 0; i < count; i += 3) {
            let rand = rd2 * Math.random();
            timeArray[i + 0] = rand;
            timeArray[i + 1] = rand;
            timeArray[i + 2] = rand;

            let randomPosX = range(-rd, rd) + center.x;
            let randomPosY = range(-rd, rd) + center.y;
            let randomPosZ = range(-rd, rd) + center.z;

            randomPosArray[3 * i + 0] = randomPosArray[3 * i + 3] = randomPosArray[3 * i + 6] = randomPosX;
            randomPosArray[3 * i + 1] = randomPosArray[3 * i + 4] = randomPosArray[3 * i + 7] = randomPosY;
            randomPosArray[3 * i + 2] = randomPosArray[3 * i + 5] = randomPosArray[3 * i + 8] = randomPosZ;
        }

        this.setAttribute('aTime', new THREE.BufferAttribute(timeArray, 1));
        this.setAttribute('position', geometry.attributes.position);
        this.setAttribute('randomPos', new THREE.BufferAttribute(randomPosArray, 3));
    }
}

//建立場景
function init() {

    createRenderer();
    createScene();

    // createControls();
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
    createLights();
    createObj();

}

// 創建相機
function createCamera() {

    let fov = 75;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 200;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createObj() {

    objLoader = new OBJLoader();
    objLoader.load(bunnyURL, (obj) => {
        createMesh(obj);
        isLoop = true;
        TweenMax.ticker.addEventListener('tick', loop);
    });
}

function createMesh(obj){

    // 計算obj的邊界距離
    obj.children[0].geometry.computeBoundingBox();
    obj.children[0].geometry.computeBoundingSphere();
    center = obj.children[0].geometry.boundingBox.max.clone().add(obj.children[0].geometry.boundingBox.min).divideScalar(2);

    // 灰色幾何
    let mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: {value: 0},
            uCenter: {value: center},
            uColor: {value: new THREE.Vector3(1.0, 1.0, 1.0)},
            uAlpha: {value: 0.2},
        },
        vertexShader: document.getElementById('vertex').textContent,
        fragmentShader: document.getElementById('fragment').textContent,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    });

    let geo = new CustomGeometry(obj.children[0].geometry, 2, 1.8);

    let scale2 = scale / 1.5;
    mesh = new THREE.Mesh(geo, mat);
    mesh.scale.multiplyScalar(scale2);
    mesh.position.set( -center.x * scale2, -center.y * scale2, -center.z * scale2);
    scene.add(mesh);

    // 藍色幾何
    mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: {value: 0},
            uCenter: {value: center},
            uColor: {value: new THREE.Vector3(0.1, 0.2, 0.4)},
            uAlpha: {value: 0.75},
        },
        vertexShader: document.getElementById('vertex').textContent,
        fragmentShader: document.getElementById('fragment').textContent,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    });

    geo = new CustomGeometry(obj.children[0].geometry);

    mesh1 = new THREE.Mesh(geo, mat);
    mesh1.scale.multiplyScalar(scale);
    mesh1.position.set( -center.x * scale, -center.y * scale, -center.z * scale);
    scene.add(mesh1);

    // 紅色幾何
    mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: {value: 0},
            uCenter: {value: center},
            uColor: {value: new THREE.Vector3(0.3, 0.1, 0.2)},
            uAlpha: {value: 0.75},
        },
        vertexShader: document.getElementById('vertex').textContent,
        fragmentShader: document.getElementById('fragment').textContent,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    });

    geo = new CustomGeometry(obj.children[0].geometry);

    mesh2 = new THREE.Mesh(geo, mat);
    mesh2.scale.multiplyScalar(scale);
    mesh2.position.set( -center.x * scale, -center.y * scale, -center.z * scale);
    scene.add(mesh2);

}

let time = 0;
function loop(){

    let delta = clock.getDelta();
    time += delta;

    // 向obj移動的效果
    mesh1.material.uniforms.uTime.value = time;
    mesh2.material.uniforms.uTime.value = time;

    camera.position.z = 20 * Math.cos(time / 3);
    camera.position.x = 20 * Math.sin(time / 3);
    camera.lookAt(new THREE.Vector3());    

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

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