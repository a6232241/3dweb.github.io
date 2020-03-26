import * as THREE from '../../../../three.js/build/three.module.js';

import Stats from '../../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../../three.js/examples/jsm/controls/OrbitControls.js';

let container_width = window.innerWidth;
let container_height = window.innerHeight;
let container_halfWidth = window.innerWidth / 2;
let container_halfHeight = window.innerHeight / 2;
let mouseX = 0, mouseY = 0;

let canvasWidth = 240;
let canvasHeight = 240;

let graphicsOffsetX = canvasWidth / 2;
let graphicsOffsetY = canvasHeight / 4;

// 重製圖案前，將 particle 打散
function randomPos(vector, outFrame = false) {
    const radius = outFrame ? (container_width * 2) : (container_width * -2);
    const centerX = 0;
    const centerY = 0;

    const r = container_width + radius * Math.random();
    const angle = Math.random() * Math.PI * 2;

    vector.x = centerX + r * Math.cos(angle);
    vector.y = centerY + r * Math.sin(angle);
    vector.z = Math.random() * container_width;
}

// 取得圖形的AttrPosition
function getGraphicPos(pixel) {
    let posX = (pixel.x - graphicsOffsetX - Math.random() * 4 - 2) * 3;
    let posY = (pixel.y - graphicsOffsetY - Math.random() * 4 - 2) * 3;
    let posZ = -20 * Math.random() + 40;

    return { x: posX, y: posY, z: posZ };
}

export default class App {

    //建立場景
    init() {
        this.container = document.querySelector('#scene-container');
        this.controls;

        this.createRenderer();
        this.createScene();

        this.createEvent();

        this.renderer.setAnimationLoop(() => {
            this.render();
        })
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container_width, container_height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        this.createCamera();
        this.createLights();
        this.createCanvas();
        this.createSlider();
        this.createBgObjects();
        this.updateGraphic();

    }

    // 創建相機
    createCamera() {
        let fov = 75;
        let aspect = container_width / container_height;
        let near = 1;
        let far = 3000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 800;

        this.scene.add(this.camera);

        this.cameraLookAt = new THREE.Vector3(0, 0, 0);
        this.cameraTarget = new THREE.Vector3(0, 0, 800);
    }

    // 創建光源
    createLights() {

        this.shadowLight = new THREE.DirectionalLight(0xffffff, 2);
        this.shadowLight.position.set(20, 0, 10);
        this.scene.add(this.shadowLight);

        this.light = new THREE.DirectionalLight(0xffffff, 1.5);
        this.light.position.set(-20, 0, 20);
        this.scene.add(this.light);

        this.backLight = new THREE.DirectionalLight(0xffffff, 1);
        this.backLight.position.set(0, 0, -20);
        this.scene.add(this.backLight);

    }

    // 建立畫布
    createCanvas() {
        this.gCanvas = document.createElement('canvas');
        this.gCanvas.width = canvasWidth;
        this.gCanvas.height = canvasHeight;
        this.gCtx = this.gCanvas.getContext('2d');
        this.graphics = document.querySelectorAll('.intro-cell > img');

        // particle 總數
        this.particles = [];
        // 當前圖案
        this.currentGraphic = 0;
    }

    // 將圖案轉換為畫布，並取得 attrPos
    updateGraphic() {

        // 清空畫布
        this.gCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        this.img = this.graphics[this.currentGraphic];
        this.gCtx.drawImage(this.img, 0, 0, canvasWidth, canvasHeight);
        this.gData = this.gCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

        this.graphicPixels = [];

        for (let i = this.gData.length; i >= 0; i -= 4) {
            if(this.gData[i] == 0) {
                const x = (i / 4) % canvasWidth;
                const y = canvasHeight - Math.floor(Math.floor(i / canvasWidth) / 4);
        
                if((x && x % 2 == 0) && (y && y % 2 == 0)) {
                  this.graphicPixels.push({
                    x: x,
                    y: y
                  });
                }
            }
        }

        // 改變圖片前先打散 particle
        for (let i = 0; i < this.particles.length; i++) {
            randomPos(this.particles[i].particle.targetPosition);
        }

        setTimeout(() => {
            this.setParticles();
        }, 500);

    }

    // 將 attrPos 轉為 Object3D
    setParticles() {

        for (let i = 0; i < this.graphicPixels.length; i++) {
            // 若存在 particle 則轉為新的位置，沒有則新增
            if (this.particles[i]) {
                let pos = getGraphicPos(this.graphicPixels[i]);
                this.particles[i].particle.targetPosition.x = pos.x;
                this.particles[i].particle.targetPosition.y = pos.y;
                this.particles[i].particle.targetPosition.z = pos.z;
            } else {
                let p = new Particle(this.graphicPixels[i]);
                p.init(i);
                this.particles[i] = p;
                this.scene.add(p.particle);
            }
        }

        for (let i = this.graphicPixels.length; i < this.particles.length; i++) {
            randomPos(this.particles[i].particle.targetPosition, true);
        }

        console.log('Total Particles: ' + this.particles.length);
    }

    // 更新Particle的旋轉、位置
    particlesUpdate() {
        for (let i = 0, l = this.particles.length; i < l; i++) {
            this.particles[i].updateRotation();
            this.particles[i].updatePosition();
        }
    }

    createBgObjects() {
        for (let i = 0; i < 40; i++) {
            let geo = new THREE.SphereBufferGeometry(10, 6, 6);
            let mat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
            let sphere = new THREE.Mesh(geo, mat);

            let x = Math.random() * container_width * 2 - container_width;
            let y = Math.random() * container_height * 2 - container_height;
            let z = Math.random() * -2000 - 200;
            sphere.position.set(x, y, z);

            this.scene.add(sphere);
        }
    }

    // 建立 carousel
    createSlider() {
        const elem = document.querySelector('.intro-carousel');
        const flktyParam = {
            cellAlign: 'center',
            pageDots: false,
            wrapAround: true,
            resize: true
        };
        this.flkty = new Flickity(elem, flktyParam);

        this.flkty.on('select', this.listener.bind(this));
    }

    listener() {
        this.currentGraphic = this.flkty.selectedIndex;
        this.updateGraphic();
        console.log(this.flkty.selectedIndex);
    }

    // 渲染更新
    render() {
        // this.controls.update();
        this.particlesUpdate();
        this.camera.position.lerp(this.cameraTarget, 0.2);
        this.camera.lookAt(this.cameraLookAt);
        this.renderer.render(this.scene, this.camera);
    }

    createEvent() {

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    }

    onWindowResize() {

        container_width = window.innerWidth;
        container_height = window.innerHeight;

        container_halfWidth = window.innerWidth / 2;
        container_halfHeight = window.innerHeight / 2;


        this.camera.aspect = container_width / container_height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(container_width, container_height);

    }

    onMouseMove(e) {
        mouseX = (e.clientX - container_halfWidth);
        mouseY = (e.clientY - container_halfHeight);
        this.cameraTarget.x = (mouseX * -1) / 2;
        this.cameraTarget.y = mouseY / 2;
    }
}


// 創建particle
class Particle {

    // 取得圖案的 attrPos
    constructor(graphicsPixelPos) {
        this.graphicsPixelPos = graphicsPixelPos;

        this.vx = Math.random() * 0.05;
        this.vy = Math.random() * 0.05;
        this.colors = ['#F7A541', '#F45D4C', '#FA2E59', '#4783c3', '#9c6cb7'];
    }

    // 根據 attrPos 生成一個 sphereGeo
    init(i) {

        this.geoCore = new THREE.SphereGeometry(2, 4, 4);
        this.matCore = new THREE.MeshBasicMaterial({ color: this.colors[i % this.colors.length] });
        this.box = new THREE.Mesh(this.geoCore, this.matCore);

        for (let i = 0; i < this.box.geometry.vertices.length; i++) {
            this.box.geometry.vertices[i].x += -2 + Math.random() * 4;
            this.box.geometry.vertices[i].y += -2 + Math.random() * 4;
            this.box.geometry.vertices[i].z += -2 + Math.random() * 4;
        }

        this.particle = new THREE.Object3D();
        this.pos = getGraphicPos(this.graphicsPixelPos);
        this.particle.targetPosition = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);
        this.particle.position.set(container_width / 2, container_height / 2, -10 * Math.random() + 20);
        randomPos(this.particle.position);

        this.particle.add(this.box);

    }

    // 旋轉
    updateRotation() {
        this.particle.rotation.x += this.vx;
        this.particle.rotation.y += this.vy;
    }

    // 移動
    updatePosition() {
        this.particle.position.lerp(this.particle.targetPosition, 0.1);
    }
}