/* Formulaire de contact : ouvre la messagerie du visiteur avec la demande déjà remplie,
   adressée à gochakicia80@gmail.com (remplace l'envoi par FormSubmit, qui ne livrait pas). */
(function(){
var TO="gochakicia80@gmail.com";
var form=document.getElementById("devis");
if(!form)return;
var L=(document.documentElement.lang||"fr").slice(0,2);
var T={
 fr:{subject:"Demande de devis depuis gocha-web.com",ok:"Votre messagerie s'ouvre avec votre demande déjà remplie : il ne vous reste qu'à cliquer sur « Envoyer ». Rien ne s'ouvre ? Écrivez-moi directement à "},
 pl:{subject:"Zapytanie ze strony gocha-web.com",ok:"Otwiera się Twoja poczta z gotową wiadomością: wystarczy kliknąć „Wyślij”. Nic się nie otworzyło? Napisz bezpośrednio na "},
 en:{subject:"Request from gocha-web.com",ok:"Your email app is opening with your request already filled in: just click “Send”. Nothing opened? Email me directly at "}
}[L]||null;
if(!T)T={subject:"Demande depuis gocha-web.com",ok:"Écrivez-moi à "};
form.addEventListener("submit",function(e){
 e.preventDefault();
 if(form.checkValidity&&!form.checkValidity()){form.reportValidity&&form.reportValidity();return;}
 var lines=[];
 Array.prototype.forEach.call(form.elements,function(el){
  if(!el.name||el.name.charAt(0)==="_"||el.type==="hidden"||el.type==="submit")return;
  var v=(el.value||"").trim();if(!v)return;
  var lab=el.closest("label"),name=el.name;
  if(lab){var t=lab.firstChild;if(t&&t.nodeType===3&&t.textContent.trim())name=t.textContent.trim();}
  lines.push(name+" : "+v);
 });
 var url="mailto:"+TO+"?subject="+encodeURIComponent(T.subject)+"&body="+encodeURIComponent(lines.join("\n\n"));
 window.location.href=url;
 var msg=form.querySelector(".mail-ok");
 if(!msg){msg=document.createElement("p");msg.className="note mail-ok";msg.setAttribute("role","status");msg.style.fontWeight="600";form.appendChild(msg);}
 msg.innerHTML="";msg.appendChild(document.createTextNode(T.ok));
 var a=document.createElement("a");a.href="mailto:"+TO;a.textContent=TO;msg.appendChild(a);msg.appendChild(document.createTextNode("."));
});
})();
