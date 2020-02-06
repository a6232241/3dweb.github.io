import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../../../three.js/examples/jsm/controls/TrackballControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let shaderUniforms = {
    amplitude: {
        type: "f",
        value: 0.5
    }
};

let particleSystem;

let imageWidth = 640;
let imageHeight = 360;
let imageData = null;

let animationTime = 0, animationDelta = 0.03;

//建立場景
function init() {

    createRenderer();
    createScene();

    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createPixelData();

}

// 創建相機
function createCamera() {

    let fov = 20;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2000;
    camera.lookAt(scene.position);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createPixelData() {

    let image = document.createElement('img');
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');


    image.crossOrigin = "Anonymous";
    image.onload = function () {

        image.width = canvas.width = imageWidth;
        image.height = canvas.height = imageHeight;

        context.fillStyle = context.createPattern(image, 'no-repeat');
        context.fillRect(0, 0, imageWidth, imageHeight);

        imageData = context.getImageData(0, 0, imageWidth, imageHeight).data;

        createParticles();

    }

    image.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/tree_star.jpg";

}

function createParticles() {

    let weights = [0.2126, 0.7152, 0.0722];
    let c = 0;

    let geo = new THREE.BufferGeometry();
    let positions = [];
    let colors = [];

    let color = new THREE.Color();

    let x, y;
    let zRange = 400;

    x = imageWidth * -0.5;
    y = imageHeight * 0.5;

    let shaderMat = new THREE.ShaderMaterial({
        uniforms: shaderUniforms,
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent,
        side: THREE.DoubleSide,
    });

    for (let i = 0; i < imageHeight; i++) {
        for (let j = 0; j < imageWidth; j++) {

            color.setRGB(imageData[c] / 255, imageData[c + 1] / 255, imageData[c + 2] / 255);
            colors.push(color.r, color.g, color.b);

            let weight = color.r * weights[0] + color.g * weights[1] + color.b * weights[2];
            let vertex = new THREE.Vector3(x, y, ((zRange * -0.5) + (zRange * weight)));
            positions.push(vertex.x, vertex.y, vertex.z);

            c += 4;
            x++;

        }

        x = imageWidth * -0.5;
        y--;
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeBoundingSphere();

    particleSystem = new THREE.Points(geo, shaderMat);
    scene.add(particleSystem);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);
    controls.update();

}

function update() {

    shaderUniforms.amplitude.value = Math.sin(animationTime);

    animationTime += animationDelta;

}

function createControls() {

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.1;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.8;
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