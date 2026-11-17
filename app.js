(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- tabs ---------- */
function route(){
  const v=location.hash==='#disposal'?'disposal':'room';
  $$('.view').forEach(e=>e.classList.toggle('on',e.id==='view-'+v));
  $$('.tabs a').forEach(a=>a.setAttribute('aria-current',a.id==='tab-'+v));
  scrollTo(0,0);
}
addEventListener('hashchange',route);route();

/* ---------- content ---------- */
const TASKS=[
 ["Open a window for one minute.","Name three things you can smell."],
 ["Drink something warm with no screen in your hand.","Just the cup."],
 ["Text one person “thinking of you”.","No reason needed, no reply required."],
 ["Walk until you find a leaf worth keeping.","Keep it."],
 ["Write down one thing you're done carrying this year.","One line is enough."],
 ["Go to bed 20 minutes earlier tonight.","Set the alarm for going to bed, not waking up."],
 ["Stretch your arms overhead for five slow breaths.","Right where you are."],
 ["Tidy one surface. Only one.","Stop when it's clear."],
 ["Listen to one whole song with your eyes closed.","Start to finish."],
 ["Say no to one thing today.","A small one counts."],
 ["Step outside after dark and look up.","One minute."],
 ["Write three things that went fine today.","Fine counts. It doesn't have to be great."],
 ["Eat one meal sitting down, slowly.","Taste the first three bites on purpose."],
 ["Put your phone in another room for 30 minutes.","See what you reach for instead."],
 ["Tell us one thing you'd change about the app.","Be blunt. We can take it."],
 ["Wear your softest thing.","All day if you can get away with it."],
 ["Mute one account that makes you feel worse.","You can always unmute it. You won't."],
 ["Do the thing you've been avoiding for five minutes.","Set a timer. Stopping at five is allowed."],
 ["Make something with your hands.","Toast counts."],
 ["Ask someone how they really are.","Then wait for the answer."],
 ["Take the long way home.","Or the long way to the kitchen."],
 ["Write a two-line thank-you to someone who won't expect it.","Send it before you edit it."],
 ["Breathe in for 4, out for 6.","Ten rounds."],
 ["Reread one page of a book you loved.","Any page."],
 ["Do nothing for three minutes.","Staring out of a window is the whole task."],
 ["Give something away.","A thing, a compliment, your seat."],
 ["Play a song from when you were 15.","Volume is your call."],
 ["Light a candle at dinner.","A lamp works too."],
 ["Plan one small thing to look forward to in December.","Put it in your calendar."],
 ["Look at your room. You built this.","Write yourself one kind sentence."]
];
const ITEMS=["Logs in the fireplace","A first small flame","A rug","An armchair","The fire caught","A mug of cocoa","A candle on the mantel","A blanket over the armrest","A stack of books","The moon came out","A cat fell asleep on the rug","A string of lights","A picture on the wall","A plant that likes the warmth","Leaves drifting past the window","A second candle","Slippers","A proper roaring fire","The cocoa is steaming","A wreath","A basket of yarn","A clock in no hurry","Stars","October's pumpkin, still hanging on","A bowl of clementines","The lights switched on","A radio playing quietly","The cat is snoring","First snow outside","Sparks. The room is finished"];

/* ---------- state ---------- */
const KEY='november-room-v1';
let S={done:[2,3,5,8,9,11,12],unlock:false};
try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&Array.isArray(r.done))S=r;}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
const now=new Date();
const TODAY=(now.getFullYear()===2026&&now.getMonth()===10)?now.getDate():13;
let sel=TODAY;
const open=d=>S.unlock||d<=TODAY;
const wd=d=>new Date(2026,10,d).toLocaleDateString('en-US',{weekday:'long'});
const toScene=()=>$('#scene').scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});

/* ---------- room ---------- */
function scene(newN){
  const c=S.done.length;
  $$('.it').forEach(g=>{const n=+g.dataset.n;g.classList.toggle('on',n<=c);g.classList.toggle('new',n===newN);});
  $('#cold').style.opacity=(.5*(1-c/30)).toFixed(2);
  $('#warm').style.opacity=c>=2?(.2+.8*c/30).toFixed(2):0;
  $('#cnt').textContent=c;$('#cnt2').textContent=c;
  $('#barfill').style.width=(c/30*100)+'%';
  $('#bar').setAttribute('aria-valuenow',c);
  $('#cap').innerHTML=c===0?'The room is cold. Light it up.':(newN?'<b>New:</b> ':'Latest: ')+ITEMS[c-1];
  if(newN){const s=$('#streak');s.classList.remove('bump');void s.offsetWidth;s.classList.add('bump');}
}
function cal(){
  const el=$('#cal');el.innerHTML='';
  ['S','M','T','W','T','F','S'].forEach(x=>{const s=document.createElement('div');s.className='dow';s.textContent=x;el.append(s);});
  for(let d=1;d<=30;d++){
    const b=document.createElement('button');b.type='button';b.textContent=d;
    const done=S.done.includes(d);
    b.className='day'+(done?' done':'')+(!open(d)?' locked':'')+(d===TODAY?' today':'')+(d===sel?' sel':'');
    b.setAttribute('aria-label','November '+d+(done?', done':!open(d)?', not open yet':d===TODAY?', today':''));
    b.onclick=()=>{sel=d;cal();card();};
    el.append(b);
  }
}
function card(){
  const el=$('#card'),d=sel,done=S.done.includes(d),t=TASKS[d-1];
  const head=`<span class="tag">Day ${d}${d===TODAY?' · today':''}</span><div class="when">${wd(d)}, November ${d}</div>`;
  if(!open(d)){
    el.innerHTML=head+`<h2>Opens ${wd(d)}.</h2><p class="muted">It'll keep. Nothing here expires.</p>`;return;
  }
  let h=head+`<h2>${t[0]}</h2><p class="muted">${t[1]}</p>`;
  if(d===15&&!done)h+=`<textarea id="fb" placeholder="One thing I'd change…"></textarea><p class="small muted">Prototype: this answer isn't sent anywhere yet. In the real thing it goes to the product team.</p>`;
  if(done){
    h+=`<p class="doneline">Done. ${ITEMS[S.done.indexOf(d)]}.</p>`;
    if(S.done.length===30)h+=`<p>That's all thirty. The room is yours to keep.</p>`;
    h+=`<button class="btn ghost sm" id="undo" type="button">Undo</button>`;
  }else h+=`<button class="btn" id="did" type="button">I did it</button>`;
  el.innerHTML=h;
  const did=$('#did'),undo=$('#undo');
  if(did)did.onclick=()=>{S.done.push(d);save();cal();card();scene(S.done.length);toScene();};
  if(undo)undo.onclick=()=>{S.done=S.done.filter(x=>x!==d);save();cal();card();scene();};
}
$('#p-fill').onclick=()=>{S.done=[...new Set([...S.done,...Array.from({length:30},(_,i)=>i+1)])];S.unlock=true;$('#p-unlock').checked=true;save();cal();card();scene(30);toScene();};
$('#p-clear').onclick=()=>{S.done=[];save();cal();card();scene();};
$('#p-unlock').checked=S.unlock;
$('#p-unlock').onchange=e=>{S.unlock=e.target.checked;save();cal();card();};
scene();cal();card();

/* ---------- thoughts already let go ----------
   The text itself is never stored. We keep only a one-way fingerprint and a date,
   so a thought that comes back can be recognised and handed to the phoenix. */
const LKEY='november-room-let-go-v1';
let L=[];
try{const r=JSON.parse(localStorage.getItem(LKEY));if(Array.isArray(r))L=r;}catch(e){}
const saveL=()=>{try{localStorage.setItem(LKEY,JSON.stringify(L.slice(-300)));}catch(e){}};
function fingerprint(text){
  let s=text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  if(!s)s=text.trim().toLowerCase();
  let a=0xdeadbeef^s.length,b=0x41c6ce57^s.length;
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677);}
  a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);
  b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);
  return (b>>>0).toString(36)+(a>>>0).toString(36);
}
function ago(t){
  const day=x=>{const d=new Date(x);d.setHours(0,0,0,0);return d.getTime();};
  const n=Math.round((day(Date.now())-day(t))/864e5);
  if(n<=0)return Date.now()-t<5*6e4?'a moment ago':'earlier today';
  return n===1?'yesterday':n+' days ago';
}

/* ---------- disposal ---------- */
const stage=$('#stage'),note=$('#note'),props=$('#props'),ta=$('#thought');
const H=340;let busy=false,shown=false,gone=0,lastFx='';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const A=(el,kf,o)=>el.animate(kf,Object.assign({fill:'forwards',easing:'ease-in-out'},o)).finished;
const rnd=(a,b)=>a+Math.random()*(b-a);
const BACK='cubic-bezier(.2,1.4,.4,1)';
function add(cls,html){const d=document.createElement('div');d.className=cls;if(html)d.innerHTML=html;props.append(d);return d;}
function pop(text,x,y){const d=add('pop');d.textContent=text;d.style.left=x+'px';d.style.top=y+'px';
  return A(d,[{transform:'translate(-50%,0) scale(.4)',opacity:0},{transform:'translate(-50%,-14px) scale(1)',opacity:1,offset:.3},{transform:'translate(-50%,-44px) scale(1)',opacity:0}],{duration:1200});}
function dots(n,x,y,color,spread,up){for(let i=0;i<n;i++){const d=add('dot'),s=rnd(3,7);
  d.style.cssText=`left:${x+rnd(-spread,spread)}px;top:${y}px;width:${s}px;height:${s}px;background:${color}`;
  A(d,[{transform:'translate(0,0)',opacity:1},{transform:`translate(${rnd(-50,50)}px,${up?rnd(-110,-40):rnd(40,110)}px)`,opacity:0}],{duration:rnd(700,1500),delay:rnd(0,300),easing:'ease-out'}).then(()=>d.remove());}}
const geo=()=>({W:stage.clientWidth,cx:note.offsetLeft+note.offsetWidth/2,cy:note.offsetTop+note.offsetHeight/2,top:note.offsetTop,h:note.offsetHeight,w:note.offsetWidth});
/* where an element sits inside the stage right now, mid-animation included */
const at=el=>{const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return {x:r.left-s.left+r.width/2,y:r.top-s.top+r.height/2};};

function preview(){
  const v=ta.value.trim();
  note.textContent=v||'Your thought goes here';
  note.classList.toggle('empty',!v);
  note.classList.toggle('md',v.length>40&&v.length<=90);
  note.classList.toggle('sm',v.length>90);
}
ta.addEventListener('input',()=>{if(shown)reset();if(!busy)preview();});
ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();run();}});

const PHOENIX_SVG='<svg viewBox="0 0 120 110" width="120" height="110"><defs><linearGradient id="phx-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd66b"/><stop offset="1" stop-color="#ff7a2a"/></linearGradient><linearGradient id="phx-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#e2566b"/></linearGradient></defs>'
 +'<g fill="url(#phx-t)"><path d="M60 58C50 78 48 94 55 108 61 94 64 80 60 58Z"/><path d="M60 58C50 78 48 94 55 108 61 94 64 80 60 58Z" transform="rotate(24 60 58)"/><path d="M60 58C50 78 48 94 55 108 61 94 64 80 60 58Z" transform="rotate(-24 60 58)"/></g>'
 +'<path class="wing" d="M57 50C42 28 22 22 3 28 13 34 17 41 15 50 26 45 32 52 30 61 41 54 51 58 57 60Z" fill="url(#phx-w)"/>'
 +'<g transform="translate(120 0) scale(-1 1)"><path class="wing" d="M57 50C42 28 22 22 3 28 13 34 17 41 15 50 26 45 32 52 30 61 41 54 51 58 57 60Z" fill="url(#phx-w)"/></g>'
 +'<ellipse cx="60" cy="56" rx="9" ry="15" fill="#ffd66b"/><path d="M54 26l2-10 4 7 4-7 2 10z" fill="#ff8a3d"/><circle cx="60" cy="34" r="8" fill="#ffe08a"/><circle cx="57" cy="33" r="1.5" fill="#3a2410"/><circle cx="63" cy="33" r="1.5" fill="#3a2410"/><path d="M58 37h4l-2 4z" fill="#ff8a3d"/></svg>';

const FX={
 async burn(){
  const g=geo(),D=2600,a=6,n=8;
  /* ragged burning edge at height Y, measured from the top of the note */
  const edge=Y=>{let p=`0px 0px,${g.w}px 0px`;for(let i=n;i>=0;i--)p+=`,${(g.w*i/n).toFixed(1)}px ${(Y+(i%2?-a:a*.5)).toFixed(1)}px`;return `polygon(${p})`;};
  const Y0=g.h+a,Y1=-a-2;
  const sc=document.createElement('div');sc.className='scorch';note.append(sc);
  const fl=add('flames',Array.from({length:9},(_,i)=>`<i style="left:${i/8*100}%;height:${rnd(20,38).toFixed(0)}px;animation-delay:${(-rnd(0,.5)).toFixed(2)}s"></i>`).join(''));
  fl.style.cssText=`left:${g.cx-g.w/2}px;width:${g.w}px;top:${g.top+Y0-40}px`;
  const iv=setInterval(()=>{const p=at(fl);dots(2,g.cx,p.y+10,Math.random()<.5?'#ffd66b':'#ff8a3d',g.w/2,true);},110);
  await Promise.all([
   A(note,[{clipPath:edge(Y0)},{clipPath:edge(Y1)}],{duration:D,easing:'linear'}),
   A(sc,[{transform:`translateY(${Y0-50}px)`},{transform:`translateY(${Y1-50}px)`}],{duration:D,easing:'linear'}),
   A(fl,[{transform:'translateY(0)',opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.9},{transform:`translateY(${Y1-Y0}px)`,opacity:0}],{duration:D,easing:'linear'})]);
  clearInterval(iv);
  for(let i=0;i<3;i++){const s=add('smoke');s.style.cssText=`left:${g.cx+rnd(-50,30)}px;top:${g.top-10}px`;
   A(s,[{transform:'translateY(0) scale(.5)',opacity:.55},{transform:`translate(${rnd(-20,20)}px,-70px) scale(1.6)`,opacity:0}],{duration:1100,delay:i*120,easing:'ease-out'});}
  dots(12,g.cx,g.top+8,'#7f9db3',g.w/2,false);await wait(1000);
 },
 async dissolve(){
  const g=geo();
  for(let i=0;i<6;i++){const f=add('fogp'),s=rnd(90,160);f.style.cssText=`width:${s}px;height:${s}px;left:${rnd(-40,g.W-60)}px;top:${rnd(0,160)}px`;
   A(f,[{opacity:0,transform:'translateX(-30px)'},{opacity:.5,offset:.5},{opacity:0,transform:'translateX(60px)'}],{duration:3200,delay:i*120});}
  await A(note,[{opacity:1,filter:'blur(0)',transform:'rotate(-2deg)'},{opacity:.7,filter:'blur(3px)',transform:'rotate(-1deg) translateY(-8px) scale(1.03)',offset:.4},{opacity:0,filter:'blur(16px)',transform:'rotate(1deg) translateY(-38px) scale(1.18)'}],{duration:2800});
  await wait(500);
 },
 async plane(){
  const g=geo(),p=add('plane','<svg viewBox="0 0 64 48" width="64" height="48"><path d="M2 22 62 2 40 46 28 30z" fill="#f3e9d8"/><path d="M62 2 28 30l-2 14 8-10z" fill="#cdbfa8"/></svg>');
  p.style.left=(g.cx-32)+'px';p.style.top=(g.cy-24)+'px';
  await A(note,[{transform:'rotate(-2deg)'},{transform:'rotate(0) scale(.55,1)',offset:.3},{transform:'rotate(0) scale(.55,.5)',offset:.6},{transform:'rotate(-14deg) scale(.3,.32)',opacity:1,offset:.85},{transform:'rotate(-14deg) scale(.26,.28)',opacity:0}],{duration:1000});
  await A(p,[{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1)'}],{duration:250,easing:BACK});
  await A(p,[{transform:'translate(0,0) rotate(0)'},{transform:'translate(-46px,50px) rotate(14deg)',offset:.3},{transform:'translate(40px,10px) rotate(-18deg)',offset:.55},{transform:`translate(${g.W}px,-240px) rotate(-30deg)`}],{duration:1900,easing:'cubic-bezier(.5,0,.8,.4)'});
  await wait(300);
 },
 async vacuum(){
  const g=geo(),v=add('vac','<svg viewBox="0 0 120 90" width="120" height="90"><path d="M52 50C30 50 34 78 8 78" fill="none" stroke="#5f7688" stroke-width="9" stroke-linecap="round"/><rect y="72" width="16" height="12" rx="3" fill="#9fb6c6"/><rect x="48" y="28" width="62" height="44" rx="18" fill="#e2566b"/><rect x="60" y="36" width="30" height="14" rx="7" fill="#f3e9d8"/><circle cx="70" cy="43" r="2.6" fill="#101820"/><circle cx="81" cy="43" r="2.6" fill="#101820"/><circle cx="98" cy="74" r="10" fill="#101820" stroke="#9fb6c6" stroke-width="3"/><circle cx="62" cy="76" r="6" fill="#101820" stroke="#9fb6c6" stroke-width="3"/></svg>');
  await A(v,[{transform:'translateX(170px)'},{transform:'translateX(0)'}],{duration:600,easing:'cubic-bezier(.2,1.2,.4,1)'});
  const dx=(g.W-132)-g.cx,dy=(H-28)-g.cy;
  const shake=v.animate([{transform:'translate(0,0)'},{transform:'translate(-2px,1px)'},{transform:'translate(2px,-1px)'},{transform:'translate(0,0)'}],{duration:90,iterations:Infinity});
  await A(note,[{transform:'rotate(-2deg)'},
   {transform:`translate(${dx*.12}px,${dy*.12}px) rotate(6deg) skewX(-12deg) scale(.95)`,offset:.25},
   {transform:`translate(${dx*.05}px,${dy*.05}px) rotate(-4deg) skewX(8deg) scale(.97)`,offset:.4},
   {transform:`translate(${dx*.55}px,${dy*.55}px) rotate(14deg) skewX(-18deg) scale(.55,.7)`,offset:.75},
   {transform:`translate(${dx}px,${dy}px) rotate(30deg) scale(.03,.12)`,opacity:.7}],{duration:1900,easing:'ease-in'});
  note.style.visibility='hidden';shake.cancel();
  await A(v,[{transform:'scale(1)'},{transform:'scale(1.18,.86)',offset:.4},{transform:'scale(.95,1.06)',offset:.7},{transform:'scale(1)'}],{duration:500});
  dots(8,g.W-30,H-50,'#9fb6c6',10,true);await pop('fwomp',g.W-80,H-140);
  await A(v,[{transform:'translateX(0)'},{transform:'translateX(-14px)',offset:.25},{transform:'translateX(190px)'}],{duration:700});
 },
 async shredder(){
  const g=geo(),SLOT=184,v=.08,hs=Math.min(g.h,112);
  const box=add('clipbox');box.append(note);
  const sh=add('shred','<span class="led"></span>'),st=add('strips',Array.from({length:10},()=>'<i></i>').join(''));
  const strips=[...st.children];
  st.style.height=(hs+1)+'px';strips.forEach(s=>{s.style.height=hs+'px';s.style.transform=`translateY(${-hs-2}px)`;});
  await A(note,[{transform:'rotate(-2deg)'},{transform:'rotate(0deg)'}],{duration:250});
  const shake=sh.animate([{transform:'translate(0,0)'},{transform:'translate(-1.5px,1px)'},{transform:'translate(1.5px,-1px)'}],{duration:70,iterations:Infinity});
  /* paper goes in at a steady speed; strips start coming out when its edge reaches the slot */
  const travel=SLOT-g.top+6,lead=Math.max(0,SLOT-(g.top+g.h))/v;
  await Promise.all([A(note,[{transform:'translateY(0)'},{transform:`translateY(${travel}px)`}],{duration:travel/v,easing:'linear'}),
   ...strips.map(s=>A(s,[{transform:`translateY(${-hs-2}px)`},{transform:'translateY(0)'}],{duration:hs/v,easing:'linear',delay:lead+rnd(0,120)}))]);
  shake.cancel();sh.querySelector('.led').style.background='#6aae2a';
  await wait(300);
  await Promise.all(strips.map((s,i)=>A(s,[{transform:'translateY(0) rotate(0)'},{transform:`translate(${rnd(-20,20)}px,${hs+40}px) rotate(${rnd(-40,40)}deg)`}],{duration:rnd(500,900),delay:i*40,easing:'ease-in'})));
  await wait(200);
 },
 async hole(){
  const g=geo(),h=add('hole'),hx=g.W/2,hy=258;
  await A(h,[{transform:'scale(0)'},{transform:'scale(1)'}],{duration:500,easing:BACK});
  const R=Math.hypot(g.cx-hx,g.cy-hy),a0=Math.atan2(g.cy-hy,g.cx-hx),N=28,kf=[];
  for(let i=0;i<=N;i++){const t=i/N,r=R*Math.pow(1-t,1.3),a=a0+t*Math.PI*5;
   kf.push({transform:`translate(${hx+r*Math.cos(a)-g.cx}px,${hy+r*Math.sin(a)-g.cy}px) rotate(${t*1000}deg) scale(${1-t*.98})`});}
  await A(note,kf,{duration:2600,easing:'ease-in'});note.style.visibility='hidden';
  await A(h,[{transform:'scale(1)'},{transform:'scale(1.35)',offset:.3},{transform:'scale(0)'}],{duration:600});
  dots(10,hx,hy,'#ffd66b',6,true);await wait(500);
 },
 async cat(){
  const g=geo(),k=.55,nw=g.w*k,TABLE=200;
  /* everything is placed relative to the note's spot on the table, so the cat
     always sits right next to it and never has to reach across the stage */
  const tl=Math.round(g.W*.26),noteL=tl+18,ncx=noteL+nw/2;
  const catL=Math.min(g.W-104,noteL+nw+16);
  const tb=add('table');tb.style.left=tl+'px';
  const c=add('catp','<svg viewBox="0 0 100 110" width="100" height="110"><path class="tail" d="M86 102q18-6 9-30" fill="none" stroke="#d99b4f" stroke-width="7" stroke-linecap="round"/><path d="M30 110C22 70 40 48 60 48c24 0 32 32 28 62z" fill="#e8b56b"/><circle cx="42" cy="40" r="20" fill="#e8b56b"/><path d="M24 30l2-22 14 14zM46 20l12-12v22z" fill="#e8b56b"/><circle cx="34" cy="40" r="2.8" fill="#2b2030"/><circle cx="48" cy="40" r="2.8" fill="#2b2030"/><path d="M39 46l2 2 2-2" fill="none" stroke="#2b2030" stroke-width="1.5"/></svg>');
  c.style.left=catL+'px';
  const paw=add('paw');paw.style.right=(g.W-(catL+42))+'px';
  note.style.transformOrigin='50% 100%';
  const ty=TABLE-(g.top+g.h);let tx=ncx-g.cx;
  const T=(x,y,r)=>`translate(${x}px,${y}px) scale(${k}) rotate(${r||0}deg)`;
  await Promise.all([A(note,[{transform:'rotate(-2deg)'},{transform:T(tx,ty)}],{duration:500}),
   A(c,[{transform:`translateX(${g.W-catL+10}px)`},{transform:'translateX(0)'}],{duration:600,easing:'cubic-bezier(.2,1.1,.4,1)'})]);
  await wait(350);
  let pw=Math.max(14,(catL+42)-(noteL+nw)-2);
  await A(paw,[{width:'10px'},{width:pw+'px'}],{duration:450});
  for(const d of [22,22]){
   await wait(450);
   await Promise.all([A(paw,[{width:pw+'px'},{width:(pw+d)+'px'}],{duration:150}),A(note,[{transform:T(tx,ty)},{transform:T(tx-d,ty,-3)}],{duration:150})]);
   tx-=d;pw+=d;
   await A(paw,[{width:pw+'px'},{width:(pw-14)+'px'}],{duration:200});pw-=14;
  }
  await wait(700);
  /* the last shove: far enough that the note's centre clears the table edge */
  const last=Math.max(40,(ncx-44)-(tl-30));
  /* a short, sharp swipe; the note slides the rest of the way on its own */
  await Promise.all([A(paw,[{width:pw+'px'},{width:(pw+34)+'px'}],{duration:140}),A(note,[{transform:T(tx,ty,-3)},{transform:T(tx-last,ty,-14)}],{duration:340,easing:'cubic-bezier(.1,.7,.3,1)'})]);
  await A(note,[{transform:T(tx-last,ty,-14)},{transform:T(tx-last-30,ty+H,-240)}],{duration:700,easing:'ease-in'});
  note.style.visibility='hidden';
  await A(paw,[{width:(pw+34)+'px'},{width:'10px'}],{duration:400});
  c.querySelector('.tail').animate([{transform:'rotate(0)'},{transform:'rotate(14deg)'},{transform:'rotate(0)'}],{duration:500,iterations:2});
  await pop('what.',catL+50,78);
 },
 async monster(){
  const g=geo(),m=add('mon','<svg viewBox="0 0 180 140" width="180" height="140"><path d="M62 42 52 14M118 42l10-28" stroke="#7d5aa6" stroke-width="6" stroke-linecap="round"/><circle cx="52" cy="12" r="10" fill="#f3e9d8"/><circle cx="54" cy="14" r="4.5" fill="#101820"/><circle cx="128" cy="12" r="10" fill="#f3e9d8"/><circle cx="126" cy="14" r="4.5" fill="#101820"/><path d="M10 140C10 60 50 30 90 30s80 30 80 110z" fill="#7d5aa6"/><g class="mouth"><ellipse cx="90" cy="92" rx="46" ry="30" fill="#1a0f1f"/><path d="M50 78l8 13 8-16 8 16 8-18 8 18 8-18 8 18 8-16 8 16 8-13z" fill="#f3e9d8"/><ellipse cx="90" cy="112" rx="20" ry="8" fill="#e2566b"/></g></svg>');
  const mouth=m.querySelector('.mouth');
  mouth.animate([{transform:'scaleY(.15)'},{transform:'scaleY(.15)'}],{duration:1,fill:'forwards'});
  await A(m,[{transform:'translateY(170px)'},{transform:'translateY(-10px)',offset:.7},{transform:'translateY(0)'}],{duration:700});
  await A(mouth,[{transform:'scaleY(.15)'},{transform:'scaleY(1.15)'}],{duration:350});
  const dy=(H-42)-g.cy;
  await A(note,[{transform:'rotate(-2deg)'},{transform:'translateY(-18px) rotate(4deg)',offset:.25},{transform:`translateY(${dy}px) rotate(18deg) scale(.22)`}],{duration:800,easing:'ease-in'});
  note.style.visibility='hidden';
  for(let i=0;i<3;i++){
   await Promise.all([A(mouth,[{transform:'scaleY(1.15)'},{transform:'scaleY(.12)'},{transform:'scaleY(.9)'}],{duration:320}),A(m,[{transform:'scale(1)'},{transform:'scale(1.06,.9)'},{transform:'scale(1)'}],{duration:320})]);
   dots(4,g.W/2,H-60,'#f3e9d8',30,true);
  }
  await A(mouth,[{transform:'scaleY(.9)'},{transform:'scaleY(.12)'}],{duration:250});
  await pop('burp',g.W/2,H-170);
  await A(m,[{transform:'translateY(0)'},{transform:'translateY(170px)'}],{duration:600});
 },
 /* not a choice: plays when the same thought comes back */
 async phoenix(){
  const g=geo(),cx=g.W/2;
  /* the note turns into a memory of itself */
  A(note,[{opacity:1,filter:'grayscale(0)'},{opacity:.5,filter:'grayscale(1)'}],{duration:700});
  const ash=add('ash');
  await A(ash,[{transform:'scale(0)'},{transform:'scale(1)'}],{duration:500,easing:BACK});
  await pop('hang on…',cx,H-84);
  const glow=add('ashglow');
  A(glow,[{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1)'}],{duration:600});
  dots(10,cx,H-44,'#ff8a3d',40,true);
  await wait(450);
  const ph=add('phx',PHOENIX_SVG);
  const trail=setInterval(()=>{const p=at(ph);dots(2,p.x,p.y+34,Math.random()<.5?'#ffd66b':'#ff8a3d',16,false);},90);
  A(ash,[{transform:'scale(1)',opacity:1},{transform:'scale(.3,.1)',opacity:0}],{duration:700});
  A(glow,[{opacity:1},{opacity:0}],{duration:900});
  await A(ph,[{transform:'translateY(70px) scale(.15)',opacity:0},{transform:'translateY(-6px) scale(1.08)',opacity:1,offset:.75},{transform:'translateY(0) scale(1)',opacity:1}],{duration:800});
  await wait(250);
  /* it rises to the old note and takes it along */
  const dy=(g.cy+6)-(H-75);
  await A(ph,[{transform:'translate(0,0) rotate(0)'},{transform:`translate(-34px,${dy*.45}px) rotate(-10deg)`,offset:.45},{transform:`translate(18px,${dy*.8}px) rotate(8deg)`,offset:.78},{transform:`translate(0,${dy}px) rotate(0)`}],{duration:1500});
  dots(18,g.cx,g.cy,'#ffd66b',g.w/2,true);
  await A(note,[{opacity:.5,filter:'grayscale(1) brightness(1)',transform:'rotate(-2deg) scale(1)'},{opacity:.9,filter:'grayscale(0) brightness(1.6)',transform:'rotate(-2deg) scale(1.06)',offset:.35},{opacity:0,filter:'grayscale(0) brightness(2.2)',transform:'rotate(-2deg) scale(.4)'}],{duration:650});
  note.style.visibility='hidden';
  await A(ph,[{transform:`translate(0,${dy}px) rotate(0) scale(1)`},{transform:`translate(26px,${dy+14}px) rotate(8deg) scale(1.05)`,offset:.3},{transform:`translate(${-g.W*.35}px,${dy-230}px) rotate(-22deg) scale(.7)`}],{duration:1200,easing:'ease-in'});
  clearInterval(trail);await wait(350);
 }
};
const CHOICES=['burn','dissolve','plane','vacuum','shredder','hole','cat','monster'];
const LINES={burn:"Ash. At least it was warm for a second.",dissolve:"Gone into the fog.",plane:"It's someone else's sky now.",
 vacuum:"The vacuum has no follow-up questions.",shredder:"Shredded. Legally unreadable.",hole:"Not even light gets out. Your thought had no chance.",
 cat:"Knocked off the table. The cat regrets nothing.",monster:"Delicious, apparently."};
const PAST=["Look, that one's already in the past. Breathe out.","You already let this one go. It's ash now. Breathe out.","This one's behind you. The phoenix checked. Breathe out."];

async function run(){
  if(shown)reset();
  if(busy)return;
  const raw=ta.value.trim();
  if(!raw){ta.classList.remove('shake');void ta.offsetWidth;ta.classList.add('shake');ta.placeholder='Write something first. One word is fine.';ta.focus();return;}
  busy=true;ta.blur();preview();$('#view-disposal').classList.add('busy');
  stage.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});
  await wait(450);
  const fp=fingerprint(raw),before=L.find(x=>x.h===fp);
  let m=before?'phoenix':$('input[name=m]:checked').value;
  if(m==='any'){const k=CHOICES.filter(x=>x!==lastFx);m=k[Math.floor(Math.random()*k.length)];}
  try{
    if(reduce)await A(note,[{opacity:1},{opacity:0}],{duration:700});else await FX[m]();
  }catch(e){console.error(e);}
  note.style.visibility='hidden';
  /* clear the stage before the closing line, so nothing sits under it */
  await A(props,[{opacity:1},{opacity:0}],{duration:300});
  stage.insertBefore(note,$('#result'));props.innerHTML='';
  if(before){
    $('#rtext').textContent=PAST[Math.floor(Math.random()*PAST.length)];
    $('#rcount').textContent='You let this go '+ago(before.t)+'. It stays gone.';
    $('#again').textContent='Write a different one';
  }else{
    lastFx=m;gone++;L.push({h:fp,t:Date.now()});saveL();
    $('#rtext').textContent=LINES[m];
    $('#rcount').textContent=gone===1?'1 thought disposed of this visit':gone+' thoughts disposed of this visit';
    $('#again').textContent='Another one';
  }
  $('#exhale').hidden=!before;
  $('#result').classList.add('on');ta.value='';
  /* controls come back straight away: starting to type is the same as pressing the button */
  $('#view-disposal').classList.remove('busy');shown=true;
}
function reset(){
  $('#result').classList.remove('on');
  note.getAnimations().forEach(a=>a.cancel());
  props.getAnimations().forEach(a=>a.cancel());
  stage.insertBefore(note,$('#result'));props.innerHTML='';
  note.removeAttribute('style');preview();
  $('#view-disposal').classList.remove('busy');busy=false;shown=false;
}
$('#go').onclick=run;
$('#again').onclick=()=>{reset();ta.focus();};
$('#p-forget').onclick=()=>{L=[];saveL();$('#p-forget').textContent='Forgotten. Every thought is new again.';};
})();
