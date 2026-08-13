/* ================================================================
   CAPS GOAT PLATES LTD — builder.js
   Loaded ONLY on /builder.html. Depends on site.js (window.CG).
   ================================================================ */
(function(){
"use strict";
if(!window.CG) return;
var CG=window.CG;
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var gbp=function(n){return '£'+Number(n).toFixed(2)};

var S={reg:'GO26 OAT',set:'pair',size:'std',style:'l4d',badge:'none',border:'none',
        tint:'none',gloss:false,kit:false,legal:true,view:'both'};

/* deep link: builder.html?style=g4d&size=sq&reg=MY+REG */
(function(){
  var q=new URLSearchParams(location.search);
  if(q.get('style')&&CG.STYLES[q.get('style')]) S.style=q.get('style');
  if(q.get('size')&&CG.SIZES[q.get('size')])    S.size=q.get('size');
  if(q.get('reg'))  S.reg=q.get('reg').toUpperCase().replace(/[^A-Z0-9 ]/g,'').slice(0,8);
  if(q.get('mode')==='show') S.legal=false;
})();

var pwF=$('#pwF'), pwR=$('#pwR');

function renderStage(){
  pwF.innerHTML='<span class="ptag">Front</span>'+CG.plateHTML('front',S);
  pwR.innerHTML='<span class="ptag">Rear</span>'+CG.plateHTML('rear',S);
  var v=S.view;
  var showF=(S.set!=='rear')&&(v==='both'||v==='front');
  var showR=(S.set!=='front')&&(v==='both'||v==='rear');
  pwF.classList.toggle('hide',v==='rear');
  pwR.classList.toggle('hide',v==='front');
  pwF.classList.toggle('off',!showF);
  pwR.classList.toggle('off',!showR);
  $('#dimsL').textContent=CG.SIZES[S.size].d;
  $('#dimsR').innerHTML='<b>'+CG.STYLES[S.style].n+'</b> · '+(S.legal?'Road Legal':'Show Plate');
  $('#showFlag').classList.toggle('on',!S.legal);
  CG.fitPlates();
}
function renderPrice(){
  var c=CG.calc(S);
  $('#priceRows').innerHTML=c.rows.map(function(r){
    return '<div class="prow'+(r[1]<0?' pneg':'')+'"><span>'+r[0]+'</span><b>'+(r[1]<0?'−'+gbp(-r[1]):gbp(r[1]))+'</b></div>';
  }).join('');
  $('#totalVal').textContent=gbp(c.total);
}
function render(){renderStage();renderPrice();}

function group(sel,key,after){
  var g=$(sel); if(!g)return;
  g.addEventListener('click',function(e){
    var b=e.target.closest('.opt,.dot');
    if(!b||b.classList.contains('locked'))return;
    $$('.opt,.dot',g).forEach(function(x){x.classList.remove('sel')});
    b.classList.add('sel');
    S[key]=b.dataset[key];
    if(after)after();
    render();
  });
}
group('#grpSet','set');
group('#grpSize','size',function(){
  $('#sizeHint').textContent=CG.SIZES[S.size].two
    ? 'Two-line layout — we set the legal line break for you.'
    : 'Standard fits almost every UK car.';
});
group('#grpStyle','style');
group('#grpBadge','badge');
group('#grpBorder','border');
group('#grpTint','tint');

var reg=$('#regInput');
reg.value=S.reg;
reg.addEventListener('input',function(){
  var v=reg.value.toUpperCase().replace(/[^A-Z0-9 ]/g,'').replace(/\s{2,}/g,' ');
  if(v.replace(/ /g,'').length>7){
    var out='',n=0;
    for(var i=0;i<v.length;i++){
      var ch=v[i];
      if(ch===' '){out+=ch;continue;}
      if(n<7){out+=ch;n++;}
    }
    v=out;
  }
  reg.value=v;S.reg=v;
  $('#regCount').textContent=v.replace(/ /g,'').length+' / 7 characters';
  render();
});

function toggle(id,key){
  var el=$(id); if(!el)return;
  el.addEventListener('click',function(){
    S[key]=!S[key];
    el.classList.toggle('on',S[key]);
    el.setAttribute('aria-checked',S[key]);
    renderPrice();
  });
}
toggle('#kitTog','kit');
toggle('#glossTog','gloss');

var sw=$('#labLegal');
sw.addEventListener('click',function(e){
  var b=e.target.closest('button[data-legal]'); if(!b)return;
  S.legal=b.dataset.legal==='1';
  $$('button',sw).forEach(function(x){
    x.classList.toggle('on',x===b);
    x.setAttribute('aria-selected',x===b);
  });
  sw.classList.toggle('show',!S.legal);
  $('#legalHint').textContent=S.legal
    ? 'BS AU 145e compliant — fine to drive on UK roads.'
    : 'Off-road, events and display only. Not legal on the highway.';
  $('#tintHint').innerHTML=S.legal
    ? 'Gel tints are <b>show-plate only</b> — flip the Lab to Show mode to unlock. +£9.99 per plate.'
    : 'Tints unlocked. <b>Show use only</b> — never on a public road. +£9.99 per plate.';
  $$('#grpTint .dot').forEach(function(d){
    if(d.dataset.tint!=='none') d.classList.toggle('locked',S.legal);
  });
  if(S.legal&&S.tint!=='none'){
    S.tint='none';
    $$('#grpTint .dot').forEach(function(d){d.classList.toggle('sel',d.dataset.tint==='none')});
  }
  render();
});

$$('.vchip').forEach(function(c){
  c.addEventListener('click',function(){
    $$('.vchip').forEach(function(x){x.classList.remove('on')});
    c.classList.add('on');
    S.view=c.dataset.view;
    renderStage();
  });
});

$('#addBtn').onclick=function(){
  if(!S.reg.replace(/ /g,'')){CG.toast('Enter your registration first');reg.focus();return;}
  var item={};
  for(var k in S) item[k]=S[k];
  item.price=CG.calc(S).total;
  item.qty=1;
  CG.add(item);
  CG.toast(S.reg.toUpperCase()+' added to your garage');
};

/* reflect deep-linked state in the controls */
function syncUI(){
  $$('#grpStyle .opt').forEach(function(o){o.classList.toggle('sel',o.dataset.style===S.style)});
  $$('#grpSize .opt').forEach(function(o){o.classList.toggle('sel',o.dataset.size===S.size)});
  $('#regCount').textContent=S.reg.replace(/ /g,'').length+' / 7 characters';
  if(!S.legal){
    $$('#labLegal button').forEach(function(x){
      var on=x.dataset.legal==='0';
      x.classList.toggle('on',on);x.setAttribute('aria-selected',on);
    });
    $('#labLegal').classList.add('show');
    $$('#grpTint .dot').forEach(function(d){d.classList.remove('locked')});
    $('#legalHint').textContent='Off-road, events and display only. Not legal on the highway.';
  }
  $('#sizeHint').textContent=CG.SIZES[S.size].two
    ? 'Two-line layout — we set the legal line break for you.'
    : 'Standard fits almost every UK car.';
}
syncUI();
render();
CG.tilt('#stage','#tiltbox',11);
})();
