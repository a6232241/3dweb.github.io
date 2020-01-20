// import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
// import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
// let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let floor;

let raycaster = new THREE.Raycaster();
let gutter = { size: 1 };
let meshs = [];
let groupMesh;
let grid = { cols: 14, rows: 6 };
let mouse3D = new THREE.Vector2();
let geometries = [
    new Box(),
    new Torus(),
    new Cone()
];

const radians = (degrees) => {
    return degrees * Math.PI / 180;
}

const distance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

const map = (value, start1, stop1, start2, stop2) => {
    return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

function getRandomGeometry() {
    return geometries[Math.floor(Math.random() * Math.floor(geometries.length))];
}

function getMesh(geo, mat) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function addPointLight(color, position){
    const light = new THREE.PointLight(color, 1, 1000, 1);
    light.position.set(position.x, position.y, position.z);
    scene.add(light);
}

//建立場景
function init() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createGrid();
    createFloor();
    createRenderer();
    // createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

// 創建相機
function createCamera() {

    let fov = 20;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(25, 30, 45);
    camera.rotation.x = radians(-30);
    camera.rotation.y = radians(25);

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0x2900af, 1));

    let spotLight = new THREE.SpotLight('#e000ff', 1, 1000);
    spotLight.position.set(0, 27, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    let rectAreaLight = new THREE.RectAreaLight('#0077ff', 1, 2000, 2000);
    rectAreaLight.position.set(5,50,50);
    rectAreaLight.lookAt(0,0,0);
    scene.add(rectAreaLight);

}

function createGrid() {

    groupMesh = new THREE.Object3D();

    const meshParams = {
        color: '#ff00ff',
        metalness: .58,
        emissive: '#000000',
        roughness: .18
    };

    const mat = new THREE.MeshPhysicalMaterial(meshParams);

    for (let row = 0; row < grid.rows; row++) {
        meshs[row] = [];

        for (let col = 0; col < grid.cols; col++) {
            const geom = getRandomGeometry();
            const mesh = getMesh(geom.geo, mat);

            mesh.position.set(col + (col * gutter.size), 0, row + (row * gutter.size));
            mesh.rotation.set(geom.rotationX, geom.rotationY, geom.rotationZ);

            mesh.initialRotation = {
                x: mesh.rotation.x,
                y: mesh.rotation.y,
                z: mesh.rotation.z
            };

            groupMesh.add(mesh);
            meshs[row][col] = mesh;
        }
    }

    const centerX = ((grid.cols - 1) + (grid.cols - 1) * gutter.size);
    const centerZ = ((grid.rows - 1) + (grid.rows - 1) * gutter.size);
    groupMesh.position.set(-centerX / 2, 0, -centerZ / 2);
    scene.add(groupMesh);

}

function createFloor(){

    let floorGeo = new THREE.PlaneGeometry(100,100);
    let floorMat = new THREE.ShadowMaterial({opacity: .3});
    floor = new THREE.Mesh(floorGeo,floorMat);
    floor.position.y = 0;
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    
    scene.add(floor);

}

function draw(){

    raycaster.setFromCamera(mouse3D, camera);

    let intersects = raycaster.intersectObjects([floor]);

    if(intersects.length){

        // 獲取交點
        const {x,z} = intersects[0].point;

        for(let row=0; row<grid.rows;row++){
            for(let col=0;col<grid.cols;col++){

                // 根據位置找出網格
                let mesh = meshs[row][col];

                let mouseDistance = distance(x,z,
                    mesh.position.x + groupMesh.position.x,
                    mesh.position.z + groupMesh.position.z);

                let maxPosY = 10, minPosY = 0;
                let starDistance = 6, endDistance = 0;
                let y = map(mouseDistance, starDistance, endDistance, minPosY, maxPosY);

                gsap.to(mesh.position, {
                    duration: .4,
                    y: y < 1? 1 : y
                });

                let scaleFactor = mesh.position.y / 2.5;

                let scale = scaleFactor < 1? 1 : scaleFactor;

                gsap.to(mesh.scale,{
                    duration: .4,
                    ease: Back.easeOut.config(1.7),
                    x: scale,
                    y: scale,
                    z: scale
                });

                gsap.to(mesh.rotation,{
                    duration: .7,
                    ease: Back.easeOut.config(1.7),
                    x: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.x),
                    z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
                    y: map(mesh.position.y, -1, 1, radians(90), mesh.initialRotation.y),
                })

            }
        }
    }


}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);
    draw();

}

function createEvent() {

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    onMouseMove({clientX: 0, clientY: 0});

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}

function onMouseMove(e) {

    mouse3D.x = (e.clientX / container_width) * 2 - 1;
    mouse3D.y = -(e.clientY / container_height) * 2 + 1;

}