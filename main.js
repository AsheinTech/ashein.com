import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass } from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';
import { FontLoader } from './js/FontLoader.js';
import { TextGeometry } from './js/TextGeometry.js';

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 5;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 1.5;
  composer.addPass(bloomPass);

  scene.fog = new THREE.FogExp2(0x000000, 0.035);

  const starsGeometry = new THREE.BufferGeometry();
  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);
    starVertices.push(x, y, z);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0x88ccff });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 100 }, (_, i) => new THREE.Vector3(
      Math.sin(i * 0.3) * 5,
      Math.cos(i * 0.3) * 5,
      -i * 3
    ))
  );
  const geometry = new THREE.TubeGeometry(curve, 200, 1, 64, false);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    wireframe: true,
    emissive: 0x0044ff,
    emissiveIntensity: 1
  });
  const tunnel = new THREE.Mesh(geometry, material);
  scene.add(tunnel);

  const pointLight = new THREE.PointLight(0x00ffff, 1);
  pointLight.position.set(0, 0, 10);
  scene.add(pointLight);

  const fontLoader = new FontLoader();
  fontLoader.load('./fonts/helvetiker_regular.typeface.json', font => {
    const textGeometry = new TextGeometry('Ashein Technologies', {
      font,
      size: 0.6,
      height: 0.1,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(5, 5, 0);
    scene.add(textMesh);
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime() * 10;  // Speed control here
    camera.position.z = t;
    camera.lookAt(new THREE.Vector3(0, 0, t - 10));
    composer.render();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});
