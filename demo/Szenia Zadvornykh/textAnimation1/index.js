
let container_width = window.innerWidth;
let container_height = window.innerHeight;

let aspect = container_width / container_height;

window.onload = init;

function init() {
  var root = new THREERoot({
    createCameraControls:false,
    fov:10
  });
  root.renderer.setClearColor(0xffffff);
	root.renderer.setPixelRatio(window.devicePixelRatio || 1);
  root.camera.position.set(0, 0, 1400);

  var textAnimation = createTextAnimation();
  root.scene.add(textAnimation);

  var tween = TweenMax.fromTo(textAnimation, 4,
    {animationProgress:0},
    {animationProgress:1, ease:Power1.easeInOut, repeat:-1, yoyo:true}
  );
  createTweenScrubber(tween);
}

function createTweenScrubber(tween, seekSpeed) {
  seekSpeed = seekSpeed || 0.001;

  function stop() {
    TweenMax.to(tween, 2, {timeScale:0});
  }

  function resume() {
    TweenMax.to(tween, 2, {timeScale:1});
  }

  function seek(dx) {
    var progress = tween.progress();
    var p = THREE.Math.clamp((progress + (dx * seekSpeed)), 0, 1);

    tween.progress(p);
  }

  var _cx = 0;

  // desktop
  var mouseDown = false;
  document.body.style.cursor = 'pointer';

  window.addEventListener('mousedown', function(e) {
    mouseDown = true;
    document.body.style.cursor = 'ew-resize';
    _cx = e.clientX;
    stop();
  });
  window.addEventListener('mouseup', function(e) {
    mouseDown = false;
    document.body.style.cursor = 'pointer';
    resume();
  });
  window.addEventListener('mousemove', function(e) {
    if (mouseDown === true) {
      var cx = e.clientX;
      var dx = cx - _cx;
      _cx = cx;

      seek(dx);
    }
  });
  // mobile
  window.addEventListener('touchstart', function(e) {
    _cx = e.touches[0].clientX;
    stop();
    e.preventDefault();
  });
  window.addEventListener('touchend', function(e) {
    resume();
    e.preventDefault();
  });
  window.addEventListener('touchmove', function(e) {
    var cx = e.touches[0].clientX;
    var dx = cx - _cx;
    _cx = cx;

    seek(dx);
    e.preventDefault();
  });
}

function THREERoot(params) {
    params = utils.extend({
        antialias: false,

        fov: 60,
        zNear: 60,
        zFar: 10000,

        createCameraControls: true
    }, params);

    this.renderer = new THREE.WebGLRenderer({antialias: params.antialias});
    this.renderer.setSize(container_width, container_height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene-container').appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(params.fov, aspect, params.zNear, params.zFar);

    if(params.createCameraControls) this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);

    this.resize();
    this.tick();

    window.addEventListener('resize', this.resize, false);
}

THREERoot.prototype = {
    tick: function() {
      this.update();
      this.render();
      requestAnimationFrame(this.tick);
    },
    update: function() {
      this.controls && this.controls.update();
    },
    render: function() {
      this.renderer.render(this.scene, this.camera);
    },
    resize: function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
  
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
};

var utils = {
    extend:function(dst, src) {
      for (var key in src) {
        dst[key] = src[key];
      }
  
      return dst;
    }
};  

function createTextAnimation() {
    let geo = generateTextGeometry('PIECE BY PIECE', {
        size: 14,
        height: 0,
        font: 'droid sans',
        weight: 'bold',
        style: 'normal',
        bevelSize: 0.75,
        bevelThickness: 0.50,
        bevelEnabled: true,
        anchor: { x: 0.5, y: 0.5, z: 0.5 }
    });

    THREE.BAS.Utils.separateFaces(geo);

    return new TextAnimation(geo);
}

function generateTextGeometry(text, params) {
    let geo = new THREE.TextGeometry(text, params);
    geo.computeBoundingBox();

    geo.userData = {};
    geo.userData.size = {
        width: geo.boundingBox.max.x - geo.boundingBox.min.x,
        height: geo.boundingBox.max.y - geo.boundingBox.min.y,
        depth: geo.boundingBox.max.z - geo.boundingBox.min.z,
    };

    let anchorX = geo.userData.size.width * -params.anchor.x;
    let anchorY = geo.userData.size.height * -params.anchor.y;
    let anchorZ = geo.userData.size.depth * -params.anchor.z;
    let matrix = new THREE.Matrix4().makeTranslation(anchorX, anchorY, anchorZ);

    geo.applyMatrix(matrix);

    return geo;
}

function TextAnimation(geo) {
    let bufferGeo = new THREE.BAS.ModelBufferGeometry(geo);

    let aAnimation = bufferGeo.createAttribute('aAnimation', 2);
    let aControl0 = bufferGeo.createAttribute('aControl0', 3);
    let aControl1 = bufferGeo.createAttribute('aControl1', 3);
    let aEndPosition = bufferGeo.createAttribute('aEndPosition', 3);

    let faceCount = bufferGeo.faceCount;
    let i, i2, i3, i4, v;

    let size = geo.userData.size;
    let length = new THREE.Vector3(size.width, size.height, size.depth).multiplyScalar(0.5).length();
    let maxDelay = length * 0.06;

    this.animationDuration = maxDelay + 4 + 1;
    this._animationProgress = 0;

    for(i = 0, i2 = 0, i3 = 0, i4 = 0; i < faceCount; i++, i2 += 6, i3 += 9, i4 += 12){
        let face = geo.faces[i];
        let centroid = THREE.BAS.Utils.computeCentroid(geo, face);
        let dirX = centroid.x > 0? 1 : -1;
        let dirY = centroid.y > 0? 1 : -1;

        // animation
        let delay = centroid.length() * THREE.Math.randFloat(0.03, 0.06);
        let duration = THREE.Math.randFloat(2, 4);

        for(v = 0; v < 6; v+=2){
            aAnimation.array[i2 + v + 0] = delay + Math.random();
            aAnimation.array[i2 + v + 1] = duration;
        }

        let c0x = THREE.Math.randFloat(0, 30) * dirX;
        let c0y = THREE.Math.randFloat(60, 120) * dirY;
        let c0z = THREE.Math.randFloat(-20, 20);

        let c1x = THREE.Math.randFloat(30, 60) * dirX;
        let c1y = THREE.Math.randFloat(0, 60) * dirY;
        let c1z = THREE.Math.randFloat(-20, 20);

        for(v = 0; v < 9; v += 3){
            aControl0.array[i3 + v + 0] = c0x;
            aControl0.array[i3 + v + 1] = c0y;
            aControl0.array[i3 + v + 2] = c0z;

            aControl1.array[i3 + v + 0] = c1x;
            aControl1.array[i3 + v + 1] = c1y;
            aControl1.array[i3 + v + 2] = c1z;
        }
    }

    let mat = new THREE.BAS.BasicAnimationMaterial({
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        uniforms: {
            uTime: { type: 'f', value: 0 }
        },
        shaderFunctions: [
            THREE.BAS.ShaderChunk['cubic_bezier']
        ],
        shaderParameters: [
            'uniform float uTime;',
            'attribute vec2 aAnimation;',
            'attribute vec3 aControl0;',
            'attribute vec3 aControl1;',
            'attribute vec3 aEndPosition;'
        ],
        shaderVertexInit: [
            'float tDelay = aAnimation.x;',
            'float tDuration = aAnimation.y;',
            'float tTime = clamp(uTime - tDelay, 0.0, tDuration);',
            'float tProgress = tTime / tDuration;'
        ],
        shaderTransformPosition: [
            'vec3 tPosition = transformed;',
            'tPosition *= 1.0 - tProgress;',
            'tPosition += cubicBezier(transformed, aControl0, aControl1, aEndPosition, tProgress);',
            'transformed = tPosition;'
        ]},

        {
            diffuse: 0x000000
        }
    );

    THREE.Mesh.call(this, bufferGeo, mat);

    this.frustumCulled = false;
}

TextAnimation.prototype = Object.create(THREE.Mesh.prototype);
TextAnimation.prototype.constructor = TextAnimation;

Object.defineProperty(TextAnimation.prototype, 'animationProgress', {
  get: function() {
    return this._animationProgress;
  },
  set: function(v) {
    this._animationProgress = v;
    this.material.uniforms['uTime'].value = this.animationDuration * v;
  }
});
