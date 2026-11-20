import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function buildWorkstation(scene:THREE.Scene,m:{wood:THREE.Material;steel:THREE.Material;ink:THREE.Material;white:THREE.Material}){
 const desk=new THREE.Group();desk.position.set(14,0,8);scene.add(desk);
 const make=(geo:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D,x:number,y:number,z:number)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const rounded=(w:number,h:number,d:number,mat:THREE.Material,parent:THREE.Object3D,x:number,y:number,z:number,r=.08)=>make(new RoundedBoxGeometry(w,h,d,3,r),mat,parent,x,y,z);
 const graphite=new THREE.MeshPhysicalMaterial({color:'#303c46',metalness:.6,roughness:.29,clearcoat:.25});
 const fabric=new THREE.MeshStandardMaterial({color:'#42515c',roughness:.95});
 rounded(5.6,.13,2.25,m.wood,desk,0,1.32,0,.055);
 for(const x of [-2.15,2.15])rounded(.12,1.22,1.5,graphite,desk,x,.64,0,.035);
 rounded(4.65,.68,.15,graphite,desk,0,.72,.78,.08);
 // A small engraved desk plaque replaces the oversized billboard.
 const plaque=document.createElement('canvas');plaque.width=1024;plaque.height=160;const pc=plaque.getContext('2d')!;pc.fillStyle='#25323c';pc.fillRect(0,0,1024,160);pc.fillStyle='#e9edef';pc.font='500 54px Terminal,Arial';pc.fillText('Developer desk',36,72);pc.fillStyle='#a9bac5';pc.font='26px Terminal,Arial';pc.fillText('THINK. BUILD. ITERATE.',39,121);const pt=new THREE.CanvasTexture(plaque);pt.colorSpace=THREE.SRGBColorSpace;const panel=make(new THREE.PlaneGeometry(2.5,.39),new THREE.MeshBasicMaterial({map:pt}),desk,0,.75,.87);
 const laptop=new THREE.Group();laptop.position.set(-.1,1.41,0);laptop.rotation.y=-.16;desk.add(laptop);
 rounded(1.6,.045,1.03,m.steel,laptop,0,0,.18,.025);
 rounded(.57,.008,.29,graphite,laptop,0,.027,.47,.02);
 const keys=new THREE.InstancedMesh(new RoundedBoxGeometry(.085,.009,.06,2,.004),graphite,48);const keyMatrix=new THREE.Matrix4();for(let row=0;row<4;row++)for(let col=0;col<12;col++){keyMatrix.makeTranslation(-.57+col*.104,.029,-.14+row*.09);keys.setMatrixAt(row*12+col,keyMatrix);}laptop.add(keys);
 const lid=new THREE.Group();lid.position.set(0,.04,-.3);lid.rotation.x=-.16;laptop.add(lid);
 rounded(1.59,1.01,.035,graphite,lid,0,.5,0,.035);
 const screen=document.createElement('canvas');screen.width=1200;screen.height=740;const ctx=screen.getContext('2d')!;
 const texture=new THREE.CanvasTexture(screen);texture.colorSpace=THREE.SRGBColorSpace;const screenMesh=make(new THREE.PlaneGeometry(1.46,.88),new THREE.MeshBasicMaterial({map:texture}),lid,0,.51,.024);
 const lines=['const developer = {','  name: "Zaw Lin Naing",','  focus: "Thoughtful interfaces",','  tools: ["TypeScript", "React"],','  next: () => buildSomethingGreat()','};','','export default developer;'];let lastFrame=-1,lastAnimated=true;
 const mug=make(new THREE.CylinderGeometry(.12,.1,.23,32),m.white,desk,1.35,1.51,-.25);make(new THREE.TorusGeometry(.08,.023,10,24),m.white,desk,1.48,1.51,-.25).rotation.y=Math.PI/2;
 rounded(.62,.015,.8,graphite,desk,-1.55,1.405,.12,.025);const pen=make(new THREE.CylinderGeometry(.018,.018,.5,12),m.steel,desk,-1.39,1.43,.16);pen.rotation.z=Math.PI/2;
 const avatar=new THREE.Group();avatar.position.set(14,0,6.55);scene.add(avatar);avatar.userData.animated=true;
 const skin=new THREE.MeshStandardMaterial({color:'#c6997a',roughness:.76});const hair=new THREE.MeshStandardMaterial({color:'#22282c',roughness:.9});
 rounded(.79,.98,.46,fabric,avatar,0,1.35,0,.16);
 const head=make(new THREE.SphereGeometry(.32,32,24),skin,avatar,0,2.13,.03);head.scale.set(.88,1.12,.87);
 const hairMesh=make(new THREE.SphereGeometry(.325,32,20,0,Math.PI*2,0,Math.PI*.52),hair,avatar,0,2.2,.015);hairMesh.scale.set(.91,1.13,.92);
 make(new THREE.SphereGeometry(.065,16,12),skin,avatar,0,2.08,.294).scale.set(.65,.8,1);
 const glassesMaterial=new THREE.MeshStandardMaterial({color:'#202a31',roughness:.4,metalness:.55});
 for(const side of [-1,1]){
  const frame=make(new THREE.TorusGeometry(.105,.012,8,28),glassesMaterial,avatar,side*.135,2.17,.275);frame.scale.set(1.04,.8,1);
  make(new THREE.SphereGeometry(.024,12,8),hair,avatar,side*.13,2.16,.287);
  const ear=make(new THREE.SphereGeometry(.12,20,16),graphite,avatar,side*.31,2.17,.025);ear.scale.set(.55,1.2,.9);
  rounded(.29,.46,.35,graphite,avatar,side*.23,.65,.2,.07);rounded(.28,.17,.55,m.white,avatar,side*.23,.34,.37,.06);
 }
 rounded(.07,.02,.025,glassesMaterial,avatar,0,2.17,.29,.006);
 const smilePoints=Array.from({length:20},(_,i)=>{const t=i/19;return new THREE.Vector3((t-.5)*.13,1.99-Math.sin(t*Math.PI)*.022,.286);});make(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smilePoints),20,.007,6,false),new THREE.MeshStandardMaterial({color:'#8c5648'}),avatar,0,0,0);
 const band=make(new THREE.TorusGeometry(.355,.026,10,36,Math.PI),graphite,avatar,0,2.2,.02);
 const hands:THREE.Mesh[]=[];for(const side of [-1,1]){const arm=make(new THREE.CapsuleGeometry(.105,.5,6,16),fabric,avatar,side*.43,1.46,.3);arm.rotation.x=-.9;arm.rotation.z=side*.2;const hand=make(new THREE.SphereGeometry(.105,20,12),skin,avatar,side*.35,1.45,.65);hand.scale.set(.9,.5,1.2);hands.push(hand);}
 const chair=new THREE.Group();chair.position.set(14,0,6.3);scene.add(chair);rounded(.93,.14,.85,graphite,chair,0,.9,0,.08);rounded(.94,.9,.15,graphite,chair,0,1.43,-.42,.1);make(new THREE.CylinderGeometry(.07,.07,.8,16),m.steel,chair,0,.43,0);
 return {desk,update(time:number,animated=true){hands.forEach((hand,i)=>hand.position.y=1.45+Math.sin(time*7+i*2)*.012);head.rotation.x=Math.sin(time*.6)*.025;const frame=Math.floor(time*6);if(frame===lastFrame&&animated===lastAnimated)return;lastFrame=frame;lastAnimated=animated;ctx.fillStyle='#15212a';ctx.fillRect(0,0,1200,740);ctx.fillStyle='#243643';ctx.fillRect(0,0,1200,70);ctx.font='26px monospace';ctx.fillStyle='#d1dbe0';ctx.fillText('portfolio.ts',45,45);const count=frame%240;let remaining=animated?Math.min(lines.join('').length,count*3+20):lines.join('').length;lines.forEach((line,i)=>{ctx.font='29px monospace';ctx.fillStyle='#5a7080';ctx.fillText(String(i+1),26,125+i*66);ctx.fillStyle=i===0||i===7?'#eaa2a9':i===5?'#d9e1e5':'#a8d8ca';ctx.fillText(line.slice(0,Math.max(0,remaining)),92,125+i*66);remaining-=line.length;});ctx.fillStyle='#e1e8ec';if(frame%6<3)ctx.fillRect(94,675,13,3);texture.needsUpdate=true;}}
}
