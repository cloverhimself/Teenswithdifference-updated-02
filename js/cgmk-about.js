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


