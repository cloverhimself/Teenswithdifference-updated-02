import {useEffect,useMemo,useState} from "react";
import {legacyContent} from "./content";
import {Legacy} from "./App";
const mission={
 title:<>Proclaim the Word.<br/>Raise leaders.<br/><em>Reach the nations.</em></>,
 text:"Christ Gospel Mission International is committed to proclaiming the unadulterated Word of God with signs and wonders, planting vibrant churches in all nations of the world, and developing leadership until Jesus Christ comes back.",
 image:"https://res.cloudinary.com/htec4rnl/image/upload/v1795064800/men2.jpg",
 name:"OUR MISSION"
};
const philosophy={
 title:<>Everyone has a<br/><em>place to grow.</em></>,
 text:"In every newcomer, we see a potential member; in every member, we see a potential worker; in every worker, we see a potential minister.",
 image:"https://res.cloudinary.com/htec4rnl/image/upload/v1795065015/women2.jpg",
 name:"OUR PHILOSOPHY"
};
function MissionTabs(){
 const [tab,setTab]=useState(0);
 const detail=tab===0?mission:philosophy;
 return <div className="cgmk-identity-interactive" aria-label="Our mission and philosophy"><div className="cgmk-identity-controls" role="tablist" aria-label="What we believe">
  {["Our mission","Our philosophy"].map((name,i)=><button type="button" key={name} className="cgmk-identity-tab" role="tab" id={i===0?"cgmk-mission-tab":"cgmk-philosophy-tab"} aria-selected={tab===i} aria-controls="cgmk-selected-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)} onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();setTab(1-tab);}}}>{name}</button>)}</div>
  <div className="cgmk-identity-panel" role="tabpanel" id="cgmk-selected-panel" aria-labelledby={tab===0?"cgmk-mission-tab":"cgmk-philosophy-tab"} tabIndex={0}>
    <div className="cgmk-identity-panel-intro"><span>{detail.name}</span><i className="bi bi-arrow-up-right" aria-hidden="true"/></div>
    <h3>{detail.title}</h3><p>{detail.text}</p>
    <figure className="cgmk-identity-photo"><img src={detail.image} alt="CGMK fellowship members together" loading="lazy"/></figure>
  </div></div>;
}
export function AboutPage(){
 const [before,after]=useMemo(()=>{
  const html=legacyContent.aboutMain;
  const start=html.indexOf('<div class="cgmk-identity-interactive"');
  const end=html.indexOf('<a class="cgmk-official-source"',start);
  if(start<0||end<0)return [html,""];
  return [html.slice(0,start),html.slice(end)];
 },[]);
 useEffect(()=>{
   const timeline=document.querySelector<HTMLElement>(".cgmk-timeline-v2");
   const progress=document.querySelector<HTMLElement>(".cgmk-timeline-progress");
   if(!timeline||!progress)return;
   let frame=0;
   const update=()=>{
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
     const rect=timeline.getBoundingClientRect();
     const fraction=Math.max(0,Math.min(1,(innerHeight*.58-rect.top)/Math.max(rect.height,1)));
     progress.style.height=(fraction*100).toFixed(1)+"%";
    });
   };
   window.addEventListener("scroll",update,{passive:true});
   window.addEventListener("resize",update,{passive:true});
   update();
   return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",update);window.removeEventListener("resize",update);};
 },[]);
 return <main><Legacy html={before}/><MissionTabs/><Legacy html={after}/></main>;
}
