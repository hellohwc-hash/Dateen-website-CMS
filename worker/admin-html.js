export const ADMIN_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Dateen CMS</title>
<style>
  :root{--red:#e40420}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f3f1;color:#1a1a1a;font-size:14px}
  header{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid #e3e1dd;display:flex;align-items:center;gap:16px;padding:12px 20px}
  header b{color:var(--red);font-size:18px;letter-spacing:-.02em}
  header .sp{flex:1}
  header a{color:#888;text-decoration:none;font-size:13px}
  button{font:inherit;cursor:pointer;border:0;border-radius:7px;padding:9px 16px;font-weight:600}
  .save{background:var(--red);color:#fff}
  .save:hover{background:#c40018}
  .ghost{background:#eee;color:#333}
  .wrap{max-width:860px;margin:0 auto;padding:22px 20px 80px}
  .card{background:#fff;border:1px solid #e3e1dd;border-radius:12px;padding:20px;margin-bottom:18px}
  .card h2{margin:0 0 14px;font-size:15px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}
  @media(max-width:620px){.grid{grid-template-columns:1fr}}
  label{display:block;font-size:12px;color:#777;margin:0 0 4px}
  input[type=text]{width:100%;padding:9px 10px;border:1px solid #d6d4d0;border-radius:7px;font:inherit;background:#fafafa}
  input:focus{outline:none;border-color:var(--red)}
  .imgrow{display:flex;align-items:center;gap:12px;margin:10px 0;padding:10px;border:1px solid #eee;border-radius:9px}
  .imgrow img{width:90px;height:60px;object-fit:cover;border-radius:5px;background:#eee;flex-shrink:0}
  .imgrow .nm{flex:1;font-size:13px}
  .listrow{display:flex;gap:8px;margin:6px 0}
  .listrow input{flex:1}
  .listrow button,.galrow button{background:#f2d4d4;color:#b00;padding:7px 11px}
  .galrow{display:grid;grid-template-columns:90px 1fr 1fr auto;gap:8px;align-items:center;margin:8px 0;padding:8px;border:1px solid #eee;border-radius:9px}
  .galrow img{width:90px;height:60px;object-fit:cover;border-radius:5px;background:#eee;cursor:pointer}
  .add{background:#e8f3e4;color:#2a7;margin-top:8px}
  #msg{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:11px 20px;border-radius:8px;font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none}
  #msg.show{opacity:1}
  .note{font-size:12px;color:#999;margin-top:6px}
</style></head>
<body>
<header><b>Dateen CMS</b><span id="who" style="font-size:12px;color:#999"></span><span class="sp"></span>
  <button class="save" id="saveBtn">Save all changes</button></header>
<div class="wrap" id="app">Loading…</div>
<div id="msg"></div>
<script>
var C=null,A=[],BOOT=[];
function msg(t){var m=document.getElementById("msg");m.textContent=t;m.classList.add("show");clearTimeout(m._t);m._t=setTimeout(function(){m.classList.remove("show")},2600)}
function h(tag,props,kids){var e=document.createElement(tag);if(props)for(var k in props){if(k==="class")e.className=props[k];else if(k==="html")e.innerHTML=props[k];else e.setAttribute(k,props[k])}(kids||[]).forEach(function(c){e.appendChild(typeof c==="string"?document.createTextNode(c):c)});return e}
function card(title,kids){return h("div",{class:"card"},[h("h2",null,[title])].concat(kids))}
function textField(label,getv,setv){var inp=h("input",{type:"text"});inp.value=getv()||"";inp.oninput=function(){setv(inp.value)};return h("div",null,[h("label",null,[label]),inp])}

function uploadImage(file,cb){
  fetch("/api/media?name="+encodeURIComponent(file.name),{method:"POST",headers:{"content-type":file.type||"application/octet-stream"},body:file})
  .then(function(r){return r.json()}).then(function(d){if(d.ok){cb(d.url)}else{msg(d.error||"Upload failed")}}).catch(function(){msg("Upload failed")})
}
function pickImage(cb){var i=h("input",{type:"file",accept:"image/*"});i.style.display="none";document.body.appendChild(i);i.onchange=function(){if(i.files[0]){msg("Uploading…");uploadImage(i.files[0],cb)}document.body.removeChild(i)};i.click()}

function imgField(label,getv,setv){
  var img=h("img",{src:getv()||""});
  var btn=h("button",{class:"ghost"},["Upload new"]);
  btn.onclick=function(){pickImage(function(url){setv(url);img.src=url;msg("Image uploaded — remember to Save")})};
  return h("div",{class:"imgrow"},[img,h("div",{class:"nm"},[label]),btn]);
}

function listEditor(arr){
  var box=h("div");
  function row(i){
    var inp=h("input",{type:"text"});inp.value=arr[i]||"";inp.oninput=function(){arr[i]=inp.value};
    var del=h("button",null,["×"]);del.onclick=function(){arr.splice(i,1);redraw()};
    return h("div",{class:"listrow"},[inp,del]);
  }
  function redraw(){box.innerHTML="";for(var i=0;i<arr.length;i++)box.appendChild(row(i));var add=h("button",{class:"add"},["+ Add"]);add.onclick=function(){arr.push("");redraw()};box.appendChild(add)}
  redraw();return box;
}

function galleryEditor(){
  var box=h("div");
  function row(i){
    var g=C.gallery[i];
    var img=h("img",{src:g.image||""});img.onclick=function(){pickImage(function(url){g.image=url;img.src=url;msg("Image uploaded — remember to Save")})};
    var cap=h("input",{type:"text"});cap.value=g.caption||"";cap.placeholder="Caption";cap.oninput=function(){g.caption=cap.value};
    var tag=h("input",{type:"text"});tag.value=g.tag||"";tag.placeholder="Tag (italic)";tag.oninput=function(){g.tag=tag.value};
    var del=h("button",null,["×"]);del.onclick=function(){C.gallery.splice(i,1);redraw()};
    return h("div",{class:"galrow"},[img,cap,tag,del]);
  }
  function redraw(){box.innerHTML="";for(var i=0;i<C.gallery.length;i++)box.appendChild(row(i));var add=h("button",{class:"add"},["+ Add photo"]);add.onclick=function(){C.gallery.push({image:"",caption:"",tag:""});redraw()};box.appendChild(add)}
  redraw();return box;
}

var PRICE=[["bentoFrom","Bento from (RM)"],["valueMeal","Value meal (RM)"],["vegBento","Vegetarian bento (RM)"],["coldbrewAmericano","Cold Brew Americano (RM)"],["coldbrewLatte","Cold Brew Latte (RM)"],["bungkusReseller","Bungkus reseller each (RM)"],["cateringFullDayA","Catering Full Day A (RM/pax)"],["cateringFullDayB","Catering Full Day B (RM/pax)"],["cateringFullDayC","Catering Full Day C Western (RM/pax)"],["cateringLunchLocal","Lunch&Dinner Local from (RM/pax)"],["cateringLunchWestern","Lunch&Dinner Western from (RM/pax)"],["cateringTeaLocal","Tea Break Local from (RM/pax)"],["cateringTeaWestern","Tea Break Western from (RM/pax)"]];
var BAN=[["catering","Catering Service banner"],["bento","Bento Menu banner"],["bungkus","Bungkus Supply banner"],["vegetarian","Vegetarian Catering banner"],["coldbrew","Cold Brew visual"]];

function render(){
  var app=document.getElementById("app");app.innerHTML="";
  // contact
  var cg=h("div",{class:"grid"});
  [["phone","Phone (display)"],["phoneIntl","Phone (international)"],["whatsapp","WhatsApp number (digits)"],["email","Email"]].forEach(function(f){
    cg.appendChild(textField(f[1],function(){return C[f[0]]},function(v){C[f[0]]=v}));
  });
  app.appendChild(card("Contact",[cg]));
  // banners
  var bk=BAN.map(function(f){return imgField(f[1],function(){return C.banners[f[0]]},function(v){C.banners[f[0]]=v})});
  app.appendChild(card("Page Banners",bk.concat([h("div",{class:"note"},["Tip: upload images already sized for web (under ~1MB) for a fast site."])])));
  // prices
  var pg=h("div",{class:"grid"});
  PRICE.forEach(function(f){pg.appendChild(textField(f[1],function(){return C.prices[f[0]]},function(v){C.prices[f[0]]=v}))});
  app.appendChild(card("Prices",[pg]));
  // clients
  app.appendChild(card("Clients — Trusted-by band (homepage top)",[listEditor(C.clientsTrusted)]));
  app.appendChild(card("Clients — Full wall",[listEditor(C.clientsWall)]));
  // gallery
  app.appendChild(card("Catering Gallery",[galleryEditor()]));
  // team access
  var bootNote=BOOT.length?h("div",{class:"note"},["Owner (always allowed, set in Cloudflare): "+BOOT.join(", ")]):h("div");
  app.appendChild(card("Team Access — who can log in (Lark email)",[listEditor(A),bootNote]));
}

function save(){
  document.getElementById("saveBtn").disabled=true;
  Promise.all([
    fetch("/api/content",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(C)}).then(function(r){return r.json()}),
    fetch("/api/access",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({allowedEmails:A})}).then(function(r){return r.json()})
  ]).then(function(res){document.getElementById("saveBtn").disabled=false;msg((res[0].ok&&res[1].ok)?"Saved ✓  Live on the site in under a minute.":"Error saving")})
  .catch(function(){document.getElementById("saveBtn").disabled=false;msg("Save failed")})
}
document.getElementById("saveBtn").onclick=save;

Promise.all([
  fetch("/api/content").then(function(r){return r.json()}),
  fetch("/api/access").then(function(r){return r.json()})
]).then(function(res){
  var d=res[0],a=res[1];
  if(!d.ok){document.getElementById("app").textContent="Not authorised.";return}
  C=d.content;A=(a.access&&a.access.allowedEmails)||[];BOOT=a.bootstrap||[];
  document.getElementById("who").textContent=d.email;render();
}).catch(function(){document.getElementById("app").textContent="Failed to load."});
</script>
</body></html>`;
