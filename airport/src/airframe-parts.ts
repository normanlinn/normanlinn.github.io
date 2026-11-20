import * as THREE from 'three';
/** A closed, tapered airfoil. Lead is the forward (+Z) edge, thickness tapers with chord. */
export function airfoil(sections:Array<{x:number;y:number;lead:number;chord:number}>,side:number,thickness=.065){
 const vertices:number[]=[],indices:number[]=[];const count=40;
 for(const s of sections)for(let j=0;j<=count;j++){
  const angle=j/count*Math.PI*2,t=(1-Math.cos(angle))/2;
  const camber=.008*s.chord*Math.sin(Math.PI*t);
  const half=5*thickness*s.chord*(.2969*Math.sqrt(t)-.126*t-.3516*t*t+.2843*t*t*t-.1036*t*t*t*t);
  const profile=camber+(angle<=Math.PI?half:-half);
  vertices.push(side*s.x,s.y+profile,s.lead-t*s.chord);
 }
 for(let i=0;i<sections.length-1;i++)for(let j=0;j<count;j++){const a=i*(count+1)+j,b=a+count+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export function addTailplanes(group:THREE.Group,material:THREE.Material,type:'a350'|'777'){
 const is777=type==='777';
 for(const side of [-1,1]){
  const sections=is777?[
   {x:.85,y:.32,lead:-13.8,chord:4.35},{x:2.6,y:.48,lead:-14.85,chord:3.2},
   {x:5.1,y:.82,lead:-16.75,chord:1.65},{x:6.05,y:.98,lead:-17.6,chord:.75},{x:6.13,y:1,lead:-17.7,chord:.025}
  ]:[{x:.65,y:.18,lead:-12,chord:4.1},{x:2.5,y:.36,lead:-13.5,chord:3.25},{x:5.6,y:.7,lead:-15.8,chord:1.2},{x:5.75,y:.73,lead:-16.05,chord:.08}];
  const mesh=new THREE.Mesh(airfoil(sections,side,.065),material);
  mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  // The elevator follows the trailing edge instead of cutting diagonally across the stabilizer.
  const points=sections.slice(0,-1).map(s=>new THREE.Vector3(side*s.x,s.y+.017,s.lead-s.chord*.77));
  const seam=new THREE.BufferGeometry().setFromPoints(points);
  group.add(new THREE.Line(seam,new THREE.LineBasicMaterial({color:'#8d959a',transparent:true,opacity:.42})));

 }
}
