// Admin UI (served at /admin). Plain JS, no build step.
// NOTE: this whole file is one template literal — do not use backticks, "${" or backslashes inside.
export const ADMIN_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Dateen CMS</title>
<style>
  :root{--red:#e40420;--line:#e3e1dd}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f3f1;color:#1a1a1a;font-size:14px}
  header{position:sticky;top:0;z-index:20;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px;padding:10px 18px;height:56px}
  header b.logo{color:var(--red);font-size:18px;letter-spacing:-.02em}
  header .sp{flex:1}
  #who{font-size:12px;color:#999}
  #dirty{font-size:12px;color:#b86e00;display:none}
  #search{width:240px;padding:8px 10px;border:1px solid #d6d4d0;border-radius:7px;font:inherit;background:#fafafa}
  button{font:inherit;cursor:pointer;border:0;border-radius:7px;padding:9px 16px;font-weight:600}
  .save{background:var(--red);color:#fff}.save:hover{background:#c40018}.save:disabled{opacity:.5}
  .ghost{background:#eee;color:#333}
  .layout{display:flex;min-height:calc(100vh - 56px)}
  aside{width:230px;flex-shrink:0;background:#fff;border-right:1px solid var(--line);padding:14px 10px;position:sticky;top:56px;height:calc(100vh - 56px);overflow:auto}
  aside .grp{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#aaa;margin:14px 10px 6px}
  aside a{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:8px;color:#333;text-decoration:none;cursor:pointer;font-weight:500}
  aside a:hover{background:#f4f3f1}
  aside a.on{background:#fde8ea;color:var(--red)}
  aside a .cnt{margin-left:auto;font-size:11px;background:#fde8ea;color:var(--red);border-radius:10px;padding:1px 7px}
  aside a.on .cnt{background:#fff}
  main{flex:1;min-width:0}
  .wrap{max-width:900px;margin:0 auto;padding:22px 22px 90px}
  .ptitle{display:flex;align-items:baseline;gap:14px;margin:0 0 4px}
  .ptitle h1{margin:0;font-size:22px}
  .ptitle a{color:var(--red);text-decoration:none;font-size:13px}
  .psub{color:#888;margin:0 0 18px;font-size:13px}
  .card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin-bottom:16px}
  .card h2{margin:0 0 14px;font-size:15px}
  .card h2 small{font-weight:400;color:#999;font-size:12px;margin-left:6px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}
  label{display:block;font-size:12px;color:#777;margin:0 0 4px}
  input[type=text]{width:100%;padding:9px 10px;border:1px solid #d6d4d0;border-radius:7px;font:inherit;background:#fafafa}
  textarea{width:100%;padding:8px 10px;border:1px solid #d6d4d0;border-radius:7px;font:inherit;background:#fafafa;resize:vertical;min-height:38px;line-height:1.45;overflow:hidden}
  input:focus,textarea:focus{outline:none;border-color:var(--red);background:#fff}
  .tgrid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}
  .tgrid .tf.wide{grid-column:1/-1}
  .tf{margin:0 0 12px;padding-left:10px;border-left:3px solid transparent}
  .tf.chg{border-left-color:var(--red)}
  .tf .top{display:flex;align-items:center;gap:8px}
  .tf .top label{margin:0}
  .tf .rs{margin-left:auto;background:none;color:var(--red);padding:0;font-size:12px;font-weight:500;display:none}
  .tf.chg .rs{display:inline}
  .tf .was{font-size:11px;color:#aaa;margin-top:3px;display:none}
  .tf.chg .was{display:block}
  .help{background:#fff8e6;border:1px solid #f3e1b0;border-radius:10px;padding:10px 14px;font-size:12.5px;color:#7a5b00;margin-bottom:16px;line-height:1.6}
  .help code{background:#fff;border:1px solid #f0dca6;border-radius:4px;padding:0 5px}
  .imgrow{display:flex;align-items:center;gap:12px;margin:10px 0;padding:10px;border:1px solid #eee;border-radius:9px}
  .imgrow img{width:90px;height:60px;object-fit:cover;border-radius:5px;background:#eee;flex-shrink:0}
  .imgrow .nm{flex:1;font-size:13px}
  .listrow{display:flex;gap:8px;margin:6px 0}.listrow input{flex:1}
  .listrow button,.galrow button{background:#f2d4d4;color:#b00;padding:7px 11px}
  .galrow{display:grid;grid-template-columns:90px 1fr 1fr auto;gap:8px;align-items:center;margin:8px 0;padding:8px;border:1px solid #eee;border-radius:9px}
  .galrow img{width:90px;height:60px;object-fit:cover;border-radius:5px;background:#eee;cursor:pointer}
  .add{background:#e8f3e4;color:#2a7;margin-top:8px}
  .note{font-size:12px;color:#999;margin-top:6px}
  .empty{color:#999;padding:30px;text-align:center}
  .hit{font-size:11px;color:var(--red);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
  #msg{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:11px 20px;border-radius:8px;font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:50}
  #msg.show{opacity:1}
  @media(max-width:760px){
    header{height:auto;flex-wrap:wrap}#search{width:100%;order:9}
    .layout{display:block}
    aside{position:static;width:auto;height:auto;display:flex;overflow-x:auto;padding:8px;border-right:0;border-bottom:1px solid var(--line)}
    aside .grp{display:none}aside a{white-space:nowrap}
    .grid,.tgrid{grid-template-columns:1fr}.wrap{padding:16px 14px 80px}
  }
</style></head>
<body>
<header><b class="logo">Dateen CMS</b><span id="who"></span><span class="sp"></span>
  <span id="dirty">● Unsaved changes</span>
  <input id="search" type="search" placeholder="Search any text on the site…">
  <button class="save" id="saveBtn">Save all changes</button></header>
<div class="layout"><aside id="nav"></aside><main><div class="wrap" id="app">Loading…</div></main></div>
<div id="msg"></div>
<script>
var C=null,A=[],BOOT=[],PAGES=[],TEXTS=[],O={},CUR="settings",DIRTY=false;
function msg(t){var m=document.getElementById("msg");m.textContent=t;m.classList.add("show");clearTimeout(m._t);m._t=setTimeout(function(){m.classList.remove("show")},2800)}
function dirty(){DIRTY=true;document.getElementById("dirty").style.display="inline"}
function h(tag,props,kids){var e=document.createElement(tag);if(props)for(var k in props){if(k==="class")e.className=props[k];else if(k==="html")e.innerHTML=props[k];else e.setAttribute(k,props[k])}(kids||[]).forEach(function(c){if(c)e.appendChild(typeof c==="string"?document.createTextNode(c):c)});return e}
function card(title,kids,sub){var t=h("h2",null,[title]);if(sub)t.appendChild(h("small",null,[sub]));return h("div",{class:"card"},[t].concat(kids))}
function textField(label,getv,setv){var inp=h("input",{type:"text"});inp.value=getv()||"";inp.oninput=function(){setv(inp.value);dirty()};return h("div",null,[h("label",null,[label]),inp])}

function uploadFile(file,cb){
  fetch("/api/media?name="+encodeURIComponent(file.name),{method:"POST",headers:{"content-type":file.type||"application/octet-stream"},body:file})
  .then(function(r){return r.json()}).then(function(d){if(d.ok){cb(d.url);dirty()}else{msg(d.error||"Upload failed")}}).catch(function(){msg("Upload failed")})
}
function pickFile(accept,cb){var i=h("input",{type:"file",accept:accept});i.style.display="none";document.body.appendChild(i);i.onchange=function(){if(i.files[0]){msg("Uploading…");uploadFile(i.files[0],cb)}document.body.removeChild(i)};i.click()}
function imgField(label,hint,getv,setv){
  var img=h("img",{src:getv()||""});
  var btn=h("button",{class:"ghost"},["Upload new"]);
  btn.onclick=function(){pickFile("image/*",function(url){setv(url);img.src=url;msg("Image uploaded — remember to Save")})};
  var nm=h("div",{class:"nm"},[label]);nm.appendChild(h("div",{class:"note",style:"margin-top:2px"},["Recommended: "+(hint||"")]));
  return h("div",{class:"imgrow"},[img,nm,btn]);
}
function pdfField(label,getv,setv){
  var cur=h("a",{href:getv()||"#",target:"_blank",style:"color:#e40420;text-decoration:none;font-size:13px"},["View current PDF ↗"]);
  var btn=h("button",{class:"ghost"},["Upload new PDF"]);
  btn.onclick=function(){pickFile("application/pdf",function(url){setv(url);cur.setAttribute("href",url);msg("Menu uploaded — remember to Save")})};
  var nm=h("div",{class:"nm"},[label]);nm.appendChild(h("div",{style:"margin-top:3px"},[cur]));
  return h("div",{class:"imgrow"},[nm,btn]);
}
function listEditor(arr,ph){
  var box=h("div");
  function row(i){
    var inp=h("input",{type:"text",placeholder:ph||""});inp.value=arr[i]||"";inp.oninput=function(){arr[i]=inp.value;dirty()};
    var del=h("button",null,["×"]);del.onclick=function(){arr.splice(i,1);dirty();redraw()};
    return h("div",{class:"listrow"},[inp,del]);
  }
  function redraw(){box.innerHTML="";for(var i=0;i<arr.length;i++)box.appendChild(row(i));var add=h("button",{class:"add"},["+ Add"]);add.onclick=function(){arr.push("");redraw()};box.appendChild(add)}
  redraw();return box;
}
function galleryEditor(){
  var box=h("div");
  function row(i){
    var g=C.gallery[i];
    var img=h("img",{src:g.image||"",title:"Click to change photo"});img.onclick=function(){pickFile("image/*",function(url){g.image=url;img.src=url;msg("Image uploaded — remember to Save")})};
    var cap=h("input",{type:"text",placeholder:"Caption"});cap.value=g.caption||"";cap.oninput=function(){g.caption=cap.value;dirty()};
    var tag=h("input",{type:"text",placeholder:"Tag"});tag.value=g.tag||"";tag.oninput=function(){g.tag=tag.value;dirty()};
    var del=h("button",null,["×"]);del.onclick=function(){C.gallery.splice(i,1);dirty();redraw()};
    return h("div",{class:"galrow"},[img,cap,tag,del]);
  }
  function redraw(){box.innerHTML="";for(var i=0;i<C.gallery.length;i++)box.appendChild(row(i));var add=h("button",{class:"add"},["+ Add photo"]);add.onclick=function(){C.gallery.push({image:"",caption:"",tag:""});redraw()};box.appendChild(add)}
  redraw();return box;
}

// ----- editable page text -----
function grow(t){if(!t.isConnected)return;if(!t.offsetWidth){setTimeout(function(){grow(t)},150);return}t.style.height="auto";t.style.height=(t.scrollHeight+2)+"px"}
window.addEventListener("resize",function(){document.querySelectorAll("textarea").forEach(grow)});
function textEditor(it,showPage){
  var val=Object.prototype.hasOwnProperty.call(O,it.k)?O[it.k]:it.def;
  var ta=h("textarea",{rows:"1"});ta.value=val;
  var lab=it.label.replace("Text in ","");
  var top=h("div",{class:"top"},[h("label",null,[showPage?(pageName(it.page)+" › "+it.section+" › "+lab):lab])]);
  var rs=h("button",{class:"rs",type:"button"},["↺ Reset to original"]);top.appendChild(rs);
  var was=h("div",{class:"was"},["Original: "+it.def]);
  var box=h("div",{class:"tf"},[top,ta,was]);
  function mark(){var c=ta.value!==it.def;box.classList.toggle("chg",c);if(c)O[it.k]=ta.value;else delete O[it.k]}
  ta.oninput=function(){mark();grow(ta);dirty();navCounts()};
  rs.onclick=function(){ta.value=it.def;mark();grow(ta);dirty();navCounts()};
  mark();setTimeout(function(){grow(ta)},0);
  return box;
}
function helpBox(){return h("div",{class:"help",html:"<b>How to format:</b> &nbsp;<code>*text*</code> = red/accent highlight (same font) &nbsp;·&nbsp; <code>**text**</code> = bold &nbsp;·&nbsp; press <b>Enter</b> for a new line. &nbsp;Changed fields get a red bar — click <i>Reset</i> to go back to the original."})}
function pageName(id){for(var i=0;i<PAGES.length;i++)if(PAGES[i][0]===id)return PAGES[i][1];return id}
function pageUrl(id){for(var i=0;i<PAGES.length;i++)if(PAGES[i][0]===id)return PAGES[i][2];return "/"}
function textSections(page){
  var out=[],secs={},order=[];
  TEXTS.forEach(function(it){if(it.page!==page||it.kind)return;if(!secs[it.section]){secs[it.section]=[];order.push(it.section)}secs[it.section].push(it)});
  order.forEach(function(s){
    var g=h("div",{class:"tgrid"},secs[s].map(function(it){var e=textEditor(it);if(it.def.length>38||it.def.indexOf("*")>=0)e.classList.add("wide");return e}));
    out.push(card(s,[g],secs[s].length+" texts"));
  });
  return out;
}

// ----- SEO card -----
function seoItem(page,kind){for(var i=0;i<TEXTS.length;i++)if(TEXTS[i].page===page&&TEXTS[i].kind===kind)return TEXTS[i];return null}
function cur(it){return Object.prototype.hasOwnProperty.call(O,it.k)?O[it.k]:it.def}
function seoCard(page){
  var ti=seoItem(page,"seo-title"),de=seoItem(page,"seo-desc"),im=seoItem(page,"seo-image");
  if(!ti)return null;
  var pv=h("div",{style:"border:1px solid #eee;border-radius:9px;padding:12px 14px;margin:4px 0 14px;font-family:arial,sans-serif;background:#fff"});
  var pu=h("div",{style:"font-size:12px;color:#4d5156"},["dateen.my"+(pageUrl(page)==="/"?"":pageUrl(page))]);
  var pt=h("div",{style:"font-size:18px;color:#1a0dab;margin:3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"});
  var pd=h("div",{style:"font-size:13px;color:#4d5156;line-height:1.5"});
  pv.appendChild(h("div",{class:"note",style:"margin:0 0 6px"},["Preview — how it may look on Google"]));pv.appendChild(pu);pv.appendChild(pt);pv.appendChild(pd);
  function fill(s){return String(s).split("[phone]").join(C.phoneIntl||"").split("[email]").join(C.email||"")}
  function counter(it,max){var n=h("span",{class:"note",style:"margin:0 0 0 auto"});function u(){var l=fill(cur(it)).length;n.textContent=l+" / ~"+max+" characters";n.style.color=l>max?"#c40018":"#999"}u();return {el:n,u:u}}
  function upd(){pt.textContent=fill(cur(ti));var d=fill(cur(de));pd.textContent=d.length>160?d.slice(0,157)+"…":d;c1.u();c2.u()}
  var c1=counter(ti,60),c2=counter(de,155);
  var e1=textEditor(ti),e2=textEditor(de);
  e1.querySelector(".top").insertBefore(c1.el,e1.querySelector(".rs"));
  e2.querySelector(".top").insertBefore(c2.el,e2.querySelector(".rs"));
  e1.addEventListener("input",upd);e2.addEventListener("input",upd);e1.addEventListener("click",function(){setTimeout(upd,0)});e2.addEventListener("click",function(){setTimeout(upd,0)});
  upd();
  var img=imgField(im.label,"1200×630 px (landscape, under ~1MB)",function(){return cur(im)},function(v){if(v===im.def)delete O[im.k];else O[im.k]=v;navCounts()});
  var rs=h("button",{class:"ghost",style:"margin-left:6px"},["Reset"]);rs.onclick=function(){delete O[im.k];img.querySelector("img").src=im.def;dirty();navCounts()};
  img.appendChild(rs);
  return card(ti.section,[pv,e1,e2,img,h("div",{class:"note"},["Tip: you can write [phone] or [email] and it fills in the number/email from Settings. Google may take days–weeks to show changes."])]);
}

// ----- structured (non-text) fields per page -----
var PRICE={bentoFrom:"Bento from (RM)",valueMeal:"Value meal (RM)",vegBento:"Vegetarian bento (RM)",coldbrewAmericano:"Cold Brew Americano (RM)",coldbrewLatte:"Cold Brew Latte (RM)",bungkusReseller:"Bungkus reseller each (RM)",cateringFullDayA:"Full Day A (RM/pax)",cateringFullDayB:"Full Day B (RM/pax)",cateringFullDayC:"Full Day C Western (RM/pax)",cateringLunchLocal:"Lunch/Dinner Local from (RM/pax)",cateringLunchWestern:"Lunch/Dinner Western from (RM/pax)",cateringTeaLocal:"Tea Break Local from (RM/pax)",cateringTeaWestern:"Tea Break Western from (RM/pax)"};
function prices(keys){var g=h("div",{class:"grid"});keys.forEach(function(k){g.appendChild(textField(PRICE[k],function(){return C.prices[k]},function(v){C.prices[k]=v}))});return card("Prices",[g],"numbers only, e.g. 17.90")}
function banner(k,label,hint){return imgField(label,hint,function(){return C.banners[k]},function(v){C.banners[k]=v})}
var STRUCT={
  home:function(){return [card("Clients — “Trusted by” strip",[listEditor(C.clientsTrusted,"Company name")],"top of homepage"),card("Clients — full client wall",[listEditor(C.clientsWall,"Company name")],"near bottom of homepage")]},
  catering:function(){return [card("Page banner",[banner("catering","Catering Service banner","wide landscape ~1600×900 px (16:9)")]),prices(["cateringFullDayA","cateringFullDayB","cateringFullDayC","cateringLunchLocal","cateringLunchWestern","cateringTeaLocal","cateringTeaWestern"]),card("Photo gallery",[galleryEditor()],"click a photo to replace it")]},
  bento:function(){return [card("Images",[banner("bento","Bento Menu banner","wide banner ~1600×760 px (2:1)"),banner("coldbrew","Cold Brew visual","square ~800×800 px (1:1)")]),prices(["bentoFrom","valueMeal","vegBento","coldbrewAmericano","coldbrewLatte"])]},
  bungkus:function(){return [card("Page banner",[banner("bungkus","Bungkus Supply banner","wide banner ~1600×760 px (2:1)")]),prices(["bungkusReseller"])]},
  vegetarian:function(){return [card("Page image",[banner("vegetarian","Vegetarian Catering image","~1000×760 px (4:3)")])]},
  contact:function(){return [h("div",{class:"note",style:"margin:-6px 0 14px"},["Phone, WhatsApp, email and address are in ⚙ Settings (they appear on every page)."])]}
};
function settings(){
  var cg=h("div",{class:"grid"});
  [["phone","Phone (display)"],["phoneIntl","Phone (international)"],["whatsapp","WhatsApp number (digits only, e.g. 60122015578)"],["email","Email"],["address","Address"]].forEach(function(f){
    cg.appendChild(textField(f[1],function(){return C[f[0]]},function(v){C[f[0]]=v}));
  });
  var bootNote=BOOT.length?h("div",{class:"note"},["Owner (always allowed, set in Cloudflare): "+BOOT.join(", ")]):null;
  return [
    card("Contact details",[cg],"used on every page + WhatsApp button"),
    card("Downloads",[pdfField("Menu PDF (the “Download Menu” button on the site)",function(){return C.menuPdf},function(v){C.menuPdf=v})]),
    card("Team access — who can log in to this admin",[listEditor(A,"name@palaterium.com"),bootNote,h("div",{class:"note"},["Use their Lark email. They log in with “Sign in with Lark”."])])
  ];
}

// ----- navigation -----
function countFor(p){var n=0;TEXTS.forEach(function(it){if(it.page===p&&Object.prototype.hasOwnProperty.call(O,it.k))n++});return n}
function navCounts(){document.querySelectorAll("aside a[data-p]").forEach(function(a){var c=a.querySelector(".cnt");var n=countFor(a.getAttribute("data-p"));c.textContent=n?(n+" edited"):"";c.style.display=n?"":"none"})}
function nav(){
  var n=document.getElementById("nav");n.innerHTML="";
  function link(id,label){var a=h("a",{"data-p":id},[label,h("span",{class:"cnt"})]);if(id===CUR)a.className="on";a.onclick=function(){CUR=id;document.getElementById("search").value="";nav();render();window.scrollTo(0,0)};n.appendChild(a)}
  link("settings","⚙  Settings");
  n.appendChild(h("div",{class:"grp"},["Website pages"]));
  PAGES.forEach(function(p){if(p[0]!=="all")link(p[0],p[1])});
  n.appendChild(h("div",{class:"grp"},["Shared"]));
  link("all","Top bar & footer");
  navCounts();
}
function render(){
  var app=document.getElementById("app");app.innerHTML="";
  var q=document.getElementById("search").value.trim().toLowerCase();
  if(q){
    app.appendChild(h("div",{class:"ptitle"},[h("h1",null,["Search: “"+q+"”"])]));
    app.appendChild(helpBox());
    var hits=TEXTS.filter(function(it){if(it.kind==="seo-image")return false;var v=Object.prototype.hasOwnProperty.call(O,it.k)?O[it.k]:it.def;return (v+" "+it.def).toLowerCase().indexOf(q)>=0}).slice(0,80);
    if(!hits.length)app.appendChild(h("div",{class:"empty"},["No text found."]));
    else app.appendChild(card(hits.length+" match"+(hits.length>1?"es":""),hits.map(function(it){return textEditor(it,true)})));
    return;
  }
  if(CUR==="settings"){
    app.appendChild(h("div",{class:"ptitle"},[h("h1",null,["Settings"])]));
    app.appendChild(h("p",{class:"psub"},["Contact details, menu download and team access."]));
    settings().forEach(function(c){app.appendChild(c)});return;
  }
  var t=h("div",{class:"ptitle"},[h("h1",null,[pageName(CUR)]),h("a",{href:pageUrl(CUR),target:"_blank"},["View page ↗"])]);
  app.appendChild(t);
  app.appendChild(h("p",{class:"psub"},[CUR==="all"?"Text in the thin top bar and the footer — shown on every page.":"Everything you can change on this page, top to bottom."]));
  var st=STRUCT[CUR]?STRUCT[CUR]():[];
  var seo=seoCard(CUR);if(seo)st.unshift(seo);
  if(CUR!=="home")st.forEach(function(c){app.appendChild(c)});
  app.appendChild(helpBox());
  textSections(CUR).forEach(function(c){app.appendChild(c)});
  if(CUR==="home")st.forEach(function(c){app.appendChild(c)});
}
var st;document.getElementById("search").oninput=function(){clearTimeout(st);st=setTimeout(render,200)};

function save(){
  var b=document.getElementById("saveBtn");b.disabled=true;
  function put(u,d){return fetch(u,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(d)}).then(function(r){return r.json()})}
  Promise.all([put("/api/content",C),put("/api/access",{allowedEmails:A.filter(Boolean)}),put("/api/texts",O)])
  .then(function(res){b.disabled=false;var ok=res.every(function(r){return r.ok});if(ok){DIRTY=false;document.getElementById("dirty").style.display="none"}msg(ok?"Saved ✓  Live on the site in about a minute.":"Error saving — please try again")})
  .catch(function(){b.disabled=false;msg("Save failed — check your connection")})
}
document.getElementById("saveBtn").onclick=save;
window.addEventListener("beforeunload",function(e){if(DIRTY){e.preventDefault();e.returnValue=""}});

Promise.all([
  fetch("/api/content").then(function(r){return r.json()}),
  fetch("/api/access").then(function(r){return r.json()}),
  fetch("/api/texts").then(function(r){return r.json()})
]).then(function(res){
  var d=res[0],a=res[1],t=res[2];
  if(!d.ok){document.getElementById("app").textContent="Not authorised.";return}
  C=d.content;A=(a.access&&a.access.allowedEmails)||[];BOOT=a.bootstrap||[];
  PAGES=t.pages||[];TEXTS=t.texts||[];O=t.overrides||{};
  document.getElementById("who").textContent=d.email;nav();render();
}).catch(function(){document.getElementById("app").textContent="Failed to load."});
</script>
</body></html>`;
