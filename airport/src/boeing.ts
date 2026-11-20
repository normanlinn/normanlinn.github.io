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
 // Shaped rings separate the flight-deck crown from the lowered radome.
 const stations=[[-20.75,.02,.04,.38],[-20,.22,.26,.36],[-18.4,.54,.58,.28],[-16,1.05,1.02,.16],[-13,1.5,1.47,.06],[-10,1.74,1.74,0],[12.7,1.74,1.74,0],[15.2,1.68,1.66,-.02],[16.8,1.47,1.39,-.07],[18,1.12,1.04,-.14],[19,.78,.7,-.22],[19.85,.46,.4,-.29],[20.45,.2,.17,-.32],[20.75,.01,.02,-.32]];
 const sample=(z:number,column:number)=>{let i=0;while(i<stations.length-2&&z>stations[i+1][0])i++;const t=THREE.MathUtils.clamp((z-stations[i][0])/(stations[i+1][0]-stations[i][0]),0,1);const a=stations[Math.max(0,i-1)][column],b=stations[i][column],c=stations[i+1][column],d=stations[Math.min(stations.length-1,i+2)][column];return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);};
 const vertices:number[]=[],uvs:number[]=[],indices:number[]=[];const rings=240,sides=80;
 for(let i=0;i<=rings;i++){const z=-20.75+i/rings*41.5;for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;vertices.push(Math.cos(a)*sample(z,1),Math.sin(a)*sample(z,2)+sample(z,3),z);uvs.push(j/sides,i/rings);}}
 for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
 const bodyGeometry=new THREE.BufferGeometry();bodyGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));bodyGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));bodyGeometry.setIndex(indices);bodyGeometry.computeVertexNormals();
 const body=mesh(bodyGeometry,white);body.updateMatrixWorld();
 // Raked tips, swept planform, and gentle dihedral distinguish the 777 from the A350.
 for(const side of [-1,1]){
  mesh(airfoil([{x:1.35,y:-.8,lead:5.5,chord:8.4},{x:4.8,y:-.58,lead:3.5,chord:6.7},{x:12,y:.08,lead:-1.2,chord:3.05},{x:16.7,y:.62,lead:-5.5,chord:1.25},{x:18.2,y:.85,lead:-7.1,chord:.09}],side,.085),wingPaint);
  for(let i=0;i<3;i++)mesh(new THREE.CapsuleGeometry(.11,.9,4,10),white,group,side*(5.5+i*3),-.65+i*.25,-2.3-i*1.45).rotation.x=Math.PI/2;
  // GE90-style nacelle: open intake, lip, recessed fan and exhaust cone.
  const engine=new THREE.Group();engine.position.set(side*5.6,-1.45,4.2);group.add(engine);
  const nacelle=mesh(new THREE.LatheGeometry([new THREE.Vector2(.72,-2.5),new THREE.Vector2(1,-1.8),new THREE.Vector2(1.22,.4),new THREE.Vector2(1.2,1.45),new THREE.Vector2(1.12,1.7),new THREE.Vector2(1.02,1.65),new THREE.Vector2(.98,1.25),new THREE.Vector2(.93,.7)],48),white,engine);nacelle.rotation.x=Math.PI/2;
  const lip=mesh(new THREE.TorusGeometry(1.1,.075,10,48),metal,engine,0,0,1.6);
  mesh(new THREE.CylinderGeometry(.99,.99,.12,48),dark,engine,0,0,1.15).rotation.x=Math.PI/2;
  const rotor=new THREE.Group();rotor.position.z=1.23;engine.add(rotor);fans.push(rotor);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(-.07,-.29);bladeShape.quadraticCurveTo(.13,-.03,.11,.34);bladeShape.lineTo(-.04,.34);bladeShape.quadraticCurveTo(.02,.02,-.12,-.27);bladeShape.closePath();
  const blades=new THREE.InstancedMesh(new THREE.ExtrudeGeometry(bladeShape,{depth:.025,bevelEnabled:false}),metal,22);const bladePose=new THREE.Object3D();for(let i=0;i<22;i++){const a=i*Math.PI*2/22;bladePose.position.set(Math.sin(a)*.57,Math.cos(a)*.57,0);bladePose.rotation.z=-a+.28;bladePose.updateMatrix();blades.setMatrixAt(i,bladePose.matrix);}rotor.add(blades);

  mesh(new THREE.ConeGeometry(.25,.5,32),metal,rotor,0,0,.12).rotation.x=Math.PI/2;
  mesh(new THREE.ConeGeometry(.48,1.5,32),metal,engine,0,0,-2.4).rotation.x=-Math.PI/2;
  mesh(new THREE.BoxGeometry(.22,1.1,2.5),wingPaint,group,side*5.6,-.55,3.7);
 }
 addTailplanes(group,white,'777');
 const finShape=new THREE.Shape();finShape.moveTo(-19.5,.6);finShape.lineTo(-16.4,6.55);finShape.lineTo(-14.8,6.55);finShape.lineTo(-10.3,.6);finShape.closePath();
 const finGeometry=new THREE.ExtrudeGeometry(finShape,{depth:.13,bevelEnabled:true,bevelThickness:.06,bevelSize:.08,bevelSegments:2});
 finGeometry.rotateY(-Math.PI/2);const fin=mesh(finGeometry,red);fin.position.x=.065;fin.updateMatrixWorld();
 // Windows follow the skin, including the aft taper, instead of sinking into it.
 const windows=new THREE.InstancedMesh(new RoundedBoxGeometry(.045,.215,.15,3,.045),dark,200);const matrix=new THREE.Matrix4();let n=0;
 const doorPositions=[13.25,6.7,.15,-6.5,-12.3];
 for(const side of [-1,1])for(let i=0;i<100;i++){const z=-13.7+i*.294;if(doorPositions.some(door=>Math.abs(z-door)<.43))continue;const y=.67;const rx=sample(z,1),ry=sample(z,2);const x=rx*Math.sqrt(Math.max(0,1-Math.pow((y-sample(z,3))/ry,2)))+.026;matrix.makeTranslation(side*x,y,z);windows.setMatrixAt(n++,matrix);}
 windows.count=n;group.add(windows);
 const decal=(target:THREE.Mesh,canvas:HTMLCanvasElement,pos:THREE.Vector3,side:number,size:THREE.Vector3)=>{const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=maxAnisotropy;const m=mesh(new DecalGeometry(target,pos,new THREE.Euler(0,side*Math.PI/2,0),size),new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));m.renderOrder=2;};
 // Project panel outlines and separated flight-deck glazing directly onto the curved skin.
 const doorCanvas=document.createElement('canvas');doorCanvas.width=256;doorCanvas.height=512;const dc=doorCanvas.getContext('2d')!;dc.strokeStyle='#78858b';dc.lineWidth=4;dc.beginPath();dc.roundRect(38,22,180,465,28);dc.stroke();dc.fillStyle='#81929b';dc.beginPath();dc.roundRect(100,105,55,64,12);dc.fill();dc.fillStyle='#b32832';dc.fillRect(133,263,40,7);dc.fillStyle='#586870';dc.font='18px Arial';dc.fillText('EXIT',105,66);
 const cockpitCanvas=document.createElement('canvas');cockpitCanvas.width=1024;cockpitCanvas.height=384;const cc=cockpitCanvas.getContext('2d')!;cc.fillStyle='#203441';cc.strokeStyle='#a8b3b8';cc.lineWidth=7;
 for(const polygon of [[[50,90],[250,65],[263,282],[78,276]],[[280,65],[555,95],[600,280],[280,282]],[[587,110],[827,185],[945,283],[634,280]]]){cc.beginPath();polygon.forEach(([x,y],i)=>i?cc.lineTo(x,y):cc.moveTo(x,y));cc.closePath();cc.fill();cc.stroke();}
 for(const side of [-1,1]){
  for(const z of doorPositions)decal(body,doorCanvas,new THREE.Vector3(side*1.72,.08,z),side,new THREE.Vector3(.66,1.55,.7));
  decal(body,cockpitCanvas,new THREE.Vector3(side*1.15,.85,17.45),side,new THREE.Vector3(2.6,.82,2.4));
 }
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
