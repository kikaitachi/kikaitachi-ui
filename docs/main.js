import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';
import { STLLoader }  from '/three/examples/jsm/loaders/STLLoader.js';
import { ServerConnection } from "/ServerConnection.js";
import { Telemetry } from "/Telemetry.js";
import { MessageIn, MessageOut } from "/Message.js";

const MSG_TELEMETRY_ADD = 0;
const MSG_TELEMETRY_UPDATE = 1;
const MSG_TELEMETRY_DELETE = 2;
const MSG_TELEMETRY_QUERY = 3;

let timer;

const robotUrl = document.getElementById('robotUrl');
if (window.location.hostname == 'localhost') {
  robotUrl.innerHTML = 'ws://localhost:3001';
} else {
  robotUrl.innerHTML = 'ws://naminukas-demo.herokuapp.com:80';
}
robotUrl.spellcheck = false;
robotUrl.focus();

const connectButton = document.getElementById('connectButton');
const telemetry = new Telemetry();
const serverConnection = new ServerConnection(
  (socket) => {
    connectButton.innerHTML = 'Disconnect';
    telemetry.clearItems();
    timer = setInterval(() => {
      const msg = new MessageOut();
      msg.writeSignedInt(MSG_TELEMETRY_QUERY);
      socket.send(msg.getBuffer());
    }, 500);
  },
  () => {
    connectButton.innerHTML = 'Connect';
    clearInterval(timer);
  },
  (dataView) => {
    const msg = new MessageIn(dataView);
    const msgType = msg.readSignedInt();
    if (msgType == MSG_TELEMETRY_ADD) {
      telemetry.addItem(msg);
    } else if (msgType == MSG_TELEMETRY_UPDATE) {
      telemetry.updateItem(msg);
    } else {
      console.log('Unknown message type: ' + msgType);
    }
  }
);

const toggleConnection = () => {
  if (!serverConnection.isConnected()) {
    connectButton.innerHTML = "Connecting...";
    serverConnection.connect(robotUrl.innerHTML);
  } else {
    serverConnection.disconnect();
  }
}

connectButton.onclick = toggleConnection;

robotUrl.onkeydown = (event) => {
  if (event.code == 'Enter' || event.code == 'NumpadEnter') {
    event.preventDefault();
    toggleConnection();
  }
};

var camera, scene, renderer;
var geometry, material, mesh;

const stlLoader = new STLLoader();

const toRadians = (degrees) => {
	return degrees * Math.PI / 180;
};

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 100;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
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

		stlLoader.load('/BeagleBoneBlue.stl', function(geometry) {
			geometry.center();
			scene.add(new THREE.Mesh(geometry.rotateZ(toRadians(-90)).translate(0, 0, 0.1), new THREE.MeshNormalMaterial()));
		});
}

function animate() {
    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );
}

init();
animate();
