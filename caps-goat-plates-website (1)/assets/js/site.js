/* ================================================================
   CAPS GOAT PLATES LTD — site.js
   Loaded on every page. Nav, persistent garage (cart), shared plate
   renderer, FAQ accordion, scroll reveals, toast.
   No dependencies. Deferred.
   ================================================================ */
(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var gbp=function(n){return '£'+Number(n).toFixed(2)};

document.documentElement.classList.remove('no-js');

/* ---------- shared catalogue (builder.js reads these) ---------- */
var CG={
  STYLES:{
    std:{n:'Standard', p:15.99, cls:'s-std'},
    gel:{n:'3D Gel',   p:24.99, cls:'s-gel'},
    l4d:{n:'4D Laser', p:29.99, cls:'s-l4d'},
    g4d:{n:'4D Gel',   p:36.99, cls:'s-g4d'}
  },
  SIZES:{
    std :{n:'Standard',   d:'520 × 111 mm', p:0,  cls:'',     two:false},
    sq  :{n:'4×4 Square', d:'279 × 203 mm', p:5,  cls:'sq',   two:true},
    moto:{n:'Motorcycle', d:'229 × 178 mm', p:-3, cls:'moto', two:true}
  },
  BADGES:{
    none:null,
    uk :{t:'UK', bg:'#1d3f94', f:'#f-uk'},
    gb :{t:'GB', bg:'#1d3f94', f:'#f-uk'},
    ev :{t:'UK', bg:'#00a550', f:'#f-uk'},
    eng:{t:'ENG',bg:'#1d3f94', f:'#f-eng'},
    sco:{t:'SCO',bg:'#1d3f94', f:'#f-sco'},
    cym:{t:'CYM',bg:'#1d3f94', f:'#f-wal'}
  },
  BORDERS:{none:null,black:'#141414',blue:'#1e3f94',red:'#c8102e',green:'#00703c',gold:'#f6a821'},
  TINTS:{none:null,crimson:{n:'Crimson',cls:'t-crimson'},cobalt:{n:'Cobalt',cls:'t-cobalt'},gold:{n:'Gold',cls:'t-gold'}},
  PRICE:{badge:4.99,border:2.99,tint:9.99,gloss:3.99,kit:2.99},
  FREE_SHIP:30, SHIP:3.95
};

/* ---------- plate renderer (shared by builder + garage) ---------- */
function splitReg(r){
  var t=(r||'').trim();
  if(t.indexOf(' ')>-1){var i=t.indexOf(' ');return [t.slice(0,i),t.slice(i+1)];}
  var h=Math.ceil(t.length/2);
  return [t.slice(0,h),t.slice(h)];
}
CG.plateHTML=function(face,st){
  var sz=CG.SIZES[st.size]||CG.SIZES.std, sy=CG.STYLES[st.style]||CG.STYLES.l4d;
  var bd=CG.BADGES[st.badge], bc=CG.BORDERS[st.border];
  var tint=(!st.legal&&CG.TINTS[st.tint])?CG.TINTS[st.tint]:null;
  var reg=(st.reg||'').toUpperCase()||'YOUR REG';
  var lines=sz.two?splitReg(reg):[reg];
  return '<div class="plate '+face+' '+sz.cls+' '+sy.cls+(tint?' tinted '+tint.cls:'')+'">'+
    '<span class="glare"></span>'+
    (bd?'<span class="badge" style="--bbg:'+bd.bg+'"><svg class="bflag" viewBox="0 0 60 36" aria-hidden="true"><use href="'+bd.f+'"/></svg><b>'+bd.t+'</b></span>':'')+
    '<span class="p-body">'+
      lines.map(function(l){return '<span class="p-line">'+(l||'&nbsp;')+'</span>'}).join('')+
      (st.legal?'<span class="p-strip">CAPS GOAT PLATES LTD · BS AU 145e</span>':'')+
    '</span>'+
    (bc?'<span class="p-border" style="--bc:'+bc+';inset:3.6%"></span>':'')+
  '</div>';
};
CG.fitPlates=function(root){
  $$('.plate',root||document).forEach(function(p){
    var h=p.clientHeight; if(!h) return;
    var lines=$$('.p-line',p); if(!lines.length) return;
    var fs=h*(lines.length>1?0.335:0.60);
    lines.forEach(function(l){l.style.fontSize=fs+'px'});
    var body=$('.p-body',p); if(!body) return;
    var avail=body.clientWidth*0.94, w=0;
    lines.forEach(function(l){w=Math.max(w,l.scrollWidth)});
    if(w>avail&&w>0){fs=fs*avail/w;lines.forEach(function(l){l.style.fontSize=fs+'px'});}
    var strip=$('.p-strip',p);
    if(strip){var s=Math.max(4,h*0.072);strip.style.fontSize=s+'px';strip.style.letterSpacing=(s*0.3)+'px';}
    var bg=$('.badge b',p); if(bg) bg.style.fontSize=Math.max(6,h*0.125)+'px';
  });
};
CG.calc=function(S){
  var qty=S.set==='pair'?2:1, rows=[], per=CG.STYLES[S.style].p;
  rows.push([CG.STYLES[S.style].n+' plate × '+qty, per*qty]);
  var szp=CG.SIZES[S.size].p;
  if(szp){rows.push([CG.SIZES[S.size].n+' cut × '+qty, szp*qty]);}
  per+=szp;
  if(S.badge!=='none'){rows.push([CG.BADGES[S.badge].t+' badge × '+qty, CG.PRICE.badge*qty]);per+=CG.PRICE.badge;}
  if(S.border!=='none'){rows.push(['Border × '+qty, CG.PRICE.border*qty]);per+=CG.PRICE.border;}
  if(!S.legal&&S.tint!=='none'){rows.push([CG.TINTS[S.tint].n+' tint × '+qty, CG.PRICE.tint*qty]);per+=CG.PRICE.tint;}
  if(S.gloss){rows.push(['Krystal gloss seal × '+qty, CG.PRICE.gloss*qty]);per+=CG.PRICE.gloss;}
  var total=per*qty, disc=0;
  if(S.set==='pair'){disc=total*0.10;rows.push(['Pair discount (10%)',-disc]);total-=disc;}
  if(S.kit){rows.push(['Fixing kit',CG.PRICE.kit]);total+=CG.PRICE.kit;}
  return {rows:rows,total:total,qty:qty};
};

/* ---------- persistent garage ---------- */
var KEY='cgp_garage_v1', cart=[];
try{var raw=localStorage.getItem(KEY); if(raw) cart=JSON.parse(raw)||[];}catch(e){cart=[];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart));}catch(e){}}
CG.add=function(item){cart.push(item);save();renderCart();openCart(true);};
CG.count=function(){return cart.reduce(function(a,b){return a+b.qty},0)};

var drawer=$('#drawer'), scrim=$('#scrim');
function openCart(o){
  if(!drawer)return;
  drawer.classList.toggle('open',o);
  scrim.classList.toggle('on',o);
  document.body.style.overflow=o?'hidden':'';
}
function desc(i){
  var b=[CG.SIZES[i.size].n, i.set==='pair'?'Front + rear':(i.set==='front'?'Front only':'Rear only')];
  if(i.badge!=='none')b.push(CG.BADGES[i.badge].t+' badge');
  if(i.border!=='none')b.push('Border');
  if(!i.legal&&i.tint!=='none')b.push(CG.TINTS[i.tint].n+' tint');
  if(i.gloss)b.push('Gloss seal');
  if(i.kit)b.push('Fixing kit');
  b.push(i.legal?'Road legal':'Show plate');
  return b.join(' · ');
}
function renderCart(){
  var c=$('#cartCount');
  if(c){var n=CG.count();c.textContent=n;c.classList.toggle('on',n>0);}
  var box=$('#cartItems'); if(!box) return;
  var empty=$('#dempty');
  $$('.citem',box).forEach(function(n){n.remove()});
  empty.classList.toggle('on',cart.length===0);
  $('#dfoot').style.display=cart.length?'':'none';
  var sub=0;
  cart.forEach(function(it,i){
    sub+=it.price*it.qty;
    var el=document.createElement('div');
    el.className='citem';
    el.innerHTML='<div class="mini">'+CG.plateHTML(it.set==='front'?'front':'rear',it)+'</div>'+
      '<div class="cmeta"><b>'+(it.reg||'').toUpperCase()+'</b><span>'+CG.STYLES[it.style].n+'</span><span>'+desc(it)+'</span></div>'+
      '<div class="cend"><b>'+gbp(it.price*it.qty)+'</b>'+
      '<div class="qty"><button data-a="-" data-i="'+i+'" aria-label="Decrease">−</button><span>'+it.qty+'</span><button data-a="+" data-i="'+i+'" aria-label="Increase">+</button></div>'+
      '<button class="rm" data-a="x" data-i="'+i+'">Remove</button></div>';
    box.insertBefore(el,empty);
  });
  CG.fitPlates(box);
  var ship=(sub>=CG.FREE_SHIP||sub===0)?0:CG.SHIP;
  $('#subVal').textContent=gbp(sub);
  $('#shipVal').textContent=ship?gbp(ship):'FREE';
  $('#grandVal').textContent=gbp(sub+ship);
}
if(drawer){
  var cb=$('#cartBtn'); if(cb) cb.onclick=function(){openCart(true)};
  $('#closeCart').onclick=function(){openCart(false)};
  scrim.onclick=function(){openCart(false)};
  var ec=$('#emptyCta'); if(ec) ec.onclick=function(){openCart(false)};
  $('#cartItems').addEventListener('click',function(e){
    var b=e.target.closest('[data-a]'); if(!b)return;
    var i=+b.dataset.i, a=b.dataset.a;
    if(a==='+')cart[i].qty++;
    else if(a==='-'){cart[i].qty--;if(cart[i].qty<1)cart.splice(i,1);}
    else cart.splice(i,1);
    save();renderCart();
  });
  var co=$('#checkoutBtn');
  if(co) co.onclick=function(){
    if(!cart.length)return;
    var n=CG.count();
    $('#modalSum').innerHTML='<b>'+n+'</b> build'+(n>1?'s':'')+' · <b>'+$('#grandVal').textContent+'</b> — ready for document verification.';
    openCart(false);$('#modal').classList.add('on');
  };
  var mc=$('#modalClose'); if(mc) mc.onclick=function(){$('#modal').classList.remove('on')};
  var md=$('#modal');
  if(md) md.addEventListener('click',function(e){if(e.target===md)md.classList.remove('on')});
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){openCart(false);var m=$('#modal');if(m)m.classList.remove('on');}
});
renderCart();

/* ---------- toast ---------- */
var tt;
CG.toast=function(m){
  var t=$('#toast'); if(!t)return;
  $('#toastMsg').textContent=m;
  t.classList.add('on');clearTimeout(tt);
  tt=setTimeout(function(){t.classList.remove('on')},2600);
};

/* ---------- mobile nav ---------- */
var burger=$('#burger'), mob=$('#mobnav');
if(burger&&mob){
  burger.addEventListener('click',function(){
    var o=!mob.classList.contains('open');
    mob.classList.toggle('open',o);
    burger.setAttribute('aria-expanded',o);
  });
}

/* ---------- tilt ---------- */
CG.tilt=function(zoneSel,targetSel,max){
  var z=$(zoneSel), t=$(targetSel);
  if(!z||!t)return;
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  if(window.matchMedia('(hover:none)').matches)return;
  z.addEventListener('mousemove',function(e){
    var r=z.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    t.style.transform='rotateY('+(x*max)+'deg) rotateX('+(-y*max*0.62)+'deg)';
  });
  z.addEventListener('mouseleave',function(){t.style.transform=''});
};

/* ---------- mount: view init, safe to re-run after content changes ---------- */
CG.mount=function(){

/* ---------- faq accordion ---------- */
$$('.qa .q').forEach(function(q){
  q.addEventListener('click',function(){
    var qa=q.parentElement, open=qa.classList.contains('open');
    $$('.qa').forEach(function(x){x.classList.remove('open');$('.aa',x).style.maxHeight=null;});
    if(!open){qa.classList.add('open');$('.aa',qa).style.maxHeight=$('.aa',qa).scrollHeight+'px';}
  });
});

/* ---------- reveals ---------- */
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('rv');io.unobserve(e.target);}});
  },{threshold:.1,rootMargin:'0px 0px -6%'});
  $$('[data-rev]').forEach(function(el,i){el.style.transitionDelay=(i%4)*70+'ms';io.observe(el);});
}else{
  $$('[data-rev]').forEach(function(el){el.classList.add('rv')});
}

/* ---------- marquee + reviews (only where present) ---------- */
var mq=$('#mq1');
if(mq){
  var words=['The Greatest Of All Plates','4D Laser Cut','Pressed In Britain','BS AU 145e','3D Gel','24 Hour Dispatch','Your Plate Your Signature','GOAT Guarantee'];
  mq.innerHTML=[0,1].map(function(){
    return words.map(function(w,i){return '<span class="'+(i%2?'mo':'mi')+'">'+w+'</span>'}).join('');
  }).join('');
}
var rt=$('#revTrack');
if(rt){
  var revs=[
    ['Ordered Friday, on the car Monday. The 4D gel has proper depth to it — my mate has already asked where I got them.','Danny R.','M4 GOAT'],
    ['The live preview is the reason I bought here. Every other builder made me guess what I was getting.','Priya S.','P12 RYA'],
    ['Sent the wrong V5C by mistake and they sorted it over email in ten minutes. Plates were perfect.','Tom H.','T80 MMY'],
    ['Two winters in and they look brand new. No fade, no lifted letters, nothing.','Marcus O.','MO24 CUS'],
    ['Square 4×4 plates for the Defender — cut exactly right, no drilling drama.','Ellie W.','EW71 DEF'],
    ['Cheapest was not the point. These feel like a proper product, not a printout.','Sam K.','S4 MKY']
  ];
  rt.innerHTML=[0,1].map(function(){
    return revs.map(function(r){
      return '<div class="rcard"><div class="rstars">'+
        new Array(6).join('<svg aria-hidden="true"><use href="#i-star"/></svg>')+
        '</div><p>'+r[0]+'</p><div class="rfoot"><span>'+r[1]+'</span><span class="rchip">'+r[2]+'</span></div></div>';
    }).join('');
  }).join('');
}

/* ---------- hero plate (home page) ---------- */
var hp=$('#heroPlate');
if(hp){
  hp.innerHTML=CG.plateHTML('rear',{reg:'GO26 OAT',size:'std',style:'g4d',badge:'uk',border:'none',tint:'none',legal:true});
}

/* ---------- demo plates on content pages ---------- */
$$('[data-plate]').forEach(function(el){
  var cfg={};
  try{cfg=JSON.parse(el.getAttribute('data-plate'))}catch(e){}
  var face=cfg.face||'rear';
  el.innerHTML=CG.plateHTML(face,{
    reg:cfg.reg||'GO26 OAT',size:cfg.size||'std',style:cfg.style||'l4d',
    badge:cfg.badge||'none',border:cfg.border||'none',tint:cfg.tint||'none',
    legal:cfg.legal===false?false:true
  });
});

CG.fitPlates();
CG.tilt('#heroStage','#heroTilt',17);
};

/* ---------- boot ---------- */
CG.mount();
window.addEventListener('resize',function(){CG.fitPlates()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){CG.fitPlates()});
setTimeout(function(){CG.fitPlates()},350);
CG.renderCart=renderCart;
window.CG=CG;
})();
