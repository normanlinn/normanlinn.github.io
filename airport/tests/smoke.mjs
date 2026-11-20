import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.BASE_URL||'http://127.0.0.1:4180';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.context().grantPermissions(['clipboard-write'],{origin:base});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.terminalState?.ready);
 await page.waitForFunction(()=>window.terminalState.aircraft.loaded);
 assert.equal(await page.evaluate(()=>window.terminalState.aircraft.source),'amvlab-a350');
 assert.equal(await page.evaluate(()=>window.terminalState.aircraft.fanCount),2);
 assert.equal(await page.evaluate(()=>window.terminalState.aircraft.wheelCount),10);
 assert.equal(await page.evaluate(()=>window.terminalState.mode),'scroll');
 assert.equal(await page.evaluate(()=>window.terminalState.airport),'zurich-dock-e');
 assert.equal(await page.evaluate(()=>window.terminalState.fleet.b777),true);
 assert.ok(await page.locator('.brand-mark').evaluate(image=>image.complete&&image.naturalWidth>0));
 assert.equal(await page.locator('#joystick,#mouse-look,.crosshair').count(),0);
 const before=await page.evaluate(()=>window.terminalState.position);
 await page.keyboard.down('KeyW');await page.waitForTimeout(200);await page.keyboard.up('KeyW');
 assert.deepEqual(await page.evaluate(()=>window.terminalState.position),before);
 await page.mouse.wheel(0,900);
 await page.waitForFunction(()=>window.terminalState.chapter==='projects');
 for(const id of ['projects','about','skills','lounge']){
  await page.locator('header [data-travel="'+id+'"]').click();
  await page.waitForFunction(id=>window.terminalState.chapter===id,id);
  assert.ok(await page.locator('#'+id+' .station-card').isVisible());
  const bounds=await page.locator('#'+id+' .station-card').boundingBox();const header=await page.locator('.topbar').boundingBox();const footer=await page.locator('.bottom-bar').boundingBox();assert.ok(bounds.y>=header.y+header.height+10,'Card overlaps header');assert.ok(bounds.y+bounds.height<=footer.y-5,'Card overlaps footer');
 }
 for(const [id,url]of [['lax','https://employeeshuttlelax.com/'],['yay','https://yaykyawfair.vercel.app/'],['tea','https://burmantea.vercel.app/'],['calc','https://normanlinn.github.io/calculus-study-site/']]){
  await page.locator('#directory-open').click();await page.locator('#directory [data-directory="'+id+'"]').click();
  assert.ok(await page.locator('#detail a[href="'+url+'"]').count());await page.locator('#detail .dialog-close').click();
 }
 await page.locator('#lounge [data-directory="lounge"]').click();await page.locator('#copy-email').click();await page.waitForFunction(()=>document.querySelector('#copy-email').textContent==='Copied!');await page.locator('#detail .dialog-close').click();
 await page.locator('#watch-runway').click();
 await page.waitForFunction(()=>window.terminalState.chapter==='runway');
 await page.waitForFunction(()=>window.terminalState.cameraMode==='explore');
 const cameraBefore=await page.evaluate(()=>window.terminalState.position);await page.mouse.move(700,480);await page.mouse.down();await page.mouse.move(850,510,{steps:8});await page.mouse.up();await page.waitForTimeout(250);assert.notDeepEqual(await page.evaluate(()=>window.terminalState.position),cameraBefore,'Runway drag did not move the camera');
 await page.locator('#runway-camera-reset').click();await page.locator('#runway-camera').click();assert.equal(await page.evaluate(()=>window.terminalState.cameraMode),'journey');
 assert.equal(await page.locator('#runway-view').getAttribute('aria-pressed'),'true');await page.locator('#runway-view').click();await page.locator('#runway-view').click();
 await page.locator('#watch-landing').click();
 await page.waitForFunction(()=>window.terminalState.aircraft.phase==='landing'&&window.terminalState.aircraft.position.x< -50);
 const aircraftX=await page.evaluate(()=>window.terminalState.aircraft.position.x);
 await page.waitForFunction(x=>window.terminalState.aircraft.position.x>x+.5,aircraftX);
 assert.ok(await page.evaluate(()=>window.terminalState.aircraft.position.z< -39));
 await page.locator('#motion-toggle').click();
 const paused=await page.evaluate(()=>window.terminalState.aircraft.position.x);
 await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.terminalState.aircraft.position.x),paused);
 await page.locator('#runway-park').click();await page.locator('#watch-takeoff').click();
 await page.waitForFunction(()=>window.terminalState.aircraft.phase==='takeoff');await page.locator('#runway-park').click();
 await page.locator('[data-aircraft="b777"]').click();
 assert.equal(await page.evaluate(()=>window.terminalState.aircraft.type),'b777');
 assert.equal(await page.evaluate(()=>window.terminalState.aircraft.wheelCount),14);
 assert.equal(await page.locator('#aircraft-name').textContent(),'BOEING 777-300ER');
 await page.locator('#watch-takeoff').click();await page.waitForFunction(()=>window.terminalState.aircraft.phase==='takeoff');await page.locator('#runway-park').click();
 await page.locator('[data-aircraft="a350"]').click();assert.equal(await page.evaluate(()=>window.terminalState.aircraft.type),'a350');
 await page.locator('#home').click();await page.waitForFunction(()=>window.terminalState.chapter==='arrivals');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.wheel(0,500);await page.waitForTimeout(900);
 assert.ok(await page.evaluate(()=>window.terminalState.position.z<21));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:390,height:844});await page.locator('#home').click();await page.waitForFunction(()=>window.terminalState.chapter==='arrivals');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const card=await page.locator('#arrival .station-card').boundingBox();const footer=await page.locator('.bottom-bar').boundingBox();assert.ok(card.y+card.height<=footer.y+1,'Arrival card is covered by the footer');
 await page.locator('header [data-travel="lounge"]').click();await page.waitForFunction(()=>window.terminalState.chapter==='lounge');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);await page.close();
 const fallback=await browser.newPage();
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return original.call(this,type,...args);};});
 await fallback.goto(base,{waitUntil:'networkidle'});await fallback.locator('#fallback-directory').click();await fallback.locator('#directory [data-directory="about"]').click();await fallback.locator('#detail').waitFor({state:'visible'});
 console.log('Passed: scroll-led camera, no walking controls, six destinations, project links, email copy, flights, pause, mobile layout, and WebGL fallback.');
}finally{await browser.close();}
