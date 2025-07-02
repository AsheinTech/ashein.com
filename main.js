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
  camera.position.z = 2;

  // Composer with Bloom
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  const curvePath = new THREE.CatmullRomCurve3(
    Array.from({ length: 100 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.3) * 2, Math.cos(i * 0.3) * 2, -i))
  );

  const geometry = new THREE.TubeGeometry(curvePath, 1000, 1, 16, false);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x0033ff,
    wireframe: true,
  });

  const tunnel = new THREE.Mesh(geometry, material);
  scene.add(tunnel);

  const pointLight = new THREE.PointLight(0x00ffff, 1);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // Title
  const loader = new FontLoader();
  loader.load('./fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeo = new TextGeometry("Ashein Technologies", {
      font: font,
      size: 0.6,
      height: 0.05,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const textMesh = new THREE.Mesh(textGeo, textMaterial);
    textMesh.position.set(-4, 0, 0);
    scene.add(textMesh);
  });

  // Mouse move interaction
  const mouse = new THREE.Vector2();
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    camera.position.z -= 0.2;
    if (camera.position.z < -95) camera.position.z = 2; // Loop back
    camera.position.x = mouse.x * 2;
    camera.position.y = mouse.y * 2;
    composer.render();
  }

  // Start after clicking Enter
  const enterBtn = document.getElementById('enter');
  const sound = document.getElementById('portal-sound');
  const loaderDiv = document.getElementById('loader');

  enterBtn.addEventListener('click', () => {
    enterBtn.style.opacity = 0;
    loaderDiv.style.display = 'block';
    setTimeout(() => {
      enterBtn.style.display = 'none';
      loaderDiv.style.display = 'none';
      sound.play().catch(() => console.warn("Audio autoplay blocked."));
      animate();
    }, 2000);
  });

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});
