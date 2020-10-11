import * as THREE from 'https://unpkg.com/three/build/three.module.js'
import { ServerConnection } from "./ServerConnection.ts";

const serverConnection = new ServerConnection();

document.getElementById('connectButton').onclick = () => {
  serverConnection.connect(document.getElementById('websocketUrl').value);
};

const view = document.getElementById('view');
view.onchange = () => {
  for (let i = 0; i < view.options.length; i++) {
    const element = document.getElementById(view.options[i].value);
    element.style.display = i === view.selectedIndex ? 'block' : 'none';
  }
};

var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.id = 'map';
    document.body.appendChild( renderer.domElement );
}

function animate() {
    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );
}
