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

  scene.fog = new THREE.Fog(0x000000, 1, 30);

  const light = new THREE.PointLight(0x00ffff, 2, 100);
  light.position.set(0, 0, 5);
  scene.add(light);

  // Background starfield sphere
  const starGeo = new THREE.SphereGeometry(50, 64, 64);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0x001122,
    side: THREE.BackSide,
    fog: false
  });
  const starfield = new THREE.Mesh(starGeo, starMat);
  scene.add(starfield);

  // Tunnel group
  const tunnelGroup = new THREE.Group();
  const circleCount = 20;
  const lineCount = 32;

  for (let i = 1; i <= circleCount; i++) {
    const geometry = new THREE.RingGeometry(0.4 * i - 0.02, 0.4 * i, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -i * 2;
    tunnelGroup.add(ring);
  }

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0,
      Math.cos(angle) * circleCount * 0.4, 0, Math.sin(angle) * circleCount * 0.4
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const line = new THREE.Line(geometry, material);
    tunnelGroup.add(line);
  }

  scene.add(tunnelGroup);

  // Glowing pulse light
  const pulseLight = new THREE.PointLight(0x00ffff, 3, 5);
  pulseLight.position.set(0, 0, -30);
  scene.add(pulseLight);

  function animate() {
    tunnelGroup.position.z += 0.2;
    if (tunnelGroup.position.z > 5) tunnelGroup.position.z = -circleCount * 2;

    pulseLight.position.z += 0.5;
    if (pulseLight.position.z > 0) pulseLight.position.z = -circleCount * 2;

    starfield.rotation.y += 0.0005;

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

      sound.play().catch(() => {
        console.warn("Audio autoplay blocked, continuing without sound.");
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
