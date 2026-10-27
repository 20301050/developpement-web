/* Formulaire de contact : envoi direct (sans ouvrir de messagerie) via l'API AJAX de FormSubmit,
   puis redirection vers la page « Merci ». L'envoi HTML classique ne livrait pas les messages. */
(function(){
var form=document.getElementById("devis");
if(!form||!window.fetch)return;
var L=(document.documentElement.lang||"fr").slice(0,2);
var T={
 fr:{sending:"Envoi en cours…",err:"Le message n'a pas pu partir. Réessayez, ou écrivez-moi directement à "},
 pl:{sending:"Wysyłanie…",err:"Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz bezpośrednio na "},
 en:{sending:"Sending…",err:"Your message could not be sent. Please try again, or email me directly at "}
}[L]||{sending:"Envoi en cours…",err:"Le message n'a pas pu partir. Écrivez-moi à "};
var TO="gochakicia80@gmail.com";
form.addEventListener("submit",function(e){
 e.preventDefault();
 if(form.checkValidity&&!form.checkValidity()){form.reportValidity&&form.reportValidity();return;}
 var data={},next="";
 Array.prototype.forEach.call(form.elements,function(el){
  if(!el.name||el.type==="submit")return;
  if(el.name==="_next"){next=el.value;return;}
  data[el.name]=el.value;
 });
 if(data._honey){return;}
 delete data._honey;
 var btn=form.querySelector("button[type=submit]"),label=btn?btn.textContent:"";
 if(btn){btn.disabled=true;btn.textContent=T.sending;}
 fetch("https://formsubmit.co/ajax/"+TO,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(data)})
 .then(function(r){return r.json();})
 .then(function(j){
  if(j&&(j.success===true||j.success==="true")){window.location.href=next||"merci.html";}
  else{throw new Error((j&&j.message)||"error");}
 })
 .catch(function(){
  if(btn){btn.disabled=false;btn.textContent=label;}
  var msg=form.querySelector(".form-err");
  if(!msg){msg=document.createElement("p");msg.className="note form-err";msg.setAttribute("role","alert");msg.style.fontWeight="600";form.appendChild(msg);}
  msg.innerHTML="";msg.appendChild(document.createTextNode(T.err));
  var a=document.createElement("a");a.href="mailto:"+TO;a.textContent=TO;msg.appendChild(a);msg.appendChild(document.createTextNode("."));
 });
});
})();
