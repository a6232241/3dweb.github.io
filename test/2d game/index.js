import * as THREE from '../../three.js/build/three.module.js';

import Stats from '../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../three.js/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '../../three.js/examples/jsm/controls/PointerLockControls.js';


import { SVGLoader } from '../../three.js/examples/jsm/loaders/SVGLoader.js';

// if( WEBGL.isWebGLAvailable() === false ){

//     document.body.appendChild( WEBGL.getWebGLErrorMessage() );

// }

// let controls;

let container = document.querySelector('#scene-container');

let camera, scene, renderer, scene1, scene2;
let clock = new THREE.Clock();

// 玩家
let play, playBody;
let playHalf = new CANNON.Vec3(50, 50, 50);
let playBodyHalf = new CANNON.Vec3(30, 50, 30);
let playSite = new CANNON.Vec3(-490, -260, 0);

// 地板
let groundHalf = new CANNON.Vec3(170, 3, 100);
let groundSite = new CANNON.Vec3(-490, -330, 0);
let groundSite2 = new CANNON.Vec3(95, -245, 0);
let groundSite3 = new CANNON.Vec3(125, -80, 0);
let groundSite4 = new CANNON.Vec3(-350, -25, 0);
let groundSite5 = new CANNON.Vec3(-70, 150, 0);
let groundSite6 = new CANNON.Vec3(170, 250, 0);
let groundSite7 = new CANNON.Vec3(540, 290, 0);

// 牆壁
let wallHalf = new CANNON.Vec3(5, 500, 100);
let wallSite = new CANNON.Vec3(-650, -30, 0);
let wallSite2 = new CANNON.Vec3(650, -30, 0);

// 下雪
let snowing;

// 物理環境
let world;

// 載入紋理
let loader = new THREE.TextureLoader();
let playMap = [
    loader.load("assets/Juggernaut Release/Animations/Juggernaut/Idle/Idle - SpriteSheet.png"),
    loader.load("assets/Juggernaut Release/Animations/Juggernaut/Run/Run - SpriteSheet.png"),
    loader.load("assets/Juggernaut Release/Animations/Juggernaut/Jumps/Jump Start/Jump Start - SpriteSheet.png"),
    loader.load("assets/Juggernaut Release/Animations/Juggernaut/Jumps/Jump Fall/Jump Fall_000.png"),
];

let annie = new textureAnimator(playMap[0], 6, 2, 12, 150);

//控制2d介面
let controls2d = new PointerLockControls(camera, document.body);

let blocker = document.getElementById("blocker");
let instructions = document.getElementById("instructions");

//鍵盤控制
let canJump = false;

// 角色速度
let speed = 5;

// 移動動畫
let idle = true;
let run = true;
let jumpStart = true;
let jumpEnd = false;

//建立場景
function init() {

    scene1 = new THREE.Scene();
    scene2 = new THREE.Scene();

    scene = scene1;

    createCamera();
    createLights();
    createMap();
    createPlay();
    createSnow();
    createAudio();
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

    // let fov = 65;
    // let aspect = container_width / container_height;
    // let near = 0.1;
    // let far = 1000;
    // camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.position.z = 999;
    // camera.lookAt(scene.position);

    let left = - container.width * 3;
    let right = container.width * 3;
    let top = container.height * 3;
    let bottom = - container.height * 3;
    let near = 1, far = 1000;
    camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.z = 1000;

}

// 創建光源
function createLights() {
    scene.add(new THREE.AmbientLight(0xffffff));
}

// 載入地圖
function createMap() {

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

    }, onProgress, onError);

    // 地圖網格
    let groundMat = new THREE.MeshLambertMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.01
    });

    let wallGeo = new THREE.BoxGeometry(wallHalf.x * 2, wallHalf.y * 2, wallHalf.z * 2, 32, 32);
    let wall = new THREE.Mesh(wallGeo, groundMat);
    wall.position.set(wallSite.x, wallSite.y, wallSite.z);
    scene.add(wall);

    let wall2Geo = new THREE.BoxGeometry(wallHalf.x * 2, wallHalf.y * 2, wallHalf.z * 2, 32, 32);
    let wall2 = new THREE.Mesh(wall2Geo, groundMat);
    wall2.position.set(wallSite2.x, wallSite2.y, wallSite2.z);
    scene.add(wall2);

    let groundGeo = new THREE.BoxGeometry(groundHalf.x * 2, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(groundSite.x, groundSite.y, groundSite.z);
    scene.add(ground);

    let groundGeo2 = new THREE.BoxGeometry(groundHalf.x * 3, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground2 = new THREE.Mesh(groundGeo2, groundMat);
    ground2.position.set(groundSite2.x, groundSite2.y, groundSite2.z);
    scene.add(ground2);

    let groundGeo3 = new THREE.BoxGeometry(groundHalf.x * 2, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground3 = new THREE.Mesh(groundGeo3, groundMat);
    ground3.position.set(groundSite3.x, groundSite3.y, groundSite3.z);
    scene.add(ground3);

    let groundGeo4 = new THREE.BoxGeometry(groundHalf.x * 1.5, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground4 = new THREE.Mesh(groundGeo4, groundMat);
    ground4.position.set(groundSite4.x, groundSite4.y, groundSite4.z);
    scene.add(ground4);

    let groundGeo5 = new THREE.BoxGeometry(groundHalf.x, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground5 = new THREE.Mesh(groundGeo5, groundMat);
    ground5.position.set(groundSite5.x, groundSite5.y, groundSite5.z);
    scene.add(ground5);

    let groundGeo6 = new THREE.BoxGeometry(groundHalf.x, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground6 = new THREE.Mesh(groundGeo6, groundMat);
    ground6.position.set(groundSite6.x, groundSite6.y, groundSite6.z);
    scene.add(ground6);

    let groundGeo7 = new THREE.BoxGeometry(groundHalf.x * 1.5, groundHalf.y * 2, groundHalf.z * 2, 32, 32);
    let ground7 = new THREE.Mesh(groundGeo7, groundMat);
    ground7.position.set(groundSite7.x, groundSite7.y, groundSite7.z);
    scene.add(ground7);

}

// 創建角色
function createPlay() {

    // play網格
    let playGeo = new THREE.BoxGeometry(playHalf.x * 7, playHalf.y * 7, playHalf.z * 7, 32, 32);
    let playMat = new THREE.MeshStandardMaterial({
        map: playMap[3],
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        emissive: 0xdddddd,
        emissiveIntensity: 0.2
    });
    play = new THREE.Mesh(playGeo, playMat);
    play.position.set(playSite.x, playSite.y, playSite.z);
    scene.add(play);

    createPhysical();

}

// 利用cannon.js建立物理效果
function createPhysical() {

    // 建立物理世界
    world = new CANNON.World();
    // 設定重力場為 y 軸 -9.8 m/s²
    world.gravity.set(0, -9.8 * 100, 0);
    // 碰撞偵測
    world.broadphase = new CANNON.NaiveBroadphase();

    // 建立地板剛體
    let groundCM = new CANNON.Material();

    let wallBody = new CANNON.Body({
        shape: new CANNON.Box(wallHalf),
        material: groundCM,
        mass: 0,
        position: wallSite,
    });
    world.add(wallBody);

    let wallBody2 = new CANNON.Body({
        shape: new CANNON.Box(wallHalf),
        material: groundCM,
        mass: 0,
        position: wallSite2,
    });
    world.add(wallBody2);

    let groundBody = new CANNON.Body({
        shape: new CANNON.Box(groundHalf),
        material: groundCM,
        mass: 0,
        position: groundSite,
    });
    world.add(groundBody);

    let groundBody2 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x * 1.5, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite2,
    });
    world.add(groundBody2);

    let groundBody3 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite3,
    });
    world.add(groundBody3);

    let groundBody4 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x * 0.75, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite4,
    });
    world.add(groundBody4);

    let groundBody5 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x * 0.5, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite5,
    });
    world.add(groundBody5);

    let groundBody6 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x * 0.5, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite6,
    });
    world.add(groundBody6);

    let groundBody7 = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(groundHalf.x * 0.75, groundHalf.y, groundHalf.z)),
        material: groundCM,
        mass: 0,
        position: groundSite7,
    });
    world.add(groundBody7);

    // 建立play剛體
    let playShape = new CANNON.Box(playBodyHalf);
    let playCM = new CANNON.Material();
    playBody = new CANNON.Body({
        shape: playShape,
        material: playCM,
        mass: 1000,
        position: playSite,
        angularDamping: 1, // 角度阻力
        linearDamping: 0.9, // 線性阻力
        velocity: new CANNON.Vec3(0, 0, 0)
    });
    world.add(playBody);

    // 禁止轉動
    // playBody.fixedRotation = true;
    // playBody.updateMassProperties();

    // 物理睡眠
    // world.allowSleep = true;
    // playBody.allowSleep = true;

    // // Sleep parameters
    // playBody.sleepSpeedLimit = 0.1; // 如果速度<1(速度==規範速度)，則漸漸減少物理
    // playBody.sleepTimeLimit = 1; // 減少物理效果達1秒，關閉物理

    // // 設定兩剛體碰撞時交互作用屬性
    let playGroundContact = new CANNON.ContactMaterial(groundCM, playCM, {
        friction: 0, // 摩擦力
        restitution: 0.3 // 恢復係數, 衡量兩個物體碰撞後反彈程度
    });
    world.addContactMaterial(playGroundContact);

}

// 增加下雪的特效
function createSnow() {

    let snowMap = loader.load("../../three.js/examples/textures/sprites/snowflake1.png");
    let snowGeo = new THREE.Geometry();
    for (let i = 0; i < 50; i++) {
        let particle = new THREE.Vector3(
            Math.random() * 1200 - 600,
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

// 創建音效
function createAudio() {

    // 創建監視
    let listener = new THREE.AudioListener()
    camera.add(listener);

    // 控制播放
    let sound = new THREE.Audio(listener);

    // 加載音樂
    let mediaElement = new Audio('../../three.js/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3');
    mediaElement.loop = true;;
    // mediaElement.play();

    sound.setMediaElementSource( mediaElement );

}

// 實現渲染
function createRenderer() {

    renderer = new THREE.WebGLRenderer({ canvas: container });
    renderer.setSize(1000, 650);
    renderer.setPixelRatio(window.devicePixelRatio);

}

// 創建事件
function createEvent() {

    // window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onWindowKeyDown, false);
    window.addEventListener('keyup', onWindowKeyUp, false);

    instructions.addEventListener('click', function () {
        controls2d.lock();
    }, false);

    controls2d.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    controls2d.addEventListener('unlock', function () {
        blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
        blocker.style.display = 'block';
        instructions.style.display = '';
    });

    playBody.addEventListener('collide', function () {
        canJump = true;
        jumpStart = true;
        jumpEnd = false;
        idle = true;
    })

}

function onWindowKeyDown(event) {

    switch (event.keyCode) {

        case 37:// left
        case 65:// a
            if (canJump) {
                play.scale.x = -1;
                if (run) runAnnie();
                speed <= 300 ? speed += 100 : speed = 200;
                playBody.velocity.x = -speed;
            }
            break;

        case 39:// right
        case 68:// d
            if (canJump) {
                play.scale.x = 1;
                if (run) runAnnie();
                speed <= 300 ? speed += 100 : speed = 200;
                playBody.velocity.x = speed;
            }
            break;

        case 32:// space
            if (canJump) {
                canJump = false;
                speed <= 700 ? speed = 20 * 45 : speed = 20 * 35;
                playBody.velocity.y = speed;
            }
            break;
    }
}

function onWindowKeyUp(event) {

    switch (event.keyCode) {

        case 37:// left
        case 65:// a
            if (!run) idleAnnie();
            break;

        case 39:// right
        case 68:// d
            if (!run) idleAnnie();
            break;

        case 32:// space
            canJump = false;
            speed = 5;
            break;

    }
}

// 載入等待
function onProgress(xhr) {
    if (xhr.lengthComputable) {
        // updateProgressBar(xhr.loaded / xhr.total);
        console.log(Math.round(xhr.loaded / xhr.total * 100, 2) + '% downloaded');
    }
    if (xhr = 1) {
        instructions.getElementsByTagName('span')[0].innerText = 'Click to Play';
    }
}

// 載入失敗
function onError() {
    let message = "Error loading model";
    instructions.innerText = message;
    console.log(message);
}

let life = 0;

function update() {

    const timeStep = 1.0 / 60.0; // seconds

    // 更新剛體位置
    world.step(timeStep)
    if (play) {
        play.position.copy(playBody.position);
        play.quaternion.copy(playBody.quaternion);
    };
    if (playBody.position.y <= -750) {
        if( life > 0 ){
            console.log("超出界外");
            playBody.position = playSite;
            play.position.copy(playBody.position);
            life--;
        }else{
            blocker.getElementsByTagName('span')[0].innerText = "GameOver";
            scene = scene1;
            // scene2.add(camera);
            // scene2.add(new THREE.AmbientLight(0xffffff));
            // let geo = new THREE.BoxBufferGeometry(50,50,50,32,32);
            // let mat = new THREE.MeshStandardMaterial({color:0xffffff});
            // let mesh = new THREE.Mesh(geo,mat);
            // scene2.add(mesh);
            // scene2.add(play);
            // scene = scene2;
        }        
    }

    let delta = clock.getDelta();
    // 紋理更新
    annie.update(1000 * delta);
    // console.log(playBody.velocity);

    // 檢查是否為無法跳躍的狀態
    if (!canJump) {
        // 檢查是否為已經在撥放跳躍的狀態
        if (jumpStart) {
            if (playBody.velocity.y > 1) JumpStartAnnie();
        }
        if (jumpEnd) {
            if (playBody.velocity.y < 0) JumpEndAnnie();
        }
    }

    if (!jumpEnd) {
        if (idle) idleAnnie();
    }

    // 產生下雪效果
    snowing.geometry.vertices.forEach(v => {

        v.y += v.velocityY;
        v.x += v.velocityX;
        if (v.y <= -350) v.y = 700;
        if (v.x >= 350 || v.x <= -350) v.velocityX = v.velocityX * -1;

    });

    snowing.geometry.verticesNeedUpdate = true;

}

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

// 找出group的中心點
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

// 雪碧圖紋理
function textureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {

    this.tilesHorizontal = tilesHoriz;                // 水平圖片數
    this.tilesVertical = tilesVert;                  // 垂直圖片數
    this.numberOfTiles = numTiles;                  // 圖片總數

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    this.tileDisplayDuration = tileDispDuration;    // 圖片持續時間
    this.currentDisplayTime = 0;                    // 當前圖片顯示了多久
    this.currentTile = 0;                           // 當前圖片是哪張

    this.update = millisec => {

        this.currentDisplayTime += millisec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles) this.currentTile = 0;
            let currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            let currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }

    }
}

// 切換為靜止動畫
function idleAnnie() {
    play.material.map = playMap[0];
    annie = new textureAnimator(playMap[0], 6, 2, 12, 150);
    idle = false;
    run = true;
}

// 切換為跑步動畫
function runAnnie() {
    play.material.map = playMap[1];
    annie = new textureAnimator(playMap[1], 4, 4, 16, 150);
    run = false;
}

// 切換為開始跳躍動畫
function JumpStartAnnie() {
    play.material.map = playMap[2];
    annie = new textureAnimator(playMap[2], 5, 2, 10, 150);
    run = false;
    jumpStart = false;
    jumpEnd = true;
}

// 切換為下降動畫
function JumpEndAnnie() {
    play.material.map = playMap[3];
    run = false;
}

init();
