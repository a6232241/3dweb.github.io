import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

import { LightningStrike } from '../../../three.js/examples/jsm/geometries/LightningStrike.js';
import { LightningStorm } from '../../../three.js/examples/jsm/objects/LightningStorm.js';

import { EffectComposer } from '../../../three.js/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../../three.js/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from '../../../three.js/examples/jsm/postprocessing/OutlinePass.js';

let container = document.querySelector('#scene-container');
let scene, renderer;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let composer;
let gui;

let currentSceneIndex = 0, currentTime = 0;

let sceneCreators = [
    createConesScene,
    createPlasmaBallScene,
    createStormScene
];

let clock = new THREE.Clock();

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

//建立場景
function init() {

    createRenderer();
    createEvent();

    renderer.setAnimationLoop(() => {
        // update();
        render();
    });
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);

    composer = new EffectComposer( renderer );

    createScene();

}

// 創建環境
function createScene() {

    scene = sceneCreators[currentSceneIndex]();

    createGUI();

}

init();

// 渲染更新
function render() {

    currentTime += scene.userData.timeRate * clock.getDelta();
    if (currentTime < 0) currentTime = 0;

    scene.userData.render(currentTime);

}

function createEvent() {

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    scene.userData.camera.aspect = container_width / container_height;
    scene.userData.camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);
    composer.setSize(container_width, container_height);

}

/**********************************建立後處理*****************************************/

function createOutline(scene, objectsArray, visibleColor) {

    let outlinePass = new OutlinePass(new THREE.Vector2(container_width, container_height), scene, scene.userData.camera, objectsArray);

    outlinePass.edgeStrength = 2.5;
    outlinePass.edgeGlow = 0.7;
    outlinePass.edgeThickness = 2.8;
    outlinePass.visibleEdgeColor = visibleColor;
    outlinePass.hiddenEdgeColor.set(0);
    composer.addPass(outlinePass);

    scene.userData.outlineEnabled = true;

    return outlinePass;

}

/**********************************建立環境*****************************************/

function createConesScene() {

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    scene.userData.canGoBackwardsInTime = true;

    scene.userData.camera = new THREE.PerspectiveCamera(27, container_width / container_height, 200, 100000);

    // Lights
    scene.userData.lightningColor = new THREE.Color(0xB0FFFF);
    scene.userData.outlineColor = new THREE.Color(0x00FFFF);

    let posLight = new THREE.PointLight(0x00ffff, 1, 5000, 2);
    scene.add(posLight);

    // Ground
    let ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(200000, 200000), new THREE.MeshPhongMaterial({ color: 0xC0C0C0, shininess: 0 }));
    ground.rotation.x = - Math.PI * 0.5;
    scene.add(ground);

    // Cones
    let conesDistance = 1000;
    let coneHeight = 200;
    let coneHeightHalf = coneHeight * 0.5;

    posLight.position.set(0, (conesDistance + coneHeight) * 0.5, 0);;
    posLight.color = scene.userData.outlineColor;

    scene.userData.camera.position.set(5 * coneHeight, 4 * coneHeight, 18 * coneHeight);

    let coneMesh1 = new THREE.Mesh(new THREE.ConeBufferGeometry(coneHeight, coneHeight, 30, 1, false), new THREE.MeshPhongMaterial({ color: 0xFFFF00, emissive: 0x1F1F00 }));
    coneMesh1.rotation.x = Math.PI;
    coneMesh1.position.y = conesDistance + coneHeight;
    scene.add(coneMesh1);

    let coneMesh2 = new THREE.Mesh(coneMesh1.geometry.clone(), new THREE.MeshPhongMaterial({ color: 0xFF2020, emissive: 0x1F0202 }));
    coneMesh2.position.y = coneHeightHalf;
    scene.add(coneMesh2);

    /***************************************創造雷擊*******************************************/
    scene.userData.lightningMaterial = new THREE.MeshBasicMaterial({ color: scene.userData.lightningColor });

    // 射線參數
    scene.userData.rayParams = {

        sourceOffset: new THREE.Vector3(),
        destOffset: new THREE.Vector3(),
        radius0: 4,
        radius1: 4,
        minRadius: 2.5,
        maxIterations: 7,
        isEternal: true,

        timeScale: 0.7,

        propagationTimeFactor: 0.05,
        vanishingTimeFactor: 0.95,
        subrayPeriod: 3.5,
        subrayDutyCycle: 0.6,
        maxSubrayRecursion: 3,
        ramification: 7,
        recursionProbability: 0.6,

        roughness: 0.85,
        straightness: 0.6

    };

    // 生成射線
    let lightningStrike;
    let lightningStrikeMesh;
    let outlineMeshArray = [];

    scene.userData.recreateRay = () => {

        if (lightningStrikeMesh) scene.remove(lightningStrikeMesh);
        lightningStrike = new LightningStrike(scene.userData.rayParams);

        lightningStrikeMesh = new THREE.Mesh(lightningStrike, scene.userData.lightningMaterial);

        outlineMeshArray.length = 0;
        outlineMeshArray.push(lightningStrikeMesh);

        scene.add(lightningStrikeMesh);
    }

    scene.userData.recreateRay();

    // Compose rendering
    composer.passes = [];
    composer.addPass(new RenderPass(scene, scene.userData.camera));
    createOutline(scene, outlineMeshArray, scene.userData.outlineColor);

    // Controls
    let controls = new OrbitControls(scene.userData.camera, renderer.domElement);
    controls.target.y = (conesDistance + coneHeight) * 0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.userData.render = (time) => {
        // 移動錐體並更新射線位置
        coneMesh1.position.set(Math.sin(0.5 * time) * conesDistance * 0.6, conesDistance + coneHeight, Math.cos(0.5 * time) * conesDistance * 0.6);
        coneMesh2.position.set(Math.sin(0.9 * time) * conesDistance, coneHeightHalf, 0);
        // 射線起始位置
        lightningStrike.rayParameters.sourceOffset.copy(coneMesh1.position);
        lightningStrike.rayParameters.sourceOffset.y -= coneHeightHalf;
        // 射線結束位置
        lightningStrike.rayParameters.destOffset.copy(coneMesh2.position);
        lightningStrike.rayParameters.destOffset.y += coneHeightHalf;

        lightningStrike.update(time);

        controls.update();

        // 將點光源的的位置更新至射線中心(vector3, vecotr3, scale)
        posLight.position.lerpVectors(lightningStrike.rayParameters.sourceOffset, lightningStrike.rayParameters.destOffset, 0.5);

        if (scene.userData.outlineEnabled) {
            composer.render();
        } else {
            renderer.render(scene, scene.userData.camera);
        }
    }

    return scene;
}

function createPlasmaBallScene() {

    let scene = new THREE.Scene();
    scene.userData.canGoBackwardsInTime = true;

    scene.userData.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 100, 50000);

    let ballScene = new THREE.Scene();
    ballScene.background = new THREE.Color(0x454545);

    // Lights
    let ambientLight = new THREE.AmbientLight(0x444444);
    ballScene.add(ambientLight);
    scene.add(ambientLight);

    let light1 = new THREE.DirectionalLight(0xffffff, 0.5);
    light1.position.set(1, 1, 1);
    ballScene.add(light1);
    scene.add(light1);

    let light2 = new THREE.DirectionalLight(0xffffff, 1.5);
    light2.position.set(- 0.5, 1, 0.2);
    ballScene.add(light2);
    scene.add(light2);

    /******************************************創建電漿球*******************************************************/
    scene.userData.lightningColor = new THREE.Color(0xFFB0FF);
    scene.userData.outlineColor = new THREE.Color(0xFF00FF);

    scene.userData.lightningMaterial = new THREE.MeshBasicMaterial({ color: scene.userData.lightningColor, side: THREE.DoubleSide });

    // 球體
    let urls = [
        "posx.jpg", "negx.jpg",
        "posy.jpg", "negy.jpg",
        "posz.jpg", "negz.jpg",
    ];
    let textureCube = new THREE.CubeTextureLoader().setPath("../../../three.js/examples/textures/cube/Bridge2/").load(urls);
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;
    textureCube.encoding = THREE.sRGBEncoding;

    let sphereMaterial = new THREE.MeshPhysicalMaterial({
        transparent: true,
        transparency: .96,
        depthWrite: false,
        color: 'white',
        metalness: 0,
        roughness: 0,
        envMap: textureCube
    });

    let sphereHeight = 300, sphereRadius = 200;

    scene.userData.camera.position.set(5 * sphereRadius, 2 * sphereHeight, 6 * sphereRadius);

    let sphereMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(sphereRadius, 80, 40), sphereMaterial);
    sphereMesh.position.set(0, sphereHeight, 0);
    ballScene.add(sphereMesh);

    // 底座
    let post = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(sphereRadius * 0.06, sphereRadius * 0.06, sphereHeight, 6, 1, true),
        new THREE.MeshLambertMaterial({ color: 0x020202 })
    );
    post.position.y = sphereHeight * 0.5 - sphereRadius * 0.05 * 1.2;
    scene.add(post);

    let box = new THREE.Mesh(new THREE.BoxBufferGeometry(sphereHeight * 0.5, sphereHeight * 0.1, sphereHeight * 0.5), post.material);
    box.position.y = sphereHeight * 0.05 * 0.5;
    scene.add(box);

    // 射線起點

    let spherePlasma = new THREE.Mesh(new THREE.SphereBufferGeometry(sphereRadius * 0.05, 24, 12), scene.userData.lightningMaterial);
    spherePlasma.position.copy(sphereMesh.position);
    spherePlasma.scale.y = 0.6;
    scene.add(spherePlasma);

    // 射線參數
    let rayDirection = new THREE.Vector3();
    let rayLength = 0;
    let vec1 = new THREE.Vector3();
    let vec2 = new THREE.Vector3();

    scene.userData.rayParams = {

        sourceOffset: sphereMesh.position,
        destOffset: new THREE.Vector3(sphereRadius, 0, 0).add(sphereMesh.position),
        radius0: 4,
        radius1: 4,
        radius0Factor: 0.82,
        minRadius: 2.5,
        maxIterations: 6,
        isEternal: true,

        timeScale: 0.6,
        propagationTimeFactor: 0.15,
        vanishingTimeFactor: 0.87,
        subrayPeriod: 0.8,
        ramification: 5,
        recursionProbability: 0.8,

        roughness: 0.85,
        straightness: 0.7,

        // 生成分支
        onSubrayCreation: (segment, parentSubray, childSubray, lightningStrike) => {

            lightningStrike.subrayConePosition(segment, parentSubray, childSubray, 0.6, 0.9, 0.7);

            // THREE.Sphere 投影

            vec1.subVectors(childSubray.pos1, lightningStrike.rayParameters.sourceOffset);
            vec2.set(0, 0, 0);
            if (lightningStrike.randomGenerator.random() < 0.7) {

                vec2.copy(rayDirection).multiplyScalar(rayLength * 1.0865);

            }
            vec1.add(vec2).setLength(rayLength);
            childSubray.pos1.addVectors(vec1, lightningStrike.rayParameters.sourceOffset);

        }

    }

    // 生成射線
    let lightningStrike;
    let lightningStrikeMesh;
    let outlineMeshArray = [];

    scene.userData.recreateRay = () => {

        if (lightningStrikeMesh) scene.remove(lightningStrikeMesh);

        lightningStrike = new LightningStrike(scene.userData.rayParams);
        lightningStrikeMesh = new THREE.Mesh(lightningStrike, scene.userData.lightningMaterial);

        outlineMeshArray.length = 0;
        outlineMeshArray.push(lightningStrikeMesh);
        outlineMeshArray.push(spherePlasma);

        scene.add(lightningStrikeMesh);
    }

    scene.userData.recreateRay();

    // Compose rendering
    composer.passes = [];
    composer.addPass(new RenderPass(ballScene, scene.userData.camera));

    let rayPass = new RenderPass(scene, scene.userData.camera);
    rayPass.clear = false; // 渲染前不清除
    composer.addPass(rayPass);

    let outlinePass = createOutline(scene, outlineMeshArray, scene.userData.outlineColor);

    scene.userData.render = (time) => {

        rayDirection.subVectors(lightningStrike.rayParameters.destOffset, lightningStrike.rayParameters.sourceOffset);
        rayLength = rayDirection.length();
        rayDirection.normalize();

        lightningStrike.update(time);

        controls.update();

        outlinePass.enabled = scene.userData.outlineEnabled;

        composer.render();

    }

    // Controls
    let controls = new OrbitControls(scene.userData.camera, renderer.domElement);
    controls.target.copy(sphereMesh.position);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Mouse Raycasting
    let sphere = new THREE.Sphere(sphereMesh.position, sphereRadius); // 數學函式(中心，半徑)
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('touchmove', onTouchMove);

    function onTouchMove(event) {

        let x, y;

        // 如果觸碰屏幕，不然則為滑鼠
        if (event.changedTouches) {
            x = event.changedTouches[0].pageX;
            y = event.changedTouches[0].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        mouse.x = (x / container_width) * 2 - 1;
        mouse.y = -(y / container_height) * 2 + 1;

        checkIntersection();

    }

    let intersection = new THREE.Vector3();
    function checkIntersection() {

        raycaster.setFromCamera(mouse, scene.userData.camera);
        let result = raycaster.ray.intersectSphere(sphere, intersection); // 將與球體接觸的點傳至intersection
        if (result !== null) lightningStrike.rayParameters.destOffset.copy(intersection);
    }

    return scene;

}

function createStormScene() {

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    scene.userData.canGoBackwardsInTime = false;

    scene.userData.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 20, 10000);

    // Lights
    scene.add(new THREE.AmbientLight(0x444444));

    let light1 = new THREE.DirectionalLight(0xffffff, 0.5);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    let posLight = new THREE.PointLight(0x00ffff);
    posLight.position.set(0, 100, 0);
    scene.add(posLight);

    // Ground
    let GROUND_SIZE = 1000;

    scene.userData.camera.position.set(0, 0.2, 1.6).multiplyScalar(GROUND_SIZE * 0.5);

    let ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(GROUND_SIZE, GROUND_SIZE), new THREE.MeshLambertMaterial({ color: 0x072302 }));
    ground.rotation.x = - Math.PI * 0.5;
    scene.add(ground);

    // 雷擊標記
    let starVertices = [];
    let prevPoint = new THREE.Vector3(0, 0, 1);
    let currPoint = new THREE.Vector3();
    for (let i = 0; i <= 16; i++) {
        currPoint.set(Math.sin(2 * Math.PI * i / 16), 0, Math.cos(2 * Math.PI * i / 16));
        if (i % 2 === 1) currPoint.multiplyScalar(0.3);
        starVertices.push(0, 0, 0);
        starVertices.push(prevPoint.x, prevPoint.y, prevPoint.z);
        starVertices.push(currPoint.x, currPoint.y, currPoint.z);

        prevPoint.copy(currPoint);

    }
    let starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    let starMesh = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: 0x020900 }));
    starMesh.scale.multiplyScalar(6);

    /********************************************創建風暴******************************************************/
    scene.userData.lightningColor = new THREE.Color(0xB0FFFF);
    scene.userData.outlineColor = new THREE.Color(0x00FFFF);

    scene.userData.lightningMaterial = new THREE.MeshBasicMaterial({ color: scene.userData.lightningColor });

    // 雷擊參數
    let rayDirection = new THREE.Vector3(0, - 1, 0);
    let rayLength = 0;
    let vec1 = new THREE.Vector3();
    let vec2 = new THREE.Vector3();

    scene.userData.rayParams = {

        radius0: 1,
        radius1: 0.5,
        minRadius: 0.3,
        maxIterations: 7,

        timeScale: 0.15,
        propagationTimeFactor: 0.2,
        vanishingTimeFactor: 0.9,
        subrayPeriod: 4,
        subrayDutyCycle: 0.6,

        maxSubrayRecursion: 3,
        ramification: 3,
        recursionProbability: 0.4,

        roughness: 0.85,
        straightness: 0.65,

        onSubrayCreation: function (segment, parentSubray, childSubray, lightningStrike) {

            lightningStrike.subrayConePosition(segment, parentSubray, childSubray, 0.6, 0.6, 0.5);

            // 平面投影
            rayLength = lightningStrike.rayParameters.sourceOffset.y;
            vec1.subVectors(childSubray.pos1, lightningStrike.rayParameters.sourceOffset);
            let proj = rayDirection.dot(vec1);
            vec2.copy(rayDirection).multiplyScalar(proj);
            vec1.sub(vec2);
            let scale = proj / rayLength > 0.5 ? rayLength / proj : 1;
            vec2.multiplyScalar(scale);
            vec1.add(vec2);
            childSubray.pos1.addVectors(vec1, lightningStrike.rayParameters.sourceOffset);

        }

    };

    // 生成風暴
    let storm = new LightningStorm({

        size: GROUND_SIZE,
        minHeight: 90,
        maxHeight: 200,
        maxSlope: 0.6,
        maxLightnings: 8,

        lightningParameters: scene.userData.rayParams, // 雷擊參數

        lightningMaterial: scene.userData.lightningMaterial,

        onLightningDown: function (lightning) {

            // 在雷擊時增加標記
            let star1 = starMesh.clone();
            star1.position.copy(lightning.rayParameters.destOffset);
            star1.position.y = 0.05;
            star1.rotation.y = 2 * Math.PI * Math.random();
            scene.add(star1);

        }

    });

    scene.add(storm);

    // Composer rendering
    composer.passes = [];
    composer.addPass(new RenderPass(scene, scene.userData.camera));
    createOutline(scene, storm.lightningsMeshes, scene.userData.outlineColor);

    // Controls
    let controls = new OrbitControls(scene.userData.camera, renderer.domElement);
    controls.target.y = GROUND_SIZE * 0.05;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.userData.render = function (time) {

        storm.update(time);

        controls.update();

        if (scene.userData.outlineEnabled) {

            composer.render();

        } else {

            renderer.render(scene, scene.userData.camera);

        }

    };

    return scene;

}

/***************************************************創建GUI****************************************************/
function createGUI() {

    if (gui) gui.destroy();

    gui = new GUI({ width: 350 });

    /*******************************************環境設置***********************************************/

    let sceneFolder = gui.addFolder('環境');
    scene.userData.sceneIndex = currentSceneIndex;
    sceneFolder.add(scene.userData, 'sceneIndex', { "Electric Cones": 0, "Plasma Ball": 1, "Storm": 2 }).name('scene').onChange((val) => {
        currentSceneIndex = val;
        createScene();
    });
    scene.userData.timeRate = 1;
    // 是否能讓時間倒退，如果能則為-1 ~ 1，不能則為0 ~ 1
    sceneFolder.add(scene.userData, 'timeRate', scene.userData.canGoBackwardsInTime ? -1 : 0, 1).name('Time rate');

    /***************************************閃電圖形色彩設置***********************************************/

    let graphicsFolder = gui.addFolder('圖形參數');

    graphicsFolder.add(scene.userData, "outlineEnabled").name("Glow enabled"); // 是否開啟輝光效果

    scene.userData.lightningColorRGB = [
        scene.userData.lightningColor.r * 255,
        scene.userData.lightningColor.g * 255,
        scene.userData.lightningColor.b * 255
    ];
    graphicsFolder.addColor(scene.userData, "lightningColorRGB").name('Color').onChange((val) => {
        scene.userData.lightningMaterial.color.setRGB(val[0], val[1], val[2]).multiplyScalar(1 / 255);
    })
    scene.userData.outlineColorRGB = [
        scene.userData.outlineColor.r * 255,
        scene.userData.outlineColor.g * 255,
        scene.userData.outlineColor.b * 255
    ];
    graphicsFolder.addColor(scene.userData, "outlineColorRGB").name('Glow color').onChange((val) => {
        scene.userData.outlineColor.setRGB(val[0], val[1], val[2]).multiplyScalar(1 / 255);
    })

    /***************************************閃電圖形特效設置***********************************************/

    let rayFolder = gui.addFolder("效果參數");

    rayFolder.add(scene.userData.rayParams, 'straightness', 0, 1).name('Straightness'); // 直線度
    rayFolder.add(scene.userData.rayParams, 'roughness', 0, 1).name('Roughness'); // 粗糙度
    rayFolder.add(scene.userData.rayParams, 'radius0', 0.1, 10).name('Initial radius'); // 起始半徑
    rayFolder.add(scene.userData.rayParams, 'radius1', 0.1, 10).name('Final radius'); // 結束半徑
    rayFolder.add(scene.userData.rayParams, 'radius0Factor', 0, 1).name('Subray initial radius'); // 分支起始半徑
    rayFolder.add(scene.userData.rayParams, 'radius1Factor', 0, 1).name('Subray final radius'); // 分支結束半徑
    rayFolder.add(scene.userData.rayParams, 'timeScale', 0, 5).name('Ray time scale'); // 射線的時間刻度
    rayFolder.add(scene.userData.rayParams, 'subrayPeriod', 0.1, 10).name('Subray period (s)'); // 分支持續時間
    rayFolder.add(scene.userData.rayParams, 'subrayDutyCycle', 0, 1).name('Subray duty cycle'); // 分支占比重

    /***************************************閃電圖形特效設置(slow)***********************************************/

    if (scene.userData.recreateRay) {

        // 修改之後重新定義的參數

        let raySlowFolder = gui.addFolder("效果參數(slow)");

        // 分支的數量
        raySlowFolder.add(scene.userData.rayParams, 'ramification', 0, 15).step(1).name('Ramification').onFinishChange(() => {
            scene.userData.recreateRay();
        });
        // 分支的小分支遞迴
        raySlowFolder.add(scene.userData.rayParams, 'maxSubrayRecursion', 0, 5).step(1).name('Recursion').onFinishChange(() => {
            scene.userData.recreateRay();
        });
        // 遞迴的可能性
        raySlowFolder.add(scene.userData.rayParams, 'recursionProbability', 0, 1).name('Rec. probability').onFinishChange(() => {
            scene.userData.recreateRay();
        });

    }

}