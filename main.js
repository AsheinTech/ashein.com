import * as THREE from './js/three.module.js'; import { EffectComposer } from './js/EffectComposer.js'; import { RenderPass } from './js/RenderPass.js'; import { UnrealBloomPass } from './js/UnrealBloomPass.js';

window.addEventListener("DOMContentLoaded", () => { const canvas = document.getElementById('bg'); const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200); const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(window.devicePixelRatio);

// Bloom effect const composer = new EffectComposer(renderer); const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass); const bloomPass = new UnrealBloomPass( new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85 ); bloomPass.threshold = 0; bloomPass.strength = 2; bloomPass.radius = 0.8; composer.addPass(bloomPass);

// Custom tunnel curve class TunnelCurve extends THREE.Curve { getPoint(t) { const angle = 2 * Math.PI * t * 3; const radius = 4; return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, t * -100); } }

const path = new TunnelCurve(); const geometry = new THREE.TubeGeometry(path, 500, 2.5, 16, false); const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true, emissive: new THREE.Color(0x00ffff), emissiveIntensity: 1 });

const tunnel = new THREE.Mesh(geometry, material); scene.add(tunnel);

// Animated traveling light const movingLight = new THREE.PointLight(0x00ffff, 2, 20); scene.add(movingLight);

// Starfield const starGeometry = new THREE.BufferGeometry(); const starVertices = []; for (let i = 0; i < 1000; i++) { starVertices.push((Math.random() - 0.5) * 100); starVertices.push((Math.random() - 0.5) * 100); starVertices.push(-Math.random() * 200); } starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); const starMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.2 }); const stars = new THREE.Points(starGeometry, starMaterial); scene.add(stars);

// Animate let t = 0; function animate() { t += 0.0025; const point = path.getPoint(t % 1); camera.position.copy(point); const lookAtPoint = path.getPoint((t + 0.01) % 1); camera.lookAt(lookAtPoint);

movingLight.position.copy(camera.position);
composer.render();
requestAnimationFrame(animate);

}

// Interactivity const enterBtn = document.getElementById('enter'); const sound = document.getElementById('portal-sound'); const loader = document.getElementById('loader');

enterBtn.addEventListener('click', () => { enterBtn.style.opacity = 0; loader.style.display = 'block';

setTimeout(() => {
  enterBtn.style.display = 'none';
  loader.style.display = 'none';

  sound.play().catch(() => {
    console.warn("Audio autoplay blocked, continuing without sound.");
  });

  animate();
}, 2000);

});

// Resize support window.addEventListener('resize', () => { renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); }); });

