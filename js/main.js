document.addEventListener("DOMContentLoaded",function(){var r=document.getElementById("mq");if(!r)return;
r.querySelectorAll(".mq-tab").forEach(function(b){b.addEventListener("click",function(){var i=b.dataset.i;r.querySelectorAll(".mq-tab").forEach(function(x){x.classList.toggle("on",x===b)});r.querySelectorAll(".mq-img").forEach(function(im){im.classList.toggle("on",im.dataset.i===i)});r.querySelectorAll(".mq-scroll").forEach(function(sc){sc.scrollTop=0})})});
r.querySelectorAll(".mq-d").forEach(function(b){b.addEventListener("click",function(){r.querySelectorAll(".mq-d").forEach(function(x){x.classList.toggle("on",x===b)});r.querySelector(".mq-desk").classList.toggle("on",b.dataset.d==="desk");r.querySelector(".mq-mob").classList.toggle("on",b.dataset.d==="mob")})});});
document.addEventListener("DOMContentLoaded",function(){var r=document.getElementById("md");if(!r)return;var i=0,t;
function go(n){i=n;r.querySelectorAll(".md-step").forEach(function(x){x.classList.toggle("on",+x.dataset.i===n)});r.querySelectorAll(".md-img").forEach(function(x){x.classList.toggle("on",+x.dataset.i===n)});}
function auto(){clearInterval(t);t=setInterval(function(){go((i+1)%6)},3500);}
r.querySelectorAll(".md-step").forEach(function(b){b.addEventListener("click",function(){go(+b.dataset.i);auto();})});
if(!matchMedia("(prefers-reduced-motion: reduce)").matches)auto();});

(function(){
  var pre=document.querySelector(".typer"),box=document.querySelector(".screens");if(!pre||!box)return;
  var L=[[["b","<header "],["","class="],["u","\"hero\""],["b",">"]],
    [["","  "],["b","<h1>"],["","Malgorzata K."],["b","</h1>"]],
    [["","  "],["b","<nav>"]],
    [["","    "],["b","<a "],["","href="],["u","\"#projets\""],["b",">"],["","Projets"],["b","</a>"]],
    [["","  "],["b","</nav>"]],
    [["b","</header>"]],
    [["b","<meta "],["","name="],["u","\"description\""]],
    [["","  content="],["u","\"Chef de projet"]],
    [["u","  digital · UI/UX\""],["b",">"]]];
  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function render(n){var out="",c=0;
    for(var i=0;i<L.length;i++){for(var j=0;j<L[i].length;j++){var tk=L[i][j],txt=tk[1];
      if(c>=n)return out+"<span class=\"cur\"></span>";var take=Math.min(txt.length,n-c);c+=take;
      var s=esc(txt.slice(0,take));out+=tk[0]?"<"+tk[0]+">"+s+"</"+tk[0]+">":s;
      if(take<txt.length)return out+"<span class=\"cur\"></span>";}
      out+="\n";}
    return out+"<span class=\"cur\"></span>";}
  var total=L.reduce(function(a,l){return a+l.reduce(function(b,t){return b+t[1].length;},0);},0);
  if(reduce){pre.innerHTML=render(total);box.classList.add("run");return;}
  function cycle(){box.classList.remove("run");void box.offsetWidth;box.classList.add("run");
    var n=0;pre.innerHTML=render(0);
    var iv=setInterval(function(){n+=1;pre.innerHTML=render(n);if(n>=total){clearInterval(iv);setTimeout(cycle,3500);}},45);}
  cycle();
})();


(function(){
  var nav=document.querySelector("nav.top"),b=nav&&nav.querySelector(".burger");if(!b)return;
  function set(o){nav.classList.toggle("open",o);b.setAttribute("aria-expanded",o?"true":"false");b.setAttribute("aria-label",o?"Fermer le menu":"Ouvrir le menu");}
  b.addEventListener("click",function(){set(!nav.classList.contains("open"));});
  nav.querySelectorAll("ul a").forEach(function(a){a.addEventListener("click",function(){set(false);});});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&nav.classList.contains("open")){set(false);b.focus();}});
})();


(function(){
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SEL=".proj,.vm-bcard,.bridge>div,.box,.vm-skills li,.skill,.btn,.vm-tile,.vm-card";
  document.addEventListener("click",function(e){
    var el=e.target.closest&&e.target.closest(SEL);if(!el||reduce)return;
    var r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,d=Math.max(r.width,r.height)*2.4;
    [["zap",d],["zap ring",d*.9]].forEach(function(c,i){var s=document.createElement("span");s.className=c[0];s.style.left=x+"px";s.style.top=y+"px";s.style.width=s.style.height=c[1]+"px";if(i)s.style.animationDelay=".08s";el.appendChild(s);setTimeout(function(){s.remove();},800);});
    el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");setTimeout(function(){el.classList.remove("flash");},500);
    var a=el.tagName==="A"?el:null,href=a&&a.getAttribute("href");
    if(href&&href.charAt(0)==="#"&&href.length>1&&!e.metaKey&&!e.ctrlKey){e.preventDefault();setTimeout(function(){location.hash=href;},330);}
  },true);
})();


(function(){var r=document.getElementById("ba-slider");if(!r)return;var i=r.querySelector("input");
function set(){r.style.setProperty("--pos",i.value+"%");}i.addEventListener("input",set);set();})();
