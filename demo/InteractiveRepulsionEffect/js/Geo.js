const radians = (degrees) => {
    return degrees * Math.PI / 180;
}

class Box{
    constructor(){
        this.geo = new THREE.BoxBufferGeometry(.5,.5,.5)
        this.rotationX = 0
        this.rotationY = 0
        this.rotationZ = 0
    }
}

class Cone{
    constructor(){
        this.geo = new THREE.ConeBufferGeometry(.3,.5,32)
        this.rotationX = 0
        this.rotationY = 0
        this.rotationZ = radians(-180)
    }
}

class Torus{
    constructor(){
        this.geo = new THREE.TorusBufferGeometry(.3,.12,30,200)
        this.rotationX = radians(90)
        this.rotationY = 0
        this.rotationZ = 0
    }
}