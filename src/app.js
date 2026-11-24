// ===== Dateen — shared site scripts =====
// Reveal on scroll
(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
})();

// Mobile nav toggle
(function(){
  var t = document.querySelector('.nav-toggle'), links = document.querySelector('.nav-links');
  if(!t || !links) return;
  t.addEventListener('click', function(){ t.classList.toggle('open'); links.classList.toggle('open'); });
  links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ t.classList.remove('open'); links.classList.remove('open'); }); });
})();

// Menu filter tabs (Bento Menu page)
document.querySelectorAll('.mtab').forEach(function(t){
  t.addEventListener('click', function(){
    document.querySelectorAll('.mtab').forEach(function(x){ x.classList.remove('on'); });
    t.classList.add('on');
    var cat = t.dataset.cat;
    document.querySelectorAll('.mgroup').forEach(function(g){
      g.classList.toggle('hide', !(cat === 'all' || g.dataset.cat === cat));
    });
  });
});

// FAQ: one open at a time
document.querySelectorAll('.faq-it').forEach(function(item){
  item.addEventListener('toggle', function(){
    if(item.open) document.querySelectorAll('.faq-it[open]').forEach(function(o){ if(o!==item) o.removeAttribute('open'); });
  });
});

// Reel band: play only when in view (defers download), tap for sound
(function(){
  var medias = document.querySelectorAll('.reel-media');
  if(!medias.length) return;
  medias.forEach(function(m){
    var v = m.querySelector('video'), btn = m.querySelector('.reel-sound');
    if(!v) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ v.play().catch(function(){}); }
        else { v.pause(); }
      });
    }, { threshold: 0.35 });
    io.observe(v);
    if(btn){
      btn.addEventListener('click', function(){
        v.muted = !v.muted;
        btn.classList.toggle('on', !v.muted);
        if(!v.muted) v.play().catch(function(){});
      });
    }
  });
})();

// Contact form -> WhatsApp (Send Inquiry)
(function(){
  var form = document.getElementById('quoteForm');
  if(!form) return;
  var WA = '60122015578';
  form.addEventListener('submit', function(e){
    e.preventDefault();
    function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    var name = val('qf-name');
    if(!name){ var n = document.getElementById('qf-name'); if(n){ n.focus(); n.reportValidity && n.reportValidity(); } return; }
    var rows = [
      ['Name', name],
      ['Company', val('qf-company')],
      ['Email', val('qf-email')],
      ['Phone', val('qf-phone')],
      ['Service', val('qf-service')],
      ['Pax / Quantity', val('qf-pax')],
      ['Event date', val('qf-date')],
      ['Brief', val('qf-brief')]
    ];
    var lines = ['Hi Dateen! I would like to request a quote.', ''];
    rows.forEach(function(r){ if(r[1]) lines.push(r[0] + ': ' + r[1]); });
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
    var note = document.getElementById('qf-note');
    if(note) note.hidden = false;
    window.open(url, '_blank');
  });
})();
