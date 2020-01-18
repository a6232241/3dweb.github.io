import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from '../../../three.js/examples/jsm/loaders/GLTFLoader.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

// 角色模組，頸部，腰部，可用的動畫，混合，靜止
let model, neck, waist, possibleAnims, mixer, idle;

// 確認目前是否撥放動畫
let currentlyAnimating = false;

let raycaster = new THREE.Raycaster();

// 加載動畫
let loaderAnim = document.getElementById('js-loader');

// 加載模型
const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
let loader = new GLTFLoader();

let clock = new THREE.Clock();

//建立場景
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f1f1);
    scene.fog = new THREE.Fog(0xf1f1f1, 60, 100);

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createObject();
    createModel();
    createRenderer();
    createEvent();
    // createControls();

    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}

// 創建相機
function createCamera() {

    let fov = 50;
    let aspect = container_width / container_height;
    let near = 0.1;
    let far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.lookAt(scene.position);
    camera.position.set(0, -3, 30);

}

// 創建光源
function createLights() {

    // scene.add(new THREE.AmbientLight(0xffffff));

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.receiveShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);

}

function createObject() {

    let floorGeo = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee, shininess: 0 });
    let floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -11;
    floor.rotation.x = Math.PI / -2;
    floor.receiveShadow = true;
    scene.add(floor);

    let sphereGeo = new THREE.SphereBufferGeometry(8, 32, 32);
    let sphereMat = new THREE.MeshBasicMaterial({ color: 0x9bffaf });
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(-0.25, -2.5, -15);
    scene.add(sphere);

}

function createModel() {

    let skin = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
    skin.flipY = false;

    let skinMat = new THREE.MeshPhongMaterial({ map: skin, color: 0xffffff, skinning: true });

    // model 載入
    loader.load(MODEL_PATH, gltf => {

        model = gltf.scene;
        model.traverse(child => {

            // 找到骨架的名稱(自定義)
            // if(child.isBone){
            //     console.log(child.name);
            // }

            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = skinMat;
            }

            // 找出脖子和脊椎的骨架的名稱，並加入相對應的變數
            if (child.isBone && child.name === 'mixamorigNeck') {
                neck = child;
            }
            if (child.isBone && child.name === 'mixamorigSpine') {
                waist = child;
            }

        });

        model.scale.multiplyScalar(7);
        model.position.y = -11;

        scene.add(model);

        // model載入後移除載入動畫
        loaderAnim.remove();

        // animations 載入
        let animations = gltf.animations;

        // 將動作和model做處理
        createAnimations(animations, model);

    }, undefined, error => { console.error(error); });
}

// 創建model的animations
function createAnimations(animations, model) {

    // 動作的動畫載入(約有10個動作)
    let modelAnimations = animations;

    // 動畫混合器(類似撥放器，負責管理動畫)
    mixer = new THREE.AnimationMixer(model);

    // 過濾除了idle以外的動作
    let clips = modelAnimations.filter(val => val.name !== 'idle');
    // 找出idle以外的動畫，清除腰部和脖子的bone，並加入mixer
    possibleAnims = clips.map(val => {
        let clip = THREE.AnimationClip.findByName(clips, val.name)
        console.log(val.name);
        clip.tracks.splice(3, 3);
        clip.tracks.splice(9, 3);
        clip = mixer.clipAction(clip);
        return clip;
    });

    // 找出idle的動畫
    let idleAnim = THREE.AnimationClip.findByName(modelAnimations, 'idle');
    // 將動畫加入混合器中

    // 找到idle中tracks屬性的脊椎和脖子的對應位置、四位數、比例，分別為3、4、5和12、13、14
    // console.log(idleAnim);
    // 刪除脊椎和脖子的數組(由於刪除會影響數組，脖子數組向前移動改為9、10、11)，這麼做可以讓模組不管做甚麼動作，都不影響到我們對脊椎和脖子的控制
    idleAnim.tracks.splice(3, 3);
    idleAnim.tracks.splice(9, 3);

    // 加入動作後回傳為AnimationAction，可以視為整個動作編排
    idle = mixer.clipAction(idleAnim);
    idle.play();

}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

}

init();

function createEvent() {

    window.addEventListener('resize', onWindowResize, false);

    // 新增model跟蹤滑鼠事件(僅限2d)
    document.addEventListener('mousemove', (e) => {
        let mousecoords = getMousePos(e);
        if (neck && waist) {
            moveJoint(mousecoords, neck, 50);
            moveJoint(mousecoords, waist, 30);
        }
    });

    // 新增鼠標和觸控事件
    window.addEventListener('click', e => raycast(e));
    window.addEventListener('touchend', e => raycast(e, true));

    // 新增鍵盤按鈕事件
    window.addEventListener('keydown', (e) => {
        if (!currentlyAnimating) {
            currentlyAnimating = true;
            playOnKeyDown(e);
        }
    })

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    // camera.left = -containerHalfX;
    // camera.right = containerHalfX;
    // camera.top = containerHalfY;
    // camera.bottom = -containerHalfY;
    // camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

}

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function update() {

    if (mixer) {
        mixer.update(clock.getDelta());
    }

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

/* 獲取鼠標的位置，對model的互動 */

// 取得滑鼠座標((0,0))為屏幕左上)
function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
}

// 計算鼠標離屏幕中心點的距離%數
function getMouseDegrees(x, y, degreeLimit) {

    let dx = 0, dy = 0;
    let xdiff, xPercentage;
    let ydiff, yPercentage;
    let w = { x: window.innerWidth, y: window.innerHeight };

    // left(脖子從0到左旋轉的極限)

    // 如果鼠標在左側
    if (x <= w.x / 2) {
        // 取得中心點到鼠標的距離
        xdiff = w.x / 2 - x;
        // 取得距離中心點的%數
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 轉換為脖子旋轉的極限%數
        dx = ((degreeLimit * xPercentage) / 100) * -1;
    }

    // 如果鼠標在右側
    if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
    }

    // 如果鼠標在上面
    if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // 將實際抬頭的角度減半
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }

    // 如果鼠標在下面
    if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
    }

    return { x: dx, y: dy };

}

// 鼠標位置、要移動的bone、bone旋轉的極限
function moveJoint(mouse, joint, degreeLimit) {

    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);

    // 由於旋轉是根據軸做變化，因此往Y移動時，轉動X軸，反之
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);

}

/* 利用射線來與model達成互動 */

// 射線
function raycast(e, touch = false) {

    let mouse = {};
    if (touch) {
        mouse.x = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (e.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    }

    // 根據鼠標與camera的位置更新射線
    raycaster.setFromCamera(mouse, camera);

    // 計算與射線相交的objects(可以相交的objects, 是否檢查子項目)，回傳參數 [ { distance, point, face, faceIndex, object }, ... ]，此為第一個接觸到的object參數
    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
        let object = intersects[0].object;

        // 如果接觸到的object是model
        if (object.name === 'stacy') {

            // 如果現在沒有進行動作
            if (!currentlyAnimating) {
                currentlyAnimating = true;
                playOnClick();
            }
            
        }
    }

}

// 點撃回饋
function playOnClick() {

    let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
    playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);

}

/* 利用案件要求model動作 */

function playOnKeyDown(e) {

    switch (e.keyCode) {

        case 49: // 1
            playModifierAnimation(idle, 0.25, possibleAnims[0], 0.25);
            break;

        case 50: // 2
            playModifierAnimation(idle, 0.25, possibleAnims[1], 0.25);
            break;

        case 51: // 3
            playModifierAnimation(idle, 0.25, possibleAnims[2], 0.25);
            break;

        case 52: // 4
            playModifierAnimation(idle, 0.25, possibleAnims[3], 0.25);
            break;

        case 53: // 5
            playModifierAnimation(idle, 0.25, possibleAnims[4], 0.25);
            break;

        case 54: // 6
            playModifierAnimation(idle, 0.25, possibleAnims[5], 0.25);
            break;

        case 55: // 7
            playModifierAnimation(idle, 0.25, possibleAnims[6], 0.25);
            break;

        case 56: // 8
            playModifierAnimation(idle, 0.25, possibleAnims[7], 0.25);
            break;

    }

}

/* 動畫過渡(閒置動作，到新動作時間，新動作，新動作結束時間) */
function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    // 將當前動作淡出
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function () {
        from.enabled = true;
        to.crossFadeTo(from, tSpeed, true);
        currentlyAnimating = false;
    }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000); // 當新動作持續時間結束，去除淡入和淡出的時間，才接著執行setTimeout的內部函數
}