// import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
// import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from "../../../three.js/examples/jsm/postprocessing/EffectComposer.js";
import { CopyShader } from "../../../three.js/examples/jsm/shaders/CopyShader.js";
import { ShaderPass } from "../../../three.js/examples/jsm/postprocessing/ShaderPass.js";
import { RenderPass } from "../../../three.js/examples/jsm/postprocessing/RenderPass.js";
import { LuminosityHighPassShader } from "../../../three.js/examples/jsm/shaders/LuminosityHighPassShader.js";
import { UnrealBloomPass } from "../../../three.js/examples/jsm/postprocessing/UnrealBloomPass.js";

let container = document.querySelector('#scene-container');
let camera, scene, renderer

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let composer, effectBloom;

// 自定義class
let observer;
let camControl;

let delta = 0, time = 0;

// drawing
let material, mesh, unifomrs;
let loader, textureLoader;
let textures;
let uniforms;

//建立場景
function init() {

    scene = new THREE.Scene();

    let axes = new THREE.AxesHelper(5);
    scene.add(axes);

    createCamera();
    createLights();
    createDraw();
    createRenderer();
    createComposer();
    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

// 創建相機
function createCamera() {

    camera = new THREE.Camera();
    camera.position.z = 1;

    let fov = 60.0;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 80000;
    observer = new Observer(fov,aspect,near,far);
    observer.distance = 8;
    scene.add(observer);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createDraw(){

    textureLoader = new THREE.TextureLoader();
    loader = new THREE.FileLoader();

    textures = {};

    // loadTexture('bg1','https://cdn.glitch.com/631097e7-5a58-45aa-a51f-cc6b44f8b30b%2Fmilkyway.jpg?1545745139132', THREE.NearestFilter);
    // loadTexture('star','https://cdn.glitch.com/631097e7-5a58-45aa-a51f-cc6b44f8b30b%2Fstars.png?1545722529872', THREE.LinearFilter);
    // loadTexture('disk','https://cdn.glitch.com/631097e7-5a58-45aa-a51f-cc6b44f8b30b%2FdQ.png?1545846159297', THREE.LinearFilter);

    // 屏幕框
    uniforms = {
        time: { type: "f", value: 0.0 },
        resolution: { type: "v2", value: new THREE.Vector2()},
        accretion_disk: {type: "b", value: false},
        use_disk_texture: {type: "b", value: true},
        lorentz_transform: {type: "b", value: false},
        doppler_shift: {type: "b", value: false},
        beaming: {type: "b", value: false},
        cam_pos: {type:"v3", value: new THREE.Vector3()},
        cam_vel: {type:"v3", value: new THREE.Vector3()},
        cam_dir: {type:"v3", value: new THREE.Vector3()},
        cam_up: {type:"v3", value: new THREE.Vector3()},
        fov: {type:"f", value: 0.0},
        cam_vel: {type:"v3", value: new THREE.Vector3()},
        bg_texture: {type: "t", value: null},
        star_texture: {type: "t", value: null},
        disk_texture: {type: "t", value:null}
    }

    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent
    });

    loader.load('0_current_tracer.glsl', (data) => {
        let defines = 
        `#define STEP 0.05
        #define NSTEPS 600
        `;
        material.fragmentShader = defines+data;
        material.fragmentShader.needsUpdate = true;
        material.needsUpdate = true;
        mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
        scene.add(mesh);
    })
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1.0);
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

}

function createComposer(){

    composer  = new EffectComposer(renderer);
    let renderPass = new RenderPass(scene,camera);

    effectBloom = new UnrealBloomPass(128,0.8,2.0,0.0);
    let scenePass = new RenderPass(scene,camera);
    let effectCopy = new ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    composer.addPass(renderPass);
    composer.addPass(effectBloom);
    composer.addPass(effectCopy);
}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function createControls() {

    camControl = new THREE.CameraDragControls(observer,render.domElement);

}

function createEvent(){

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize(){

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize( container_width, container_height );

}

window.onbeforeprint = () => {
    for(let i=0; i<textures.length;i++){
        textures[i].dispose()
    }
}