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


/* Interactive local calendar for CGMK's confirmed weekly gatherings.
   All dates and times use Africa/Lagos, independently of device timezone. */
(() => {
 const days=document.querySelector('#calendarDays');
 const monthHeading=document.querySelector('#calendarMonth');
 const upcoming=document.querySelector('#upcomingGatherings');
 if(!days||!monthHeading||!upcoming)return;
 const timezone='Africa/Lagos';
 const nowFields=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());
 const getPart=name=>Number(nowFields.find(x=>x.type===name)?.value);
 const today={year:getPart('year'),month:getPart('month')-1,day:getPart('day')};
 let year=today.year,month=today.month,selected=null;
 const kinds={0:{name:'Sunday Service',time:'9:00 AM',icon:'bi-sun'},2:{name:'Bible Study',time:'6:00 PM',icon:'bi-book'},4:{name:'Prayer Meeting',time:'6:00 PM',icon:'bi-heart'}};
 const pad=n=>String(n).padStart(2,'0');
 const key=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
 const monthName=(y,m)=>new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m,1)));
 const makeDate=(y,m,d)=>new Date(Date.UTC(y,m,d));
 const todayUTC=Date.UTC(today.year,today.month,today.day);
 function renderCalendar(){
   monthHeading.textContent=monthName(year,month);days.replaceChildren();
   const first=new Date(Date.UTC(year,month,1)).getUTCDay();
   const total=new Date(Date.UTC(year,month+1,0)).getUTCDate();
   for(let i=0;i<first;i++){const blank=document.createElement('span');blank.className='cgmk-calendar-blank';days.append(blank);}
   for(let d=1;d<=total;d++){
     const weekday=makeDate(year,month,d).getUTCDay(),event=kinds[weekday];
     const button=document.createElement('button');button.type='button';button.textContent=d;
     button.dataset.weekday=weekday;
     if(event)button.classList.add('has-event');
     if(year===today.year&&month===today.month&&d===today.day)button.classList.add('is-today');
     if(selected===key(year,month,d))button.classList.add('is-selected');
     button.setAttribute('aria-label',d+' '+monthName(year,month)+(event?', '+event.name+' at '+event.time+' WAT':''));
     button.setAttribute('aria-pressed',String(selected===key(year,month,d)));
     button.addEventListener('click',()=>{selected=selected===key(year,month,d)?null:key(year,month,d);renderCalendar();renderUpcoming();});
     days.append(button);
   }
 }
 function renderUpcoming(){
   upcoming.replaceChildren();
   const start=selected?new Date(selected+'T00:00:00Z').getTime():todayUTC;
   let count=0;
   for(let offset=0;offset<55&&count<5;offset++){
    const date=new Date(start+offset*86400000),kind=kinds[date.getUTCDay()];
    if(!kind)continue;
    const d=date.getUTCDate(),m=date.getUTCMonth();
    const item=document.createElement('article');item.className='cgmk-upcoming-item';
    const badge=document.createElement('div');badge.className='cgmk-upcoming-date';
    const n=document.createElement('strong');n.textContent=d;
    const mon=document.createElement('span');mon.textContent=new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(date);
    badge.append(n,mon);
    const details=document.createElement('div');
    const h=document.createElement('h4');h.textContent=kind.name;
    const p=document.createElement('p');p.textContent=kind.time+' WAT · '+new Intl.DateTimeFormat('en-GB',{weekday:'long',timeZone:'UTC'}).format(date);
    details.append(h,p);
    const icon=document.createElement('i');icon.className='bi '+kind.icon;icon.setAttribute('aria-hidden','true');
    item.append(badge,details,icon);upcoming.append(item);count++;
   }
 }
 function move(delta){month+=delta;if(month<0){month=11;year--;}if(month>11){month=0;year++;}selected=null;renderCalendar();renderUpcoming();}
 document.querySelector('#calendarPrev').addEventListener('click',()=>move(-1));
 document.querySelector('#calendarNext').addEventListener('click',()=>move(1));
 renderCalendar();renderUpcoming();
})();
