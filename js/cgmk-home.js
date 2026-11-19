// Small, accessible mobile navigation for the CGMK homepage.
(() => {
  const toggle = document.querySelector('.cgmk-menu-toggle');
  const nav = document.querySelector('#cgmkNav');
  const header = document.querySelector('.cgmk-header');
  if (!toggle || !nav || !header) return;
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  const close = () => { nav.classList.remove('is-open'); header.classList.remove('is-menu-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', e => { if (!nav.contains(e.target) && !toggle.contains(e.target)) close(); });
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
    card.addEventListener('click', () => {
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
