import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let velArr, xPosArr;
let totalWidth = 0;

let texture;

let textureCanvas = document.createElement('canvas');
let width = container_width;
let height = container_height;
textureCanvas.width = width;
textureCanvas.height = height;

let uniforms;

let col = { b1: 100 };
let tl = new TimelineLite();
tl.to(col, 2, { b1: 200, onComplete: onComplete1 });

function onComplete1() {
    tl.to(col, 2, { bl: 100, onComplete: onComplete2, delay: .5 });
}

function onComplete2() {
    tl.to(col, 2, { bl: 200, onComplete: onComplete1, delay: .5 });
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

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    createCamera();
    // createLights();

    createText();
    createTexture();
    createMesh();

}

// 創建相機
function createCamera() {

    // let fov = 65;
    // let aspect = container_width / container_height;
    // let near = 0.1;
    // let far = 1000;
    camera = new THREE.Camera();
    camera.position.z = 1;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createText() {

    let textureCtx = textureCanvas.getContext('2d');
    textureCtx.fillStyle = "#fff";
    textureCtx.fillRect(0, 0, width, height);
    textureCtx.font = "Bold 80px Helvetica";

    let date = new Date();
    let curHour = date.getHours();
    let curHourStr = curHour < 10 ? "0" + curHour : curHour;
    let curMin = date.getMinutes();
    let curMinStr = curMin < 10 ? "0" + curMin : curMin;
    let curSec = date.getSeconds();
    let curSecStr = curSec < 10 ? "0" + curSec : curSec;
    let curTime = curHourStr + ":" + curMinStr + ":" + curSecStr;

    let textWidth = textureCtx.measureText(curTime);
    let textExtraWidth = textWidth.width * 1.2;
    let extraHeight = 80;
    let xPos, yPos;

    if (!velArr) {
        velArr = [];
        for (var yy = 0; yy < height / extraHeight + 1; yy++) {
            velArr[yy] = -Math.random() - .5;
        }

        xPosArr = [];


        for (var yy = 0; yy < height / extraHeight + 1; yy++) {
            xPosArr[yy] = [];
            for (var xx = 0; xx < width / textExtraWidth + 2; xx++) {
                xPos = textExtraWidth * xx + Math.random() * 10 - 5 + velArr[yy];
                xPosArr[yy][xx] = xPos;

            }
        }

        totalWidth += parseInt(width / textExtraWidth + 3) * textExtraWidth;
    }
    var colNum = parseInt(col.b1)
    var colRgb = "rgb(" + colNum + ", " + colNum + ", " + colNum + ")";
    textureCtx.fillStyle = colRgb;

    for (var yy = 0; yy < height / extraHeight + 1; yy++) {

        for (var xx = 0; xx < width / textExtraWidth + 2; xx++) {


            textureCtx.font = "Bold 80px Helvetica";

            xPosArr[yy][xx] += velArr[yy];
            if (xPosArr[yy][xx] < -textExtraWidth) xPosArr[yy][xx] += totalWidth;

            yPos = extraHeight * yy;

            //var fontNum = parseInt(75 + 10 *Math.random());

            //yoCtx.font = "Bold 80px Arial";
            textureCtx.save();
            textureCtx.translate(xPosArr[yy][xx], yPos);


            textureCtx.fillText(curTime, 0, 0);
            textureCtx.restore();
        }

    }

    if (texture) texture.needsUpdate = true;

}

function createTexture() {

    texture = new THREE.Texture(textureCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

}

function createMesh() {

    uniforms = {
        canvasSource: { type: 't', value: texture },
        time: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new THREE.Vector2(container_width, container_height) }
    };

    let geo = new THREE.PlaneGeometry(2, 2);
    let mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
    });
    let mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

}

init();

// 渲染更新
function render() {

    uniforms.time.value += 0.05;
    createText();

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

    uniforms.resolution.value.x = container_width;
    uniforms.resolution.value.y = container_height;

    // camera.aspect = container_width / container_height;
    // camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}
