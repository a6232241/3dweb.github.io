import * as THREE from '../../../../three.js/build/three.module.js';

import Stats from '../../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../../three.js/examples/jsm/libs/dat.gui.module.js';

import { RectAreaLightUniformsLib } from '../../../../three.js/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from '../../../../three.js/examples/jsm/helpers/RectAreaLightHelper.js';

let container_width = window.innerWidth;
let container_height = window.innerHeight;

function mathRandom(num = 1) {
    let setNumber = -Math.random() * num + Math.random() * num;
    return setNumber;
}

export default class App {

    //建立場景
    init() {
        this.container = document.querySelector('#scene-container');
        this.uSpeed = 0.1;

        this.createRenderer();
        this.createScene();
        this.createRaycaster();

        this.createEvent();

        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        })
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container_width, container_height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.needsUpdate = true;

        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {

        this.scene = new THREE.Scene();
        this.color = 0x000000;
        this.scene.background = new THREE.Color(this.color);
        this.scene.fog = new THREE.Fog(this.color, 2.5, 3.5);

        // let axes = new THREE.AxesHelper(5);
        // this.scene.add(axes);

        this.createCamera();
        this.createLights();
        this.createMesh();

    }

    // 創建相機
    createCamera() {
        let fov = 35;
        let aspect = container_width / container_height;
        let near = 1;
        let far = 500;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 0, 3);

        this.scene.add(this.camera);
    }

    // 創建光源
    createLights() {

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.1));

        this.spotLight = new THREE.SpotLight(0xffffff, 3);
        this.spotLight.position.set(5, 5, 2);
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 10000;
        this.spotLight.shadow.mapSize.height = 10000;
        this.spotLight.penumbra = 0.5;
        this.scene.add(this.spotLight);

        this.pointLight = new THREE.PointLight(0x0fffff, 1);
        this.pointLight.position.set(0, -3, -1);
        this.scene.add(this.pointLight);

        let rectSize = 2;
        let intensity = 20;
        this.rectLight = new THREE.RectAreaLight(0x0fffff, intensity, rectSize, rectSize);
        this.rectLight.position.set(0, 0, 1);
        this.rectLight.lookAt(0, 0, 1);
        this.scene.add(this.rectLight);

        this.rectLightHelper = new RectAreaLightHelper(this.rectLight);
        // this.scene.add(this.rectLightHelper);

    }

    createMesh() {
        this.sceneGroup = new THREE.Object3D();
        this.particularGroup = new THREE.Object3D();
        this.modularGroup = new THREE.Object3D();

        this.createGenerateParticle(200, 2);
        this.createGenerateModular();

        this.sceneGroup.add(this.particularGroup);
        this.scene.add(this.modularGroup);
        this.scene.add(this.sceneGroup);
    }

    createGenerateParticle(num, amp = 2) {
        let gMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        let gParticular = new THREE.CircleGeometry(0.2, 5);

        for (let i = 1; i < num; i++) {
            let pscale = 0.001 + Math.abs(mathRandom(0.03));
            let particular = new THREE.Mesh(gParticular, gMat);
            particular.position.set(mathRandom(amp), mathRandom(amp), mathRandom(amp));
            particular.rotation.set(mathRandom(), mathRandom(), mathRandom());
            particular.scale.multiplyScalar(pscale);
            particular.speedValue = mathRandom();

            this.particularGroup.add(particular);
        }
    }

    createGenerateModular() {
        for (let i = 0; i < 30; i++) {
            let geo = new THREE.IcosahedronGeometry(1);
            let mat = new THREE.MeshStandardMaterial({ flatShading: true, color: 0x111111 });
            let cube = new THREE.Mesh(geo, mat);
            cube.speedRotation = Math.random() * 0.1;
            cube.posX = mathRandom();
            cube.posY = mathRandom();
            cube.posZ = mathRandom();
            cube.position.set(cube.posX, cube.posY, cube.posZ);
            cube.castShadow = true;
            cube.receiveShadow = true;

            let scaleValue = mathRandom(0.3);

            cube.scale.multiplyScalar(scaleValue);

            cube.rotation.x = mathRandom(180 * Math.PI / 180);
            cube.rotation.y = mathRandom(180 * Math.PI / 180);
            cube.rotation.z = mathRandom(180 * Math.PI / 180);

            this.modularGroup.add(cube);
        }
    }

    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.INTERSECTED;
        this.intersected;
    }

    // 渲染更新
    render() {
        // this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }

    update() {
        let time = performance.now() * 0.0003;
        
        for (let i = 0, l = this.particularGroup.children.length; i < l; i++){
            let obj = this.particularGroup.children[i];
            
            obj.rotation.x += obj.speedValue / 10;
            obj.rotation.y += obj.speedValue / 10;
            obj.rotation.z += obj.speedValue / 10;
        }
        this.particularGroup.rotation.y += 0.005;

        for( let i = 0, l = this.modularGroup.children.length; i < l; i++){
            let obj = this.modularGroup.children[i];
            
            obj.rotation.x += 0.008;
            obj.rotation.x += 0.005;
            obj.rotation.x += 0.003;

            obj.position.x = Math.sin(time * obj.posZ) * obj.posY;
            obj.position.y = Math.cos(time * obj.posX) * obj.posZ;
            obj.position.z = Math.sin(time * obj.posY) * obj.posX;
            
        }

        this.modularGroup.rotation.y -= ((this.mouse.x * 4) + this.modularGroup.rotation.y) * this.uSpeed;
        this.modularGroup.rotation.x -= ((-this.mouse.y * 4) + this.modularGroup.rotation.x) * this.uSpeed;
        this.camera.lookAt(this.scene.position);

    }

    createEvent() {

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('mousedown', this.onMouseDown.bind(this), false);

    }

    onWindowResize() {

        container_width = window.innerWidth;
        container_height = window.innerHeight;

        this.camera.aspect = container_width / container_height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(container_width, container_height);

    }

    onMouseMove(e) {
        e.preventDefault();
        this.mouse.x = (e.clientX / container_width) * 2 - 1;
        this.mouse.y = -(e.clientY / container_height) * 2 + 1;
    }

    onMouseDown(e) {
        e.preventDefault();
        this.onMouseMove(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.intersected = this.raycaster.intersectObjects(this.modularGroup.children);
        if (this.intersected.length > 0) {
            if (this.INTERSECTED != this.intersected[0].object) {
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);

                this.INTERSECTED = this.intersected[0].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                this.INTERSECTED.material.emissive.setHex(0xffff00);

                TweenMax.to(this.camera.position, 1, {
                    x: this.INTERSECTED.position.x,
                    y: this.INTERSECTED.position.y,
                    z: this.INTERSECTED.position.z + 3,
                    ease: Power2.easeInOut
                });
            } else {
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                this.INTERSECTED = null;
            }
        }
    }
}