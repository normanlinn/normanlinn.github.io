import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Small deterministic textures: no external downloads or runtime texture service. */
export function terminalMaterials(renderer:THREE.WebGLRenderer,scene:THREE.Scene){
 const pmrem=new THREE.PMREMGenerator(renderer);
 const room=new RoomEnvironment();
 const environment=pmrem.fromScene(room,.07);
 scene.environment=environment.texture;
 scene.environmentIntensity=.62;
 room.dispose();pmrem.dispose();
 let seed=12904;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function texture(kind:'stone'|'wood'){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d')!;
  if(kind==='stone'){
   ctx.fillStyle='#e1dfd8';ctx.fillRect(0,0,512,512);
   for(let i=0;i<19000;i++){const value=160+random()*65;ctx.fillStyle='rgba('+value+','+value+','+(value-4)+','+(.05+random()*.12)+')';const radius=.25+random()*1.5;ctx.beginPath();ctx.ellipse(random()*512,random()*512,radius,radius*.7,random()*Math.PI,0,Math.PI*2);ctx.fill();}
   ctx.strokeStyle='#bcbdb7';ctx.lineWidth=1.2;ctx.strokeRect(.6,.6,510.8,510.8);
  }else{
   ctx.fillStyle='#bda991';ctx.fillRect(0,0,512,512);
   for(let i=0;i<450;i++){ctx.strokeStyle='rgba(73,47,25,'+(.01+random()*.045)+')';ctx.lineWidth=.3+random()*1.5;ctx.beginPath();const x=random()*512;ctx.moveTo(x,0);ctx.bezierCurveTo(x+random()*12,150,x-random()*14,330,x+random()*8,512);ctx.stroke();}
  }
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
 }
 const stone=texture('stone');stone.repeat.set(24,30);
 const wood=texture('wood');wood.repeat.set(2,1);
 return {
  floor:new THREE.MeshPhysicalMaterial({color:'#faf9f4',map:stone,roughness:.31,metalness:.02,clearcoat:.42,clearcoatRoughness:.25,bumpMap:stone,bumpScale:.008}),
  wood:new THREE.MeshStandardMaterial({color:'#ddd1bc',map:wood,roughness:.48,metalness:0}),
  leather:new THREE.MeshPhysicalMaterial({color:'#2a2c2c',roughness:.68,metalness:0,sheen:.25,sheenColor:new THREE.Color('#6b6c68')}),
  white:new THREE.MeshStandardMaterial({color:'#f0f0e9',roughness:.38,metalness:.04}),
  steel:new THREE.MeshStandardMaterial({color:'#bac1c2',roughness:.28,metalness:.8}),
 };
}
