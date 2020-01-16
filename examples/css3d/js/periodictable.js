import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';
// import { GUI } from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '../../../three.js/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from '../../../three.js/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from '../../../three.js/examples/jsm/renderers/CSS3DRenderer.js';

import { TWEEN } from '../../../three.js/examples/jsm/libs/tween.module.min.js';
// import { getHeapSpaceStatistics } from 'v8';

let container = document.getElementById('scene-container');
let camera, scene, renderer
let controls;

let container_width = window.innerWidth;
let container_height = window.innerHeight;

// 建立元素表 (符號，全名，原子量，組，週期)
let table = [
    "H", "Hydrogen", "1.00794", 1, 1,
    "He", "Helium", "4.002602", 18, 1,
    "Li", "Lithium", "6.941", 1, 2,
    "Be", "Beryllium", "9.012182", 2, 2,
    "B", "Boron", "10.811", 13, 2,
    "C", "Carbon", "12.0107", 14, 2,
    "N", "Nitrogen", "14.0067", 15, 2,
    "O", "Oxygen", "15.9994", 16, 2,
    "F", "Fluorine", "18.9984032", 17, 2,
    "Ne", "Neon", "20.1797", 18, 2,
    "Na", "Sodium", "22.98976...", 1, 3,
    "Mg", "Magnesium", "24.305", 2, 3,
    "Al", "Aluminium", "26.9815386", 13, 3,
    "Si", "Silicon", "28.0855", 14, 3,
    "P", "Phosphorus", "30.973762", 15, 3,
    "S", "Sulfur", "32.065", 16, 3,
    "Cl", "Chlorine", "35.453", 17, 3,
    "Ar", "Argon", "39.948", 18, 3,
    "K", "Potassium", "39.948", 1, 4,
    "Ca", "Calcium", "40.078", 2, 4,
    "Sc", "Scandium", "44.955912", 3, 4,
    "Ti", "Titanium", "47.867", 4, 4,
    "V", "Vanadium", "50.9415", 5, 4,
    "Cr", "Chromium", "51.9961", 6, 4,
    "Mn", "Manganese", "54.938045", 7, 4,
    "Fe", "Iron", "55.845", 8, 4,
    "Co", "Cobalt", "58.933195", 9, 4,
    "Ni", "Nickel", "58.6934", 10, 4,
    "Cu", "Copper", "63.546", 11, 4,
    "Zn", "Zinc", "65.38", 12, 4,
    "Ga", "Gallium", "69.723", 13, 4,
    "Ge", "Germanium", "72.63", 14, 4,
    "As", "Arsenic", "74.9216", 15, 4,
    "Se", "Selenium", "78.96", 16, 4,
    "Br", "Bromine", "79.904", 17, 4,
    "Kr", "Krypton", "83.798", 18, 4,
    "Rb", "Rubidium", "85.4678", 1, 5,
    "Sr", "Strontium", "87.62", 2, 5,
    "Y", "Yttrium", "88.90585", 3, 5,
    "Zr", "Zirconium", "91.224", 4, 5,
    "Nb", "Niobium", "92.90628", 5, 5,
    "Mo", "Molybdenum", "95.96", 6, 5,
    "Tc", "Technetium", "(98)", 7, 5,
    "Ru", "Ruthenium", "101.07", 8, 5,
    "Rh", "Rhodium", "102.9055", 9, 5,
    "Pd", "Palladium", "106.42", 10, 5,
    "Ag", "Silver", "107.8682", 11, 5,
    "Cd", "Cadmium", "112.411", 12, 5,
    "In", "Indium", "114.818", 13, 5,
    "Sn", "Tin", "118.71", 14, 5,
    "Sb", "Antimony", "121.76", 15, 5,
    "Te", "Tellurium", "127.6", 16, 5,
    "I", "Iodine", "126.90447", 17, 5,
    "Xe", "Xenon", "131.293", 18, 5,
    "Cs", "Caesium", "132.9054", 1, 6,
    "Ba", "Barium", "132.9054", 2, 6,
    "La", "Lanthanum", "138.90547", 4, 9,
    "Ce", "Cerium", "140.116", 5, 9,
    "Pr", "Praseodymium", "140.90765", 6, 9,
    "Nd", "Neodymium", "144.242", 7, 9,
    "Pm", "Promethium", "(145)", 8, 9,
    "Sm", "Samarium", "150.36", 9, 9,
    "Eu", "Europium", "151.964", 10, 9,
    "Gd", "Gadolinium", "157.25", 11, 9,
    "Tb", "Terbium", "158.92535", 12, 9,
    "Dy", "Dysprosium", "162.5", 13, 9,
    "Ho", "Holmium", "164.93032", 14, 9,
    "Er", "Erbium", "167.259", 15, 9,
    "Tm", "Thulium", "168.93421", 16, 9,
    "Yb", "Ytterbium", "173.054", 17, 9,
    "Lu", "Lutetium", "174.9668", 18, 9,
    "Hf", "Hafnium", "178.49", 4, 6,
    "Ta", "Tantalum", "180.94788", 5, 6,
    "W", "Tungsten", "183.84", 6, 6,
    "Re", "Rhenium", "186.207", 7, 6,
    "Os", "Osmium", "190.23", 8, 6,
    "Ir", "Iridium", "192.217", 9, 6,
    "Pt", "Platinum", "195.084", 10, 6,
    "Au", "Gold", "196.966569", 11, 6,
    "Hg", "Mercury", "200.59", 12, 6,
    "Tl", "Thallium", "204.3833", 13, 6,
    "Pb", "Lead", "207.2", 14, 6,
    "Bi", "Bismuth", "208.9804", 15, 6,
    "Po", "Polonium", "(209)", 16, 6,
    "At", "Astatine", "(210)", 17, 6,
    "Rn", "Radon", "(222)", 18, 6,
    "Fr", "Francium", "(223)", 1, 7,
    "Ra", "Radium", "(226)", 2, 7,
    "Ac", "Actinium", "(227)", 4, 10,
    "Th", "Thorium", "232.03806", 5, 10,
    "Pa", "Protactinium", "231.0588", 6, 10,
    "U", "Uranium", "238.02891", 7, 10,
    "Np", "Neptunium", "(237)", 8, 10,
    "Pu", "Plutonium", "(244)", 9, 10,
    "Am", "Americium", "(243)", 10, 10,
    "Cm", "Curium", "(247)", 11, 10,
    "Bk", "Berkelium", "(247)", 12, 10,
    "Cf", "Californium", "(251)", 13, 10,
    "Es", "Einstenium", "(252)", 14, 10,
    "Fm", "Fermium", "(257)", 15, 10,
    "Md", "Mendelevium", "(258)", 16, 10,
    "No", "Nobelium", "(259)", 17, 10,
    "Lr", "Lawrencium", "(262)", 18, 10,
    "Rf", "Rutherfordium", "(267)", 4, 7,
    "Db", "Dubnium", "(268)", 5, 7,
    "Sg", "Seaborgium", "(271)", 6, 7,
    "Bh", "Bohrium", "(272)", 7, 7,
    "Hs", "Hassium", "(270)", 8, 7,
    "Mt", "Meitnerium", "(276)", 9, 7,
    "Ds", "Darmstadium", "(281)", 10, 7,
    "Rg", "Roentgenium", "(280)", 11, 7,
    "Cn", "Copernicium", "(285)", 12, 7,
    "Nh", "Nihonium", "(286)", 13, 7,
    "Fl", "Flerovium", "(289)", 14, 7,
    "Mc", "Moscovium", "(290)", 15, 7,
    "Lv", "Livermorium", "(293)", 16, 7,
    "Ts", "Tennessine", "(294)", 17, 7,
    "Og", "Oganesson", "(294)", 18, 7
];

let element;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };

// let tableBtn = document.getElementById('table');
// let sphereBtn = document.getElementById('sphere');
// let helixBtn = document.getElementById('helix');
// let gridBtn = document.getElementById('grid');

let cover;
let returnBtn;

//建立場景
function init() {

    scene = new THREE.Scene();

    createCamera();
    createLights();
    createTable();
    // createSphere();
    // createHelix();
    // createGrid();
    createEvent();
    createRenderer();
    // createControls();
    render();

}

// 創建相機
function createCamera() {

    let fov = 40;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.lookAt(scene.position);
    camera.position.z = 3000;

}

// 創建光源
function createLights() {

    scene.add(new THREE.AmbientLight(0xffffff));

}

// 創建週期表
function createTable() {

    for (let i = 0; i < table.length; i += 5) {

        // 建立Element
        element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';
        document.body.appendChild(element);

        // 添加子節點
        let number = document.createElement('div');
        number.className = 'number';
        number.textContent = (i / 5) + 1;
        element.appendChild(number);

        // 添加符號
        let symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = table[i];
        element.appendChild(symbol);

        // 添加全名和原子量
        let details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
        element.appendChild(details);

        // 建立UI
        cover = document.createElement('div');
        cover.id = 'cover';
        document.body.appendChild(cover);

        let introduction = document.createElement('div');
        introduction.id = 'introduction';
        cover.appendChild(introduction);

        returnBtn = document.createElement('button');
        returnBtn.id = 'returnBtn';
        returnBtn.innerHTML = 'return';
        returnBtn.style.border = '3px solid rgba(127,255,255,0.5)';
        returnBtn.style.borderBottomRightRadius = '15px';
        returnBtn.style.fontSize = '20px';
        returnBtn.style.fontWeight = 'bold';
        returnBtn.style.color = '#fff';

        introduction.appendChild(returnBtn);

        // 建立CSS3DObject
        let object = new CSS3DObject(element);
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add(object);

        objects.push(object);

        let object3d = new THREE.Object3D();
        object3d.position.x = (table[i + 3] * 140) - 1330;
        object3d.position.y = -(table[i + 4] * 180) + 990;

        targets.table.push(object3d);

    }
}

// 創建圓形週期表
function createSphere() {

    let vector = new THREE.Vector3();

    for (let i = 0, l = objects.length; i < l; i++) {

        let phi = Math.acos(-1 + (2 * i) / l);
        let theta = Math.sqrt(l * Math.PI) * phi;

        let object3d = new THREE.Object3D();

        // 用圓柱半徑設定向量
        object3d.position.setFromSphericalCoords(800, phi, theta);

        vector.copy(object3d.position).multiplyScalar(2);

        // 讓object3d面相前方
        object3d.lookAt(vector);

        targets.sphere.push(object3d);
    }
}

// 創建螺旋形週期表
function createHelix() {

    let vector = new THREE.Vector3();

    for (let i = 0, l = objects.length; i < l; i++) {

        let theta = i * 0.175 + Math.PI;
        let y = - (i * 8) + 450;

        let object3d = new THREE.Object3D();

        object3d.position.setFromCylindricalCoords(900, theta, y);

        vector.set(object3d.position.x * 2, object3d.position.y, object3d.position.z * 2);

        object3d.lookAt(vector);

        targets.helix.push(object3d);
    }
}

// 創建grid週期表
function createGrid() {

    for (let i = 0, l = objects.length; i < l; i++) {

        let object3d = new THREE.Object3D();

        // 左到右
        object3d.position.x = ((i % 5) * 400) - 800;
        // 上到下
        object3d.position.y = (- (Math.floor(i / 5) % 5) * 400) + 800;
        // 後到前
        object3d.position.z = (Math.floor(i / 25)) * 1000 - 2000;

        targets.grid.push(object3d);

    }
}

// 創建事件
function createEvent() {

    window.addEventListener('resize', onWindowResize, false);

    // tableBtn.addEventListener('click', () => {
    //     transform(targets.table, 2000);
    // }, false);

    // sphereBtn.addEventListener('click', () => {
    //     transform(targets.sphere, 2000);
    // }, false);

    // helixBtn.addEventListener('click', () => {
    //     transform(targets.helix, 2000);
    // }, false);

    // gridBtn.addEventListener('click', () => {
    //     transform(targets.grid, 2000);
    // }, false);

    transform(targets.table, 2000);
}

function onWindowResize() {

    container_width = window.innerWidth;
    container_height = window.innerHeight;

    camera.aspect = container_width / container_height;
    camera.updateProjectionMatrix();

    renderer.setSize(container_width, container_height);

    render();

}

// 創建移動補間
function transform(targets, duration) {

    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {

        let object = objects[i];
        let target = targets[i];

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();

    let elementAll = document.getElementsByClassName('element');

    for (var i = 0; i < objects.length; i++) {

        let object = objects[i];
        let target = targets[i];

        elementAll[i].addEventListener('click', () => {
            cameraMove(object, target, 1000);
        });

    }

}

function cameraMove(object, target, duration) {

    cover.style.display = 'block';

    new TWEEN.Tween(object.position)
        .to({ x: camera.position.x + 180, y: camera.position.y, z: camera.position.z - 300 }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();


    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();

    gsap.set('#introduction', {
        x: -1000
    });

    gsap.to('#introduction', {
        duration: 1.5,
        x: 0
    });

    returnBtn.addEventListener('click', () => {

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();

        let t = gsap.timeline();

        t.to('#introduction', { duration: 1, x: -1000 })
        .to('#cover', { display: 'none' });

    })

}

function createRenderer() {

    renderer = new CSS3DRenderer();
    renderer.setSize(container_width, container_height);
    // renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

}

// 渲染更新
function render() {

    renderer.render(scene, camera);

}

function createControls() {

    controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    // controls.update();

}

init();
animate();