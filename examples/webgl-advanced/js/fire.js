import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

import { Fire } from '../../../three.js/examples/jsm/objects/Fire.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let fire;
let gui;
let params = {
    color1: '#ffffff',
    color2: '#ffa000',
    color3: '#000000',
    colorBias: 0.8,
    burnRate: 0.35,
    diffuse: 1.33,
    viscosity: 0.25,
    expansion: - 0.25,
    swirl: 50.0,
    drag: 0.35,
    airSpeed: 12.0,
    windX: 0.0,
    windY: 0.75,
    speed: 500.0,
    massConservation: false
};

params.Single = () => {

    fire.clearSources();
    fire.addSource(0.5, 0.1, 0.1, 1.0, 0.0, 1.0);

}

params.Multiple = () => {

    fire.clearSources();
    fire.addSource(0.45, 0.1, 0.1, 0.5, 0.0, 1.0);
    fire.addSource(0.55, 0.1, 0.1, 0.5, 0.0, 1.0);

}

params.Text = () => {

    let text = "Three JS";
    let size = 180;
    let color = '#ff0040';
    let canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;

    let context = canvas.getContext('2d');
    context.font = size + "pt Arial";
    context.strokeStyle = "black";
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.fillStyle = "black";

    context.strokeText(text, canvas.width / 2, canvas.height * 0.75);
    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    fire.setSourceMap(texture);

}

// 蠟燭
params.Candle = function () {

    params.color1 = 0xffffff;
    params.color2 = 0xffa000;
    params.color3 = 0x000000;
    params.windX = 0.0;
    params.windY = 0.5;
    params.colorBias = 0.3;
    params.burnRate = 1.6;
    params.diffuse = 1.33;
    params.viscosity = 1.33;
    params.expansion = 0.0;
    params.swirl = 0.0;
    params.drag = 0.0;
    params.airSpeed = 8.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}
// 火炬
params.Torch = function () {

    params.color1 = 0xffdcaa;
    params.color2 = 0xffa000;
    params.color3 = 0x000000;
    params.windX = 0.0;
    params.windY = 0.75;
    params.colorBias = 0.9;
    params.burnRate = 1.0;
    params.diffuse = 1.33;
    params.viscosity = 0.25;
    params.expansion = 0.0;
    params.swirl = 50.0;
    params.drag = 0.35;
    params.airSpeed = 10.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}
// 營火
params.Campfire = function () {

    params.color1 = 0xffffff;
    params.color2 = 0xffa000;
    params.color3 = 0x000000;
    params.windX = 0.0;
    params.windY = 0.75;
    params.colorBias = 0.8;
    params.burnRate = 0.3;
    params.diffuse = 1.33;
    params.viscosity = 0.25;
    params.expansion = - 0.25;
    params.swirl = 50.0;
    params.drag = 0.35;
    params.airSpeed = 12.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}
// 火球
params.Fireball = function () {

    params.color1 = 0xffffff;
    params.color2 = 0xffa000;
    params.color3 = 0x000000;
    params.windX = 0.0;
    params.windY = 0.75;
    params.colorBias = 0.8;
    params.burnRate = 1.2;
    params.diffuse = 3.0;
    params.viscosity = 0.0;
    params.expansion = 0.0;
    params.swirl = 6.0;
    params.drag = 0.0;
    params.airSpeed = 20.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}
// 冰球
params.Iceball = function () {

    params.color1 = 0x00bdf7;
    params.color2 = 0x1b3fb6;
    params.color3 = 0x001869;
    params.windX = 0.0;
    params.windY = - 0.25;
    params.colorBias = 0.25;
    params.burnRate = 2.6;
    params.diffuse = 5.0;
    params.viscosity = 0.5;
    params.expansion = 0.75;
    params.swirl = 30.0;
    params.drag = 0.0;
    params.airSpeed = 40.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}
// 煙
params.Smoke = function () {

    params.color1 = 0xd2d2d2;
    params.color2 = 0xd7d7d7;
    params.color3 = 0x000000;
    params.windX = - 0.05;
    params.windY = 0.15;
    params.colorBias = 0.95;
    params.burnRate = 0.0;
    params.diffuse = 1.5;
    params.viscosity = 0.25;
    params.expansion = 0.2;
    params.swirl = 3.75;
    params.drag = 0.4;
    params.airSpeed = 18.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}
// 雪茄
params.Cigar = function () {

    params.color1 = 0xc5c5c5;
    params.color2 = 0x787878;
    params.color3 = 0x000000;
    params.windX = 0.0;
    params.windY = 0.3;
    params.colorBias = 0.55;
    params.burnRate = 0.0;
    params.diffuse = 1.3;
    params.viscosity = 0.05;
    params.expansion = - 0.05;
    params.swirl = 3.7;
    params.drag = 0.6;
    params.airSpeed = 6.0;
    params.speed = 500.0;
    params.massConservation = false;

    updateAll();

}

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    let axes = new THREE.AxesHelper(50);
    scene.add(axes);

    createCamera();
    createLights();
    createFire();
    createRenderer();
    createGUI();
    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

// 創建相機
function createCamera() {

    let fov = 70;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 25;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xcccccc, 0.4));

    let pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);

}

function createFire() {

    let fireGeo = new THREE.PlaneBufferGeometry(20, 20);
    fire = new Fire(fireGeo, { textureWidth: 512, textureHeight: 512, debug: false });
    fire.position.z = -2;
    scene.add(fire);

    // let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(1, 1, 10, 32), new THREE.MeshStandardMaterial());
    // cylinder.position.set(0, -15, -2);
    // scene.add(cylinder);

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

}

function createGUI() {

    gui = new GUI();

    let guiMorph = gui.addFolder("數量&文字");
    guiMorph.add(params, "Single");
    guiMorph.add(params, "Multiple");
    guiMorph.add(params, "Text");

    let guiParameter = gui.addFolder("參數");
    guiParameter.addColor(params, 'color1').onChange(updateColor1);
    guiParameter.addColor(params, 'color2').onChange(updateColor2);
    guiParameter.addColor(params, 'color3').onChange(updateColor3);
    guiParameter.add(params, 'colorBias', 0.0, 1.0).onChange(updateColorBias);
    guiParameter.add(params, 'burnRate', 0.0, 10.0).onChange(updateBurnRate);
    guiParameter.add(params, 'diffuse', 0.0, 5.0).step(0.01).onChange(updateDiffuse);
    guiParameter.add(params, 'viscosity', 0.0, 5.0).step(0.01).onChange(updateViscosity);
    guiParameter.add(params, 'expansion', - 1.0, 1.0).step(0.01).onChange(updateExpansion);
    guiParameter.add(params, 'swirl', 0.0, 50.0).step(0.01).onChange(updateSwirl);
    guiParameter.add(params, 'drag', 0.0, 1.0).onChange(updateDrag);
    guiParameter.add(params, 'airSpeed', 0.0, 50.0).onChange(updateAirSpeed);
    guiParameter.add(params, 'windX', - 5, 5).step(0.01).onChange(updateWindX);
    guiParameter.add(params, 'windY', - 5, 5).step(0.01).onChange(updateWindY);
    guiParameter.add(params, 'speed', 0, 1000).onChange(updateSpeed);
    guiParameter.add(params, 'massConservation').onChange(updateMassConservation);

    let guiType = gui.addFolder("型態");
    guiType.add(params, 'Candle');
    guiType.add(params, 'Torch');
    guiType.add(params, 'Campfire');
    guiType.add(params, 'Fireball');
    guiType.add(params, 'Iceball');
    guiType.add(params, 'Smoke');
    guiType.add(params, 'Cigar');

    params.Campfire();
    params.Single();

}

init();

// 渲染更新
function render() {

    renderer.clear();
    renderer.render(scene, camera);
    fire.quaternion.copy(camera.quaternion);

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

/****************************** GUI onChange *****************************/

function updateColor1(val) {
    fire.color1.set(val);
}

function updateColor2(val) {
    fire.color2.set(val);
}

function updateColor3(val) {
    fire.color3.set(val);
}

function updateColorBias(value) {
    fire.colorBias = value;
}

function updateBurnRate(value) {
    fire.burnRate = value;
}

function updateDiffuse(value) {
    fire.diffuse = value;
}

function updateViscosity(value) {
    fire.viscosity = value;
}

function updateExpansion(value) {
    fire.expansion = value;
}

function updateSwirl(value) {
    fire.swirl = value;
}

function updateDrag(value) {
    fire.drag = value;
}

function updateAirSpeed(value) {
    fire.airSpeed = value;
}

function updateWindX(value) {
    fire.windVector.x = value;
}

function updateWindY(value) {
    fire.windVector.y = value;
}

function updateSpeed(value) {
    fire.speed = value;
}

function updateMassConservation(value) {
    fire.massConservation = value;
}

function updateAll() {

    updateColor1(params.color1);
    updateColor2(params.color2);
    updateColor3(params.color3);
    updateColorBias(params.colorBias);
    updateBurnRate(params.burnRate);
    updateDiffuse(params.diffuse);
    updateViscosity(params.viscosity);
    updateExpansion(params.expansion);
    updateSwirl(params.swirl);
    updateDrag(params.drag);
    updateAirSpeed(params.airSpeed);
    updateWindX(params.windX);
    updateWindY(params.windY);
    updateSpeed(params.speed);
    updateMassConservation(params.massConservation);

    // 改變GUI面板的當前參數
    for (var i in gui.__controllers) {

        gui.__controllers[i].updateDisplay();

    }

}