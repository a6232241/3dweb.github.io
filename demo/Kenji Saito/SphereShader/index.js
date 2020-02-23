import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let clock = new THREE.Clock();
let time = 0;
let mesh;
// let _inc = 1;
let isLoop = true;

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

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

function createScene(){

    scene = new THREE.Scene();

    createCamera();
    createLights();
    createMesh();

}

// 創建相機
function createCamera() {

    let fov = 60;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1000;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createMesh(){
    let rad = 200;
    let geo = new THREE.SphereBufferGeometry(rad, 40, 40);
    let mat = new THREE.RawShaderMaterial({
        uniforms: {
            uRad: {value: rad},
            uTime: {value: 0},
            uDistance: {value: 1000}
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        transparent: true,
        side: THREE.DoubleSide
    });
    mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    TweenMax.ticker.addEventListener('tick', loop);
}

function loop(){

    let delta = clock.getDelta();
    time += delta;

    mesh.material.uniforms.uTime.value = time;
    // mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    if(mesh.material.uniforms.uTime.value > 12 ) {
        time = 0;
    }

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
    window.addEventListener('keydown', animationControl);

}

function onWindowResize(){

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize( container_width, container_height );

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