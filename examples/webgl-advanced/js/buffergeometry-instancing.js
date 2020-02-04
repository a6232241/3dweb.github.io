import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let geometry;
let instances = 50000; // 實例化數量

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

    container.appendChild(renderer.domElement);

    if (renderer.extensions.get("ANGLE_instanced_arrays") === null) {
        document.getElementById('notSuppotred').style.display = '';
        return;
    };

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    // createLights();
    createMesh();
    createGUI();

}

// 創建相機
function createCamera() {

    let fov = 50;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createMesh() {

    let vector = new THREE.Vector4();

    let positions = [];
    let offsets = [];
    let colors = [];
    let orientationsStart = [];
    let orientationsEnd = [];

    positions.push(0.025, -0.025, 0);
    positions.push(-0.025, 0.025, 0);
    positions.push(0, 0, 0.025);

    // instanced attributes
    for (let i = 0; i < instances; i++) {

        // offsets
        offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

        // colors
        colors.push(Math.random(), Math.random(), Math.random(), Math.random());

        // orientation start
        vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        vector.normalize();

        orientationsStart.push(vector.x, vector.y, vector.z, vector.w);

        // orientation end
        vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        vector.normalize();

        orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);

    }

    // CreateGeometry
    geometry = new THREE.InstancedBufferGeometry();
    geometry.maxInstancedCount = instances; // 設置為GUI的初始值

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
    geometry.setAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4));
    geometry.setAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4));

    // CreateMaterial

    // 類似ShaderMaterial，但內建的uniforms和attributes不會自動添加到GLSL著色器代碼
    let material = new THREE.RawShaderMaterial({

        uniforms: {
            "time": { value: 1.0 },
            "sineTime": { value: 1.0 }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        side: THREE.DoubleSide,
        transparent: true

    });

    // CreateMesh
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

}

function createGUI() {
    let gui = new GUI({ width: 250 });
    gui.add(geometry, 'maxInstancedCount', 0, instances);
}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function update() {

    let time = performance.now();
    let object = scene.children[0]; // 抓取第一個子項

    console.log(object);

    object.rotation.y = time * 0.0005;
    object.material.uniforms["time"].value = time * 0.005;
    object.material.uniforms["sineTime"].value = Math.sin(object.material.uniforms["time"].value * 0.05);

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