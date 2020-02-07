import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

import { CopyShader } from '../../../three.js/examples/jsm/shaders/CopyShader.js';
import { DigitalGlitch } from '../../../three.js/examples/jsm/shaders/DigitalGlitch.js';
import { EffectComposer } from '../../../three.js/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../../three.js/examples/jsm/postprocessing/RenderPass.js';
import { MaskPass } from '../../../three.js/examples/jsm/postprocessing/MaskPass.js';
import { ShaderPass } from '../../../three.js/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from '../../../three.js/examples/jsm/postprocessing/GlitchPass.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer;
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let gridGeo, gridMat, grid, gridEdge;
let bgGeo, bgMat, bg;
let timetrack = 0.01;
let composer, glitchPass;
let clock = new THREE.Clock();
let isScroll = false;

let datboi, waddupTime;
let boiLoader = new THREE.TextureLoader();
boiLoader.setCrossOrigin('');
let boiMap = boiLoader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/datboi.png");
let textureAnim = new textureAnimator(boiMap, 5, 1, 5, 100);

//建立場景
function init() {

    createRenderer();
    createScene();

    // createControls();
    createEvent();

    renderer.setAnimationLoop(() => {
        if (!isScroll) {
            // update();
            render();
        }
    });
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container_width, container_height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

function createScene() {

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(600);
    // scene.add(axes);

    createCamera();
    createLights();
    createGrid();
    createSkydome();
    loadDatboi();
    createComposer();

}

// 創建相機
function createCamera() {

    let fov = 120;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 115;
    camera.position.y = 490;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createGrid() {

    gridGeo = new THREE.SphereBufferGeometry(500, 359, 179);
    gridMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
    grid = new THREE.Mesh(gridGeo, gridMat);
    scene.add(grid);

    gridEdge = new THREE.LineSegments(new THREE.EdgesGeometry(gridGeo), new THREE.LineBasicMaterial({ color: 0xaaaaff, linewidth: 3 }));
    gridEdge.rotation.z = 1 / 2 * Math.PI;
    scene.add(gridEdge);

}

function createSkydome() {

    let loader = new THREE.TextureLoader();
    loader.setCrossOrigin('');
    let uniforms = {
        texture: {
            type: 't',
            value: loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/milk.jpg')
        }
    }

    bgMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('sky-vertex').textContent,
        fragmentShader: document.getElementById('sky-fragment').textContent,
        side: THREE.BackSide
    });
    bgGeo = new THREE.SphereBufferGeometry(10000, 60, 40);
    bg = new THREE.Mesh(bgGeo, bgMat);
    bg.renderDepth = 1000.0;
    bg.rotation.set(0, 1 / 4 * Math.PI, 1 / 4 * Math.PI);
    scene.add(bg);

}

function loadDatboi() {

    let mat = new THREE.MeshBasicMaterial({ map: boiMap, transparent: true, side: THREE.DoubleSide });
    let geo = new THREE.PlaneGeometry(10, 10, 1, 1);
    datboi = new THREE.Mesh(geo, mat);
    datboi.position.set(5, -505 * Math.sin(timetrack / 3), 505 * Math.cos(timetrack / 3));
    datboi.rotation.x = timetrack / 3 + 90;
    scene.add(datboi);
}

function createComposer() {

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    glitchPass = new GlitchPass();
    glitchPass.renderToScreen = true;
    composer.addPass(glitchPass);

}

init();

// 渲染更新
function render() {

    grid.rotation.x += 0.0016;
    bg.rotation.x += 0.0016;

    timetrack += 0.01;
    let delta = clock.getDelta();
    textureAnim.update(1000 * delta);
    datboi.position.set(0, -504 * Math.sin(timetrack / 3), 504 * Math.cos(timetrack / 3));
    datboi.rotation.x = timetrack / 3 + 90;
    if (datboi.position.z > 108 && datboi.position.z < 115 && datboi.position.y > 0) {

        isScroll = true;
        glitchPass.goWild = true;
        document.getElementById("OHSHIT").style.display = 'flex';
        composer.render();
        window.clearTimeout(waddupTime);
        waddupTime = window.setTimeout(() => {
            isScroll = false;
            glitchPass.goWild = false;
        }, 1000);

    } else {

        document.getElementById('OHSHIT').style.display = 'none';
        renderer.render(scene, camera);

    }



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