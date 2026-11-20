(() => {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const nav=document.querySelector('header nav');if(!nav)return;
const links=[...nav.querySelectorAll('a')], indicator=document.createElement('span');
indicator.className='nav-motion-indicator';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);nav.classList.add('has-motion-indicator');
let movement,frame;
function update(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
const active=nav.querySelector('a.nav-active')||links[0];
links.forEach(link=>{if(link===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
const current=getComputedStyle(indicator);
const from={transform:current.transform,width:current.width,height:current.height};
const target={transform:'translate('+active.offsetLeft+'px,'+active.offsetTop+'px)',width:active.offsetWidth+'px',height:active.offsetHeight+'px'};
if(movement)movement.cancel();Object.assign(indicator.style,target);
if(!reduced.matches&&indicator.dataset.ready)movement=indicator.animate([from,target],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});
indicator.dataset.ready='true';
});}
new MutationObserver(update).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
const resize=new ResizeObserver(update);resize.observe(nav);
links.forEach(link=>{resize.observe(link);link.addEventListener('click',()=>{if(!reduced.matches)link.animate([{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:350,easing:'ease-out'});update();});});
document.fonts.ready.then(update);
reduced.addEventListener('change',()=>{if(movement)movement.cancel();document.getAnimations().filter(a=>a.id==='showcase-reveal').forEach(a=>a.finish());update();});
update();
if(!reduced.matches)document.querySelector('header').animate([{transform:'translateY(-100%)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:750,easing:'cubic-bezier(.22,1,.36,1)'});
const seen=new WeakSet();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
if(!entry.isIntersecting||seen.has(entry.target))return;
seen.add(entry.target);observer.unobserve(entry.target);if(reduced.matches)return;
const image=entry.target.querySelector('.work-art');
const reveal=image.animate([{opacity:.3,transform:'scale(1.07)'},{opacity:1,transform:'scale(1)'}],{duration:1100,easing:'cubic-bezier(.22,1,.36,1)'});reveal.id='showcase-reveal';
entry.target.querySelectorAll('.project-meta > *').forEach((part,index)=>{const motion=part.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:120+index*95,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'});motion.id='showcase-reveal';});
}),{threshold:.15});
document.querySelectorAll('#work .real-project').forEach(card=>observer.observe(card));
})();
(() => {
const section=document.querySelector('#contact');if(!section)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const plane=section.querySelector('.flight-plane');
let flight,seen=false;
function startFlight(){if(flight)flight.cancel();if(reduced.matches||!section.classList.contains('is-contact-visible'))return;
flight=plane.animate([{transform:'translate(2px,20px) rotate(-24deg)',opacity:0},{transform:'translate(15px,14px) rotate(-18deg)',opacity:1,offset:.15},{transform:'translate(60px,6px) rotate(0deg)',opacity:1,offset:.5},{transform:'translate(106px,14px) rotate(18deg)',opacity:1,offset:.85},{transform:'translate(118px,20px) rotate(24deg)',opacity:0}],{duration:4200,iterations:Infinity,easing:'linear'});
}
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
section.classList.toggle('is-contact-visible',entry.isIntersecting);startFlight();
if(!entry.isIntersecting||seen||reduced.matches)return;seen=true;
const elements=[section.querySelector('.contact-message'),section.querySelector('.boarding-pass')];
elements.forEach((el,index)=>{const a=el.animate([{opacity:0,transform:'translateY(36px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:index*150,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'});a.id='contact-reveal';});
section.querySelectorAll('.pass-head,.pass-route,.pass-grid,.pass-main .pill,.pass-stub').forEach((el,index)=>{const a=el.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:250+index*90,fill:'backwards',easing:'ease-out'});a.id='contact-reveal';});
}),{threshold:.15});observer.observe(section);
reduced.addEventListener('change',()=>{document.getAnimations().filter(a=>a.id==='contact-reveal').forEach(a=>a.finish());startFlight();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(flight)flight.pause();}else startFlight();});
const button=section.querySelector('.copy-email'),feedback=section.querySelector('.copy-feedback');let timer;
button.addEventListener('click',async()=>{clearTimeout(timer);try{await navigator.clipboard.writeText('mrzawlinnaing1001@gmail.com');button.textContent='Copied!';feedback.textContent='Email address copied. Ready when you are.';if(!reduced.matches)button.animate([{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});}catch{feedback.textContent='You can select the email address or click it to open your email app.';}timer=setTimeout(()=>{button.textContent='Copy email';feedback.textContent='';},3500);});
})();
(() => {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let progressFrame=0;
function progress(){progressFrame=0;const max=document.documentElement.scrollHeight-innerHeight;const value=max>0?Math.min(1,Math.max(0,scrollY/max)):0;document.documentElement.style.setProperty('--flight-progress',String(value));}
function requestProgress(){if(!progressFrame)progressFrame=requestAnimationFrame(progress);}
window.addEventListener('scroll',requestProgress,{passive:true});
window.addEventListener('resize',requestProgress,{passive:true});
new ResizeObserver(requestProgress).observe(document.body);
document.fonts.ready.then(requestProgress);requestProgress();
const route=document.querySelector('.origin-route');
if(route){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){route.classList.add('is-route-visible');io.unobserve(route);}}),{threshold:.4});io.observe(route);}
const hero=document.querySelector('.hero'),path=document.querySelector('.hero-flight-path'),craft=document.querySelector('.hero-flight-craft');
if(!hero||!path||!craft)return;
const length=path.getTotalLength();let visible=false,frame=0,start=0,elapsed=0;
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;start=0;}
function render(time){frame=0;if(reduced.matches||!visible||document.hidden)return;if(!start)start=time-elapsed;elapsed=time-start;
const fraction=(elapsed%15000)/15000;const point=path.getPointAtLength(fraction*length),ahead=path.getPointAtLength(Math.min(length,fraction*length+2));
const angle=Math.atan2(ahead.y-point.y,ahead.x-point.x)*180/Math.PI+90;
craft.setAttribute('transform','translate('+point.x+' '+point.y+') rotate('+angle+')');
craft.style.opacity=String(Math.min(1,fraction*12,(1-fraction)*12));
frame=requestAnimationFrame(render);
}
function sync(){stop();if(visible&&!reduced.matches&&!document.hidden)frame=requestAnimationFrame(render);}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
})();