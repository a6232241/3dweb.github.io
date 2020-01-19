// import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
// let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let loader = new THREE.TextureLoader();

let cloudParticles = [];
let composer;

let clock = new THREE.Clock();

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03544e, 0.001);

    // let axes = new THREE.AxesHelper(5000);
    // scene.add(axes);

    createCamera();
    createLights();
    createNebulaCloud();
    createRenderer();
    // createControls();
    createEvent();

}

// 創建相機
function createCamera() {

    let fov = 60;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.lookAt(scene.position);
    camera.position.z = 1;
    camera.rotation.set(1.16, -0.12, 0.27);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0x555555));

    let dirLight = new THREE.DirectionalLight(0xff8c19);
    dirLight.position.set(0,0,1);
    scene.add(dirLight);

    let orangeLight = new THREE.PointLight(0xcc6600, 50, 450, 2);
    orangeLight.position.set(200,300,100);
    scene.add(orangeLight);

    let redLight = new THREE.PointLight(0xd8547e, 50, 450, 2);
    redLight.position.set(100,300,100);
    scene.add(redLight);

    let blueLight = new THREE.PointLight(0x3677ac, 50, 450, 2);
    blueLight.position.set(300,300,200);
    scene.add(blueLight);

}

// 創造星雲
function createNebulaCloud(){
    loader.load('assets/smoke.png', function(texture){
        let cloudGeo = new THREE.PlaneBufferGeometry(500,500);
        let cloudMat = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
        });

        for( let p=0; p<50; p++){
            let cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(
                Math.random()*800-400,
                500,
                Math.random()*500-500
            );
            cloud.rotation.set(1.16,-0.12,Math.random()*2*Math.PI);
            cloud.material.opacity = 0.6;
            cloudParticles.push(cloud);
            scene.add(cloud);
        }
    })
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(scene.fog.color);

    container.appendChild(renderer.domElement);

    createComposer();

}

function createComposer(){

    loader.load("assets/starrySky.jpg", function(texture){
        
        let textureEffect = new POSTPROCESSING.TextureEffect({
            blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
            texture: texture
        });
        textureEffect.blendMode.opacity.value = 0.6;    
        let bloomEffect = new POSTPROCESSING.BloomEffect({
            blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
            kernelSize: POSTPROCESSING.KernelSize.SMALL,
            useLuminanceFilter: true,
            luminanceThreshold: 0.3,
            luminanceSmoothing: 0.75
        });
        bloomEffect.blendMode.opacity.value = 1.5;

        let effectPass = new POSTPROCESSING.EffectPass(
            camera,
            bloomEffect,
            textureEffect
        );
        effectPass.renderToScreen = true;

        composer = new POSTPROCESSING.EffectComposer(renderer);
        composer.addPass(new POSTPROCESSING.RenderPass(scene,camera));
        composer.addPass(effectPass);
        render();
    });
}

init();

// 渲染更新
function render() {

    // renderer.render(scene, camera);
    composer.render(0.1);

    renderer.setAnimationLoop(() => {
        update();
        render();
    });

}

function update() {

    cloudParticles.forEach( p => {
        p.rotation.z -= 0.001;
    })

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