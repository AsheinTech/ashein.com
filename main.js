import * as THREE from './js/three.module.js';
import { FontLoader } from './js/FontLoader.js';
import { TextGeometry } from './js/TextGeometry.js';
import { EffectComposer } from './js/EffectComposer.js';
import { RenderPass } from './js/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';

window.addEventListener("DOMContentLoaded", () => {
  //------ SCENE & RENDER
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 0;

  //——-- COMPOSER & BLOOM -->
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  // ---- TUNNEL CURVE + MESH
  const geometry = new THREE.CylinderGeometry(10, 10, 100, 64);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      void main() {
        vec3 pos = position;
        pos.z += sin(pos.x * 0.1 + time) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);              
      }
    `// Royal blue
      }
    `
  });
  const tunnel = new THREE.Mesh(geometry, material);
  tunnel.rotation.x = Math.PI / 2;
  scene.add(tunnel);

  // Add background stars
  const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue
  for (let i = 0; i < 100; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.x = Math.random() * 20 - 10;
    star.position.y = Math.random() * 20 - 10;
    star.position.z = Math.random() * 20 - 10;
    scene.add(star);
  }

  // Add glowing Ashein Technologies
  const loader = new FontLoader();
  loader.load('./fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeo = new TextGeometry('Ashein Technologies', {
      font: font,
      size: 1,
      height: 0.2
    });
    const textMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(-8, 0, -5);
    scene.add(textMesh);
  });

  // ---- PROGRESS & SPEED ADJUSTMENT----
  let progress = 0;
  let speed = 0.009;

  //---- ANIMATION LOOP ------
  function animate() {
    progress += speed;
    material.uniforms.time.value = progress;
    composer.render();
    requestAnimationFrame(animate);
  }

  const enterBtn = document.getElementById('enter');
  const sound = document.getElementById('portal-sound');
  const loaderDiv = document.getElementById('loader');

  // ----- UI INTERACTION ————-—
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

  // ----- RESIZE HANDLER -----
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});
