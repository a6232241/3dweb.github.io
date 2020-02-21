import * as THREE from '../../../three.js/build/three.module.js';

// import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';

let container = document.querySelector('#scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

const assetUrls = [
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/water.jpg',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/water2.jpg',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/disp.jpg'
];

let obj = {trans: 0}
var cnt = 0;

let textureArr = [];

let mesh;

//建立場景
function init() {

    createRenderer();
    createScene();
   
    createControls();
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

    container.appendChild(renderer.domElement);

}

function createScene(){

    scene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createLights();
    createTexture();
    createMesh();

}

// 創建相機
function createCamera() {

    // let fov = 65;
    // let aspect = container_width / container_height;
    // let near = 0.1;
    // let far = 1000;
    // camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.position.z = 50;

    let left = - 1;
    let right = 1;
    let top = 1;
    let bottom = - 1;
    let near = 1, far = 1000;
    camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.z = 1;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

function createTexture(){

    assetUrls.forEach((url, index) => {

        let img = new Image();

        let texture = new THREE.Texture();
        texture.flipY = false;
        textureArr.push(texture);
        
        img.onload = function(_index, _img){
            let texture = textureArr[_index];
            texture.image = _img;
            texture.needsUpdate = true;

            cnt ++;
            if(cnt == 3) render();
        }.bind(this, index, img);

        img.crossOrigin = "Anonymous";
        img.src = url;

    });
}

function createMesh(){
    let mat = new THREE.RawShaderMaterial({
        uniforms:{
            uTrans: { value: obj.trans },
            uTexture0: {value: textureArr[0] },
            uTexture1: { value: textureArr[1] },
            uDisp: {value: textureArr[2] }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });

    let geo = new THREE.PlaneGeometry(2,2);
    mesh = new THREE.Mesh(geo,mat);
    scene.add(mesh);

}

init();

// 渲染更新
function render() {

    mesh.material.uniforms.uTrans.value = obj.trans;
    renderer.render(scene, camera);

}

function createControls() {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    // controls.update(); 適用於改變相機時使用，例如 enableDamping、autoRotate

}

function createEvent(){

    window.addEventListener('resize', onWindowResize, false);
    container.addEventListener('mouseenter', () => {
        TweenMax.killTweensOf(obj);
        TweenMax.to(obj, 1.5, {trans: 1});
    });
    container.addEventListener('mouseleave', () => {
        TweenMax.killTweensOf(obj);
        TweenMax.to(obj, 1.5, {trans: 0});
    });

}

function onWindowResize(){

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    // camera.aspect = container_width / container_height;
    // camera.updateProjectionMatrix();

    camera.left = -1;
    camera.right = 1;
    camera.top = 1;
    camera.bottom = -1;
    camera.updateProjectionMatrix();

    let size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
	if(size > 450)  size = 450;
	renderer.setSize(size, size);
    renderer.setSize( container_width, container_height );

}