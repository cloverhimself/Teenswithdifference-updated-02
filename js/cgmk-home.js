// Accessible sliding navigation overlay for CGMK.
(() => {
  const toggle=document.querySelector('.cgmk-menu-toggle');
  const nav=document.getElementById('cgmkNav');
  const header=document.querySelector('.cgmk-header');
  if(!toggle||!nav||!header)return;
  const doc=document.documentElement;
  let lastFocused=null;
  const isOpen=()=>nav.classList.contains('is-open');
  const syncHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>25);
  const close=(restore=true)=>{
    if(!isOpen())return;
    nav.classList.remove('is-open');
    header.classList.remove('is-menu-open');
    doc.classList.remove('cgmk-drawer-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open navigation');
    nav.setAttribute('aria-hidden','true');
    if(restore)toggle.focus({preventScroll:true});
    syncHeader();
  };
  const open=()=>{
    lastFocused=document.activeElement;
    nav.classList.add('is-open');
    header.classList.add('is-menu-open');
    doc.classList.add('cgmk-drawer-open');
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','Close navigation');
    nav.removeAttribute('aria-hidden');
    nav.querySelector('a')?.focus({preventScroll:true});
  };
  toggle.addEventListener('click',()=>isOpen()?close():open());
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>close(false)));
  document.addEventListener('keydown',event=>{
    if(!isOpen())return;
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(event.key==='Tab'){
      const focusable=[...nav.querySelectorAll('a[href]'),toggle].filter(x=>x.offsetParent!==null);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>900)close(false);},{passive:true});
  window.addEventListener('scroll',syncHeader,{passive:true});
  syncHeader();
})();

/* Fellowship accordion: click to pin open, click again to release. */
(() => {
  const deck = document.querySelector('.cgmk-fellowship-deck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('.cgmk-fellowship-card')];
  const clear = () => cards.forEach(card => {
    card.classList.remove('is-pinned');
    card.setAttribute('aria-pressed', 'false');
  });
  cards.forEach(card => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.cgmk-fellowship-more')) {
        window.location.assign('media.html');
        return;
      }
      const wasPinned = card.classList.contains('is-pinned');
      clear();
      if (!wasPinned) {
        card.classList.add('is-pinned');
        card.setAttribute('aria-pressed', 'true');
      }
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') clear();
  });
})();
