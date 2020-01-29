import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../../../three.js/examples/jsm/controls/TrackballControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

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

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createGeometry();

}

// 創建相機
function createCamera() {

    let fov = 45;
    let aspect = container_width / container_height;
    let near = 100;
    let far = 1500.0;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 480.0;
    scene.add(camera);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    let pointLight = new THREE.PointLight(0xffffff, 0.7);
    camera.add(pointLight);

}

function createGeometry() {

    // 創建HeartGeometry
    let heartShape = new THREE.Shape();
    let x = 0, y = 0;

    heartShape.moveTo(x + 25, y + 25);
    heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
    heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
    heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
    heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
    heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
    heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

    let extrudSettings = {
        depth: 16,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
    };

    let heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudSettings);
    heartGeometry.rotateX(Math.PI);
    heartGeometry.scale(0.4, 0.4, 0.4);

    // 創建BuffeGeometry

    let bufferGeometry = new THREE.BufferGeometry();

    let radius = 125;
    let count = 80;

    let positions = [];
    let normals = [];
    let colors = [];

    let vector = new THREE.Vector3();

    let color = new THREE.Color(0xffffff);
    let geometry = new THREE.Geometry();

    for (let i = 1, l = count; i <= count; i++) {

        let phi = Math.acos(-1 + (2 * i) / l);
        let theta = Math.sqrt(l * Math.PI) * phi;

        vector.setFromSphericalCoords(radius, phi, theta);

        geometry.copy(heartGeometry);
        geometry.lookAt(vector);
        geometry.translate(vector.x, vector.y, vector.z);

        color.setHSL((i / l), 1.0, 0.7);

        geometry.faces.forEach(face => {

            // 找出組成face的頂點vector
            positions.push(geometry.vertices[face.a].x);
            positions.push(geometry.vertices[face.a].y);
            positions.push(geometry.vertices[face.a].z);
            positions.push(geometry.vertices[face.b].x);
            positions.push(geometry.vertices[face.b].y);
            positions.push(geometry.vertices[face.b].z);
            positions.push(geometry.vertices[face.c].x);
            positions.push(geometry.vertices[face.c].y);
            positions.push(geometry.vertices[face.c].z);

            normals.push(face.normal.x);
            normals.push(face.normal.y);
            normals.push(face.normal.z);
            normals.push(face.normal.x);
            normals.push(face.normal.y);
            normals.push(face.normal.z);
            normals.push(face.normal.x);
            normals.push(face.normal.y);
            normals.push(face.normal.z);

            colors.push(color.r);
            colors.push(color.g);
            colors.push(color.b);
            colors.push(color.r);
            colors.push(color.g);
            colors.push(color.b);
            colors.push(color.r);
            colors.push(color.g);
            colors.push(color.b);

        });

    }

    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    bufferGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    let mat = new THREE.MeshPhongMaterial({ shininess: 80, vertexColors: THREE.VertexColors });

    let mesh = new THREE.Mesh(bufferGeometry, mat);
    scene.add(mesh);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);
    controls.update();

}

function createControls() {

    controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 100.0;
    controls.maxDistance = 800.0;
    controls.dynamicDampingFactor = 0.1;

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