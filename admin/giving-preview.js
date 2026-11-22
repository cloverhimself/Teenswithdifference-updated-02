/* CGMK Giving settings: sample-only, client-local sandbox. No publication or payments. */
(() => {
 'use strict';
 const storageKey='cgmk-admin-giving-demo-v1';
 const defaults=['Offering','Tithe','Building','Welfare'].map((purpose,i)=>({id:'sample-'+i,purpose,bank:'To be confirmed',accountName:'Sample only',number:'0000000000',group:'primary',enabled:true,featured:i===0}));
 const $=id=>document.getElementById(id);
 const list=$('givingPreviewList'),dialog=$('givingDialog'),form=$('givingForm');
 if(!list||!dialog||!form)return;
 let items=defaults.map(x=>({...x})),link='',editing=null;
 const alert=message=>{const t=$('adminToast');if(t){t.textContent=message;t.hidden=false;clearTimeout(t._timer);t._timer=setTimeout(()=>t.hidden=true,3500);}};
 try{const previous=JSON.parse(localStorage.getItem(storageKey)||'null');if(previous&&Array.isArray(previous.items)){items=previous.items.filter(x=>x&&typeof x.purpose==='string'&&typeof x.number==='string').slice(0,20);link=typeof previous.link==='string'?previous.link:'';}}catch{}
 function persist(){
  try{localStorage.setItem(storageKey,JSON.stringify({items,link}));return true;}catch{alert('Browser storage unavailable');return false;}
 }
 function rowText(tag,text,className){
  const el=document.createElement(tag);if(className)el.className=className;el.textContent=text;return el;
 }
 function draw(){
  list.replaceChildren();
  if(!items.length){list.append(rowText('p','No sample accounts. Use Add sample account to begin.','adm-giving-empty'));return;}
  items.forEach((account,index)=>{
   const row=document.createElement('article');row.className='adm-giving-preview-row';
   const content=document.createElement('div');content.className='adm-giving-preview-info';
   content.append(rowText('strong',account.purpose),rowText('span',account.bank+' · '+account.accountName),rowText('code',account.number),rowText('small',(account.group==='primary'?'Primary':'Other')+' · '+(account.enabled?'Shown':'Hidden')+(account.featured?' · Featured':'')));
   const actions=document.createElement('div');actions.className='adm-giving-preview-actions';
   for(const [title,fn] of [
    ['Edit',()=>edit(account.id)],['Up',()=>move(index,-1)],['Down',()=>move(index,1)],['Delete',()=>remove(account.id)]
   ]){const button=document.createElement('button');button.type='button';button.textContent=title;if((title==='Up'&&index===0)||(title==='Down'&&index===items.length-1))button.disabled=true;button.addEventListener('click',fn);actions.append(button);}
   row.append(content,actions);list.append(row);
  });
 }
 function edit(id=null){
  editing=id;
  form.reset();
  const acc=items.find(x=>x.id===id);
  $('givingDialogTitle').textContent=acc?'Edit sample account':'Add sample account';
  if(acc){
   for(const field of ['purpose','bank','accountName','number','group'])form.elements.namedItem(field).value=acc[field]||'';
   form.elements.namedItem('enabled').checked=Boolean(acc.enabled);
   form.elements.namedItem('featured').checked=Boolean(acc.featured);
  }else{
   form.elements.namedItem('number').value='0000000000';
   form.elements.namedItem('enabled').checked=true;
  }
  dialog.showModal();form.elements.namedItem('purpose').focus();
 }
 function move(index,delta){
  const to=index+delta;if(to<0||to>=items.length)return;
  [items[index],items[to]]=[items[to],items[index]];
  persist();draw();
 }
 function remove(id){if(!confirm('Delete this local sample account?'))return;items=items.filter(x=>x.id!==id);persist();draw();}
 $('addGivingAccount').addEventListener('click',()=>edit());
 $('givingDialogClose').addEventListener('click',()=>dialog.close());
 $('givingCancel').addEventListener('click',()=>dialog.close());
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const number=String(data.get('number')||'').trim();
  if(!/^\d{10}$/.test(number)){alert('Use a 10-digit sample number.');return;}
  // Never accept plausible payment details in this mock manager.
  if(number!=='0000000000'){alert('This preview only accepts 0000000000. Real numbers need secured publishing.');return;}
  const record={
   id:editing||('sample-'+Date.now()),
   purpose:String(data.get('purpose')||'').trim().slice(0,50),
   bank:String(data.get('bank')||'To be confirmed').trim().slice(0,70)||'To be confirmed',
   accountName:String(data.get('accountName')||'Sample only').trim().slice(0,100)||'Sample only',
   number,
   group:data.get('group')==='other'?'other':'primary',
   enabled:data.has('enabled'),featured:data.has('featured')
  };
  if(!record.purpose){alert('Add an account purpose.');return;}
  if(record.featured){items.forEach(a=>a.featured=false);}
  const existing=items.findIndex(x=>x.id===editing);
  if(existing>=0)items[existing]=record;
  else if(items.length<20)items.push(record);else{alert('Maximum 20 sample accounts.');return;}
  persist();draw();dialog.close();alert('Sample account updated in this browser');
 });
 $('givingInternationalLink').value=link;
 $('saveGivingInternational').addEventListener('click',()=>{
  const value=$('givingInternationalLink').value.trim();
  if(value && !/^https:\/\/example\.(org|com)(\/.*)?$/.test(value)){alert('Use example.org or example.com demonstration links only.');return;}
  link=value;persist();alert('International preview link saved locally');
 });
 $('exportGivingAccounts').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({previewOnly:true,createdAt:new Date().toISOString(),items,internationalLink:link},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cgmk-giving-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 draw();
})();