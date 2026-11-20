import * as THREE from 'three';
/** A closed, tapered airfoil. Lead is the forward (+Z) edge, thickness tapers with chord. */
export function airfoil(sections:Array<{x:number;y:number;lead:number;chord:number}>,side:number,thickness=.065){
 const vertices:number[]=[],indices:number[]=[];const count=40;
 for(const s of sections)for(let j=0;j<=count;j++){
  const angle=j/count*Math.PI*2,t=(1-Math.cos(angle))/2;
  const profile=Math.sin(angle)*thickness*s.chord*.5;
  vertices.push(side*s.x,s.y+profile,s.lead-t*s.chord);
 }
 for(let i=0;i<sections.length-1;i++)for(let j=0;j<count;j++){const a=i*(count+1)+j,b=a+count+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export function addTailplanes(group:THREE.Group,material:THREE.Material,type:'a350'|'777'){
 const is777=type==='777';
 for(const side of [-1,1]){
  const mesh=new THREE.Mesh(airfoil([{x:.65,y:.18,lead:is777?-12.2:-12,chord:4.1},{x:2.5,y:.36,lead:-13.5,chord:3.25},{x:is777?6.2:5.6,y:.7,lead:is777?-16.6:-15.8,chord:1.2},{x:is777?6.35:5.75,y:.73,lead:is777?-16.85:-16.05,chord:.08}],side,.055),material);
  mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  const seam=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(side*1.1,.21,-15.2),new THREE.Vector3(side*5.3,.68,-16.8)]);
  group.add(new THREE.Line(seam,new THREE.LineBasicMaterial({color:'#8d959a',transparent:true,opacity:.5})));
 }
}
