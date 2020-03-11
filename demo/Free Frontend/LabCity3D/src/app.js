import * as THREE from '../../../../three.js/build/three.module.js';

import Stats from '../../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../../three.js/examples/jsm/controls/OrbitControls.js';

export default class App {

    //建立場景
    init() {
        this.container = document.querySelector('#scene-container');
        this.controls;

        this.container_width = window.innerWidth;
        this.container_height = window.innerHeight;

        this.city = new THREE.Object3D();
        this.smoke = new THREE.Object3D();
        this.town = new THREE.Object3D();

        this.createCarPos = true;
        this.uSpeed = 0.005;

        this.createRenderer();
        this.createScene();
        this.createCars();

        // this.createControls();
        this.createEvent();

        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        })
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container_width, this.container_height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        if (this.container_width > 800) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.needsUpdate = true;
        }

        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {

        this.scene = new THREE.Scene();

        this.setcolor = 0xf02050;
        this.scene.background = new THREE.Color(this.setcolor);
        this.scene.fog = new THREE.Fog(this.setcolor, 10, 16);

        this.createCamera();
        this.createLights();
        this.createTown();
        this.createEnv();

    }

    // 創建相機
    createCamera() {
        let fov = 25;
        let aspect = this.container_width / this.container_height;
        let near = 1;
        let far = 500;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 2, 14);

        this.scene.add(this.camera);
    }

    // 創建光源
    createLights() {

        this.scene.add(new THREE.AmbientLight(0xffffff, 4));

        this.lightFront = new THREE.SpotLight(0xffffff, 20, 10);
        this.lightFront.rotation.x = 45 * Math.PI / 180;
        this.lightFront.rotation.z = -45 * Math.PI / 180;
        this.lightFront.position.set(5, 5, 5);
        this.lightFront.castShadow = true;
        this.lightFront.shadow.mapSize.width = 6000;
        this.lightFront.shadow.mapSize.height = 6000;
        this.lightFront.penumbra = 0.1;
        this.scene.add(this.lightFront);

        this.lightBack = new THREE.PointLight(0xffffff, .5);
        this.lightBack.position.set(0, 6, 0);
        this.scene.add(this.lightBack);

        // this.scene.add(new THREE.SpotLightHelper(this.lightFront));

    }

    mathRandom(num = 8) {
        this.numValue = - Math.random() * num + Math.random() * num;
        return this.numValue;
    }

    setTintColor() {
        this.setTintNum = true;

        if (this.setTintNum) {
            this.setTintNum = false;
            this.setColor = 0x000000;
        } else {
            this.setTintNum = true;
            this.setColor = 0x000000;
        }

        return this.setColor;
    }

    createTown() {

        this.segments = 2;
        for (let i = 0; i < 100; i++) {
            let geo = new THREE.CubeGeometry(1, 0, 0, this.segments, this.segments, this.segments);
            let mat = new THREE.MeshStandardMaterial({
                color: this.setTintColor(),
                flatShading: true,
                side: THREE.DoubleSide,
            });
            let wMat = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0.03,
                side: THREE.DoubleSide,
            });

            // 樓層
            let cube = new THREE.Mesh(geo, mat);
            let wCube = new THREE.Mesh(geo, wMat);

            cube.add(wCube);
            cube.castShadow = true;
            cube.receiveShadow = true;
            cube.rotationValue = 0.1 + Math.abs(this.mathRandom(8));

            let cubeWidth = 0.9;
            cube.scale.y = 0.1 + Math.abs(this.mathRandom(8));
            cube.scale.x = cube.scale.z = cubeWidth + this.mathRandom(1 - cubeWidth);

            cube.position.x = Math.round(this.mathRandom());
            cube.position.z = Math.round(this.mathRandom());

            // 樓層地基
            let floor = new THREE.Mesh(geo, mat);
            floor.scale.y = 0.05;
            floor.position.set(cube.position.x, 0, cube.position.z);

            this.town.add(floor);
            this.town.add(cube);

            this.city.add(this.town);
        }

    }

    createEnv() {

        // 建立smoke
        let sMat = new THREE.MeshToonMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        let sGeo = new THREE.CircleGeometry(0.01, 3);
        let sRandomNum = 5;
        for (let h = 1; h < 300; h++) {
            let smoke = new THREE.Mesh(sGeo, sMat);
            smoke.position.set(this.mathRandom(sRandomNum), this.mathRandom(sRandomNum), this.mathRandom(sRandomNum));
            smoke.rotation.set(this.mathRandom(), this.mathRandom(), this.mathRandom());
            this.smoke.add(smoke);
        }

        // 建立地板
        let pMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 10,
            metalness: 0.6,
        });
        let pGeo = new THREE.PlaneGeometry(60, 60);
        let plane = new THREE.Mesh(pGeo, pMat);
        plane.position.y = -.0001;
        plane.rotation.x = - Math.PI / 2;
        plane.receiveShadow = true;

        let gridHelper = new THREE.GridHelper(60, 120, 0xff0000, 0x000000);
        this.city.add(gridHelper);

        this.city.add(this.smoke);
        this.city.add(plane);

    }

    createCars() {
        let cScale = 0.1;
        let cPos = 20;
        let cColor = 0xffff00;
        let cAmp = 3;

        for (let i = 0; i < 60; i++) {
            let cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide });
            let cGeo = new THREE.CubeGeometry(1, cScale / 40, cScale / 40);
            let car = new THREE.Mesh(cGeo, cMat);

            car.receiveShadow = true;
            car.castShadow = true;
            car.position.y = Math.abs(this.mathRandom(5));

            if (this.createCarPos) {
                this.createCarPos = false;
                car.position.x = -cPos;
                car.position.z = (this.mathRandom(cAmp));

                TweenMax.to(car.position, 3, { x: cPos, repeat: -1, yoyo: true, delay: this.mathRandom(3) });
            } else {
                this.createCarPos = true;
                car.position.x = (this.mathRandom(cAmp));
                car.position.z = -cPos;
                car.rotation.y = 90 * Math.PI / 180;

                TweenMax.to(car.position, 5, { z: cPos, repeat: -1, yoyo: true, delay: this.mathRandom(3), ease: Power1.easeInOut });
            };

            this.city.add(car);
        }

        this.scene.add(this.city);
    }

    // 渲染更新
    render() {
        // this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    update() {

        // let time = Date.now() * .00005;

        this.city.rotation.y -= ((this.mouse.x * 8) - this.camera.rotation.y) * this.uSpeed;
        this.city.rotation.x -= (-(this.mouse.y * 2) - this.camera.rotation.x) * this.uSpeed;
        if(this.city.rotation.x < -.05) this.city.rotation.x = -.05;
        else if(this.city.rotation.x > 1) this.city.rotation.x = 1;

        // let cityRotation = Math.sin(Date.now() / 5000) * 13;
        // for(let i = 0, l = this.town.children.length; i < l; i++) {
        //     let obj = this.town.children[i];
        // }

        this.smoke.rotation.y += .01;
        this.smoke.rotation.x += .01;

        this.camera.lookAt(this.city.position);

    }

    createControls() {

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.panSpeed = 0.1;
        this.controls.rotateSpeed = 0.1;
        // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

    }

    createEvent() {

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.createMouseMove();

    }

    onWindowResize() {

        this.container_width = window.innerWidth;
        this.container_height = window.innerHeight;

        this.camera.aspect = this.container_width / this.container_height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.container_width, this.container_height);

    }

    createMouseMove() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.INTERSECTED;
        this.intersected;

        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('touchstart', this.onTouchMove.bind(this), false);
        window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    }
    onMouseMove(e) {
        e.preventDefault();
        this.mouse.x = (e.clientX / this.container_width) * 2 - 1;
        this.mouse.y = -(e.clientY / this.container_height) * 2 + 1;
    }
    onTouchMove(e) {
        if (e.touches.length == 1) {
            e.preventDefault();
            this.mouse.x = e.touches[0].pageX - this.container_width / 2;
            this.mouse.y = e.touches[0].pageY - this.container_height / 2;
        }
    }
}