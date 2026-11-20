import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Small deterministic textures: no external downloads or runtime texture service. */
export function terminalMaterials(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.07);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.5;
  room.dispose();
  pmrem.dispose();
  let seed = 12904;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function texture(kind: 'stone' | 'wood') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    if (kind === 'stone') {
      ctx.fillStyle = '#c7ccca';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 19000; i++) {
        const value = 160 + random() * 65;
        ctx.fillStyle =
          'rgba(' + value + ',' + value + ',' + (value - 4) + ',' + (0.05 + random() * 0.12) + ')';
        const radius = 0.25 + random() * 1.5;
        ctx.beginPath();
        ctx.ellipse(random() * 512, random() * 512, radius, radius * 0.7, random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 1900; i++) {
        const x = random() * 512,
          y = random() * 512,
          r = 1 + random() * 3;
        ctx.fillStyle = ['#f0f1eb', '#717e80', '#9ca8a5', '#dce0da'][i % 4];
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + r, y + r * 0.4);
        ctx.lineTo(x + r * 0.5, y + r * 1.3);
        ctx.lineTo(x - r * 0.4, y + r * 0.6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = '#899796';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0.6, 0.6, 510.8, 510.8);
    } else {
      ctx.fillStyle = '#92745a';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 450; i++) {
        ctx.strokeStyle = 'rgba(73,47,25,' + (0.01 + random() * 0.045) + ')';
        ctx.lineWidth = 0.3 + random() * 1.5;
        ctx.beginPath();
        const x = random() * 512;
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + random() * 12, 150, x - random() * 14, 330, x + random() * 8, 512);
        ctx.stroke();
      }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  const stone = texture('stone');
  stone.repeat.set(24, 30);
  const wood = texture('wood');
  wood.repeat.set(2, 1);
  const carpetCanvas = document.createElement('canvas');
  carpetCanvas.width = carpetCanvas.height = 128;
  const cc = carpetCanvas.getContext('2d')!;
  cc.fillStyle = '#697272';
  cc.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8000; i++) {
    cc.fillStyle = i % 2 ? '#85908c50' : '#323f3d50';
    cc.fillRect(random() * 128, random() * 128, 0.5, 2);
  }
  const carpetTexture = new THREE.CanvasTexture(carpetCanvas);
  carpetTexture.colorSpace = THREE.SRGBColorSpace;
  carpetTexture.wrapS = carpetTexture.wrapT = THREE.RepeatWrapping;
  carpetTexture.repeat.set(8, 8);
  return {
    carpet: new THREE.MeshStandardMaterial({
      map: carpetTexture,
      roughness: 1,
      bumpMap: carpetTexture,
      bumpScale: 0.015,
    }),
    floor: new THREE.MeshPhysicalMaterial({
      color: '#faf9f4',
      map: stone,
      roughness: 0.31,
      metalness: 0.02,
      clearcoat: 0.42,
      clearcoatRoughness: 0.25,
      bumpMap: stone,
      bumpScale: 0.008,
    }),
    wood: new THREE.MeshStandardMaterial({ color: '#c7ad88', map: wood, roughness: 0.48, metalness: 0 }),
    leather: new THREE.MeshPhysicalMaterial({
      color: '#2a2c2c',
      roughness: 0.68,
      metalness: 0,
      sheen: 0.25,
      sheenColor: new THREE.Color('#6b6c68'),
    }),
    white: new THREE.MeshStandardMaterial({ color: '#f0f0e9', roughness: 0.38, metalness: 0.04 }),
    steel: new THREE.MeshStandardMaterial({ color: '#bac1c2', roughness: 0.28, metalness: 0.8 }),
  };
}
