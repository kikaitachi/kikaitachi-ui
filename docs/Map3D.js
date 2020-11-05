import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';
import { STLLoader }  from '/three/examples/jsm/loaders/STLLoader.js';

var camera, scene, renderer;
var geometry, material, mesh;

const stlLoader = new STLLoader();

const toRadians = (degrees) => {
	return degrees * Math.PI / 180;
};

function animate() {
  requestAnimationFrame( animate );

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render( scene, camera );
}

export class Map3D {

  constructor() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.x = 0;
    camera.position.y = -130;
    camera.position.z = 60;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'canvas';
    document.body.appendChild( renderer.domElement );

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
    	const height = window.innerHeight;
    	camera.aspect = width / height;
    	camera.updateProjectionMatrix();
    	renderer.setSize(width, height);
    });

    new OrbitControls(camera, renderer.domElement);

    animate();
  }

  addSTL(url, x, y, z) {
    stlLoader.load(url, geometry => {
			geometry.center();
			scene.add(new THREE.Mesh(geometry/*.rotateX(toRadians(-90))*/.translate(x, y, z), new THREE.MeshNormalMaterial()));
    });
  }
};