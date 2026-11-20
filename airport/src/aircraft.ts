import * as THREE from 'three';
import { addTailplanes } from './airframe-parts';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

/** Licensed A350 airframe, normalized once, with local livery and animated mechanisms. */
export function buildAirliner(maxAnisotropy:number){
 const group=new THREE.Group();group.userData.animated=true;group.rotation.order='YXZ';group.visible=false;
 const gear=new THREE.Group();group.add(gear);
 const fans:THREE.Group[]=[],wheels:THREE.Group[]=[];
 const state={loaded:false,source:'amvlab-a350',error:false};
 const metal=new THREE.MeshStandardMaterial({color:'#b4bcc2',roughness:.23,metalness:.85});
 const rubber=new THREE.MeshStandardMaterial({color:'#1d2024',roughness:.83});
 function part(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 // Bogies sit at the runway surface with AIRCRAFT_GROUND_Y = 3.35.
 for(const [x,z,main]of [[-1.7,-3.9,true],[1.7,-3.9,true],[0,12.5,false]] as const){
  const leg=part(new THREE.CylinderGeometry(.055,.08,1.45,14),metal,gear);leg.position.set(x,-2.25,z);
  const brace=part(new THREE.CylinderGeometry(.035,.035,1.2,10),metal,gear);brace.position.set(x,-2,z-.4);brace.rotation.x=-.5;
  const bogie=part(new THREE.BoxGeometry(.36,.12,main?1.2:.3),metal,gear);bogie.position.set(x,-3.11,z);
  for(const side of [-1,1])for(let axle=0;axle<(main?2:1);axle++){
   const wheelGroup=new THREE.Group();wheelGroup.position.set(x+side*(main?.29:.18),main?-3.2:-3.31,z+(main?axle*.68-.34:0));gear.add(wheelGroup);
   const radius=main?.36:.25;
   const tire=part(new THREE.CylinderGeometry(radius,radius,main?.25:.17,28),rubber,wheelGroup);tire.rotation.z=Math.PI/2;
   const hub=part(new THREE.CylinderGeometry(radius*.44,radius*.44,main?.26:.18,20),metal,wheelGroup);hub.rotation.z=Math.PI/2;wheels.push(wheelGroup);
  }
 }
 const ready=new GLTFLoader().loadAsync('assets/a350-plain.glb').then(gltf=>{
  gltf.scene.updateMatrixWorld(true);
  let source:THREE.Mesh|undefined;
  gltf.scene.traverse(object=>{if(object instanceof THREE.Mesh)source=object;});
  if(!source)throw new Error('A350 mesh missing');
  const geometry=source.geometry.clone();geometry.applyMatrix4(source.matrixWorld);
  // The source airframe points along +X; the flight controller expects +Z.
  geometry.rotateY(-Math.PI/2);geometry.computeBoundingBox();
  const bounds=geometry.boundingBox!;
  const sourceLength=bounds.max.z-bounds.min.z;
  geometry.translate(-(bounds.min.x+bounds.max.x)/2,-1.1319137937413029,-(bounds.min.z+bounds.max.z)/2);
  geometry.scale(38/sourceLength,38/sourceLength,38/sourceLength);
  const expanded=geometry.index?geometry.toNonIndexed():geometry;
  const positions=expanded.getAttribute('position'),normals=expanded.getAttribute('normal'),uv=expanded.getAttribute('uv');
  const sourceMaterial=(Array.isArray(source.material)?source.material[0]:source.material) as THREE.MeshStandardMaterial;
  const original=sourceMaterial.map!;
  // Repaint the old blue livery islands while retaining the cockpit, doors, windows and engine details.
  const image=original.image as ImageBitmap;
  const atlas=document.createElement('canvas');atlas.width=image.width;atlas.height=image.height;
  const ctx=atlas.getContext('2d')!;ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,atlas.width,atlas.height);
  const blue=new Uint8Array(atlas.width*atlas.height);
  for(let y=0;y<atlas.height;y++)for(let x=0;x<atlas.width;x++){
   const index=y*atlas.width+x,i=index*4,r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
   const engineFan=x/atlas.width>.81&&x/atlas.width<.94&&y/atlas.height<.145;
   if(!engineFan&&b-r>18&&b>g*1.08)blue[index]=1;
  }
  // Preserve individual dark window marks; remove the large connected livery panels.
  for(let start=0;start<blue.length;start++)if(blue[start]){
   const region=[start];blue[start]=0;
   for(let cursor=0;cursor<region.length;cursor++){
    const index=region[cursor],x=index%atlas.width;
    for(const next of [x>0?index-1:-1,x<atlas.width-1?index+1:-1,index-atlas.width,index+atlas.width])
     if(next>=0&&next<blue.length&&blue[next]){blue[next]=0;region.push(next);}
   }
   if(region.length>96)for(const index of region){const i=index*4;pixels.data[i]=238;pixels.data[i+1]=241;pixels.data[i+2]=243;}
  }
  ctx.putImageData(pixels,0,0);
  const map=new THREE.CanvasTexture(atlas);map.flipY=original.flipY;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=maxAnisotropy;
  const paint=new THREE.MeshPhysicalMaterial({map,color:'#ffffff',roughness:.3,metalness:.08,clearcoat:.28,clearcoatRoughness:.23,side:THREE.DoubleSide});
  const red=new THREE.MeshPhysicalMaterial({color:'#c81024',roughness:.28,metalness:.05,clearcoat:.3,clearcoatRoughness:.2,side:THREE.DoubleSide});
  const buckets=Array.from({length:4},()=>({p:[] as number[],n:[] as number[],uv:[] as number[]}));
  for(let i=0;i<positions.count;i+=3){
   let x=0,y=0,z=0;let inFan=true;
   for(let j=0;j<3;j++){x+=positions.getX(i+j)/3;y+=positions.getY(i+j)/3;z+=positions.getZ(i+j)/3;const u=uv.getX(i+j),v=uv.getY(i+j);if(u<.81||u>.94||v<0||v>.145)inFan=false;}
   const fin=Math.abs(x)<.55&&y>1.65&&z< -10;
   const fan=inFan&&Math.abs(x)>3.5&&Math.abs(x)<8&&z>5&&y<0;
   if(z< -11&&Math.abs(x)>1.5&&y<1.5)continue;
   const bucket=buckets[fin?1:fan?(x<0?2:3):0];
   for(let j=0;j<3;j++){bucket.p.push(positions.getX(i+j),positions.getY(i+j),positions.getZ(i+j));bucket.n.push(normals.getX(i+j),normals.getY(i+j),normals.getZ(i+j));bucket.uv.push(uv.getX(i+j),uv.getY(i+j));}
  }
  if(buckets.some(bucket=>bucket.p.length===0))throw new Error('Incomplete airframe or fan geometry');
  const model=new THREE.Group();
  const meshes=buckets.map((bucket,index)=>{
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(bucket.p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(bucket.n,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(bucket.uv,2));
   if(index>1){geo.computeBoundingBox();const center=geo.boundingBox!.getCenter(new THREE.Vector3());geo.translate(-center.x,-center.y,-center.z);const rotor=new THREE.Group();rotor.position.copy(center);model.add(rotor);part(geo,paint,rotor);fans.push(rotor);return null;}
   return part(geo,index===1?red:paint,model);
  });
  model.updateMatrixWorld(true);
  function decal(target:THREE.Mesh,texture:THREE.Texture,position:THREE.Vector3,side:number,size:THREE.Vector3){
   const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.32,metalness:.02});
   const projected=new DecalGeometry(target,position,new THREE.Euler(0,side*Math.PI/2,0),size);
   const mesh=new THREE.Mesh(projected,material);mesh.renderOrder=2;model.add(mesh);
  }
  const lettering=document.createElement('canvas');lettering.width=1536;lettering.height=384;
  const letteringContext=lettering.getContext('2d')!;letteringContext.fillStyle='#c81024';letteringContext.font='600 260px Arial';letteringContext.textBaseline='middle';letteringContext.fillText('SWISS',25,202);
  const letteringMap=new THREE.CanvasTexture(lettering);letteringMap.colorSpace=THREE.SRGBColorSpace;letteringMap.anisotropy=maxAnisotropy;
  const flag=document.createElement('canvas');flag.width=flag.height=512;const flagContext=flag.getContext('2d')!;flagContext.fillStyle='#fff';flagContext.fillRect(110,215,292,82);flagContext.fillRect(215,110,82,292);
  const flagMap=new THREE.CanvasTexture(flag);flagMap.colorSpace=THREE.SRGBColorSpace;flagMap.anisotropy=maxAnisotropy;
  for(const side of [-1,1]){
   decal(meshes[0]!,letteringMap,new THREE.Vector3(side*1.75,.18,10.1),side,new THREE.Vector3(6.9,1.7,1.4));
   decal(meshes[1]!,flagMap,new THREE.Vector3(side*.15,4.6,-16.35),side,new THREE.Vector3(3.2,3.2,.55));
  }
  addTailplanes(model,new THREE.MeshPhysicalMaterial({color:'#e2e5e6',roughness:.35,metalness:.15,side:THREE.DoubleSide}),'a350');
  group.add(model);group.visible=true;state.loaded=true;
  geometry.dispose();if(expanded!==geometry)expanded.dispose();
 }).catch(error=>{state.error=true;console.warn('Aircraft model could not load.',error);});
 return {group,fans,gear,wheels,state,ready};
}
