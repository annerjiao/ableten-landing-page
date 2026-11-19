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

$('[data-mapsvg]').innerHTML=mapSVG('wide',[['tate',150,95],['borough mkt',270,95],['padella',360,45]]);
$$('[data-mapsvg] .route').forEach(r=>{r.removeAttribute('pathLength');r.style.transition='none';r.style.strokeDasharray='3 5';r.style.strokeDashoffset='0'});
$('[data-eatermap]').innerHTML=(()=>{let s='<svg viewBox="0 0 370 420" style="position:absolute;inset:0;width:100%;height:100%"><rect width="370" height="420" fill="#EEF0EC"/><path d="M-10 250 C 60 220, 120 300, 190 262 S 300 200, 380 236" fill="none" stroke="#BFDCEA" stroke-width="18"/><path d="M70 0 L 90 420 M230 0 L 210 420 M0 120 L 370 108 M0 350 L 370 340" stroke="#fff" stroke-width="5"/>';[[120,90],[160,140],[200,120],[240,170],[140,200],[290,110],[180,300],[260,290],[100,320],[310,330],[220,230],[300,60],[60,160]].forEach((p,i)=>{s+=`<circle class="epin" style="transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform .4s var(--spring) ${i*60}ms" cx="${p[0]}" cy="${p[1]}" r="7" fill="#D8312A" stroke="#fff" stroke-width="2"/>`});return s+'</svg>'})();

$$('[data-words]').forEach(h=>{h.innerHTML=h.textContent.split(' ').map((w,i)=>`<span class="w" style="animation-delay:${.08+i*.07}s">${w}</span>`).join(' ')});
addEventListener('scroll',()=>{const h=document.querySelector('header'); if(h) h.classList.toggle('scrolled', scrollY>20)},{passive:true});
$$('.q button').forEach(b=>b.addEventListener('click',()=>b.parentElement.classList.toggle('open')));

/* ---------- reveal + smart loading ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  const el=e.target; el.classList.add('in'); io.unobserve(el);
  $$('img.lazy',el).forEach(img=>{const box=img.parentElement;const src=img.dataset.src;if(!src)return;setTimeout(()=>{img.onload=()=>box.classList.add('loaded');img.src=src;if(img.complete)box.classList.add('loaded')},250+Math.random()*450)});
  $$('[data-map]',el).forEach(m=>setTimeout(()=>{m.classList.add('go');finishRoutes(m)},400));
}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
function observeAll(){$$('.rv:not(.in)').forEach(el=>io.observe(el))}

/* features */
const fio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return; const el=e.target; fio.unobserve(el);
  if(el.matches('[data-group]')) groupChat(el);
  if(el.matches('[data-ext]')){setTimeout(()=>$$('.epin',el).forEach(p=>p.style.transform='scale(1)'),200);setTimeout(()=>$('[data-extwin]').classList.add('show'),1100);setTimeout(()=>{const b=$('[data-extsave]');b.classList.add('ok');b.textContent='✓ Saved to London, June 2026'},2900)}
}),{threshold:.4});
fio.observe($('[data-group]'));fio.observe($('[data-ext]'));


/* group chat → saves */
async function groupChat(el){
  if(el._gc) return; el._gc=1;
  const W=ms=>new Promise(r=>setTimeout(r,RM?0:ms)), box=$('[data-msgs]',el), ms=$$('[data-m]',el);
  let vis=true; new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.1}).observe(el);
  while(true){
    while(!vis) await W(400);
    ms.forEach(m=>m.classList.remove('shown','in','out'));
    await W(500);
    for(const m of ms){
      const r=m.classList.contains('r'), t=document.createElement('div');
      t.className='typing'+(r?' r':''); t.innerHTML=(r?'':`<i>${m.dataset.who}</i>`)+'<div class="dots3"><b></b><b></b><b></b></div>';
      box.appendChild(t); requestAnimationFrame(()=>t.classList.add('in'));
      await W(r?1100:900+Math.random()*500);
      t.remove(); box.appendChild(m); m.classList.add('shown'); void m.offsetWidth; m.classList.add('in');
      await W(700);
    }
    await W(3500); ms.forEach(m=>m.classList.add('out')); await W(500);
  }
}

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
  const hashed=()=>{const id=(location.hash||'').slice(1);return tabs.findIndex(t=>t.id===id)};
  new IntersectionObserver(es=>{inView=es[0].isIntersecting;if(inView&&!root.dataset.started){root.dataset.started=1;show(Math.max(0,hashed()))}else if(inView&&!timer){show(cur)}},{threshold:.35}).observe($('.pane-stage',root));
  addEventListener('hashchange',()=>{const i=hashed();if(i>=0)show(i)});
}

/* ---------- HOME panes ---------- */
const H={
  async save(p,alive,step){
    const cur=$('[data-cur]',p), hl=$('[data-hl]',p), pop=$('[data-pop]',p), note=$('[data-note]',p), cnt=$('[data-cnt]',p), sb=$('[data-savebtn]',p);
    hl.classList.remove('on');pop.classList.remove('show');note.textContent='';note.classList.remove('caret');cnt.textContent='0/300';sb.classList.remove('ok');sb.textContent='Save to Ableten';cur.classList.remove('show');
    step(0); await sleep(600,alive);
    moveCursor(cur,p,hl,-170,4); await sleep(900,alive);
    hl.classList.add('on'); moveCursor(cur,p,hl,190,4); await sleep(1300,alive);
    step(1); pop.classList.add('show'); await sleep(500,alive);
    note.classList.add('caret'); await type(note,'Tons of vintage vendors!',alive,45,cnt);
    await sleep(400,alive); step(2);
    moveCursor(cur,p,sb); await sleep(950,alive); click(cur); note.classList.remove('caret');
    sb.textContent='✓ Saved'; sb.classList.add('ok'); await sleep(600,alive);
    sb.textContent='✓ Saved to London, June 2026'; await sleep(1600,alive); pop.classList.remove('show'); cur.classList.remove('show');
  },
  async file(p,alive,step){
    const cur=$('[data-cur]',p), tg=$('[data-toggle]',p), knob=$('.knob',tg), [s1,s2]=$$('span',tg), vp=$('[data-vplan]',p), vs=$('[data-vsaves]',p), svs=$$('[data-sv]',p), cks=$$('.ck',$('[data-fcheck]',p));
    const placeKnob=el=>{knob.style.width=el.offsetWidth+'px';knob.style.transform=`translateX(${el.offsetLeft-3}px)`};
    placeKnob(s1);s1.classList.add('on');s2.classList.remove('on');vp.classList.remove('hide');vs.classList.add('hide');svs.forEach(s=>s.classList.remove('in','glow'));cks.forEach(c=>c.classList.remove('in','done'));cur.classList.remove('show');
    step(0); await sleep(800,alive);
    moveCursor(cur,p.querySelector('.app'),s2,10,8); await sleep(1000,alive); click(cur);
    placeKnob(s2);s2.classList.add('on');s1.classList.remove('on');step(1);
    vp.classList.add('hide');vs.classList.remove('hide');
    for(const s of svs){await sleep(180,alive);s.classList.add('in')}
    await sleep(900,alive); cur.classList.remove('show'); step(2);
    for(const c of cks){c.classList.add('in');await sleep(300,alive);const g=svs[+c.dataset.g];g.classList.add('glow');await sleep(900,alive);c.classList.add('done');g.classList.remove('glow');await sleep(250,alive)}
    await sleep(700,alive);
    moveCursor(cur,p.querySelector('.app'),s1,10,8); await sleep(1000,alive); click(cur);
    placeKnob(s1);s1.classList.add('on');s2.classList.remove('on');vs.classList.add('hide');vp.classList.remove('hide');
    await sleep(800,alive); cur.classList.remove('show');
  },
  async plan(p,alive,step){
    const app=$('.app',p), cur=$('[data-cur]',p), cks=$$('.ck',$('[data-pcheck]',p)), stops=$$('[data-st]',p), walks=$$('[data-wk]',p), tl=$('[data-ptl]',p), drop=$('[data-drop]',p), wm=$('[data-wmap]',p), wl=$('[data-wlist]',p), mw=$('[data-mapw]',p), stk=$('[data-dsticker]',p);
    cks.forEach(c=>c.classList.remove('in','done'));stops.forEach(s=>s.classList.remove('in'));walks.forEach(w=>w.classList.remove('in'));tl.style.setProperty('--tls',0);drop.classList.remove('open');[wm,wl].forEach(w=>w.classList.remove('in','lifted'));mw.className='mapw';mw.style.transition='none';stk.classList.remove('in');cur.classList.remove('show');const sc=$('[data-scroll]',p);sc.style.transform='';
    step(0); await sleep(400,alive);
    for(let i=0;i<cks.length;i++){cks[i].classList.add('in');await sleep(700,alive);if(i<3)cks[i].classList.add('done')}
    step(1); tl.style.setProperty('--tls',1);
    for(let i=0;i<stops.length;i++){stops[i].classList.add('in');await sleep(500,alive);if(walks[i])walks[i].classList.add('in');await sleep(250,alive)}
    cks[3].classList.add('done'); await sleep(300,alive); wm.classList.add('in'); await sleep(150,alive); wl.classList.add('in');
    await sleep(700,alive); step(2); {const vp=sc.parentElement.getBoundingClientRect(),dt=drop.getBoundingClientRect().top;sc.style.transform=`translateY(${-Math.max(0,Math.round(dt-vp.top-(vp.height-200)))}px)`} await sleep(1000,alive);
    moveCursor(cur,app,wm,-40,0); await sleep(950,alive); click(cur);
    const a=app.getBoundingClientRect(), w=wm.getBoundingClientRect();
    mw.style.left=(w.left-a.left)+'px';mw.style.top=(w.top-a.top-30)+'px';mw.style.transform='rotate(-4deg) scale(.6)';mw.style.transformOrigin='0 0';
    void mw.offsetWidth; mw.style.transition=''; mw.classList.add('show'); wm.classList.add('lifted');
    drop.classList.add('open'); await sleep(650,alive);
    const d=drop.getBoundingClientRect();
    mw.style.left=(d.left-a.left+8)+'px';mw.style.top=(d.top-a.top+10)+'px';mw.style.transform='rotate(-3deg) scale(1)';
    cur.style.transition='transform .9s var(--ease)'; moveCursor(cur,app,drop,150,40);
    await sleep(1100,alive); mw.style.transform='rotate(-.5deg)'; mw.classList.add('landed'); wm.classList.remove('lifted'); cur.classList.remove('show');
    await sleep(900,alive);
    stk.style.left=(d.left-a.left+320)+'px';stk.style.top=(d.top-a.top-40)+'px';stk.classList.add('in');
  }
};
setupHIW($('[data-hiw="home"]'),[H.save,H.file,H.plan],[10000,13000,15500],[
 [['Highlight it','Select any rec on any page with the Ableten Chrome extension.'],['Add a note','Say why it matters. Your note stays with the place.'],['Save it to your trip','It lands in Saves with the link and your name on it.']],
 [['Everything in one place','Every save sits inside your trip, with who added it and where it came from.'],['Plan or Saves, one tap','Flip between the plan and your saves any time. Nothing gets buried.'],['Plans use your saves','Ableten builds the days from what your group saved, not from guesses.']],
 [['Tell it what matters','Dates, who\u2019s coming, what you\u2019re into. It asks back when something\u2019s missing.'],['Watch the week take shape','Each day fills in live from your saves. Approve the shape, then build it.'],['Drag in what you need','Maps, shortlists and votes wait on the side. Drop one into any day.']]]);


observeAll();
})();
