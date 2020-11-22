import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';
import { STLLoader }  from '/three/examples/jsm/loaders/STLLoader.js';

var camera, scene, renderer;

const stlLoader = new STLLoader();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

export class Map3D {

  constructor() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.x = 0;
    camera.position.y = -130;
    camera.position.z = 60;

    scene = new THREE.Scene();

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

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.keys = { LEFT: 0, RIGHT: 0, UP: 0, BOTTOM: 0 };

    animate();
  }

  addSTL(url) {
    return new Promise((resolve) => {
      stlLoader.load(url, geometry => {
        geometry.center();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        scene.add(mesh);
        resolve(mesh);
      });
    });
  }

  addPoints(coloredPoints) {
    const vertices = [];
    for (let i = 0; i < coloredPoints.length; i++) {
      const p = coloredPoints[i];
      vertices.push(p.x, p.y, p.z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x888888 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
  }
};
