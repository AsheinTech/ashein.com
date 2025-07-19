import * as THREE from 'three';
import { OrbitControls } from './js/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create tunnel geometry
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({ 
  color: 0x00ccff, 
  wireframe: true 
});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

// Lighting (optional for glow)
const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// Camera & controls
camera.position.z = 30;
const controls = new OrbitControls(camera, renderer.domElement);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate()
