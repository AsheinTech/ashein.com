import * as THREE from './js/three.module.js';
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
  camera.position.z = 0;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  const light = new THREE.PointLight(0x00ffff, 2, 100);
  light.position.set(0, 0, 5);
  scene.add(light);

  // Tunnel curve and geometry
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 100 }, (_, i) => new THREE.Vector3(
      Math.sin(i * 0.1) * 2,
      Math.cos(i * 0.1) * 2,
      -i * 1.5
    ))
  );
  const geometry = new THREE.TubeGeometry(curve, 300, 0.8, 12, false);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    wireframe: true,
    emissive: 0x0077ff,
    emissiveIntensity: 1
  });
  const tubeMesh = new THREE.Mesh(geometry, material);

  const tunnelGroup = new THREE.Group();
  tunnelGroup.add(tubeMesh);
  scene.add(tunnelGroup);

  // Add text inside tunnel
  const fontLoader = new FontLoader();
  fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('Ashein Technologies', {
      font: font,
      size: 0.8,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.03,
      bevelSegments: 3
    });
    const textMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0099ff,
      emissiveIntensity: 1.5
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textGeo.center();
    textMesh.position.set(0, 1.5, 0);
    tunnelGroup.add(textMesh);
  });

  function animate() {
    camera.position.z -= 0.2;
    composer.render();
    requestAnimationFrame(animate);
  }

  const enterBtn = document.getElementById('enter');
  const sound = document.getElementById('portal-sound');
  const loader = document.getElementById('loader');

  enterBtn.addEventListener('click', () => {
    enterBtn.style.opacity = 0;
    loader.style.display = 'block';
    setTimeout(() => {
      enterBtn.style.display = 'none';
      loader.style.display = 'none';
      sound.play().catch(() => console.warn("Audio autoplay blocked."));
      animate();
    }, 2000);
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});
