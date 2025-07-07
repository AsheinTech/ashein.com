import * as THREE from './js/three.module.js';
import { FontLoader } from './js/FontLoader.js';
import { TextGeometry } from './js/TextGeometry.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass } from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';
import { OrbitControls } from './js/OrbitControls.js';

window.addEventListener("DOMContentLoaded", () => {
  // ------ SCENE & RENDERER ------
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 0;

  // ------ ORBIT CONTROLS ------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.enablePan = false;

  // ------ COMPOSER & BLOOM ------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  // ------ CURVE + TUNNEL ------
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 100 }, (_, i) =>
      new THREE.Vector3(
        Math.sin(i * 0.3) * 2,
        Math.cos(i * 0.3) * 2,
        -i * 2
      )
    )
  );

  const geometry = new THREE.TubeGeometry(curve, 300, 1.2, 32, false);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true
  });
  const tube = new THREE.Mesh(geometry, material);
  scene.add(tube);

  // ------ 3D TEXT ------
  const loader = new FontLoader();
  loader.load('./fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeo = new TextGeometry('Ashein Technologies', {
      font: font,
      size: 1,
      height: 0.2
    });

    const textMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true
    });

    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(5, 5, -10);
    scene.add(textMesh);
  });

  // ------ ANIMATION STATE ------
  let progress = 0;
  let speed = 0.01;

  // ------ ANIMATION LOOP ------
  function animate() {
    progress += speed;
    const point = curve.getPointAt(progress % 1);
    const tangent = curve.getTangentAt(progress % 1);

    camera.position.copy(point);
    camera.lookAt(point.clone().add(tangent));
    controls.update(); // Ensure smooth interaction

    composer.render();
    requestAnimationFrame(animate);
  }

  // ------ UI INTERACTION ------
  const enterBtn = document.getElementById('enter');
  const sound = document.getElementById('portal-sound');
  const loaderDiv = document.getElementById('loader');

  enterBtn.addEventListener('click', () => {
    enterBtn.style.opacity = 0;
    loaderDiv.style.display = 'block';

    setTimeout(() => {
      enterBtn.style.display = 'none';
      loaderDiv.style.display = 'none';
      sound.play().catch(() => {});
      animate();
    }, 1500);
  });

  // ------ RESIZE HANDLER ------
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});
