import * as THREE from './js/three.module.js';
import { FontLoader } from './js/FontLoader.js';
import { TextGeometry } from './js/TextGeometry.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass } from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  camera.position.z = 5;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.5, 0.4, 0.85);
  bloom.threshold = 0; bloom.strength = 2; bloom.radius = 1.5;
  composer.addPass(bloom);

  scene.fog = new THREE.FogExp2(0x000000, 0.035);

  const starsGeo = new THREE.BufferGeometry();
  const starVerts = [];
  for (let i = 0; i < 5000; i++) {
    starVerts.push(...[
      THREE.MathUtils.randFloatSpread(200),
      THREE.MathUtils.randFloatSpread(200),
      THREE.MathUtils.randFloatSpread(200)
    ]);
  }
  starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x88ccff })));

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 200 }, (_, i) =>
      new THREE.Vector3(Math.sin(i * 0.3)*5, Math.cos(i * 0.3)*5, -i * 3)
    )
  );
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 400, 1, 64, false),
    new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      wireframe: true,
      emissive: 0x0044ff,
      emissiveIntensity: 1
    })
  );
  scene.add(tube);

  const pl = new THREE.PointLight(0x00ffff, 1);
  pl.position.set(0,0,10);
  scene.add(pl);

  new FontLoader().load(
    './fonts/helvetiker_regular.typeface.json',
    f => {
      const txt = new TextGeometry('Ashein Technologies', {
        font: f, size: 0.6, height: 0.1
      });
      txt.center();
      const txtMesh = new THREE.Mesh(txt, new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      txtMesh.position.set(5, 3, -20);
      scene.add(txtMesh);
    }
  );

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime() * 10;
    camera.position.z = t;
    camera.lookAt(0,0, t - 10);
    composer.render();
    requestAnimationFrame(animate);
  }

  const enterBtn = document.getElementById('enter');
  const loaderDiv = document.getElementById('loader');
  const sound = document.getElementById('portal-sound');

  enterBtn.addEventListener('click', () => {
    enterBtn.style.opacity = 0;
    loaderDiv.style.display = 'block';
    setTimeout(() => {
      enterBtn.style.display = 'none';
      loaderDiv.style.display = 'none';
      sound.play().catch(()=>{});
      animate();
    }, 1500);
  });

  window.addEventListener("resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });
});
