import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { airfoil,addTailplanes } from './airframe-parts';
/** Original web-scale interpretation, with 73.9:64.8 length/span proportions. */
export function buildBoeing(maxAnisotropy:number){
 const group=new THREE.Group();group.userData.animated=true;group.rotation.order='YXZ';
 const gear=new THREE.Group();group.add(gear);const fans:THREE.Group[]=[],wheels:THREE.Group[]=[];
 const white=new THREE.MeshPhysicalMaterial({color:'#f4f5f5',roughness:.29,metalness:.12,clearcoat:.4,side:THREE.DoubleSide});
 const wingPaint=new THREE.MeshStandardMaterial({color:'#d2d7da',roughness:.36,metalness:.25,side:THREE.DoubleSide});
 const red=new THREE.MeshPhysicalMaterial({color:'#cb1228',roughness:.3,clearcoat:.4,side:THREE.DoubleSide});
 const metal=new THREE.MeshStandardMaterial({color:'#89959e',metalness:.88,roughness:.25});
 const dark=new THREE.MeshStandardMaterial({color:'#18222b',roughness:.5,metalness:.3});
 const rubber=new THREE.MeshStandardMaterial({color:'#25272a',roughness:.85});
 const mesh=(geo:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D=group,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const profile=[[-20.75,0],[-20,.16],[-18.5,.5],[-16,.95],[-13,1.45],[-10,1.72],[12,1.72],[15,1.65],[17,1.38],[18.5,.94],[19.8,.55],[20.55,.2],[20.75,0]];
 const curve=new THREE.SplineCurve(profile.map(([z,r])=>new THREE.Vector2(z,r)));const points=curve.getPoints(180).map(p=>new THREE.Vector2(Math.max(0,p.y),p.x));
 const body=mesh(new THREE.LatheGeometry(points,64),white);body.rotation.x=Math.PI/2;body.updateMatrixWorld();
 // Raked tips, swept planform, and gentle dihedral distinguish the 777 from the A350.
 for(const side of [-1,1]){
  mesh(airfoil([{x:1.35,y:-.8,lead:5.5,chord:8.4},{x:4.8,y:-.5,lead:4.7,chord:7},{x:12,y:.45,lead:.1,chord:3.5},{x:16.7,y:1.15,lead:-3.8,chord:1.6},{x:18.2,y:1.4,lead:-5.6,chord:.09}],side,.085),wingPaint);
  for(let i=0;i<3;i++)mesh(new THREE.CapsuleGeometry(.11,.9,4,10),white,group,side*(5.5+i*3),-.65+i*.25,-2.3-i*1.45).rotation.x=Math.PI/2;
  // GE90-style nacelle: open intake, lip, recessed fan and exhaust cone.
  const engine=new THREE.Group();engine.position.set(side*5.6,-1.45,4.2);group.add(engine);
  const nacelle=mesh(new THREE.LatheGeometry([new THREE.Vector2(.72,-2.5),new THREE.Vector2(1,-1.8),new THREE.Vector2(1.22,.4),new THREE.Vector2(1.2,1.45),new THREE.Vector2(1.12,1.7),new THREE.Vector2(1.02,1.65),new THREE.Vector2(.98,1.25),new THREE.Vector2(.93,.7)],48),white,engine);nacelle.rotation.x=Math.PI/2;
  const lip=mesh(new THREE.TorusGeometry(1.1,.075,10,48),metal,engine,0,0,1.6);
  mesh(new THREE.CylinderGeometry(.99,.99,.12,48),dark,engine,0,0,1.15).rotation.x=Math.PI/2;
  const rotor=new THREE.Group();rotor.position.z=1.23;engine.add(rotor);fans.push(rotor);
  for(let i=0;i<22;i++){const blade=mesh(new THREE.BoxGeometry(.13,.66,.035),metal,rotor);const a=i*Math.PI*2/22;blade.position.set(Math.sin(a)*.57,Math.cos(a)*.57,0);blade.rotation.z=-a+.28;}
  mesh(new THREE.ConeGeometry(.25,.5,32),metal,rotor,0,0,.12).rotation.x=Math.PI/2;
  mesh(new THREE.ConeGeometry(.48,1.5,32),metal,engine,0,0,-2.4).rotation.x=-Math.PI/2;
  mesh(new THREE.BoxGeometry(.22,1.1,2.5),wingPaint,group,side*5.6,-.55,3.7);
 }
 addTailplanes(group,white,'777');
 const finShape=new THREE.Shape();finShape.moveTo(-19.5,.6);finShape.lineTo(-16.4,6.55);finShape.lineTo(-14.8,6.55);finShape.lineTo(-10.3,.6);finShape.closePath();
 const finGeometry=new THREE.ExtrudeGeometry(finShape,{depth:.13,bevelEnabled:true,bevelThickness:.06,bevelSize:.08,bevelSegments:2});
 finGeometry.rotateY(-Math.PI/2);const fin=mesh(finGeometry,red);fin.position.x=.065;fin.updateMatrixWorld();
 // Instanced cabin windows keep the long twin-aisle fuselage inexpensive to draw.
 const windows=new THREE.InstancedMesh(new RoundedBoxGeometry(.035,.17,.12,2,.035),dark,180);const matrix=new THREE.Matrix4();let n=0;
 for(const side of [-1,1])for(let i=0;i<90;i++){const z=-11.8+i*.29;if([12,6.7,.2,-6,-11.3].some(door=>Math.abs(z-door)<.4))continue;matrix.makeTranslation(side*1.56,.71,z);windows.setMatrixAt(n++,matrix);}
 windows.count=n;group.add(windows);
 for(const side of [-1,1]){
  for(const z of [-11.3,-6,.2,6.7,12]){const door=mesh(new RoundedBoxGeometry(.035,1.15,.48,2,.035),wingPaint,group,side*1.65,.05,z);}
  const cockpit=new THREE.BufferGeometry();cockpit.setAttribute('position',new THREE.Float32BufferAttribute([side*.85,.82,18.7,side*1.31,.84,17.2,side*1.4,.42,17.1,side*.85,.82,18.7,side*1.4,.42,17.1,side*.9,.43,18.5],3));cockpit.computeVertexNormals();mesh(cockpit,new THREE.MeshStandardMaterial({color:'#1b303e',roughness:.22,metalness:.5,side:THREE.DoubleSide}));
 }
 const decal=(target:THREE.Mesh,canvas:HTMLCanvasElement,pos:THREE.Vector3,side:number,size:THREE.Vector3)=>{const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=maxAnisotropy;const m=mesh(new DecalGeometry(target,pos,new THREE.Euler(0,side*Math.PI/2,0),size),new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));m.renderOrder=2;};
 const letters=document.createElement('canvas');letters.width=1024;letters.height=256;const c=letters.getContext('2d')!;c.fillStyle='#c81024';c.font='600 200px Arial';c.fillText('SWISS',12,202);
 const flag=document.createElement('canvas');flag.width=flag.height=512;const fc=flag.getContext('2d')!;fc.fillStyle='white';fc.fillRect(105,213,302,86);fc.fillRect(213,105,86,302);
 for(const side of [-1,1]){decal(body,letters,new THREE.Vector3(side*1.6,.4,11.2),side,new THREE.Vector3(6.5,1.65,1));decal(fin,flag,new THREE.Vector3(side*.15,4.75,-15.8),side,new THREE.Vector3(3.2,3.2,.65));}
 for(const [x,z,main]of [[-1.9,-3.8,true],[1.9,-3.8,true],[0,14,false]] as const){
  mesh(new THREE.CylinderGeometry(.06,.09,1.35,12),metal,gear,x,-2.12,z);
  const bogie=mesh(new THREE.BoxGeometry(.35,.13,main?1.8:.3),metal,gear,x,-2.96,z);
  for(const side of [-1,1])for(let axle=0;axle<(main?3:1);axle++){const wheel=new THREE.Group();wheel.position.set(x+side*(main?.3:.19),main?-3.12:-3.28,z+(main?(axle-1)*.65:0));gear.add(wheel);const radius=main?.44:.28;mesh(new THREE.CylinderGeometry(radius,radius,.25,24),rubber,wheel).rotation.z=Math.PI/2;mesh(new THREE.CylinderGeometry(radius*.45,radius*.45,.26,20),metal,wheel).rotation.z=Math.PI/2;wheels.push(wheel);}
 }
 const state={loaded:true,source:'zln-777-300er',error:false};return {group,gear,fans,wheels,state,ready:Promise.resolve()};
}
