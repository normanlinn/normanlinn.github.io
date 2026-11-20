import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildAirliner } from './aircraft';
import { terminalMaterials } from './materials';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { flightPose, AIRCRAFT_GROUND_Y, type FlightKind } from './flight';

function initTerminal(){

type StationId = 'lax'|'yay'|'tea'|'calc'|'about'|'skills'|'lounge';
type Project = {gate:string;name:string;kind:string;description:string;image:string;url:string;source?:string};
const projects:Record<string,Project>={
 lax:{gate:'A1',name:'LAXCommute',kind:'TypeScript / Web app',description:'Employee shuttle information for LAX, built from an everyday problem I knew firsthand.',image:'work-lax-desktop.jpg',url:'https://employeeshuttlelax.com/',source:'https://github.com/normanlinn/LAXCommute'},
 yay:{gate:'A2',name:'Yay Kyaw Nights',kind:'TypeScript / 3D experience',description:'A browser-based night fair inspired by Yangon. Explore the world, its rides, and its atmosphere.',image:'work-yaykyaw-desktop.jpg',url:'https://yaykyawfair.vercel.app/',source:'https://github.com/normanlinn/yaykyawfair'},
 tea:{gate:'A3',name:'Burman Tea',kind:'TypeScript / Shop website',description:'A website for a Burmese tea shop in Los Angeles, bringing familiar flavors to the web.',image:'work-tea-desktop.jpg',url:'https://burmantea.vercel.app/'},
 calc:{gate:'A4',name:'Derivatives Field Guide',kind:'TypeScript / Learning tool',description:'An interactive calculus study guide with worked examples, graphs, and practice questions.',image:'work-calc-desktop.jpg',url:'https://normanlinn.github.io/calculus-study-site/',source:'https://github.com/normanlinn/calculus-study-site'}
};
const $=<T extends HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const canvas=$<HTMLCanvasElement>('#terminal'),arrival=$('#arrival'),detail=$<HTMLDialogElement>('#detail'),directory=$<HTMLDialogElement>('#directory');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer:coarse)');
let ambience=!reduced.matches,initialized=false;

const scene=new THREE.Scene();scene.background=new THREE.Color('#dfe8ed');scene.fog=new THREE.Fog('#dfe7e9',85,210);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,250);camera.position.set(5,3.1,22);camera.lookAt(0,2.7,-20);camera.rotation.order='YXZ';
let renderer:THREE.WebGLRenderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,coarse.matches?1.4:1.75));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;}catch{$('#webgl-fallback').hidden=false;$('#scene-state').textContent='SCROLL TO EXPLORE';$('#watch-runway').addEventListener('click',()=>document.querySelector('#runway')?.scrollIntoView());$('#reset-view').addEventListener('click',()=>document.querySelector('#arrival')?.scrollIntoView());$('#motion-toggle').hidden=true;$('#fallback-close').addEventListener('click',()=>{$('#webgl-fallback').hidden=true;});document.querySelectorAll<HTMLButtonElement>('[data-travel]').forEach(button=>button.addEventListener('click',()=>document.querySelector<HTMLElement>('[data-stop="'+button.dataset.travel+'"]')?.scrollIntoView()));$('#enter').addEventListener('click',()=>document.querySelector('#projects')?.scrollIntoView());$('#view-projects').addEventListener('click',openDirectory);$('#directory-open').addEventListener('click',openDirectory);$('#fallback-directory').addEventListener('click',openDirectory);document.querySelectorAll<HTMLButtonElement>('[data-directory]').forEach(b=>b.addEventListener('click',()=>openStation(b.dataset.directory as StationId)));document.querySelectorAll<HTMLButtonElement>('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog')?.close()));return;}
const finish=terminalMaterials(renderer,scene);
const mats={
 floor:finish.floor,white:finish.white,ink:finish.leather,steel:finish.steel,red:new THREE.MeshStandardMaterial({color:'#cf0d1b',roughness:.45}),wood:finish.wood,glass:new THREE.MeshPhysicalMaterial({color:'#cbdde1',metalness:.3,roughness:.09,transparent:true,opacity:.09,depthWrite:false}),green:new THREE.MeshStandardMaterial({color:'#526b4f',roughness:.9}),rubber:new THREE.MeshStandardMaterial({color:'#343a40',roughness:.85}),light:new THREE.MeshStandardMaterial({color:'#fff9e9',emissive:'#fff1d7',emissiveIntensity:1.2})
};
const boxes=new Map<string,THREE.BoxGeometry>();
function box(w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene){const key=[w,h,d].join('/');let geo=boxes.get(key);if(!geo){geo=new THREE.BoxGeometry(w,h,d);boxes.set(key,geo);}const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function roundBox(w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene,radius=.1){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(radius,Math.min(w,h,d)/3)),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function cylinder(r:number,h:number,mat:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function beam(a:THREE.Vector3,b:THREE.Vector3,r:number,mat= mats.steel,parent:THREE.Object3D=scene){const mesh=cylinder(r,a.distanceTo(b),mat,0,0,0,parent);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return mesh;}
function label(text:string,width:number,height:number,options:{background?:string;color?:string;size?:number;align?:CanvasTextAlign;sub?:string}={}){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*height/width);const ctx=c.getContext('2d')!;ctx.fillStyle=options.background||'#252a2e';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=options.color||'#ffffff';ctx.font='600 '+(options.size||62)+'px Terminal, Arial';ctx.textAlign=options.align||'center';ctx.textBaseline='middle';ctx.fillText(text,options.align==='left'?55:c.width/2,options.sub?c.height*.37:c.height/2,c.width-90);if(options.sub){ctx.font='400 30px Terminal,Arial';ctx.fillStyle='#c7cdd2';ctx.fillText(options.sub,c.width/2,c.height*.74,c.width-80);}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();const mat=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});return new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);}
function sign(text:string,x:number,y:number,z:number,width=6,height=1.15,sub?:string){const group=new THREE.Group();group.position.set(x,y,z);box(width+.16,height+.16,.16,mats.ink,0,0,0,group);const face=label(text,width,height,{sub});face.position.z=.091;group.add(face);scene.add(group);return group;}
const colliders:Array<{x:number;z:number;w:number;d:number}>=[];
function obstacle(x:number,z:number,w:number,d:number){colliders.push({x,z,w,d});}
const hemi=new THREE.HemisphereLight('#f2f7ff','#b6b2a5',1.35);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff5e7',3.1);sun.position.set(16,26,-36);sun.castShadow=true;sun.shadow.mapSize.set(coarse.matches?1024:2048,coarse.matches?1024:2048);Object.assign(sun.shadow.camera,{left:-36,right:36,top:35,bottom:-35,near:1,far:100});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;scene.add(sun);
const fill=new THREE.DirectionalLight('#e2edff',.8);fill.position.set(-15,15,18);scene.add(fill);

// Terminal shell: an open central aisle, structural ribs, glass and an apron.
box(48,.25,60,mats.floor,0,-.14,-4);
box(150,.2,100,new THREE.MeshStandardMaterial({color:'#bfc8cc',roughness:.92}),0,-.35,-78);
// A low-opacity planar reflection adds depth on larger screens; phones use the PBR finish alone.
if(!coarse.matches&&innerWidth>=1000){
 const reflection=new Reflector(new THREE.PlaneGeometry(48,60),{color:0xd6d9d5,textureWidth:768,textureHeight:768,clipBias:.003,multisample:0});
 reflection.rotation.x=-Math.PI/2;reflection.position.set(0,.006,-4);const reflectedMaterial=reflection.material as THREE.ShaderMaterial;reflectedMaterial.fragmentShader=reflectedMaterial.fragmentShader.replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), 0.13');reflectedMaterial.transparent=true;reflectedMaterial.depthWrite=false;reflection.userData.animated=true;scene.add(reflection);
}

box(.4,10,60,mats.white,-24,5,-4);box(.4,10,60,mats.white,24,5,-4);
box(48,8,.08,mats.glass,0,4.2,-31);
for(let x=-24;x<=24;x+=6){box(.22,9,.25,mats.steel,x,4.5,-31);beam(new THREE.Vector3(x,8,-31),new THREE.Vector3(x,11,-13),.1);beam(new THREE.Vector3(x,11,-13),new THREE.Vector3(x,9,18),.1);}
for(let z=-30;z<=20;z+=8){beam(new THREE.Vector3(-24,9,z),new THREE.Vector3(24,9,z),.14);box(44,.12,.1,mats.light,0,8.84,z+.3);}
for(let x=-22;x<22;x+=.5)box(.16,.18,17,mats.wood,x,9.15,10);
for(let x=-23;x<=23;x+=8){box(.25,8,.25,mats.steel,x,4,-3);box(.2,8,.2,mats.steel,x,4,19);}
// Red wayfinding line physically belongs to the floor.
const routeCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(3,.02,23),new THREE.Vector3(0,.02,13),new THREE.Vector3(0,.02,4),new THREE.Vector3(0,.02,-6),new THREE.Vector3(-3,.02,-13)]);
const floorRoute=new THREE.Mesh(new THREE.TubeGeometry(routeCurve,90,.085,5,false),mats.red);scene.add(floorRoute);
const routePulse=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),new THREE.MeshBasicMaterial({color:'#ef4b50'}));routePulse.userData.animated=true;scene.add(routePulse);
// The jet stays entirely outside the terminal glass, above the apron/runway.
const airliner=buildAirliner(renderer.capabilities.getMaxAnisotropy());
for(const id of ['#watch-landing','#watch-takeoff','#runway-park'])$<HTMLButtonElement>(id).disabled=true;
airliner.ready.then(()=>{for(const id of ['#watch-landing','#watch-takeoff','#runway-park'])$<HTMLButtonElement>(id).disabled=!airliner.state.loaded;if(airliner.state.error)$('#runway-status').textContent='AIRCRAFT UNAVAILABLE';});
const plane=airliner.group;plane.position.set(4,AIRCRAFT_GROUND_Y,-62);plane.rotation.y=Math.PI/2;scene.add(plane);
const runwayMaterial=new THREE.MeshStandardMaterial({color:'#78858b',roughness:.9});box(260,.02,8,runwayMaterial,0,-.23,-67);
for(let x=-125;x<125;x+=9)box(4,.025,.16,mats.white,x,-.21,-67);
for(let x=-125;x<125;x+=5){box(.2,.03,.2,mats.light,x,-.2,-71.1);box(.2,.03,.2,mats.light,x,-.2,-62.9);}
let flight:{kind:FlightKind;time:number;manual:boolean}|null=null;
function playFlight(kind:FlightKind,manual=true){setClearWindowView(true);flight={kind,time:0,manual};plane.visible=true;ambience=true;syncAmbience();$('#runway-status').textContent=kind==='landing'?'INBOUND / APPROACH':'OUTBOUND / TAKEOFF';}
function setClearWindowView(clear:boolean){document.body.classList.toggle('clear-window-view',clear);const panel=document.querySelector<HTMLElement>('#runway .station-card')!;panel.inert=clear;panel.setAttribute('aria-hidden',String(clear));$('#runway-view').textContent=clear?'Show story panel':'Clear window view';$('#runway-view').setAttribute('aria-pressed',String(clear));}
$('#runway-view').addEventListener('click',()=>setClearWindowView(!document.body.classList.contains('clear-window-view')));
$('#watch-runway').addEventListener('click',()=>travel('runway'));
$('#watch-landing').addEventListener('click',()=>playFlight('landing'));
$('#watch-takeoff').addEventListener('click',()=>playFlight('takeoff'));
$('#runway-park').addEventListener('click',()=>{flight=null;plane.visible=true;plane.position.set(4,AIRCRAFT_GROUND_Y,-62);plane.rotation.set(0,Math.PI/2,0);airliner.gear.position.y=0;airliner.gear.visible=true;$('#runway-status').textContent='ON STAND';});
// Silhouettes beyond the apron suggest an alpine horizon.
for(let i=0;i<14;i++){const mountain=new THREE.Mesh(new THREE.ConeGeometry(10+i%4,8+i%5,4),new THREE.MeshStandardMaterial({color:i%2?'#a2b8c2':'#b4c7ce',roughness:1}));mountain.position.set(-95+i*15,1,-113-(i%3)*8);mountain.rotation.y=.6+i*.8;scene.add(mountain);}

// Seating, plants, and a moving baggage carousel.
function chair(x:number,z:number,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;roundBox(1.3,.16,1.05,mats.ink,0,.65,0,g);const back=roundBox(1.3,1.05,.18,mats.ink,0,1.2,-.45,g);back.rotation.x=-.08;for(const side of [-.48,.48]){box(.07,.65,.07,mats.steel,side,.32,0,g);box(.08,.07,.85,mats.steel,side,.94,.05,g);}scene.add(g);}
for(const z of [-25,-28])for(const x of [-19,-17.5,-16,-10,-8.5,-7,7,8.5,10,16,17.5,19])chair(x,z);
function plant(x:number,z:number){cylinder(.55,.8,mats.white,x,.4,z);for(let i=0;i<7;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),mats.green);leaf.scale.set(.5,1.7,.4);leaf.position.set(x+Math.sin(i*2)*.35,1.1+(i%3)*.18,z+Math.cos(i*2)*.3);leaf.rotation.z=Math.sin(i)*.6;scene.add(leaf);}obstacle(x,z,1.1,1.1);}
for(const [x,z]of [[-21,-13],[21,-13],[-21,7],[21,13],[-5,-25],[5,-25]])plant(x,z);
const carouselShape=new THREE.Shape();carouselShape.absellipse(0,0,4.8,2.7,0,Math.PI*2,false,0);const hole=new THREE.Path();hole.absellipse(0,0,3.5,1.5,0,Math.PI*2,true,0);carouselShape.holes.push(hole);
const carousel=new THREE.Mesh(new THREE.ExtrudeGeometry(carouselShape,{depth:.65,bevelEnabled:true,bevelThickness:.1,bevelSize:.1,bevelSegments:2}),mats.steel);carousel.rotation.x=-Math.PI/2;carousel.position.set(-12,.05,11);scene.add(carousel);obstacle(-12,11,10,6);
const bags:THREE.Group[]=[];for(let i=0;i<7;i++){const bag=new THREE.Group();bag.userData.animated=true;roundBox(.7,.85,.45,i%3===0?mats.red:i%3===1?mats.ink:mats.wood,0,.45,0,bag,.08);box(.3,.05,.05,mats.ink,0,.95,0,bag);for(const x of [-.24,.24])cylinder(.07,.08,mats.ink,x,.04,0,bag);scene.add(bag);bags.push(bag);}
sign('BAGGAGE / IDEAS IN TRANSIT',-12,4,11,7,.8);
// Security doors move when the visitor approaches; the aisle remains clear.
const security=new THREE.Group();security.position.set(0,0,9);scene.add(security);for(const x of [-2.2,2.2])box(.4,3.2,.8,mats.white,x,1.6,0,security);box(4.8,.45,.8,mats.white,0,3.2,0,security);const doors=[box(1.95,1.7,.05,mats.glass,-1.05,.9,0,security),box(1.95,1.7,.05,mats.glass,1.05,.9,0,security)];doors.forEach(door=>door.userData.animated=true);sign('WELCOME / YOUR NEXT CHAPTER',0,4.4,9,6,.85);

const interactive:THREE.Object3D[]=[];const targets=new Map<StationId,THREE.Vector3>();
function target(id:StationId,obj:THREE.Object3D,pos:THREE.Vector3){obj.traverse(child=>{child.userData.station=id;});interactive.push(obj);targets.set(id,pos);}
const textureLoader=new THREE.TextureLoader();
function kiosk(id:string,x:number){const p=projects[id];const group=new THREE.Group();group.position.set(x,0,-18);scene.add(group);box(3,.25,1.5,mats.steel,0,.12,0,group);box(.6,1.3,.5,mats.steel,0,.85,0,group);roundBox(3.8,2.6,.22,mats.ink,0,2.5,0,group,.08);const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.5,2.18),new THREE.MeshBasicMaterial({color:'#f0f2f4'}));screen.position.set(0,2.55,.12);group.add(screen);textureLoader.load('assets/'+p.image,texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();(screen.material as THREE.MeshBasicMaterial).map=texture;(screen.material as THREE.MeshBasicMaterial).color.set('#ffffff');(screen.material as THREE.MeshBasicMaterial).needsUpdate=true;});const gate=sign(p.name,x,4.8,-18,6.1,1.05);for(const side of [-2.5,2.5])beam(new THREE.Vector3(x+side,0,-18.2),new THREE.Vector3(x+side,4.7,-18.2),.055);const badge=label(p.gate,1.2,.7,{background:'#cf0d1b',size:170});badge.position.set(x-2.3,4.8,-17.89);scene.add(badge);target(id as StationId,group,new THREE.Vector3(x,2.3,-18));gate.traverse(child=>{child.userData.station=id;});interactive.push(gate);obstacle(x,-18,4,1.7);}
['lax','yay','tea','calc'].forEach((id,i)=>kiosk(id,-15+i*10));
// Departures board: project names rendered onto actual scene signage.
const board=sign('PROJECT DEPARTURES',-16,4,-5,8,1.05);const boardGroup=new THREE.Group();boardGroup.position.set(-16,2.35,-5);scene.add(boardGroup);box(8.15,2.5,.2,mats.ink,0,0,0,boardGroup);
Object.entries(projects).forEach(([id,p],i)=>{const row=label(p.gate+'   '+p.name,7.8,.48,{background:i===0?'#b80f1a':'#252a2e',size:47,align:'left'});row.position.set(0,.84-i*.56,.12);row.userData.station=id;boardGroup.add(row);interactive.push(row);});for(const x of [-19,-13])box(.12,2.3,.12,mats.steel,x,1.15,-5);obstacle(-16,-5,8,1);
// Developer workstation, with laptop and a small geometric avatar.
const desk=new THREE.Group();desk.position.set(14,0,8);scene.add(desk);roundBox(6,1.25,2.3,mats.white,0,.65,0,desk,.16);roundBox(6.2,.12,2.5,mats.wood,0,1.32,0,desk,.035);const laptop=box(1.4,.9,.06,mats.steel,-.3,1.87,-.15,desk);laptop.rotation.x=-.12;box(1.5,.05,.95,mats.steel,-.3,1.42,.35,desk);const code=label('HELLO, WORLD.',1.28,.72,{background:'#1d242b',color:'#bde1cf',size:91,sub:'TYPE  /  BUILD  /  LEARN'});code.position.set(-.3,1.88,-.105);desk.add(code);const deskLabel=label('DEVELOPER DESK',5,.75,{background:'#252a2e',size:78,sub:'TOOLS / CURIOSITY / CRAFT'});deskLabel.position.set(0,.8,1.17);desk.add(deskLabel);target('skills',desk,new THREE.Vector3(14,1.8,8));obstacle(14,8,6,2.5);chair(14,5.5,Math.PI);
const avatar=new THREE.Group();avatar.position.set(14,0,5.5);scene.add(avatar);box(.85,1.2,.45,mats.ink,0,1.32,0,avatar);const skin=new THREE.MeshStandardMaterial({color:'#bc957b',roughness:.85});const head=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),skin);head.position.set(0,2.18,0);avatar.add(head);const hair=new THREE.Mesh(new THREE.SphereGeometry(.35,16,12,0,Math.PI*2,0,Math.PI/2),mats.ink);hair.position.set(0,2.23,0);avatar.add(hair);for(const side of [-1,1]){box(.25,.18,.06,mats.ink,side*.16,2.2,.29,avatar);beam(new THREE.Vector3(side*.45,1.8,0),new THREE.Vector3(side*.42,1.35,.55),.13,mats.ink,avatar);box(.3,.65,.35,mats.ink,side*.25,.45,.15,avatar);const ear=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),mats.rubber);ear.position.set(side*.36,2.15,0);avatar.add(ear);}beam(new THREE.Vector3(-.35,2.3,0),new THREE.Vector3(.35,2.3,0),.055,mats.rubber,avatar);
// Personal story station and first-class lounge.
const about=sign('RGN  →  ZRH  →  LAX',-15,2.6,2,7,2.5,'FROM AVIATION TO SOFTWARE');target('about',about,new THREE.Vector3(-15,2.5,2));for(const x of [-17.5,-12.5])box(.12,1.6,.12,mats.steel,x,.8,2);obstacle(-15,2,7,.6);
const lounge=new THREE.Group();lounge.position.set(16,0,-5);scene.add(lounge);box(11,.07,10,new THREE.MeshStandardMaterial({color:'#ccc3b7',roughness:1}),0,.03,0,lounge);for(const x of [-4,-2,2,4]){box(.9,.5,1.4,mats.ink,x,.45,-1,lounge);box(.9,.8,.2,mats.ink,x,.9,-1.55,lounge);}box(3,.15,1.6,mats.wood,0,.6,-.5,lounge);for(const x of [-4.5,4.5])box(.15,5,.15,mats.wood,x,2.5,-4.8,lounge);const loungeSign=sign('FIRST CLASS LOUNGE',16,4.8,-8,10,1.15,'HON CIRCLE MEMBER / LET’S CONNECT');target('lounge',loungeSign,new THREE.Vector3(16,2.2,-5));const loungeDesk=roundBox(4,1.3,1.5,mats.wood,15,.65,-2,scene,.12);target('lounge',loungeDesk,new THREE.Vector3(16,2,-3));const pass=label('ZLN / FIRST CLASS',3.4,.9,{background:'#252a2e',size:75,sub:'YOUR NEXT PROJECT STARTS HERE'});pass.position.set(15,1.9,-1.2);scene.add(pass);target('lounge',pass,new THREE.Vector3(15,1.9,-1.2));obstacle(15,-2,4,1.6);

// Merge static surfaces by material; interactive screens and moving parts stay separate.
scene.updateMatrixWorld(true);
const staticGroups=new Map<THREE.Material,THREE.Mesh[]>();
scene.traverse(object=>{if(!(object instanceof THREE.Mesh)||Array.isArray(object.material)||object.material.transparent||object.material instanceof THREE.MeshBasicMaterial)return;let node:THREE.Object3D|null=object;while(node){if(node.userData.station||node.userData.animated)return;node=node.parent;}const list=staticGroups.get(object.material)||[];list.push(object);staticGroups.set(object.material,list);});
for(const [material,meshes]of staticGroups){if(meshes.length<2)continue;const geometries=meshes.map(mesh=>{const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geometry.applyMatrix4(mesh.matrixWorld);return geometry;});const merged=mergeGeometries(geometries,false);if(merged){const batch=new THREE.Mesh(merged,material);batch.castShadow=true;batch.receiveShadow=true;scene.add(batch);meshes.forEach(mesh=>mesh.removeFromParent());}geometries.forEach(g=>g.dispose());}


const stops=[
 {id:'arrivals',label:'ARRIVALS',position:new THREE.Vector3(5,3.1,22),look:new THREE.Vector3(0,2.7,-20)},
 {id:'projects',label:'PROJECT GATES',position:new THREE.Vector3(0,2.25,-9),look:new THREE.Vector3(0,2.8,-18)},
 {id:'about',label:'MY STORY',position:new THREE.Vector3(-9,2.05,5),look:new THREE.Vector3(-15,2.3,2)},
 {id:'skills',label:'DEVELOPER DESK',position:new THREE.Vector3(10,2.35,12),look:new THREE.Vector3(14,1.8,8)},
 {id:'lounge',label:'FIRST CLASS LOUNGE',position:new THREE.Vector3(9,2.25,0),look:new THREE.Vector3(16,2.6,-5)},
 {id:'runway',label:'RUNWAY OBSERVATION',position:new THREE.Vector3(3,2.1,-26.5),look:new THREE.Vector3(4,4,-62)}
].map(stop=>({...stop,element:document.querySelector<HTMLElement>('[data-stop="'+stop.id+'"]')!,offset:0}));
const finalApproach=new THREE.CatmullRomCurve3([stops[4].position,new THREE.Vector3(0,2.6,-9),new THREE.Vector3(0,2.4,-22),stops[5].position]);
let desiredY=scrollY,chapter=0,lastChapter=-1,lastTime=performance.now(),elapsed=0,hudAt=0;
const targetPosition=new THREE.Vector3(),targetLook=new THREE.Vector3(),poseCamera=new THREE.PerspectiveCamera();
function measure(){stops.forEach(stop=>stop.offset=stop.element.getBoundingClientRect().top+scrollY);desiredY=scrollY;}
window.addEventListener('scroll',()=>{desiredY=scrollY;},{passive:true});
window.addEventListener('resize',()=>{measure();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,coarse.matches?1.4:1.75));});
new ResizeObserver(measure).observe(document.querySelector('#journey')!);
function travel(id:string){const stop=stops.find(s=>s.id===id);if(!stop)return;stop.element.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
function modalOpen(){return detail.open||directory.open;}
function openDirectory(){if(!directory.open)directory.showModal();}
$('#directory-open').addEventListener('click',openDirectory);
$('#fallback-directory').addEventListener('click',openDirectory);
$('#fallback-close').addEventListener('click',()=>{$('#webgl-fallback').hidden=true;});
$('#home').addEventListener('click',e=>{e.preventDefault();travel('arrivals');});
$('#enter').addEventListener('click',()=>travel('projects'));
$('#view-projects').addEventListener('click',openDirectory);
$('#reset-view').addEventListener('click',()=>travel('arrivals'));
document.querySelectorAll<HTMLButtonElement>('[data-travel]').forEach(b=>b.addEventListener('click',()=>travel(b.dataset.travel!)));
$('#motion-toggle').addEventListener('click',()=>{ambience=!ambience;syncAmbience();});
function syncAmbience(){$('#motion-toggle').textContent=ambience?'Pause ambience':'Play ambience';$('#motion-toggle').setAttribute('aria-pressed',String(!ambience));}
reduced.addEventListener('change',()=>{ambience=!reduced.matches;syncAmbience();});
syncAmbience();
function openStation(id:StationId){if(directory.open)directory.close();const container=$('#detail-content');const p=projects[id];
 if(p){container.innerHTML='<span class="gate-tag">GATE '+p.gate+'</span><h2>'+p.name+'</h2><p class="panel-kind">'+p.kind+'</p><p>'+p.description+'</p><img class="project-preview" width="1440" height="900" src="assets/'+p.image+'" alt="'+p.name+' desktop preview"><div class="panel-links"><a class="button primary" href="'+p.url+'" target="_blank" rel="noopener noreferrer">Visit live site <span>↗</span></a>'+(p.source?'<a class="button secondary" href="'+p.source+'" target="_blank" rel="noopener noreferrer">View source</a>':'')+'</div>';}
 else if(id==='about'){container.innerHTML='<span class="gate-tag subtle">DEVELOPER PASS</span><div class="about-panel"><img src="assets/zaw-id-upright.webp" alt="Zaw Lin Naing"><div><h2>Hi, I’m Zaw Lin.</h2><p>A software developer based in Los Angeles, studying at El Camino College. Before writing code, I worked in aviation customer service at LAX. That experience led to LAXCommute, my first app.</p><p>I enjoy turning complex problems into simple, enjoyable experiences, with readable code and thoughtful interfaces.</p><div class="panel-links"><a class="button primary" href="assets/zaw-lin-naing-resume.pdf" target="_blank" rel="noopener">Read my résumé</a><a class="button secondary" href="https://github.com/normanlinn" target="_blank" rel="noopener noreferrer">GitHub</a></div></div></div>';}
 else if(id==='skills'){container.innerHTML='<span class="gate-tag subtle">DEVELOPER DESK</span><h2>Tools for the next idea.</h2><p>From a first sketch to a working product. These are some of the tools I use to build for the web.</p><div class="skills-list">'+['TypeScript','JavaScript','React','Next.js','Three.js','HTML & CSS','Framer Motion','Supabase','Cloudflare Workers','Git & GitHub','Figma','Accessibility'].map(s=>'<span>'+s+'</span>').join('')+'</div><p>Explore the project gates to see these tools in context.</p>';}
 else {container.innerHTML='<span class="gate-tag dark">FIRST CLASS LOUNGE</span><h2>Your next project starts here.</h2><p>I’m open to remote or part-time web development work. Have something in mind? Let’s talk.</p><div class="boarding-pass"><div class="pass-main"><div class="pass-class">+ FIRST CLASS</div><div class="pass-name">ZAW LIN NAING</div><div class="pass-route">RGN — ZRH — LAX</div><div class="pass-cities">Yangon / Zurich / Los Angeles</div><div class="pass-fields"><span>GATE<b>DEV</b></span><span>SEAT<b>01A</b></span><span>DESTINATION<b>SOFTWARE</b></span></div><a class="button primary" href="mailto:mrzawlinnaing1001@gmail.com">Let’s work together</a></div><div class="pass-stub"><strong>HON<br>CIRCLE</strong><span>MEMBER</span><div class="stub-stripes"><i></i><i></i><i></i></div></div></div><div class="copy-row"><a href="mailto:mrzawlinnaing1001@gmail.com">mrzawlinnaing1001@gmail.com</a><button id="copy-email">Copy email</button></div><p class="copy-status" id="copy-status" role="status"></p><div class="lounge-links"><a href="https://www.linkedin.com/in/zawlinnaing" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/normanlinn" target="_blank" rel="noopener noreferrer">GitHub</a><a href="assets/zaw-lin-naing-resume.pdf" target="_blank" rel="noopener">Résumé</a></div>';$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('mrzawlinnaing1001@gmail.com');$('#copy-email').textContent='Copied!';$('#copy-status').textContent='Email address copied. Ready when you are.';}catch{$('#copy-status').textContent='Select the email address, or click it to open your email app.';}});}
 if(!detail.open)detail.showModal();
}

document.querySelectorAll<HTMLButtonElement>('[data-directory]').forEach(b=>b.addEventListener('click',()=>openStation(b.dataset.directory as StationId)));
document.querySelectorAll<HTMLButtonElement>('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog')?.close()));
[detail,directory].forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
canvas.addEventListener('click',event=>{if(modalOpen())return;pointer.set(event.clientX/innerWidth*2-1,-event.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(interactive,true).find(h=>h.distance<28);if(hit?.object.userData.station)openStation(hit.object.userData.station as StationId);});
const cardObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;cardObserver.unobserve(entry.target);if(!reduced.matches)entry.target.animate([{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],{duration:800,easing:'cubic-bezier(.22,1,.36,1)'});}),{threshold:.25});
document.querySelectorAll('.station-card').forEach(card=>cardObserver.observe(card));
function render(time:number){requestAnimationFrame(render);if(document.hidden){lastTime=time;return;}const dt=Math.min(.05,(time-lastTime)/1000);lastTime=time;if(ambience&&!reduced.matches)elapsed+=dt;
 let segment=0;while(segment<stops.length-2&&desiredY>=stops[segment+1].offset)segment++;
 const a=stops[segment],b=stops[segment+1];const fraction=THREE.MathUtils.clamp((desiredY-a.offset)/Math.max(1,b.offset-a.offset),0,1);const eased=fraction*fraction*(3-2*fraction);
 chapter=fraction>.5?segment+1:segment;
 if(reduced.matches){targetPosition.copy(stops[chapter].position);targetLook.copy(stops[chapter].look);}else{if(segment===4)targetPosition.copy(finalApproach.getPointAt(eased));else targetPosition.lerpVectors(a.position,b.position,eased);targetLook.lerpVectors(a.look,b.look,eased);}
 const damping=reduced.matches?1:1-Math.exp(-dt*10);
 camera.position.lerp(targetPosition,damping);poseCamera.position.copy(targetPosition);poseCamera.lookAt(targetLook);camera.quaternion.slerp(poseCamera.quaternion,damping);
 if(chapter!==lastChapter){lastChapter=chapter;$('#location').textContent='ZRH · '+stops[chapter].label;$('#journey-count').textContent=String(chapter+1).padStart(2,'0')+' / 06';$('#journey-destination').textContent=stops[chapter].label;$('#runway-controls').hidden=chapter!==5;document.querySelectorAll<HTMLButtonElement>('header [data-travel]').forEach(button=>{const active=button.dataset.travel===stops[chapter].id;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});}
 const max=document.documentElement.scrollHeight-innerHeight;$('#journey-progress-fill').style.transform='scaleX('+Math.min(1,scrollY/Math.max(1,max))+')';
 if(flight&&ambience&&(!reduced.matches||flight.manual)){flight.time+=dt;const pose=flightPose(flight.kind,flight.time);plane.position.set(pose.x,pose.y,pose.z);plane.rotation.set(-pose.pitch,Math.PI/2,0);airliner.gear.position.y=(1-pose.gear)*1.65;airliner.gear.visible=pose.gear>.04;airliner.fans.forEach(fan=>fan.rotation.z+=dt*32);airliner.wheels.forEach(wheel=>wheel.rotation.x+=dt*9);$('#runway-status').textContent=pose.phase;if(pose.done){if(flight.kind==='takeoff'){plane.visible=false;$('#runway-status').textContent='AIRBORNE';}else $('#runway-status').textContent='LANDED / ROLLOUT COMPLETE';flight=null;}}else if(ambience&&!reduced.matches){airliner.fans.forEach(fan=>fan.rotation.z+=dt*4);}
 routePulse.position.copy(routeCurve.getPointAt((elapsed*.045)%1));routePulse.visible=ambience&&!reduced.matches;
 bags.forEach((bag,i)=>{const angle=elapsed*.13+i*Math.PI*2/bags.length;bag.position.set(-12+Math.cos(angle)*4.1,.78,11+Math.sin(angle)*2.1);bag.rotation.y=-angle;});
 const doorOpen=Math.abs(camera.position.x)<5&&Math.abs(camera.position.z-9)<7;doors[0].position.x=THREE.MathUtils.damp(doors[0].position.x,doorOpen?-3.1:-1.05,reduced.matches?100:5,dt);doors[1].position.x=-doors[0].position.x;
 if(time-hudAt>150){hudAt=time;$('#scene-state').textContent=chapter===0?'SCROLL TO EXPLORE':'YOUR JOURNEY / '+String(chapter+1).padStart(2,'0');$('#coordinates').textContent=chapter===5?'THANKS FOR FLYING BY':'SCROLL TO CONTINUE ↓';}
 renderer.render(scene,camera);
}
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();$('#webgl-fallback').hidden=false;});
measure();if(location.hash==='#work')travel('projects');if(location.hash==='#contact')travel('lounge');initialized=true;$('#scene-state').textContent='SCROLL TO EXPLORE';requestAnimationFrame(render);
Object.defineProperty(window,'terminalState',{get:()=>({mode:'scroll',chapter:stops[chapter].id,scrollY,position:{x:camera.position.x,y:camera.position.y,z:camera.position.z},ambience,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,ready:initialized,aircraft:{position:{x:plane.position.x,y:plane.position.y,z:plane.position.z},phase:flight?.kind||'stand',visible:plane.visible,loaded:airliner.state.loaded,fanCount:airliner.fans.length,wheelCount:airliner.wheels.length,source:airliner.state.source,error:airliner.state.error}})});


}
document.fonts.ready.then(initTerminal);
