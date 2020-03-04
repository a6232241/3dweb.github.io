import * as THREE from '../../../../three.js/build/three.module.js';

import Stats from '../../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../../three.js/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '../../../../three.js/examples/jsm/loaders/OBJLoader.js';

export default class App {

    //建立場景
    init() {
        this.container = document.querySelector('#scene-container');
        this.controls;

        this.container_width = window.innerWidth;
        this.container_height = window.innerHeight;

        this.group = new THREE.Object3D();
        this.gridSize = 40;
        this.buildings = [];

        this.mousePos();

        this.createRenderer();

        this.createScene();

        this.createControls();
        this.createEvent();

        this.renderer.setAnimationLoop(() => {
            this.render();
        });
    }

    // 取得滾輪位置
    mousePos() {
        this.mouseX = 3;
        this.lastMouseX = 3;
        this.lastMouseY = 65;
        this.lastScale = 155;
        this.tiltFx = {
        body: document.body,
        docEl: document.documentElement,
        getMousePos: (e, docScrolls) => {
            let posx = 0;
            let posy = 0;
            if (!e) { e = window.event; }

            // e.page 跟隨頁面滾動改變
            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY) {
                posx = e.clientX + docScrolls.left;
                posy = e.clientY + docScrolls.top;
            }
            return { x: posx, y: posy }
        },
        lerp: (a, b, n) => (1 - n) * a + n * b,
        lineEq: (y2, y1, x2, x1, currentVal) => {
            let m = (y2 - y1) / (x2 - x1);
            let b = y1 - m * x1;
            return m * currentVal + b;
        }
        };

        this.docheight = Math.max(
            this.tiltFx.body.scrollHeight,
            this.tiltFx.body.offsetHeight,
            this.tiltFx.docEl.clientHeight,
            this.tiltFx.docEl.scrollHeight,
            this.tiltFx.docEl.offsetHeight
        );
    }

    // 根據滾輪位置更新camera
    tilt() {
        this.lastMouseX = this.tiltFx.lerp(this.lastMouseX, this.tiltFx.lineEq(6, 0, this.container_width, 0, this.mouseX), 0.05);
        const newScrollingPos = window.pageYOffset;
        this.lastMouseY = this.tiltFx.lerp(this.lastMouseY, this.tiltFx.lineEq(0, 65, this.docheight, 0, newScrollingPos), 0.05);
        this.lastScale = this.tiltFx.lerp(this.lastScale, this.tiltFx.lineEq(0, 158, this.docheight, 0, newScrollingPos), 0.05);
        this.camera.position.set(this.lastMouseX, this.lastMouseY, this.lastScale);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container_width, this.container_height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog('#353c3c', 1, 208);

        this.createCamera();
        this.createLights();
        this.createFloor();
        this.loadModels('https://raw.githubusercontent.com/iondrimba/images/master/buildings.obj', this.onLoadComplete.bind(this));

    }

    // 創建相機
    createCamera() {
        let fov = 20;
        let aspect = this.container_width / this.container_height;
        let near = 1;
        let far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(3, 50, 155);

        this.scene.add(this.camera);
    }

    // 創建光源
    createLights() {

        this.scene.add(new THREE.AmbientLight(0xffffff));

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(100, 150, 100);
        spotLight.castShadow = true;

        this.scene.add(spotLight);

        const pointLight = new THREE.PointLight(0x00ff00, 4);
        pointLight.position.set(18, 22, -9);
        this.scene.add(pointLight);

    }

    createFloor() {
        let width = 200;
        let height = 200;
        let floorGeo = new THREE.PlaneGeometry(width, height);
        let floorMat = new THREE.MeshStandardMaterial({
            color: '#ccc',
            metalness: 0,
            emissive: '#000',
            roughness: 0,
        });
        let floor = new THREE.Mesh(floorGeo, floorMat);

        floor.rotateX(- Math.PI / 2);
        floor.position.y = 0;

        this.scene.add(floor);
    }

    loadModels(path, callback) {
        let loader = new OBJLoader();
        loader.load(path, callback);
    }

    onLoadComplete(model) {

        this.models = [...model.children].map((model) => {
            const scale = .01;
            model.scale.multiplyScalar(scale);
            model.position.set(0, -14, 0);
            model.receiveShadow = true;
            model.castShadow = true;
            return model;
        });

        this.createGrid();
    }

    createGrid() {
        let boxSize = 3;
        let max = .009;
        let min = .001;

        let meshParams = {
            color: '#fff',
            metalness: .58,
            emissive: '#000',
            roughness: .18,
        };

        let mat = new THREE.MeshPhysicalMaterial(meshParams);

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {

                // 每次迭代隨機呼叫一個模型並複製
                const building = this.getRandomBuiding().clone();

                building.material = mat;
                building.scale.y = Math.random() * (max - min + .01);
                building.position.x = (i * boxSize);
                building.position.z = (j * boxSize);

                this.group.add(building);

                this.buildings.push(building);
            }
        }

        this.scene.add(this.group);

        this.group.position.set(-this.gridSize - 10, 1, -this.gridSize - 10);

        setTimeout(() => {
            this.removeLoader();
            window.scrollTo(0, 0);
            document.body.style.overflow = "auto";
            console.log(document.body.style.overflow);
            this.showBuildings();
        }, 2000);
        
    }

    // 取得隨機model
    getRandomBuiding() {
        return this.models[Math.floor(Math.random() * Math.floor(this.models.length))];
    }

    // 移除load
    removeLoader() {
        document.querySelector('.load').remove();
    }

    // 根據model到相機z軸的排序(排序model z軸的大小)
    sortBuildingsByDistance() {
        this.buildings.sort((a, b) => {
            if (a.position.z > b.position.z) {
                return 1;
            }
            if (a.position.z < b.position.z) {
                return -1;
            }
            return 0;
        }).reverse();
    }

    // 定義動畫持續時間和延遲
    showBuildings() {
        this.sortBuildingsByDistance();

        this.buildings.forEach((building, index) => {
            TweenMax.to(building.position, .3 + (index / 350), { y: 1, ease: Power3.easeOut, delay: index / 350 });
        });
    }

    // 渲染更新
    render() {

        this.controls.update();

        this.renderer.render(this.scene, this.camera);

        this.tilt();

    }

    createControls() {

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.panSpeed = 0.1;
        this.controls.rotateSpeed = 0.1;
        this.controls.enabled = false;
        // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

    }

    createEvent() {

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this));

    }

    onWindowResize() {

        this.container_width = window.innerWidth;
        this.container_height = window.innerHeight;

        this.camera.aspect = this.container_width / this.container_height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.container_width, this.container_height);

        this.docheight = Math.max(
            this.tiltFx.body.scrollHeight,
            this.tiltFx.body.offsetHeight,
            this.tiltFx.docEl.clientHeight,
            this.tiltFx.docEl.scrollHeight,
            this.tiltFx.docEl.offsetHeight
        );

    }

    onMouseMove(ev) {
        const docScrolls = { left: this.tiltFx.body.scrollLeft + this.tiltFx.docEl.scrollLeft, top: this.tiltFx.body.scrollTop + this.tiltFx.docEl.scrollTop };
        const mp = this.tiltFx.getMousePos(ev, docScrolls);
        this.mouseX = mp.x - docScrolls.left;
    }
}