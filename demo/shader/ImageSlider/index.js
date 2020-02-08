import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let mesh;
let g_dt = 1 / 30, time = 0;

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

    renderer = new THREE.WebGLRenderer();
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
    createImageSlider();

}

// 創建相機
function createCamera() {

    let fov = 50;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 20;
    camera.lookAt(new THREE.Vector3(0, 0, -1));

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createImageSlider() {

    let geo = new THREE.BufferGeometry();
    // let mat = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

    let positions = [];
    let colors = [];
    let indices_array = [];

    let numPtsX = 96;
    let numPtsY = 96;
    // let numVerts = numPtsX * numPtsY;
    let deltaStep = 0.2;

    // 創建垂直
    let posXOffset = -numPtsX * deltaStep * 0.5;
    let posYOffset = -numPtsY * deltaStep * 0.5;
    
    for (var y = 0; y < numPtsY; y++) {
        for (var x = 0; x < numPtsX; x++) {

            var posX = posXOffset + x * deltaStep;
            var posY = posYOffset + y * deltaStep;
            var posZ = 0.0;

            positions.push(posX, posY, posZ);
            //colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
            colors.push(0.65, 0.65, 0.65);
            //colors.push(1.0,0.0,1.0);
        }

    }

    // generate indices
    for (var y = 0; y < numPtsY - 1; y++) {

        var rowIndexOffset = y * numPtsX;

        for (var x = 0; x < numPtsX - 1; x++) {

            var indexCurr = rowIndexOffset + x;
            var indexRight = indexCurr + 1;
            var indexTop = indexCurr + numPtsX;
            var indexTopRight = indexTop + 1;

            indices_array.push(indexCurr, indexRight);
            indices_array.push(indexCurr, indexTop);
            indices_array.push(indexCurr, indexTopRight);
        }

    }

    // top row - needs to stitch together
    for (var x = 0; x < numPtsX - 1; x++) {

        var index0 = (numPtsY - 1) * numPtsX + x;
        var index1 = index0 + 1;
        indices_array.push(index0, index1);

    }

    // right col - needs to stitch together
    for (var y = 0; y < numPtsY - 1; y++) {

        var index0 = y * numPtsX + numPtsX - 1;
        var index1 = index0 + numPtsX;
        indices_array.push(index0, index1);

    }

    // vert attrib
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices_array), 1));
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geo.computeBoundingSphere();

    let uniforms = {
        time: { type: 'f', value: 2.0 },
        texture: { type: 't', value: new THREE.TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/ballon.jpg") },
        texture2: { type: 't', value: new THREE.TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/town-texture.jpg") },
        rate: { type: 'f', value: 0.0 }
    };

    let shaderMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShaderLines').textContent,
        fragmentShader: document.getElementById('fragmentShaderLines').textContent,
        depthTest: true,
        transparent: false
    });
    mesh = new THREE.LineSegments(geo, shaderMat);
    scene.add(mesh);
}



init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function update() {

    time += g_dt;
    let rate = (Math.cos(time / 2) + 1) / 2;
    mesh.material.uniforms.time.value = time;
    mesh.material.uniforms.rate.value = rate;

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