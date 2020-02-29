
let container = document.querySelector('.threejs');
let camera, renderer;
let buildingScene, particleScene;

let buildingGroup;
let particleGroup;
let mat;

let controls;

let container_width = container.clientWidth;
let container_height = container.clientHeight;

let img = document.querySelector('.threejs img');

let f = 0;

//建立場景
function init() {

    createRenderer();
    createScene();

    // createControls();
    // createEvent();

    tick();
}

function createRenderer() {

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container_width, container_height);
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;

    document.querySelector('#scene-container').appendChild(renderer.domElement);

}

function createScene() {

    buildingScene = new THREE.Scene();
    particleScene = new THREE.Scene();

    // let axes = new THREE.AxesHelper(5);
    // scene.add(axes);

    createCamera();
    createGroup();
    createLights();
}

// 創建相機
function createCamera() {

    let fov = 60;
    let aspect = container_width / container_height;
    let near = 1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-10, 69.13656684885552, 738.4807311243286);
    camera.lookAt(buildingScene.position);

}

// 創建光源
function createLights() {

    particleGroup.add(new THREE.AmbientLight(0x000808));

    let pointLight = new THREE.PointLight(0xead6a7, 4, 3000, 2);
    pointLight.position.set(0, 0, -500);
    particleGroup.add(pointLight);

    let DirLight = new THREE.DirectionalLight(0xb5e4dd, 0.5);
    DirLight.position.set(0, -1, 0);
    particleGroup.add(DirLight);

}

function createGroup() {

    buildingGroup = new THREE.Group();
    buildingGroup.position.set(0, -1000, -1000);
    buildingScene.add(buildingGroup);

    particleGroup = buildingGroup.clone();
    particleScene.add(particleGroup);

    // 背景
    let backBuilding = new THREE.Mesh(
        new THREE.PlaneGeometry(610, 2000).translate(10, 1000, 0),
        new THREE.MeshBasicMaterial()
    );
    backBuilding.position.set(-240, 0, -600);
    buildingGroup.add(backBuilding);

    let frontBuilding = new THREE.Mesh(
        new THREE.PlaneGeometry(600, 2000).translate(0, 1000, 0),
        new THREE.MeshBasicMaterial()
    );
    frontBuilding.position.set(650, 0, 300);
    buildingGroup.add(frontBuilding);

    let splinePoints = [
        new THREE.Vector4(-600, 2400, -1200, 50),
        new THREE.Vector4(-250, 1400, -1000, 100),
        new THREE.Vector4(800, 1600, -500, 200),
        new THREE.Vector4(-250, 1000, 300, 20),
        new THREE.Vector4(2000, 1200, 500, 200)
    ];

    createPrefab(splinePoints);

}

// 複製已經設定好的 Object 包含動畫
function createPrefab(splinePoints) {

    // Geometry
    let prefab = new THREE.PlaneGeometry(6, 6);
    let prefabCount = 25000;
    let geo = new THREE.BAS.PrefabBufferGeometry(prefab, prefabCount);

    // 動畫
    geo.createAttribute('aOffset', 1, function (data, i, count) {
        data[0] = i / count * 0.5;
    });

    let axis = new THREE.Vector3();
    geo.createAttribute('aRotation', 4, function (data) {
        THREE.BAS.Utils.randomAxis(axis).toArray(data);
        data[3] = Math.PI * 2 * THREE.Math.randFloat(-4, 4);
    });

    geo.createAttribute('aScale', 1, function (data) {
        data[0] = THREE.Math.randFloat(0.1, 4.0);
    });

    let aOscillation = geo.createAttribute('aOscillation', 2);
    let offset = 0;

    for (let i = 0; i < prefabCount; i++) {

        let a = Math.random() * 1.0;
        for (let j = 0; j < geo.prefabVertexCount; j++) {

            let o = Math.random() * 10;

            aOscillation.array[offset++] = o;
            aOscillation.array[offset++] = a;
        }
    }

    geo.createAttribute('aPivotScale', 1, function (data) {
        data[0] = Math.random();
    });

    // Material
    mat = new THREE.BAS.StandardAnimationMaterial({
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        defines: {
            PATH_LENGTH: splinePoints.length,
            PATH_MAX: (splinePoints.length - 1).toFixed(1) // 小數點後 1 位
        },
        uniformValues: {
            metalness: 0.5,
            roughness: 0.5
        },
        uniforms: {
            uTime: { value: 0 },
            uOscTime: { value: 0 },
            uDuration: { value: 1 },
            uPath: { value: splinePoints },
            uSmoothness: { value: new THREE.Vector2(2, 2) }
        },
        vertexFunctions: [
            THREE.BAS.ShaderChunk['catmull_rom_spline'],
            THREE.BAS.ShaderChunk['quaternion_rotation']
        ],
        vertexParameters: [
            'uniform float uTime;',
            'uniform float uDuration;',
            'uniform float uOscTime;',

            'attribute float aOffset;',
            'attribute vec4 aRotation;',
            'attribute float aScale;',
            'attribute vec2 aOscillation;',
            'attribute float aPivotScale;',

            'uniform vec4 uPath[PATH_LENGTH];',
            'uniform vec2 uSmoothness;'
        ],
        vertexPosition: [
            'float tProgress = mod((uTime + aOffset), uDuration) / uDuration;',
            'float osc = 1.0 + sin(aOscillation.x + uOscTime) * aOscillation.y;',
            'transformed *= aScale * osc;',

            'float pathProgress = tProgress * PATH_MAX;',
            'ivec4 indices = getCatmullRomSplineIndices(PATH_MAX, pathProgress);',
            'vec4 p0 = uPath[indices[0]];', // max(0, floor(pathProgress) - 1)
            'vec4 p1 = uPath[indices[1]];', // floor(pathProgress)
            'vec4 p2 = uPath[indices[2]];', // min(length, floor(pathProgress) + 1)
            'vec4 p3 = uPath[indices[3]];', // min(length, floor(pathProgress) + 2)

            'float pathProgressFract = fract(pathProgress);',

            'transformed += catmullRomSpline(p0.w, p1.w, p2.w, p3.w, pathProgressFract) * aPivotScale;',

            'transformed = rotateVector(quatFromAxisAngle(aRotation.xyz, aRotation.w * tProgress), transformed);',

            'transformed += catmullRomSpline(p0.xyz, p1.xyz, p2.xyz, p3.xyz, pathProgressFract, uSmoothness);'
        ],
    });

    // Mesh
    let stars = new THREE.Mesh(geo, mat);
    particleGroup.add(stars);

}

init();

function tick() {
    update();
    render();
    requestAnimationFrame(tick);
}

// 渲染更新
function render() {

    if (!(++f % 2)) {
        renderer.clear();
        renderer.render(buildingScene, camera);

        renderer.clear(true, false, false);
        renderer.render(particleScene, camera);
    }

}

function update() {
    img.style.visibility = 'visible';
    mat.uniforms.uTime.value += (1 / 400);
    mat.uniforms.uOscTime.value += (1 / 10);

    // controls && controls.update();
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