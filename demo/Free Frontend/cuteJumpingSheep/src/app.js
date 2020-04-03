import * as THREE from '../../../../three.js/build/three.module.js';

import Stats from '../../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../../three.js/examples/jsm/controls/OrbitControls.js';

let container_width = window.innerWidth;
let container_height = window.innerHeight;

let container = document.querySelector('#scene-container');

let mouseDown = false;
let night = false;

function rad(degress) {
    return degress * (Math.PI / 180);
}

export default class App {

    //建立場景
    init() {
        
        this.controls;

        this.createRenderer();
        this.createScene();

        this.createControls();
        this.createEvent();

        this.renderer.setAnimationLoop(() => {
            this.render();
        })
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(container_width, container_height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(this.renderer.domElement);
    }

    createScene() {

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xccdcda);

        // let axes = new THREE.AxesHelper(5);
        // this.scene.add(axes);

        this.createCamera();
        this.createLights();
        this.drawSheep();
        this.drawCloud();
        this.drawSky();

    }

    // 創建相機
    createCamera() {
        let fov = 75;
        let aspect = container_width / container_height;
        let near = 0.1;
        let far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 0.7, 8);
        this.camera.lookAt(this.scene.position);

        this.scene.add(this.camera);
    }

    // 創建光源
    createLights() {

        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        this.scene.add(this.hemiLight);

        this.dirLight1 = new THREE.DirectionalLight(0xffd798, 0.3);
        this.dirLight1.castShadow = true;
        this.dirLight1.position.set(9.5, 8.2, 8.3);
        this.scene.add(this.dirLight1);

        this.dirLight2 = new THREE.DirectionalLight(0xc9ceff, 0.5);
        this.dirLight2.castShadow = true;
        this.dirLight2.position.set(-15.8, 5.2, 8);
        this.scene.add(this.dirLight2);

    }

    drawSheep() {
        this.sheep = new Sheep();
        this.scene.add(this.sheep.group);
    }

    drawCloud() {
        this.cloud = new Cloud();
        this.scene.add(this.cloud.group);
    }

    drawSky() {
        this.sky = new Sky();
        this.sky.showNightSky(night);
        this.scene.add(this.sky.group);
    }

    // 渲染更新
    render() {
        
        this.sheep.jumpOnMouseDown();
        if(this.sheep.group.position.y > 0.4) this.cloud.bend();

        this.sky.moveSky();

        this.renderer.render(this.scene, this.camera);
    }

    createControls() {

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.panSpeed = 0.1;
        this.controls.rotateSpeed = 0.1;
        // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

    }

    createEvent() {

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('touchstart', this.onTouchStart(this));
        document.addEventListener('touchend', this.onTouchEnd(this));

        this.toggleBtn = document.querySelector('.toggle');
        this.toggleBtn.addEventListener('click', this.toggleNight.bind(this));

    }

    onWindowResize() {

        container_width = window.innerWidth;
        container_height = window.innerHeight;

        this.camera.aspect = container_width / container_height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(container_width, container_height);

    }

    onMouseDown(e) {
        mouseDown = true;
    }

    onTouchStart(e) {

        let target = e.targetTouches;
        if(target > 1) {
            if(target === 'toggle' || target === 'toggle-music') return;
            e.preventDefault();
            mouseDown = true;
        }
        
    }

    onMouseUp(e) {
        mouseDown = false;
    }

    onTouchEnd(e) {
        let target = e.targetTouches;
        if(target > 1) {
            if(target === 'toggle' || target === 'toggle-music') return;
            e.preventDefault();
            mouseDown = false;
        }
    }

    toggleNight() {
    
        night = !night;
    
        this.toggleBtn.classList.toggle('toggle-night');
        container.classList.toggle('night');

        if(night) {
            this.scene.background = new THREE.Color(0x1e0f4c);
        }else{
            this.scene.background = new THREE.Color(0xccdcda);
        }

        this.sky.showNightSky(night);
    }
}

class Sheep {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.y = 0.4;

        this.woolMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1,
            flatShading: true
        });
        this.skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaf8b,
            roughness: 1,
            flatShading: true
        });
        this.darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4b4553,
            roughness: 1,
            flatShading: true
        });

        this.vAngle = 0;

        this.drawBody();
        this.drawHead();
        this.drawLegs();
    }

    drawBody() {
        const bodyGeometry = new THREE.IcosahedronGeometry(1.7, 0);
        const body = new THREE.Mesh(bodyGeometry, this.woolMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        this.group.add(body);
    }

    drawHead() {
        const head = new THREE.Group();
        head.position.set(0, 0.65, 1.6);
        head.rotation.x = rad(-20);
        this.group.add(head);
        
        const foreheadGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.7);
        const forehead = new THREE.Mesh(foreheadGeometry, this.skinMaterial);
        forehead.castShadow = true;
        forehead.receiveShadow = true;
        forehead.position.y = -0.15;
        head.add(forehead);
        
        const faceGeometry = new THREE.CylinderGeometry(0.5, 0.15, 0.4, 4, 1);
        const face = new THREE.Mesh(faceGeometry, this.skinMaterial);
        face.castShadow = true;
        face.receiveShadow = true;
        face.position.y = -0.65;
        face.rotation.y = rad(45);
        head.add(face);
        
        const woolGeometry = new THREE.BoxGeometry(0.84, 0.46, 0.9);
        const wool = new THREE.Mesh(woolGeometry, this.woolMaterial);
        wool.position.set(0, 0.12, 0.07);
        wool.rotation.x = rad(20);
        head.add(wool);
        
        const rightEyeGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.06, 6);
        const rightEye = new THREE.Mesh(rightEyeGeometry, this.darkMaterial);
        rightEye.castShadow = true;
        rightEye.receiveShadow = true;
        rightEye.position.set(0.35, -0.48, 0.33);
        rightEye.rotation.set(rad(130.8), 0, rad(-45));
        head.add(rightEye);
        
        const leftEye = rightEye.clone();
        leftEye.position.x = -rightEye.position.x;
        leftEye.rotation.z = -rightEye.rotation.z;
        head.add(leftEye);
        
        const rightEarGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.3);
        rightEarGeometry.translate(0, -0.25, 0);
        this.rightEar = new THREE.Mesh(rightEarGeometry, this.skinMaterial);
        this.rightEar.castShadow = true;
        this.rightEar.receiveShadow = true;
        this.rightEar.position.set(0.35, -0.12, -0.07);
        this.rightEar.rotation.set(rad(20), 0, rad(50));
        head.add(this.rightEar);
        
        this.leftEar = this.rightEar.clone();
        this.leftEar.position.x = -this.rightEar.position.x;
        this.leftEar.rotation.z = -this.rightEar.rotation.z;
        head.add(this.leftEar);
    }

    drawLegs() {
        const legGeometry = new THREE.CylinderGeometry(0.3, 0.15, 1, 4);
        legGeometry.translate(0, -0.5, 0);
        this.frontRightLeg = new THREE.Mesh(legGeometry, this.darkMaterial);
        this.frontRightLeg.castShadow = true;
        this.frontRightLeg.receiveShadow = true;
        this.frontRightLeg.position.set(0.7, -0.8, 0.5);
        this.frontRightLeg.rotation.x = rad(-12);
        this.group.add(this.frontRightLeg);
        
        this.frontLeftLeg = this.frontRightLeg.clone();
        this.frontLeftLeg.position.x = -this.frontRightLeg.position.x;
        this.frontLeftLeg.rotation.z = -this.frontRightLeg.rotation.z;
        this.group.add(this.frontLeftLeg);
        
        this.backRightLeg = this.frontRightLeg.clone();
        this.backRightLeg.position.z = -this.frontRightLeg.position.z;
        this.backRightLeg.rotation.x = -this.frontRightLeg.rotation.x;
        this.group.add(this.backRightLeg);
        
        this.backLeftLeg = this.frontLeftLeg.clone();
        this.backLeftLeg.position.z = -this.frontLeftLeg.position.z;
        this.backLeftLeg.rotation.x = -this.frontLeftLeg.rotation.x;
        this.group.add(this.backLeftLeg);
    }

    jump(speed) {
        
        this.vAngle += speed;
        this.group.position.y = Math.sin(this.vAngle) + 1.38;

        // leg 動作
        const legRotation = Math.sin(this.vAngle) * Math.PI / 6 + 0.4;

        this.frontRightLeg.rotation.z = legRotation;
        this.backRightLeg.rotation.z = legRotation;
        this.frontLeftLeg.rotation.z = -legRotation;
        this.backLeftLeg.rotation.z = -legRotation;

        // ear 動作
        const earRotation = Math.sin(this.vAngle) * Math.PI / 3 + 1.5;

        this.rightEar.rotation.z = earRotation;
        this.leftEar.rotation.z = -earRotation;

    }

    jumpOnMouseDown() {
        if(mouseDown) {
            this.jump(0.05);
        } else {
            if ( this.group.position.y <= 0.4 ) return;
            this.jump(0.08);
        }
    }
}

class Cloud {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.y = -2;
        this.group.scale.multiplyScalar(1.5);

        this.material = new THREE.MeshStandardMaterial({
            color: 0xacb3fb,
            roughness: 1,
            flatShading: true
        });

        this.vAngle = 0;
    
        this.drawParts();
        
        this.group.traverse((part) => {
            part.castShadow = true;
            part.receiveShadow = true;
        });
    }

    drawParts() {
        const partGeometry = new THREE.IcosahedronGeometry(1, 0);
        this.upperPart = new THREE.Mesh(partGeometry, this.material);
        this.group.add(this.upperPart);
        
        this.leftPart = this.upperPart.clone();
        this.leftPart.position.set(-1.2, -0.3, 0);
        this.leftPart.scale.set(0.8, 0.8, 0.8);
        this.group.add(this.leftPart);
        
        this.rightPart = this.leftPart.clone();
        this.rightPart.position.x = -this.leftPart.position.x;
        this.group.add(this.rightPart);
        
        this.frontPart = this.leftPart.clone();
        this.frontPart.position.set(0, -0.4, 0.9);
        this.frontPart.scale.set(0.7, 0.7, 0.7);
        this.group.add(this.frontPart);
        
        this.backPart = this.frontPart.clone();
        this.backPart.position.z = -this.frontPart.position.z;
        this.group.add(this.backPart);
    }

    bend() {
        this.vAngle += 0.08;
        
        this.upperPart.position.y = -Math.cos(this.vAngle) * 0.12;
        this.leftPart.position.y = -Math.cos(this.vAngle) * 0.1 - 0.3;
        this.rightPart.position.y = -Math.cos(this.vAngle) * 0.1 - 0.3;
        this.frontPart.position.y = -Math.cos(this.vAngle) * 0.08 - 0.3;
        this.backPart.position.y = -Math.cos(this.vAngle) * 0.08 - 0.3;
    }
}

class Sky {
    constructor() {
        this.group = new THREE.Group();
    
        this.daySky = new THREE.Group();
        this.nightSky = new THREE.Group();
        
        this.group.add(this.daySky);
        this.group.add(this.nightSky);
        
        this.colors = {
        day: [0xFFFFFF, 0xEFD2DA, 0xC1EDED, 0xCCC9DE],
        night: [0x5DC7B5, 0xF8007E, 0xFFC363, 0xCDAAFD, 0xDDD7FE],
        };
        
        this.drawSky('day');
        this.drawSky('night');
        this.drawNightLights();
    }

    drawSky(phase) {
        for (let i = 0; i < 30; i ++) {
          const geometry = new THREE.IcosahedronGeometry(0.4, 0);
          const material = new THREE.MeshStandardMaterial({
            color: this.colors[phase][Math.floor(Math.random() * this.colors[phase].length)],
            roughness: 1,
            flatShading: true
          });
          const mesh = new THREE.Mesh(geometry, material);
    
          mesh.position.set((Math.random() - 0.5) * 30,
                             (Math.random() - 0.5) * 30,
                             (Math.random() - 0.5) * 30);
          if (phase === 'day') {
            this.daySky.add(mesh);
          } else {
            this.nightSky.add(mesh);
          }
        }
    }

    drawNightLights() {
        const geometry = new THREE.SphereGeometry(0.1, 5, 5);
        const material = new THREE.MeshStandardMaterial({
          color: 0xFF51B6,
          roughness: 1,
          flatShading: true
        });
        
        for (let i = 0; i < 3; i ++) {
          const light = new THREE.PointLight(0xF55889, 1.5, 30);
          const mesh = new THREE.Mesh(geometry, material);
          light.add(mesh);
          
          light.position.set((Math.random() - 2) * 6,
                             (Math.random() - 2) * 6,
                             (Math.random() - 2) * 6);
          light.updateMatrix();
          light.matrixAutoUpdate = false;
          
          this.nightSky.add(light);
        }
    }

    showNightSky(condition) {
        if (condition) {
          this.daySky.position.set(100, 100, 100);
          this.nightSky.position.set(0, 0, 0);
        } else {
          this.daySky.position.set(0, 0, 0);
          this.nightSky.position.set(100, 100, 100);
        }
    }

    moveSky() {
        this.group.rotation.x += 0.001;
        this.group.rotation.y -= 0.004;
    }
}

const worldMusic = document.querySelector('.world-music');
worldMusic.volume = 0.3;
worldMusic.loop = true;

const btnMusic = document.querySelector('.toggle-music');
btnMusic.addEventListener('click', toggleMusic);

let playMusic = false;

function toggleMusic() {
    playMusic = !playMusic;
    btnMusic.classList.toggle('music-off');
    playMusic? worldMusic.play() : worldMusic.pause();
}
