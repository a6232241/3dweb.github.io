import * as THREE from '../../three.js/build/three.module.js';

import Stats from '../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../three.js/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '../../three.js/examples/jsm/controls/PointerLockControls.js';


import { SVGLoader } from '../../three.js/examples/jsm/loaders/SVGLoader.js';

// if( WEBGL.isWebGLAvailable() === false ){

//     document.body.appendChild( WEBGL.getWebGLErrorMessage() );

// }

let controls;

let container = document.querySelector('#scene-container');

let container_width = container.offsetWidth;
let container_height = container.offsetHeight;
let containerHalfX = container_width / 2;
let containerHalfY = container_height / 2;

// let stats;

// let clock = new THREE.Clock();

let camera, scene, renderer;

// 玩家
let play, playBody;
let playHalf = new CANNON.Vec3(50, 50, 50);
let playSite = new CANNON.Vec3(-490, -260, 0);

// 地板
let groundHalf = new CANNON.Vec3(170, 3, 100);
let groundSite = new CANNON.Vec3(-490, -330, 0);
let groundSite2 = new CANNON.Vec3(95, -250, 0);

//
let sprite;

// 下雪
let snowing;

// 物理環境
let world;

// 載入紋理
let loader = new THREE.TextureLoader();

//控制2d介面
let controls2d = new PointerLockControls(camera, document.body);

let blocker = document.getElementById("blocker");
let instructions = document.getElementById("instructions");

//鍵盤控制
let canLeft = false;
let canRight = false;
let canJump = false;

// 角色速度
let speed = 0;

//建立場景
function init() {

    scene = new THREE.Scene();

    let axes = new THREE.AxesHelper(2000)
    scene.add(axes)

    createCamera();
    createLights();
    createObject();
    createMeshes();
    createSnow();
    createRenderer();
    createEvent();
    createControls();

    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}

//創建相機
function createCamera() {

    // let fov = 65;
    // let aspect = container_width / container_height;
    // let near = 0.1;
    // let far = 1000;
    // camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.position.z = 999;
    // camera.lookAt(scene.position);

    let left = - containerHalfX;
    let right = containerHalfX;
    let top = containerHalfY;
    let bottom = - containerHalfY;
    let near = 1, far = 1000;
    camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.z = 1000;

}

//創建光源
function createLights() {
    scene.add(new THREE.AmbientLight(0xffffff));
}

//找出group的中心點
let computeGroupCenter = (function () {
    let childBox = new THREE.Box3();
    let groupBox = new THREE.Box3();
    let invMatrixWorld = new THREE.Matrix4();

    return function (group, optionalTarget) {

        if (!optionalTarget) optionalTarget = new THREE.Vector3();

        //搜尋group底下的child
        group.traverse(function (child) {

            //如果child是Mesh
            if (child instanceof THREE.Mesh) {

                //如果child沒有設置邊界框
                if (!child.geometry.boundingBox) {
                    //child設置邊界框
                    child.geometry.computeBoundingBox();
                    childBox.copy(child.geometry.boundingBox);
                    //更新child和child的全部子孫對象
                    child.updateMatrixWorld(true);
                    //應用child的matrix4(由transform取出，分別代表translate,scale,rotate,skew)
                    childBox.applyMatrix4(child.matrixWorld);

                    groupBox.min.min(childBox.min);
                    groupBox.max.max(childBox.max);
                }
            }
        });

        group.matrixWorld.getInverse(invMatrixWorld);
        groupBox.applyMatrix4(invMatrixWorld);

        groupBox.getCenter(optionalTarget);
        return optionalTarget;
    }
})();

//載入物件
function createObject() {

    let SVGloader = new SVGLoader();

    SVGloader.load("./assets/freetileset/svg/Sample.svg", function (data) {
        let paths = data.paths;
        let group = new THREE.Group();
        group.scale.multiplyScalar(0.0105);
        group.scale.y *= - 1;
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let fillColor = path.userData.style.fill;
            let material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setStyle(fillColor),
                opacity: path.userData.style.fillOpacity,
                transparent: path.userData.style.fillOpacity < 1,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            let shapes = path.toShapes(true);
            for (let j = 0; j < shapes.length; j++) {
                let shape = shapes[j];
                let geometry = new THREE.ShapeBufferGeometry(shape);
                let mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            }

        }

        let groupCenter = computeGroupCenter(group).multiplyScalar(0.0105);
        group.position.x = -groupCenter.x;
        group.position.y = groupCenter.y;
        console.log(groupCenter);

        scene.add(group);

    });

}

//實現網格
function createMeshes() {

    // 地圖網格
    let groundMat = new THREE.MeshLambertMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide
    });
    let groundGeo = new THREE.BoxGeometry(groundHalf.x * 2, groundHalf.y * 2, groundHalf.z * 2, 20, 32);
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(groundSite.x, groundSite.y, groundSite.z);
    scene.add(ground);

    let groundGeo2 = new THREE.BoxGeometry(groundHalf.x * 3, groundHalf.y * 2, groundHalf.z * 2, 20, 32);
    let ground2 = new THREE.Mesh(groundGeo2, groundMat);
    ground2.position.set(groundSite2.x, groundSite2.y, groundSite2.z);
    scene.add(ground2);

    // play網格
    let playGeo = new THREE.BoxGeometry(playHalf.x * 2, playHalf.y * 2, playHalf.z * 2, 32, 32);
    let playMat = new THREE.MeshStandardMaterial();
    play = new THREE.Mesh(playGeo, playMat);
    play.position.set(playSite.x, playSite.y, playSite.z);
    scene.add(play);

    // sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteMap }));
    // sprite.scale.set(500, 500, 1);
    // scene.add(sprite);

    // console.log(sprite);

    createPhysical();

}

//利用cannon.js建立物理效果
function createPhysical() {

    // 建立物理世界
    world = new CANNON.World();
    // 設定重力場為 y 軸 -9.8 m/s²
    world.gravity.set(0, -9.8 * 100, 0);
    // 碰撞偵測
    world.broadphase = new CANNON.NaiveBroadphase();

    // 建立地板剛體
    let groundCM = new CANNON.Material();
    let groundBody = new CANNON.Body({
        shape: new CANNON.Box(groundHalf),
        material: groundCM,
        mass: 0,
        position: groundSite,
    });
    let groundBody2 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x * 1.5, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite2,
    });

    world.add(groundBody);
    world.add(groundBody2);

    // 建立play剛體
    let playShape = new CANNON.Box(playHalf);
    let playCM = new CANNON.Material();
    playBody = new CANNON.Body({
        shape: playShape,
        material: playCM,
        mass: 100,
        position: playSite,
        angularDamping: 0.9,
        linearDamping: 0.9
    });
    world.add(playBody);

    // 物理睡眠
    // world.allowSleep = true;
    // playBody.allowSleep = true;

    // // Sleep parameters
    // playBody.sleepSpeedLimit = 0.1; // 如果速度<1(速度==規範速度)，則漸漸減少物理
    // playBody.sleepTimeLimit = 1; // 減少物理效果達1秒，關閉物理

    // // 設定兩剛體碰撞時交互作用屬性
    let playGroundContact = new CANNON.ContactMaterial(groundCM, playCM, {
        friction: 1, // 摩擦力
        restitution: 0.5 // 恢復係數, 衡量兩個物體碰撞後反彈程度
    });
    world.addContactMaterial(playGroundContact);

}

//增加下雪的特效
function createSnow() {

    let snowMap = loader.load("../../three.js/examples/textures/sprites/snowflake1.png");
    let snowGeo = new THREE.Geometry();
    for (let i = 0; i < 50; i++) {
        let particle = new THREE.Vector3(
            Math.random() * 1400 - 700,
            Math.random() * 700 - 200,
            1
        );
        particle.velocity = {};
        particle.velocityY = Math.random() * 0.5 - 2;
        particle.velocityX = Math.random() * 1.5 - 0.5;
        snowGeo.vertices.push(particle);
    }
    let snowMat = new THREE.PointsMaterial({
        size: Math.random() * 10 + 25,
        map: snowMap,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7
    });
    snowing = new THREE.Points(snowGeo, snowMat);

    scene.add(snowing);
}

//實現渲染
function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    container.appendChild(renderer.domElement);

}

//創建事件
function createEvent() {

    // window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onWindowKeyDown, false);
    window.addEventListener('keyup', onWindowKeyUp, false);

    // instructions.addEventListener('click', function () {
    //     controls2d.lock();
    // }, false);

    // controls2d.addEventListener('lock', function () {
    //     instructions.style.display = 'none';
    //     blocker.style.display = 'none';
    // });

    // controls2d.addEventListener('unlock', function () {
    //     blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
    //     blocker.style.display = 'block';
    //     instructions.style.display = '';
    // });

    playBody.addEventListener('collide', function () {
        canJump = true;
    })

}

function onWindowKeyDown(event) {

    switch (event.keyCode) {

        case 37:// left
        case 65:// a
            if (canJump) {
                speed = -5 * 100;
                playBody.velocity.x = speed;
            }
            break;

        case 39:// right
        case 68:// d
            if (canJump) {
                speed = 5 * 100;
                playBody.velocity.x = speed;
            }
            break;

        case 32:// space
            if (canJump) {
                canLeft = false;
                canRight = false;
                canJump = false;
                speed = 20 * 50;
                playBody.velocity.y = speed;
            }
            break;
    }
}

function onWindowKeyUp(event) {

    switch (event.keyCode) {

        case 37:// left
        case 65:// a
            canLeft = false;
            break;

        case 39:// right
        case 68:// d
            canRight = false;
            break;

        case 32:// space
            canJump = false;
            break;

    }
}

//載入等待
function onProgress(xhr) {
    if (xhr.lengthComputable) {
        // updateProgressBar(xhr.loaded / xhr.total);
        console.log(Math.round(xhr.loaded / xhr.total * 100, 2) + '% downloaded');
    }
    if (xhr = 1) {
        instructions.getElementsByTagName('span')[0].innerText = 'Click to Play';
    }
}

//載入失敗
function onError() {
    let message = "Error loading model";
    instructions.innerText = message;
    console.log(message);
}

//載入%數
// function updateProgressBar(fraction) {
//     instructions.getElementsByTagName('span')[0].innerText = 'Loading...' + Math.round(fraction * 100, 2) + '%';            
// }

//Object事件

function update() {

}

//渲染更新
function render() {

    const timeStep = 1.0 / 60.0; // seconds

    // 更新剛體位置
    world.step(timeStep)
    if (play) {
        play.position.copy(playBody.position);
        play.quaternion.copy(playBody.quaternion);
    };

    // 產生下雪效果
    snowing.geometry.vertices.forEach(v => {

        v.y += v.velocityY;
        v.x += v.velocityX;
        if( v.y <= -350 ) v.y = 700;
        if( v.x >= 350 || v.x <= -350 ) v.velocityX = v.velocityX * -1;

    });

    snowing.geometry.verticesNeedUpdate = true;

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

init();
