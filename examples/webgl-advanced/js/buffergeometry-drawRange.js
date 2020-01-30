import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let group, particlesData = []; // 整體網格，全部粒子資訊
let positions, colors;
let particles, pointCloud; // 每個粒子幾何，全部粒子網格
let particlePositions, linesMesh; // 粒子位置資訊，連接網格

let maxParticleCount = 1000; // 最大粒子數
let particleCount = 500; // 粒子數
let r = 800;
let rHalf = r / 2;

let effectController = {
    showDots: true,
    showLines: true,
    minDistance: 150, // 最小連接距離
    limitConnections: false,
    maxConnections: 20,
    particleCount: 500
};

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
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5000);
    // scene.add(axes);

    createCamera();
    createPointCloud();

    createGUI();

}

// 創建相機
function createCamera() {

    let fov = 45;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 4000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1750;

}

function createPointCloud() {

    group = new THREE.Group();
    scene.add(group);

    let helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxBufferGeometry(r, r, r)));
    helper.material.color.setHex(0x101010);
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add(helper);

    // 建立粒子網格
    let segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array(segments * 3);
    colors = new Float32Array(segments * 3);

    let pMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    });

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticleCount * 3);
    for (let i = 0; i < maxParticleCount; i++) {

        // -500 ~ 500
        let x = Math.random() * r - rHalf;
        let y = Math.random() * r - rHalf;
        let z = Math.random() * r - rHalf;

        // 存放粒子位置資訊
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        // 存放粒子移動資訊
        particlesData.push({
            velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
            numConnections: 0
        });

    }

    particles.setDrawRange(0, particleCount);
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

    // 建立粒子系統網格
    pointCloud = new THREE.Points(particles, pMaterial);
    group.add(pointCloud);

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.computeBoundingSphere();
    geometry.setDrawRange(0, 0);

    let material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    linesMesh = new THREE.LineSegments(geometry, material);
    group.add(linesMesh);

}

function createGUI() {

    let gui = new GUI();

    gui.add(effectController, "showDots").onChange(val => { pointCloud.visible = val });
    gui.add(effectController, "showLines").onChange(val => { linesMesh.visible = val });
    gui.add(effectController, "minDistance", 10, 300);
    gui.add(effectController, "limitConnections");
    gui.add(effectController, "maxConnections", 0, 30, 1);
    gui.add(effectController, "particleCount", 0, maxParticleCount, 1).onChange(val => {
        particleCount = parseInt(val);
        particles.setDrawRange(0, particleCount);
    })
}



init();

// 渲染更新
function render() {

    let time = Date.now() * 0.0001;
    group.rotation.y = time;
    renderer.render(scene, camera);

}

function update() {

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < particleCount; i++) {
        particlesData[i].numConnections = 0;
    }

    for (let i = 0; i < particleCount; i++) {

        // 獲取移動資訊
        let particleData = particlesData[i];

        particlePositions[i * 3] += particleData.velocity.x;
        particlePositions[i * 3 + 1] += particleData.velocity.y;
        particlePositions[i * 3 + 2] += particleData.velocity.z;

        // 超出 -500 ~ 500 的範圍，則改變移動反方向
        if (particlePositions[i * 3] < - rHalf || particlePositions[i * 3] > rHalf)
            particleData.velocity.x = - particleData.velocity.x;

        if (particlePositions[i * 3 + 1] < - rHalf || particlePositions[i * 3 + 1] > rHalf)
            particleData.velocity.y = - particleData.velocity.y;

        if (particlePositions[i * 3 + 2] < - rHalf || particlePositions[i * 3 + 2] > rHalf)
            particleData.velocity.z = - particleData.velocity.z;

        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections)
            continue;

        // 計算粒子間的距離是否做連接
        for (let j = i + 1; j < particleCount; j++) {

            let particleDataB = particlesData[j];
            if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections) {
                continue;
            }

            // 計算粒子間的距離
            let dx = particlePositions[i * 3] - particlePositions[j * 3];
            let dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
            let dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
            let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // 如果兩點符合最小距離，則連成一線
            if (dist < effectController.minDistance) {

                particleData.numConnections++;
                particleDataB.numConnections++;

                let alpha = 1.0 - dist / effectController.minDistance;

                positions[vertexpos++] = particlePositions[i * 3];
                positions[vertexpos++] = particlePositions[i * 3 + 1];
                positions[vertexpos++] = particlePositions[i * 3 + 2];

                positions[vertexpos++] = particlePositions[j * 3];
                positions[vertexpos++] = particlePositions[j * 3 + 1];
                positions[vertexpos++] = particlePositions[j * 3 + 2];

                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;

                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;

                numConnected++;

            }
        }
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;
    
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