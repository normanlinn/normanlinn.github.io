import * as THREE from 'three';
type Palette={floor:THREE.Material;white:THREE.Material;ink:THREE.Material;steel:THREE.Material;red:THREE.Material;wood:THREE.Material;glass:THREE.Material;light:THREE.Material};
/** Dock E-inspired architecture, an original layout rather than a measured reconstruction. */
export function buildZurich(scene:THREE.Scene,m:Palette,coarse:boolean){
 let seed=3811;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const texture=(kind:'concrete'|'apron'|'rock')=>{const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;ctx.fillStyle=kind==='concrete'?'#babdbb':kind==='apron'?'#8d9394':'#aaa89d';ctx.fillRect(0,0,512,512);for(let i=0;i<26000;i++){const v=100+random()*140;ctx.fillStyle=`rgba(${v},${v},${v},${.03+random()*.14})`;ctx.fillRect(random()*512,random()*512,random()*2.4+.3,random()*1.6+.3);}if(kind==='concrete'){ctx.strokeStyle='#8d959233';for(let y=0;y<=512;y+=128){ctx.strokeRect(0,y,512,128);for(let x=40;x<512;x+=144){ctx.fillStyle='#7e888854';ctx.beginPath();ctx.arc(x,y+24,2,0,Math.PI*2);ctx.fill();}}}if(kind==='apron'){ctx.strokeStyle='#525d5d';ctx.lineWidth=1;ctx.strokeRect(0,0,512,512);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='apron'?22:4,kind==='apron'?18:2);return t;};
 const sky=document.createElement('canvas');sky.width=2048;sky.height=1024;const skyContext=sky.getContext('2d')!;
 const gradient=skyContext.createLinearGradient(0,0,0,1024);gradient.addColorStop(0,'#809eaf');gradient.addColorStop(.55,'#c7d7df');gradient.addColorStop(1,'#edf0e8');skyContext.fillStyle=gradient;skyContext.fillRect(0,0,2048,1024);
 for(let i=0;i<20;i++){const x=random()*2048,y=100+random()*380,r=50+random()*130;const cloud=skyContext.createRadialGradient(x,y,2,x,y,r);cloud.addColorStop(0,'#ffffff45');cloud.addColorStop(1,'#ffffff00');skyContext.fillStyle=cloud;skyContext.save();skyContext.translate(x,y);skyContext.scale(2.8,.35);skyContext.translate(-x,-y);skyContext.fillRect(x-r,y-r,r*2,r*2);skyContext.restore();}
 const skyMap=new THREE.CanvasTexture(sky);skyMap.colorSpace=THREE.SRGBColorSpace;scene.background=skyMap;
 const concreteMap=texture('concrete'),apronMap=texture('apron'),rock=texture('rock');rock.repeat.set(8,8);
 const concrete=new THREE.MeshStandardMaterial({map:concreteMap,color:'#e6e4df',roughness:.85,bumpMap:concreteMap,bumpScale:.025});
 const apron=new THREE.MeshStandardMaterial({map:apronMap,color:'#c1c3ba',roughness:.95,bumpMap:apronMap,bumpScale:.018});
 const structure=new THREE.MeshStandardMaterial({color:'#777f80',metalness:.75,roughness:.32});
 const yellow=new THREE.MeshStandardMaterial({color:'#edc84a',roughness:.6});
 function box(w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
 function panel(text:string,w:number,h:number,x:number,y:number,z:number,color='#f5d359',background='#20282d',sub=''){
  const c=document.createElement('canvas');c.width=1536;c.height=Math.round(1536*h/w);const ctx=c.getContext('2d')!;ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.font='500 100px Terminal,Arial';ctx.textBaseline='middle';ctx.fillText(text,65,c.height*(sub?.38:.5),1400);if(sub){ctx.fillStyle='#e8ebed';ctx.font='400 43px Terminal,Arial';ctx.fillText(sub,67,c.height*.77,1400);}const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;
 }
 box(48,.25,60,m.floor,0,-.14,-4);box(300,.2,175,apron,0,-.35,-115);
 // Concrete soffits frame a long central skylight; deep beams reveal the construction.
 for(const x of [-15,15])box(18,.4,60,concrete,x,9.35,-4);
 box(12,.1,60,m.glass,0,10.1,-4);
 for(let z=-30;z<=25;z+=6){box(48,.44,.4,structure,0,9,z);box(11.8,.1,.12,m.steel,0,10,z);for(const x of [-15,15]){box(15,.035,.12,m.light,x,9.11,z+1);box(15,.035,.12,m.light,x,9.11,z-1);}}
 for(let z=-27;z<=24;z+=10){for(const x of [-22.5,22.5]){box(.65,9,.65,concrete,x,4.4,z);box(.76,.08,.76,m.steel,x,.04,z);}}
 for(const x of [-24,24]){box(.08,8.8,60,m.glass,x,4.4,-4);for(let z=-31;z<=26;z+=4)box(.1,9,.14,structure,x,4.4,z);}
 box(48,8.8,.045,m.glass,0,4.4,-31);
 for(const x of [-24,24]){box(.14,9,.18,structure,x,4.4,-31);if(Math.abs(x)===24)box(.3,9,.3,concrete,x,4.4,-32);}
 box(48,.1,.16,structure,0,7,-31);
 // Swiss yellow-on-charcoal bilingual wayfinding suspended above the clear aisle.
 panel('E   Gates E42–67',10,1.7,0,6.8,-9,'#f6d54b','#20282d','Abflug / Departures     •     Projects');
 for(const x of [-4.4,4.4])box(.035,2,.035,m.steel,x,8.1,-9);
 panel('ZÜRICH',5,1.4,15,5.8,3,'#f1f1ea','#20282d','DOCK E / DEVELOPER TERMINAL');
 panel('Skymetro    ·    Airside Center',9,1.25,0,5.9,19,'#f4d24d','#20282d');
 // Clock dial and red second hand, tucked beside the gate signs.
 const dial=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.09,64),m.white);dial.rotation.x=Math.PI/2;dial.position.set(6.3,6.8,-8.95);scene.add(dial);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(.045,i%3===0?.15:.07,.025,m.ink,6.3+Math.sin(a)*.5,6.8+Math.cos(a)*.5,-8.88);tick.rotation.z=-a;}
 const clockHands=new THREE.Group();clockHands.userData.animated=true;clockHands.position.set(6.3,6.8,-8.86);scene.add(clockHands);const hand=new THREE.Mesh(new THREE.BoxGeometry(.025,.53,.03),m.red);hand.position.y=.2;clockHands.add(hand);
 const hour=box(.055,.32,.03,m.ink,6.23,6.87,-8.84);hour.rotation.z=.8;
 // Apron depth: stand markings, jet bridges, service vehicles, Dock E facade and tower.
 for(const x of [-48,-20,20,48]){box(.1,.025,24,yellow,x,-.21,-48);box(15,.025,.09,yellow,x,-.21,-59);panel('E '+(x<0?'46':'52'),3,.8,x,1,-36,'#f5d359');}
 for(const x of [-34,35]){
  box(4.2,2.5,18,concrete,x,3.2,-41);box(4.25,1.35,17,m.glass,x,3.55,-41);for(let z=-34;z>-50;z-=1.5)box(4.3,.09,.12,structure,x,4.55,z);box(3.9,2.4,2,m.ink,x,3.2,-50.5);for(const dx of [-1.4,1.4])box(.18,2.1,.18,structure,x+dx,1.1,-46);
 }
 box(130,9,10,concrete,-40,4.2,-119);box(129,4.4,.1,m.glass,-40,5.2,-113.9);
 for(let x=-101;x<=24;x+=5)box(.18,8,.15,structure,x,4.4,-113.7);
 box(8,25,8,concrete,65,12,-119);box(14,5,12,m.ink,65,27,-119);box(14.1,3,12.1,m.glass,65,27.3,-119);box(15,.25,13,m.white,65,30,-119);box(.15,8,.15,structure,65,34,-119);
 const tug=new THREE.Group();scene.add(tug);tug.userData.animated=true;const tugBody=new THREE.Mesh(new THREE.BoxGeometry(2,.8,1.2),m.white);tugBody.position.y=.55;tug.add(tugBody);const cab=new THREE.Mesh(new THREE.BoxGeometry(.9,.65,1),m.ink);cab.position.set(.35,1.25,0);tug.add(cab);for(const x of [-.65,.65])for(const z of [-.62,.62]){const tire=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.18,12),m.ink);tire.rotation.x=Math.PI/2;tire.position.set(x,.2,z);tug.add(tire);}tug.position.set(-20,0,-45);
 // Many layered ridgelines, with elevation-based snow, crags, and an evergreen foothill band.
 const mountainMaterial=new THREE.MeshStandardMaterial({vertexColors:true,map:rock,roughness:1,side:THREE.DoubleSide});
 for(let layer=0;layer<4;layer++){
  const positions:number[]=[],colors:number[]=[],uvs:number[]=[],indices:number[]=[];const cols=180,rows=28;
  const heights=Array.from({length:cols+1},(_,i)=>{const u=i/cols;return 11+layer*4+10*Math.pow(Math.sin(u*11+layer*.8),2)+7*Math.pow(Math.sin(u*23+layer),4)+Math.sin(i*.62)*1.1;});
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
   const t=row/rows;const height=heights[col]*Math.sin(t*Math.PI/2)+Math.sin(col*.57+row*.7)*t*1.5;
   positions.push(-165+col*330/cols,height-3,-145-layer*15-row*2.5);uvs.push(col/cols,row/rows);
   const snow=height>heights[col]*(.84+Math.sin(col*.31)*.035)&&height>23;const color=new THREE.Color(snow?'#f2f5f4':height>10?'#58686c':'#3e554c');color.lerp(new THREE.Color('#c6d5dc'),layer*.1);color.multiplyScalar(.83+random()*.22);colors.push(color.r,color.g,color.b);
  }
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();scene.add(new THREE.Mesh(geo,mountainMaterial));
 }
 const trees=new THREE.InstancedMesh(new THREE.ConeGeometry(.6,2.8,8),new THREE.MeshStandardMaterial({color:'#426257',roughness:1}),180);const matrix=new THREE.Matrix4();for(let i=0;i<180;i++){matrix.compose(new THREE.Vector3(-155+random()*310,random()*.8+1,-132-random()*18),new THREE.Quaternion(),new THREE.Vector3(.6+random(),.7+random(),.6+random()));trees.setMatrixAt(i,matrix);}scene.add(trees);
 return {update(time:number){clockHands.rotation.z=-time*Math.PI/30;tug.position.x=-25+Math.sin(time*.07)*11;},style:'zurich-dock-e'};
}
