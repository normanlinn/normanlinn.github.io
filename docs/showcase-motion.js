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