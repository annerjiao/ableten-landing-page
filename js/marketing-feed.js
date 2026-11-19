(function () {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- maps ---------- */
const MAPS={
  street:{bg:'#F1EFEA',water:'M-10 90 C 40 60, 80 120, 130 96 S 210 50, 270 80',roads:'M60 0 L 74 190 M150 0 L 140 190 M0 150 L 258 140 M0 24 L 258 30',park:[220,160,38,20],route:'M96 54 C 120 40, 150 70, 176 56 M176 56 C 200 120, 120 150, 104 140',pins:[[96,54],[176,56],[104,140]]},
  river:{bg:'#F1EFEA',water:'M-10 120 C 50 150, 110 80, 170 110 S 240 150, 270 120',roads:'M80 0 L 70 190 M190 0 L 200 190 M0 50 L 258 60 M0 170 L 258 162',park:[40,30,30,16],route:'M110 50 C 140 40, 170 40, 190 60 M190 60 C 200 100, 160 130, 120 140',pins:[[110,50],[190,60],[120,140]]},
  island:{bg:'#D7E6EE',water:'',land:'M30 60 C 60 20, 200 20, 230 70 S 220 170, 140 175 S 10 150, 30 60 Z',roads:'M60 60 L 200 140 M70 150 L 180 70',park:[120,95,30,18],route:'M60 50 C 100 40, 160 60, 170 100 M170 100 C 175 130, 160 150, 140 150',pins:[[60,50],[170,100],[140,150]]},
  wide:{bg:'#F1EFEA',water:'M-10 70 C 80 30, 160 110, 250 76 S 380 40, 450 70',roads:'M110 0 L 122 160 M300 0 L 288 160 M0 132 L 436 124 M0 18 L 436 26',park:[380,138,46,20],route:'M168 108 C 210 120, 240 108, 262 100 M262 100 C 300 80, 320 60, 352 54',pins:[[168,108],[262,100],[352,54]],vb:'0 0 436 160'}
};
function mapSVG(k,labels){
  const m=MAPS[k], vb=m.vb||'0 0 258 190';
  let s=`<svg class="base" viewBox="${vb}" preserveAspectRatio="xMidYMid slice"><rect width="100%" height="100%" fill="${m.bg}"/>`;
  if(m.land) s+=`<path d="${m.land}" fill="#F1EFEA"/>`;
  if(m.water) s+=`<path d="${m.water}" fill="none" stroke="#D5E4EC" stroke-width="22" stroke-linecap="round"/>`;
  s+=`<path d="${m.roads}" fill="none" stroke="#fff" stroke-width="5"/><ellipse cx="${m.park[0]}" cy="${m.park[1]}" rx="${m.park[2]}" ry="${m.park[3]}" fill="#DCE8D6"/>`;
  s+=`<path class="route" pathLength="1" d="${m.route}" fill="none" stroke="#6B6794" stroke-width="2" stroke-linecap="round" style="stroke-dasharray:1"/>`;
  s+=`<g stroke-dasharray="0">`;
  m.pins.forEach((p,i)=>{s+=`<g class="pin"><circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#111"/><text x="${p[0]}" y="${p[1]+4}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" font-weight="600" fill="#fff">${i+1}</text></g>`});
  s+=`</g>`;
  if(labels) labels.forEach(l=>{s+=`<text x="${l[1]}" y="${l[2]}" font-family="Gochi Hand" font-size="14" fill="#111">${l[0]}</text>`});
  return s+`</svg>`;
}
/* a route path with dashes needs dasharray "3 5"; we animate via pathLength then switch */
function finishRoutes(el){$$('.route',el).forEach(r=>{const done=()=>{r.style.transition='none';r.removeAttribute('pathLength');r.style.strokeDasharray='3 5';r.style.strokeDashoffset='0'};r.addEventListener('transitionend',done,{once:true});setTimeout(()=>{if(r.getAttribute('pathLength'))done()},2600)})}

$('[data-pmap1]').innerHTML=mapSVG('street')+`<div class="dc" style="left:8px;top:62px;width:52px;height:52px;--r:-7deg;--dl:.6s"><img src="/assets/images/marketing/tokyo-street.jpg" alt=""></div><div class="dc" style="left:126px;top:8px;width:52px;height:52px;--r:6deg;--dl:1s"><img src="/assets/images/marketing/tokyo-neon.jpg" alt=""></div>`;
$('[data-pmap2]').innerHTML=mapSVG('river')+`<div class="dc" style="left:110px;top:60px;width:52px;height:52px;--r:6deg;--dl:1.1s"><img src="/assets/images/marketing/tokyo-alley.jpg" alt=""></div>`;

$$('[data-words]').forEach(h=>{h.innerHTML=h.textContent.split(' ').map((w,i)=>`<span class="w" style="animation-delay:${.08+i*.07}s">${w}</span>`).join(' ')});
addEventListener('scroll',()=>{const h=document.querySelector('header'); if(h) h.classList.toggle('scrolled', scrollY>20)},{passive:true});
$$('.q button').forEach(b=>b.addEventListener('click',()=>b.parentElement.classList.toggle('open')));

const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
$$('.rv:not(.in)').forEach(el=>io.observe(el));

/* ---------- doodle step icons ---------- */
const ICONS={
 'Highlight it':'<path d="M7.2 20.6 L4.6 18.1 L13.8 7.4 L17.9 11.2 Z"/><path d="M13.8 7.4 L16.2 4.6 C17 3.8 18.1 3.9 18.8 4.6 L20.6 6.3 C21.3 7 21.2 8.1 20.5 8.8 L17.9 11.2"/><path d="M4.6 18.1 L2.8 20.9 L7.2 20.6"/><path d="M10.5 21.2 C14 20.7 17.6 21.4 21.3 20.8"/>',
 'Add a note':'<path d="M5.2 3.6 C9.4 3.2 14.6 3.4 18.6 3.8 C19 9.4 18.9 14.2 18.5 19.3 L13.6 20.6 C10.6 20.4 7.7 20.6 5 20.4 C4.6 14.5 4.8 9 5.2 3.6 Z"/><path d="M8.2 8.4 C10.6 8.2 13.2 8.3 15.4 8.5"/><path d="M8.1 12.2 C10.3 12 12.4 12.1 14.2 12.3"/><path d="M13.6 20.6 C13.9 18.9 14.2 17.6 14.4 16.4 C15.9 16.6 17.3 16.5 18.5 16.4"/>',
 'Save it to your trip':'<path d="M6.3 3.4 C10.2 3.1 14 3.2 17.8 3.6 C18 9.5 18.1 15 17.7 20.8 C15.6 19.2 13.8 17.6 12.1 16.1 C10.2 17.8 8.3 19.4 6.2 20.9 C5.9 15 5.9 9.2 6.3 3.4 Z"/><path d="M9.4 9.6 C10.4 10.7 11.2 11.5 11.7 12 C13.1 10.3 14.3 8.9 15.4 7.6"/>',
 'Everything in one place':'<path d="M3.4 8.6 C3.2 13 3.3 16.8 3.6 20.4 C9.2 20.7 14.9 20.6 20.5 20.2 C20.8 16.3 20.7 12.4 20.4 8.4"/><path d="M3.4 8.6 C4.4 6.8 5.4 5 6.2 3.6 C10.4 3.4 14.2 3.4 17.9 3.7 C18.8 5.2 19.7 6.8 20.4 8.4 C14.8 8.8 9.1 8.8 3.4 8.6 Z"/><path d="M9.4 12.4 C11.2 12.6 13 12.5 14.7 12.3"/>',
 'Plan or Saves, one tap':'<path d="M7.4 7.2 C10.6 6.9 13.9 7 16.8 7.3 C19.7 7.6 21.4 9.6 21.3 12.2 C21.2 14.8 19.3 16.7 16.6 16.8 C13.5 17 10.4 16.9 7.3 16.7 C4.6 16.5 2.7 14.6 2.8 11.9 C2.9 9.4 4.8 7.4 7.4 7.2 Z"/><circle cx="16.4" cy="12" r="3.1"/>',
 'Plans use your saves':'<path d="M12.1 21.2 C8.7 17.4 5.6 13.6 5.7 9.6 C5.8 5.9 8.6 3.1 12.1 3.1 C15.7 3.2 18.4 6 18.3 9.6 C18.2 13.7 15.3 17.4 12.1 21.2 Z"/><circle cx="12" cy="9.5" r="2.6"/>',
 'Tell it what matters':'<path d="M4.2 5.1 C9.2 4.6 14.6 4.7 19.6 5.2 C20.1 8.6 20.1 11.8 19.7 15 C15.6 15.4 11.6 15.4 8.9 15.3 C7.3 16.9 5.8 18.3 4.3 19.6 C4.5 18 4.6 16.6 4.6 15.2 C4 11.8 3.9 8.4 4.2 5.1 Z"/><path d="M8.3 9.1 C10.8 8.9 13.4 9 15.8 9.2"/><path d="M8.2 11.8 C9.8 11.7 11.3 11.7 12.6 11.9"/>',
 'Watch the week take shape':'<path d="M3.6 6.1 C9.1 5.7 14.8 5.8 20.4 6.2 C20.7 11 20.6 15.6 20.3 20.3 C14.8 20.6 9.2 20.6 3.7 20.3 C3.3 15.6 3.3 10.8 3.6 6.1 Z"/><path d="M3.7 10.3 C9.2 10.1 14.8 10.1 20.4 10.4"/><path d="M8 3.4 L8.1 7.6 M16 3.3 L16.1 7.5"/><path d="M7.4 15.2 C8.4 16.1 9.1 16.8 9.6 17.2 C11 15.6 12.2 14.3 13.3 13.2"/>',
 'Drag in what you need':'<path d="M3.4 6.2 L9 4 L15 6.1 L20.6 4.1 L20.5 17.9 L15 20.1 L9 18 L3.5 20 Z"/><path d="M9 4 C9.1 8.6 9 13.3 9 18"/><path d="M15 6.1 C15.1 10.8 15 15.4 15 20.1"/>',
 'Search a city':'<circle cx="10.3" cy="10.2" r="6.4"/><path d="M15 15.1 C16.8 16.8 18.6 18.6 20.6 20.6"/><path d="M7.6 8.4 C8.3 7.4 9.2 6.9 10.4 6.8"/>',
 'See every day first':'<path d="M2.6 12.2 C5.2 7.9 8.4 5.8 12.1 5.8 C15.8 5.8 19 8 21.4 12 C19 16.1 15.8 18.2 12.1 18.2 C8.3 18.3 5.1 16.3 2.6 12.2 Z"/><circle cx="12" cy="12" r="3"/>',
 'Make it yours':'<path d="M12 20.4 C8.2 17.6 4.2 14.5 3.6 10.3 C3.1 7 5.3 4.5 8.2 4.6 C9.9 4.7 11.2 5.8 12 7.4 C12.9 5.7 14.3 4.6 16 4.6 C18.9 4.6 20.9 7.2 20.4 10.4 C19.7 14.6 15.8 17.6 12 20.4 Z"/>'
};
function setIcon(el,name){const d=ICONS[name];el.dataset.ic=name;el.innerHTML=d?`<svg viewBox="0 0 24 24"><g filter="url(#scrib)">${d.replace(/<(path|circle)/g,'<$1 class="dr" pathLength="1"')}</g></svg>`:''}
document.body.insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute"><filter id="scrib" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter></svg>');
$$('.step .ic').forEach(el=>setIcon(el,el.dataset.ic));
/* ---------- timeline helpers ---------- */
function runner(){let id=0;return{start(fn){const my=++id;const alive=()=>my===id;fn(alive)},stop(){id++}}}
const sleep=(ms,alive)=>new Promise((res,rej)=>setTimeout(()=>alive()?res():rej('x'),RM?Math.min(ms,60):ms));
async function type(el,text,alive,speed=38,counter){for(let i=1;i<=text.length;i++){await sleep(speed,alive);el.textContent=text.slice(0,i);if(counter)counter.textContent=i+'/300'}}
function moveCursor(cur,stage,target,dx=0,dy=0){const s=stage.getBoundingClientRect(),t=target.getBoundingClientRect();cur.classList.add('show');cur.style.transform=`translate(${t.left-s.left+t.width/2+dx}px,${t.top-s.top+t.height/2+dy}px)`}
function click(cur){cur.classList.remove('click');void cur.offsetWidth;cur.classList.add('click')}

/* ---------- How it works: generic tabs ---------- */
function setupHIW(root,panes,durs,caps){
  const tabs=$$('.tab',root), ps=$$('.pane',root), steps=$$('.step',root), r=runner(); let cur=0, timer=null, inView=false;
  function show(i,auto){
    cur=i; clearTimeout(timer);
    tabs.forEach((t,j)=>{t.classList.remove('active','done');t.style.setProperty('--dur',durs[j]+'ms');if(j<i)t.classList.add('done')});
    void tabs[i].offsetWidth; tabs[i].classList.add('active');
    ps.forEach((p,j)=>p.classList.toggle('active',j===i));
    if(caps){steps.forEach((st,k)=>{st.style.transition='opacity .25s';st.style.opacity=0;setTimeout(()=>{$('b',st).textContent=caps[i][k][0];setIcon($('.ic',st),caps[i][k][0]);$('p',st).textContent=caps[i][k][1];st.style.opacity=1},250)})}
    r.start(alive=>panes[i](ps[i],alive,s=>steps.forEach((st,k)=>st.classList.toggle('on',k===s))).catch(()=>{}));
    timer=setTimeout(()=>{timer=null;if(inView)show((i+1)%ps.length,true)},durs[i]);
  }
  tabs.forEach((t,i)=>t.onclick=()=>show(i));
  new IntersectionObserver(es=>{inView=es[0].isIntersecting;if(inView&&!root.dataset.started){root.dataset.started=1;show(0)}else if(inView&&!timer){show(cur)}},{threshold:.35}).observe($('.pane-stage',root));
}

/* ---------- WORLD FEED panes ---------- */
const CITIES=[['San Francisco, USA',1,['sf']],['Chiang Mai, Thailand',1,['cm']],['Tokyo, Japan',2,['tk','tk2']],['Mie, Japan',1,['mie']],['London, UK',1,['ld']],['Brooklyn, USA',1,['bk']]];
const RC={sf:['San Francisco','3 days','sf.jpg'],cm:['Chiang Mai bike trip','5 days','temple.jpg'],tk:['Tokyo','5 days','tokyo-shibuya.jpg'],tk2:['Tokyo Nov 19–23','5 days','tokyo-shinjuku.jpg'],mie:['5 Days in Mie','5 days','shrine.jpg'],ld:['London for christmas','22 days','bigben.jpg'],bk:['Brooklyn bachelorette','2 days','brooklyn.jpg']};
$('[data-cities]').innerHTML=CITIES.map(c=>`<div class="city" data-c="${c[0]}"><span>${c[0]}</span><small>${c[1]} trip${c[1]>1?'s':''}</small></div>`).join('');
$('[data-rgrid]').innerHTML=Object.entries(RC).filter(([k])=>k!=='ld').map(([k,v])=>`<div class="rc" data-k="${k}"><div class="media"><img src="/assets/images/marketing/${v[2]}" alt=""></div><b>${v[0]}</b><span>${v[1]}</span></div>`).join('');
const W={
  async find(p,alive,step){
    const q=$('[data-q]',p), dd=$('[data-dd]',p), cities=$$('.city',p), grid=$('[data-rgrid]',p), cards=$$('.rc',grid), lbl=$('[data-rlbl]',p);
    const apply=s=>{const L=s.toLowerCase();let keys=new Set();cities.forEach(c=>{const ok=!L||c.dataset.c.toLowerCase().split(/[ ,]+/).some(w=>w.startsWith(L));c.classList.toggle('hid',!ok);c.classList.remove('hi');if(ok)CITIES.find(x=>x[0]===c.dataset.c)[2].forEach(k=>keys.add(k))});
      const vis=cities.filter(c=>!c.classList.contains('hid'));if(L&&vis[0])vis[0].classList.add('hi');
      cards.forEach(c=>{const on=!L||keys.has(c.dataset.k);c.style.display=on?'':'none';if(on){c.style.opacity=0;c.style.transform='scale(.94)';requestAnimationFrame(()=>{c.style.opacity=1;c.style.transform=''})}});
      grid.classList.toggle('big',L.length>=2);lbl.textContent=L?(L.length>=2&&vis[0]?'TRIPS IN '+vis[0].dataset.c.split(',')[0].toUpperCase()+' · '+keys.size:'MATCHING · '+keys.size):'ALL TRIPS · 6'};
    q.textContent='';dd.classList.remove('show');apply('');
    step(0); await sleep(900,alive); dd.classList.add('show'); await sleep(700,alive);
    for(const s of ['T','To','Tok','Toky','Tokyo']){q.textContent=s;apply(s);await sleep(s.length<3?850:520,alive)}
    await sleep(2200,alive); step(1);
    await sleep(400,alive);
  },
  async preview(p,alive,step){
    const pass=$('[data-pass]',p), cur=$('[data-cur]',p), row=$('[data-trow]',p);
    pass.classList.remove('go');row.classList.remove('hov');cur.classList.remove('show');$$('.map',p).forEach(m=>{m.classList.remove('go');$$('.route',m).forEach(r=>{r.setAttribute('pathLength','1');r.style.transition='';r.style.strokeDasharray='1';r.style.strokeDashoffset=''})});
    step(1); await sleep(300,alive); void pass.offsetWidth; pass.classList.add('go');
    await sleep(900,alive); $$('.map',p).forEach(m=>{m.classList.add('go');finishRoutes(m)});
    await sleep(2400,alive); moveCursor(cur,p,$('u',row)); await sleep(900,alive); row.classList.add('hov'); click(cur);
    await sleep(1500,alive); moveCursor(cur,p,$('.btn',row)); await sleep(1000,alive); click(cur); $('.btn',row).classList.add('pressed'); await sleep(250,alive); $('.btn',row).classList.remove('pressed'); step(2);
  },
  async make(p,alive,step){
    const dl=$$('[data-dl] div',p), f1=$('[data-f1]',p), f1t=$('[data-f1t]',p), hint=$('[data-hint]',p), f2=$('[data-f2]',p), who=$$('[data-who] span',p), f3=$('[data-f3]',p), f3t=$('[data-f3t]',p), cr=$('[data-create]',p);
    dl.forEach(d=>d.classList.remove('in'));[f1,f2,f3].forEach(f=>f.classList.remove('focus','filled'));f1t.textContent='Add your dates';f3t.textContent='Food, pace, must-sees…';hint.classList.remove('show');who.forEach(w=>w.classList.remove('in'));cr.textContent='Create my trip';
    step(2); await sleep(300,alive);
    for(const d of dl){d.classList.add('in');await sleep(140,alive)}
    await sleep(400,alive); f1.classList.add('focus'); f1.classList.add('filled'); f1t.textContent=''; f1t.classList.add('caret'); await type(f1t,'Apr 2 – 6 · 5 days',alive,55); f1t.classList.remove('caret');
    hint.classList.add('show'); await sleep(900,alive); f1.classList.remove('focus');
    f2.classList.add('focus'); for(const w of who){await sleep(260,alive);w.classList.add('in')} await sleep(500,alive); f2.classList.remove('focus');
    f3.classList.add('focus','filled'); f3t.textContent=''; f3t.classList.add('caret'); await type(f3t,'First time in Japan. Big on food, light on museums.',alive,34); f3t.classList.remove('caret'); f3.classList.remove('focus');
    await sleep(500,alive); cr.classList.add('pressed'); await sleep(220,alive); cr.classList.remove('pressed'); cr.textContent='Creating your trip…'; await sleep(1300,alive); cr.textContent='✓ Tokyo, Apr 2–6 is yours';
  }
};
setupHIW($('[data-hiw="wf"]'),[W.find,W.preview,W.make],[9500,9000,13000]);
})();
