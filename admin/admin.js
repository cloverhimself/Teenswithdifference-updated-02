// CGMK Admin v0.1. Local prototype only. No authentication or server-side publishing.
(() => {
 'use strict';
 const KEY='cgmk-admin-event-drafts-v1';
 const menuButtons=[...document.querySelectorAll('.adm-menu-link')];
 const views=[...document.querySelectorAll('.adm-view')];
 const sidebar=document.getElementById('adminSidebar');
 const overlay=document.getElementById('adminOverlay');
 const toggle=document.getElementById('adminToggle');
 const dialog=document.getElementById('eventDialog');
 const form=document.getElementById('eventForm');
 const toastEl=document.getElementById('adminToast');
 const byId=id=>document.getElementById(id);
 const memory={events:[]};
 let editing=null;
 const inLagos=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=k=>Number(inLagos.find(p=>p.type===k)?.value);
 const todayUTC=Date.UTC(part('year'),part('month')-1,part('day'));
 const pad=n=>String(n).padStart(2,'0');
 const dateKey=date=>date.getUTCFullYear()+'-'+pad(date.getUTCMonth()+1)+'-'+pad(date.getUTCDate());
 const dayName=date=>new Intl.DateTimeFormat('en-GB',{weekday:'long',timeZone:'UTC'}).format(date);
 const monthShort=date=>new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(date);
 const weekly=[{day:0,title:'Sunday Service',time:'09:00',category:'Church service'},{day:2,title:'Bible Study',time:'18:00',category:'Bible study'},{day:4,title:'Prayer Meeting',time:'18:00',category:'Prayer meeting'}];
 const load=()=>{
  try{
   const data=JSON.parse(localStorage.getItem(KEY)||'[]');
   memory.events=Array.isArray(data)?data.filter(e=>e&&typeof e.title==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.date||'' )).slice(0,100):[];
  }catch{memory.events=[];}
 };
 const save=()=>{
  try{localStorage.setItem(KEY,JSON.stringify(memory.events));return true;}
  catch{toast('Browser storage unavailable. Drafts may not persist.');return false;}
 };
 const toast=message=>{
  toastEl.textContent=message;toastEl.hidden=false;
  clearTimeout(toastEl._timeout);
  toastEl._timeout=setTimeout(()=>toastEl.hidden=true,3400);
 };
 const openMenu=()=>{sidebar.classList.add('open');overlay.hidden=false;toggle.setAttribute('aria-expanded','true');};
 const closeMenu=()=>{sidebar.classList.remove('open');overlay.hidden=true;toggle.setAttribute('aria-expanded','false');};
 toggle.addEventListener('click',()=>sidebar.classList.contains('open')?closeMenu():openMenu());
 overlay.addEventListener('click',closeMenu);
 window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 window.addEventListener('resize',()=>{if(window.innerWidth>800)closeMenu();},{passive:true});
 const navigate=(view)=>{
  views.forEach(v=>{const active=v.id==='view-'+view;v.hidden=!active;v.classList.toggle('active',active);});
  menuButtons.forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');});
  byId('breadTitle').textContent=({overview:'Overview',events:'Events',media:'Media library',giving:'Giving accounts',settings:'Church settings'})[view]||'Overview';
  closeMenu();
  window.scrollTo({top:0,behavior:'instant'});
 };
 menuButtons.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
 function upcomingGatherings(){
  const result=[];
  for(let i=0;i<26&&result.length<4;i++){
   const date=new Date(todayUTC+i*86400000);
   const event=weekly.find(e=>e.day===date.getUTCDay());
   if(event)result.push({date,title:event.title,time:event.time});
  }
  return result;
 }
 function makeDateBadge(date){
  const d=document.createElement('span');d.className='adm-date-badge';
  const n=document.createElement('strong');n.textContent=date.getUTCDate();
  const m=document.createElement('small');m.textContent=monthShort(date);
  d.append(n,m);return d;
 }
 function renderOverview(){
  byId('statEvents').textContent=memory.events.length;
  byId('sidebarEventCount').textContent=memory.events.length;
  const el=byId('overviewUpcoming');el.replaceChildren();
  upcomingGatherings().forEach(event=>{
   const row=document.createElement('div');row.className='adm-upcoming-row';
   const info=document.createElement('div');
   const h=document.createElement('h3');h.textContent=event.title;
   const p=document.createElement('p');p.textContent=dayName(event.date)+' · '+formatTime(event.time)+' WAT';
   info.append(h,p);row.append(makeDateBadge(event.date),info);el.append(row);
  });
 }
 function formatTime(t){
  const [h,m]=t.split(':').map(Number);
  return (h%12||12)+':'+pad(m)+' '+(h>=12?'PM':'AM');
 }
 function renderEvents(){
  const drafts=byId('draftEvents');
  drafts.replaceChildren();
  if(!memory.events.length){
   const wrap=document.createElement('div');wrap.className='adm-empty';
   const icon=document.createElement('i');icon.className='bi bi-calendar-plus';icon.setAttribute('aria-hidden','true');
   const title=document.createElement('h3');title.textContent='No event drafts yet';
   const description=document.createElement('p');description.textContent='Create your first event. Drafts only exist in this browser.';
   const btn=document.createElement('button');btn.type='button';btn.textContent='Create an event';btn.addEventListener('click',()=>openEvent());
   wrap.append(icon,title,description,btn);drafts.append(wrap);
  }else{
   const list=document.createElement('div');list.className='adm-event-list';
   [...memory.events].sort((a,b)=>a.date.localeCompare(b.date)).forEach(event=>{
    const date=new Date(event.date+'T00:00:00Z');
    const row=document.createElement('article');row.className='adm-event-row';
    const body=document.createElement('div');
    const title=document.createElement('h3');title.textContent=event.title;
    const meta=document.createElement('p');meta.textContent=event.category+' · '+formatTime(event.time)+' WAT';
    body.append(title,meta);
    if(event.description){const detail=document.createElement('small');detail.textContent=event.description;body.append(detail);}
    const controls=document.createElement('div');controls.className='adm-event-row-actions';
    const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.addEventListener('click',()=>openEvent(event.id));
    const remove=document.createElement('button');remove.type='button';remove.textContent='Delete';remove.addEventListener('click',()=>{
     if(!confirm('Delete this local event draft?'))return;
     memory.events=memory.events.filter(e=>e.id!==event.id);save();refresh();toast('Local event draft deleted');
    });
    controls.append(edit,remove);row.append(makeDateBadge(date),body,controls);list.append(row);
   });drafts.append(list);
  }
  const weeklyEl=byId('weeklyEvents');weeklyEl.replaceChildren();
  weekly.forEach(event=>{
   const row=document.createElement('div');row.className='adm-weekly-row';
   const detail=document.createElement('div');
   const h=document.createElement('h3');h.textContent=event.title;
   const p=document.createElement('p');p.textContent=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][event.day]+' · Recurring weekly';
   detail.append(h,p);
   const time=document.createElement('strong');time.textContent=formatTime(event.time)+' WAT';
   row.append(detail,time);weeklyEl.append(row);
  });
 }
 document.querySelectorAll('[data-event-tab]').forEach(b=>b.addEventListener('click',()=>{
  const drafts=b.dataset.eventTab==='drafts';
  byId('draftEvents').hidden=!drafts;byId('weeklyEvents').hidden=drafts;
  document.querySelectorAll('[data-event-tab]').forEach(t=>{const active=t===b;t.classList.toggle('active',active);t.setAttribute('aria-pressed',String(active));});
 }));
 const openEvent=(id=null)=>{
  editing=id;
  form.reset();
  const event=memory.events.find(e=>e.id===id);
  byId('eventDialogTitle').textContent=event?'Edit event draft':'New event draft';
  form.elements.namedItem('date').min=dateKey(new Date(todayUTC));
  if(event){
   for(const name of ['title','date','time','category','description'])form.elements.namedItem(name).value=event[name]||'';
   form.elements.namedItem('date').min='';
  }else{form.elements.namedItem('date').value=dateKey(new Date(todayUTC));form.elements.namedItem('time').value='09:00';}
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  form.elements.namedItem('title').focus();
 };
 byId('eventDialogClose').addEventListener('click',()=>dialog.close());
 byId('eventCancel').addEventListener('click',()=>dialog.close());
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(form).entries());
  if(!String(data.title||'').trim()||!/^\d{4}-\d{2}-\d{2}$/.test(data.date||'')||!/^\d{2}:\d{2}$/.test(data.time||'')){
   toast('Enter a title, date and time.');return;
  }
  if(memory.events.length>=100&&!editing){toast('Maximum 100 local event drafts.');return;}
  const record={id:editing||('draft-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)),title:String(data.title).trim().slice(0,100),date:data.date,time:data.time,category:String(data.category).slice(0,50),description:String(data.description||'').trim().slice(0,400)};
  const idx=memory.events.findIndex(e=>e.id===editing);
  if(idx>=0)memory.events[idx]=record;else memory.events.push(record);
  save();refresh();dialog.close();navigate('events');toast('Event draft saved in this browser');
 });
 document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
  const action=button.dataset.action;
  if(action==='new-event')openEvent();
  if(action==='open-media')navigate('media');
  if(action==='open-giving')navigate('giving');
 }));
 byId('exportAdmin').addEventListener('click',()=>{
  const payload=JSON.stringify({schema:'cgmk-admin-drafts-v1',exportedAt:new Date().toISOString(),events:memory.events},null,2);
  const blob=new Blob([payload],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='cgmk-event-drafts.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Local event drafts exported');
 });
 byId('resetAdmin').addEventListener('click',()=>{
  if(!confirm('Clear all event drafts stored in this browser?'))return;
  memory.events=[];save();refresh();toast('Local drafts cleared');
 });
 function refresh(){renderOverview();renderEvents();}
 load();refresh();navigate('overview');
})();