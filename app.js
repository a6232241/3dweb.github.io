import * as THREE from './three.js/build/three.module.js';

import Stats from './three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from './three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from './three.js/examples/jsm/controls/OrbitControls.js';

let container_width = window.innerWidth;
let container_height = window.innerHeight;

export default class App {

    //建立場景
    init() {
        this.container = document.querySelector('#scene-container');
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
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(container_width, container_height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {

        this.scene = new THREE.Scene();

        let axes = new THREE.AxesHelper(5);
        this.scene.add(axes);

        this.createCamera();
        this.createLights();

    }

    // 創建相機
    createCamera() {
        let fov = 20;
        let aspect = container_width / container_height;
        let near = 1;
        let far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(3, 16, 111);

        this.scene.add(this.camera);
    }

    // 創建光源
    createLights() {

        this.scene.add(new THREE.AmbientLight(0xffffff));

    }



    // 渲染更新
    render() {
        // this.controls.update();

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

    }

    onWindowResize() {

        container_width = window.innerWidth;
        container_height = window.innerHeight;

        this.camera.aspect = container_width / container_height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(container_width, container_height);

    }
}