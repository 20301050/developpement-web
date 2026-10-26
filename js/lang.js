/* Langue : chaque langue a ses propres pages (/, /pl/, /en/).
   Ce script traduit seulement le libellé du bouton menu, changé par main.js. */
(function(){
var L=document.documentElement.lang;
var T={pl:{"Ouvrir le menu":"Otwórz menu","Fermer le menu":"Zamknij menu"},en:{"Ouvrir le menu":"Open menu","Fermer le menu":"Close menu"}}[L];
var b=document.querySelector(".burger");
if(!T||!b)return;
function fix(){var v=b.getAttribute("aria-label"),t=T[v];if(t)b.setAttribute("aria-label",t);}
new MutationObserver(fix).observe(b,{attributes:true,attributeFilter:["aria-label"]});
fix();
})();
