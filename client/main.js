import * as THREE from './threejs/three.module.js'
import {STLLoader} from './threejs/STLLoader.js'
import {OrbitControls} from './threejs/OrbitControls.js'

const socket = io()

let scene, camera, renderer, mesh, controls, light
let angles, x, y, z
let latestRotation = { x: 0, y: 0, z: 0 };

init()

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(50,0,100)

    light = new THREE.DirectionalLight(0x5277f1)
    scene.add(light)
    let light2 = new THREE.DirectionalLight(0x5277f1)
    light2.position.set(0,-50,50)
    scene.add(light2)

    let grid = new THREE.GridHelper(1200,60)
    scene.add(grid)

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container').appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)

    socket.on('spin data', function (data) {
        const angles = data.trim().split(' ');
        const x = parseFloat(angles[1]);
        const y = parseFloat(angles[2]);
        const z = parseFloat(angles[3]);

        latestRotation = {
            x: -x * Math.PI / 180,
            y: -y * Math.PI / 180,
            z: -z * Math.PI / 180,
        };
    });

}

function render() {

    requestAnimationFrame(render);

    if (mesh) {
        mesh.rotation.set(
            latestRotation.z,
            latestRotation.x,
            latestRotation.y
        );
    }

    renderer.render(scene, camera);

}




let loader = new STLLoader()
loader.load('./models/boeing_tx1.STL', function (geometry){
    mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({Color:0x87ceeb})
    )
    mesh.scale.set(0.08, 0.08, 0.08);
    mesh.position.set(0, 0, 0);

    scene.add(mesh)

    render()
})