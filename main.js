import * as THREE from './js/three.module.js';
import { FontLoader } from './js/FontLoader.js';
import { TextGeometry } from './js/TextGeometry.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass } from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('bg');
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.position.z = 0;

  // Post-processing composer for glowing effect
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloom.threshold = 0;
  bloom.strength = 2;
  bloom.radius = 1.2;
  composer.addPass(bloom);

  // Starfield background
  const starsGeo = new THREE.BufferGeometry();
  const starVerts = [];
  for(let i = 0; i < 8000; i++) {
    starVerts.push(
      THREE.MathUtils.randFloatSpread(400),
      THREE.MathUtils.randFloatSpread(400),
      THREE.MathUtils.randFloatSpread(400)
    );
  }
  starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x88ccff })));

  // Create swirling tunnel
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 200 }, (_, i) =>
      new THREE.Vector3(Math.sin(i * 0.2)*8, Math.cos(i * 0.2)*8, -i * 5)
    ), false, 'catmullrom', 0.5
  );
  const tubeGeo = new THREE.TubeGeometry(curve, 400, 1.5, 64, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    wireframe: true,
    emissive: 0x0044ff,
    emissiveIntensity: 2
  });
  const tunnel = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(tunnel);

  const light = new THREE.PointLight(0x00ffff, 2, 100);
  light.position.set(0, 0, 10);
  scene.add(light);

  new FontLoader().load('./fonts/helvetiker_regular.typeface.json', font => {
    const txtGeo = new TextGeometry('Ashein Technologies', {
      font: font,
      size: 0.8,
      height: 0.1,
      curveSegments: 12
    }).center();
    const txtMesh = new THREE.Mesh(txtGeo, new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    txtMesh.position.set(6, 4, -20);
    scene.add(txtMesh);
  });

  const clock = new THREE.Clock();
  let running = false;

  function animate() {
    if (!running) return;
    const t = clock.getElapsedTime() * 20;
    camera.position.z = t;
    camera.lookAt(0, 0, t - 10);
    composer.render();
    requestAnimationFrame(animate);
  }

  document.getElementById('enter').addEventListener('click', () => {
    document.getElementById('enter').style.opacity = 0;
    document.getElementById('loader').style.display = 'block';

    setTimeout(() => {
      document.getElementById('enter').style.display = 'none';
      document.getElementById('loader').style.display = 'none';
      document.getElementById('portal-sound').play().catch(() => {});
      clock.start();
      running = true;
      animate();
    }, 1500);
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
})
