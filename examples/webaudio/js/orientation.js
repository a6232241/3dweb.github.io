import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';
import { PositionalAudioHelper } from '../../../three.js/examples/jsm/helpers/PositionalAudioHelper.js';
import { GLTFLoader } from '../../../three.js/examples/jsm/loaders/GLTFLoader.js';



let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let positionAudio;

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 2, 20);

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createFloor();
    createAudio();
    createModel();
    createWall();
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

    let fov = 45;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(3, 2, 3);

}

// 創建光源
function createLights() {

    // scene.add(new THREE.AmbientLight(0xffffff));

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    let dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(5, 5, 0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 1;
    dirLight.shadow.camera.bottom = -1;
    dirLight.shadow.camera.left = -1;
    dirLight.shadow.camera.right = 1;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 20;
    scene.add(dirLight);

}

function createFloor() {

    let floorGeo = new THREE.PlaneBufferGeometry(50, 50);
    let floorMat = new THREE.MeshStandardMaterial({ color: 0x999999, depthWrite: false });
    let floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    let grid = new THREE.GridHelper(50, 50, 0x888888, 0x888888);
    scene.add(grid);
}

function createAudio() {

    let listener = new THREE.AudioListener();
    camera.add(listener);

    let media = new Audio('../../../three.js/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3');
    media.loop = true;
    media.play();

    positionAudio = new THREE.PositionalAudio(listener);
    positionAudio.setMediaElementSource(media);
    positionAudio.setRefDistance(1);
    positionAudio.setDirectionalCone(180, 230, 0.1); // 將全方位聲音改為定向聲音(定向聲音角度，定向聲音角度外，角度外音量獲取比例)

    // 幫助顯示positionAudio的定向圓錐
    let helper = new PositionalAudioHelper(positionAudio, 0.1);
    positionAudio.add(helper);

}

function createModel() {

    let gltfLoader = new GLTFLoader();
    gltfLoader.load('../../../three.js/examples/models/gltf/BoomBox/glTF-Binary/BoomBox.glb', function (gltf) {

        let boomBox = gltf.scene;
        boomBox.position.set(0, 0.2, 0);
        boomBox.scale.multiplyScalar(20);

        boomBox.traverse((object) => {

            if (object.isMesh) {
                object.geometry.rotateY(- Math.PI);
                object.castShadow = true;
            }

        });

        boomBox.add(positionAudio);
        scene.add(boomBox);
    })
}

function createWall() {

    let wallGeo = new THREE.BoxBufferGeometry(2, 1, 0.1);
    let wallMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
    let wall = new THREE.Mesh(wallGeo,wallMat);
    wall.position.set(0,0.5,-0.5);
    scene.add(wall);
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

}

init();

// 渲染更新
function render() {

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

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}