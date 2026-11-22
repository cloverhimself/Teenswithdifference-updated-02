// Progressive enhancement for the About page.
// Content is visible by default and motion is disabled if the visitor prefers reduced motion.
(() => {
  const body = document.body;
  if (!body.classList.contains('cgmk-about-page')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const targets = [...document.querySelectorAll('[data-reveal]')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  targets.forEach(el => observer.observe(el));
  body.classList.add('about-motion-ready');
  requestAnimationFrame(() => {
    targets.filter(el => el.getBoundingClientRect().top < window.innerHeight).forEach(el => el.classList.add('is-revealed'));
  });
  const timeline = document.querySelector('.cgmk-timeline-v2');
  const progress = document.querySelector('.cgmk-timeline-progress');
  if (!timeline || !progress) return;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const r = timeline.getBoundingClientRect();
    const view = window.innerHeight;
    const fraction = Math.min(1, Math.max(0, (view * .58 - r.top) / Math.max(1, r.height)));
    progress.style.height = (fraction * 100).toFixed(1) + '%';
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
})();



/* Accessible mission and philosophy switcher and single-open core values. */
(() => {
 const tabs=[...document.querySelectorAll('.cgmk-identity-tab')];
 if(!tabs.length)return;
 const activate=(index,focus=false)=>{
   tabs.forEach((tab,i)=>{
     const active=i===index;
     tab.setAttribute('aria-selected',String(active));
     tab.tabIndex=active?0:-1;
     const panel=document.getElementById(tab.getAttribute('aria-controls'));
     if(panel)panel.hidden=!active;
   });
   if(focus)tabs[index].focus();
 };
 tabs.forEach((tab,i)=>{
   tab.addEventListener('click',()=>activate(i));
   tab.addEventListener('keydown',e=>{
      let next=null;
      if(e.key==='ArrowRight')next=(i+1)%tabs.length;
      if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      if(e.key==='Home')next=0;
      if(e.key==='End')next=tabs.length-1;
      if(next!==null){e.preventDefault();activate(next,true);}
   });
 });
 const details=[...document.querySelectorAll('.cgmk-value-row')];
 details.forEach(row=>row.addEventListener('toggle',()=>{
   if(row.open)details.forEach(other=>{if(other!==row)other.open=false;});
 }));
})();
