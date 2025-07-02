import * as THREE from './js/three.module.js';
import { FontLoader }    from './js/FontLoader.js';
import { TextGeometry }  from './js/TextGeometry.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass }     from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';

window.addEventListener("DOMContentLoaded", () => {
  // ——— SCENE & RENDERER ——————————————————————————
  const canvas   = document.getElementById('bg');
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  camera.position.z = 0;

  // ——— COMPOSER + BLOOM ——————————————————————————
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    1.5, 0.4, 0.85
  );
  bloom.threshold = 0;
  bloom.strength  = 2;
  bloom.radius    = 0.8;
  composer.addPass(bloom);

  // ——— TUNNEL CURVE + MESH ————————————————————————
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 200 }, (_, i) =>
      new THREE.Vector3(
        Math.sin(i * 0.2) * 2,
        Math.cos(i * 0.2) * 2,
        -i * 1.5
      )
    )
  );
  const tubeGeo = new THREE.TubeGeometry(curve, 600, 1.2, 24, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true
  });
  scene.add(new THREE.Mesh(tubeGeo, tubeMat));

  // ——— 3D TEXT —————————————————————————————————————
  new FontLoader().load(
    'https://asheintech.github.io/ashein.com/fonts/helvetiker_regular.typeface.json',
    (font) => {
      const txtGeo = new TextGeometry('Ashein Technologies', {
        font, size: 0.8, height: 0.2, curveSegments:12
      });
      txtGeo.center();
      const txtMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
      const txtMesh = new THREE.Mesh(txtGeo, txtMat);
      txtMesh.position.z = -10; // sit a bit ahead
      scene.add(txtMesh);
    }
  );

  // ——— INTERACTION STATE —————————————————————————
  let t      = 0;
  const speed = 0.05;          // slower steady speed
  const mouse = new THREE.Vector2();
  const targetCam = new THREE.Vector2();

  window.addEventListener('mousemove', (e) => {
    // map mouse to -0.5..0.5
    mouse.x = (e.clientX / innerWidth)  - 0.5;
    mouse.y = (e.clientY / innerHeight) - 0.5;
  });

  // ——— ANIMATION LOOP ——————————————————————————
  function animate() {
    // advance along curve
    t = (t + speed) % 1;
    const pos = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);

    // smooth mouse interpolation
    targetCam.lerp(mouse, 0.05);

    camera.position.copy(pos);
    camera.position.x += targetCam.x * 2;  // gentle horizontal drift
    camera.position.y += targetCam.y * 2;  // gentle vertical drift
    camera.lookAt(pos.clone().add(tan));

    composer.render();
    requestAnimationFrame(animate);
  }

  // ——— UI INTERACTION ——————————————————————————
  const enterBtn = document.getElementById('enter');
  const loader   = document.getElementById('loader');
  const sound    = document.getElementById('portal-sound');

  enterBtn.addEventListener('click', () => {
    enterBtn.style.opacity         = 0;
    loader.style.display           = 'block';
    setTimeout(() => {
      enterBtn.style.display       = 'none';
      loader.style.display         = 'none';
      sound.play().catch(() => {});
      animate();
    }, 1500);
  });

  // ——— RESIZE HANDLER ——————————————————————————
  window.addEventListener("resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });
});
