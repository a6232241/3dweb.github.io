import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let tile_image = document.querySelector('.tile__image');
tile_image.src = tile_image.dataset.src;

let loader = new THREE.TextureLoader();

//建立場景
function init() {

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    createCamera();
    createLights();
    createImage();
    createRenderer();
    createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

// 創建相機
function createCamera() {

    const perspective = 800;
    // 減少旋轉平面時帶來的變化(增加視角)
    let fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.lookAt(scene.position);
    camera.position.z = 50;

    // let left = - container_width * 3;
    // let right = container_width * 3;
    // let top = container_height * 3;
    // let bottom = - container_height * 3;
    // let near = 1, far = 1000;
    // camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    // camera.position.z = 1000;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff, 2));

}

function createImage() {

    let image = loader.load(tile_image.dataset.src);
    let hoverImage = loader.load(tile_image.dataset.hover);
    let sizes = new THREE.Vector2(0,0);
    let offset = new THREE.Vector2(0,0);

    function getSizes(){

        const{ width, height, top, left } = tile_image.getBoundingClientRect();

        sizes.set(width, height);
        offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2);
    }

    getSizes();

    let geo = new THREE.PlaneBufferGeometry(1,1,1,1);
    let mat = new THREE.MeshBasicMaterial({
        map: image
    });

    let mesh = new THREE.Mesh(geo,mat);
    mesh.position.set(offset.x, offset.y, 0);
    mesh.scale.set(sizes.x, sizes.y, 1);
    scene.add(mesh);

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

init();

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.autoRotate = true;
    // controls.autoRotateSpeed = 1;
    controls.addEventListener('change', renderer);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    controls.update();

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
