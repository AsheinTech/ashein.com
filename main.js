import * as THREE from './js/three.module.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass } from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 10;

  // Post-processing bloom
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  scene.fog = new THREE.Fog(0x000000, 5, 50);

  const light = new THREE.PointLight(0x00ffff, 2, 100);
  light.position.set(0, 0, 5);
  scene.add(light);

  const tunnelGroup = new THREE.Group();
  const circleCount = 25;
  const lineCount = 16;

  // Concentric glowing rings
  for (let i = 0; i < circleCount; i++) {
    const geometry = new THREE.RingGeometry(1.5, 1.52, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.z = -i * 2;
    ring.rotation.x = Math.PI / 2;
    tunnelGroup.add(ring);
  }

  // Spoke lines (radial)
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const x = Math.cos(angle) * 1.5;
    const y = Math.sin(angle) * 1.5;
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0,
      x, y, -circleCount * 2
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const line = new THREE.Line(geometry, material);
    tunnelGroup.add(line);
  }

  // Glowing pulse light
  const pulseGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const pulseLight = new THREE.Mesh(pulseGeometry, pulseMaterial);
  pulseLight.position.z = 0;
  tunnelGroup.add(pulseLight);

  scene.add(tunnelGroup);

  function animate() {
    tunnelGroup.position.z += 0.2;
    if (tunnelGroup.position.z > 5) tunnelGroup.position.z = -circleCount * 2;

    pulseLight.position.z += 0.5;
    if (pulseLight.position.z > 0) pulseLight.position.z = -circleCount * 2;

    composer.render();
    requestAnimationFrame(animate);
  }

  // Interaction
  const enterBtn = document.getElementById('enter');
  const sound = document.getElementById('portal-sound');
  const loader = document.getElementById('loader');

  enterBtn.addEventListener('click', () => {
    enterBtn.style.opacity = 0;
    loader.style.display = 'block';

    setTimeout(() => {
      enterBtn.style.display = 'none';
      loader.style.display = 'none';
      sound.play().catch(() => {
        console.warn("Audio blocked");
      });
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
