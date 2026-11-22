import {useEffect,useMemo,useRef,useState} from "react";
import {Link} from "react-router-dom";
import {galleryPhotos,type GalleryPhoto} from "./galleryData";
import {youtubeLive} from "./App";
type Section="gallery"|"messages"|"materials";
const configs:Record<Section,{title:string;sub:string;description:string;filters:string[];empty:string}>={
 gallery:{title:"Gallery.",sub:"Moments from our church family",description:"Explore photographs from our different fellowships. Select a category above to filter the collection.",filters:["All","Men","Women","Youth","Teenagers","Children"],empty:"No photos match your search."},
 messages:{title:"Messages.",sub:"Sermons and teachings",description:"Browse sermons, Bible study recordings, prayer meetings and conference messages when they are uploaded.",filters:["All","Sunday sermons","Bible study","Prayer meetings","Conventions","Series"],empty:"No audio messages are published here yet."},
 materials:{title:"Materials.",sub:"Study resources and publications",description:"Explore Sunday school manuals, convention e-books, study notes and other downloadable resources when they are available.",filters:["All","Sunday school","Convention e-books","Bible study","Guides","Other"],empty:"No study materials are published here yet."}
};
export function MediaPage(){
 const [section,setSection]=useState<Section>("gallery");
 const [filter,setFilter]=useState("All");
 const [search,setSearch]=useState("");
 const [active,setActive]=useState<GalleryPhoto|null>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const cfg=configs[section];
 const filtered=useMemo(()=>section!=="gallery"?[]:galleryPhotos.filter(p=>(filter==="All"||p.category===filter)&&(p.title+" "+p.category).toLowerCase().includes(search.trim().toLowerCase())),[section,filter,search]);
 useEffect(()=>{
   if(!active)return;
   const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setActive(null);};
   document.addEventListener("keydown",close);
   const old=document.body.style.overflow;
   document.body.style.overflow="hidden";
   closeButton.current?.focus();
   return()=>{document.body.style.overflow=old;document.removeEventListener("keydown",close);};
 },[active]);
 const change=(next:Section)=>{setSection(next);setFilter("All");setSearch("");};
 return <main className="cgmk-media-shell">
  <aside className="cgmk-media-aside" aria-label="Media library navigation"><div className="cgmk-aside-top"><p className="cgmk-aside-label">THE LIBRARY</p>
   {([["gallery","grid-1x2","Gallery"],["messages","soundwave","Messages"],["materials","book","Materials"]] as const).map(([key,icon,label])=><button key={key} type="button" data-section={key} className={`cgmk-side-item ${section===key?"is-selected":""}`} aria-pressed={section===key} onClick={()=>change(key)}><i className={`bi bi-${icon}`}/><span>{label}</span></button>)}
   <div className="cgmk-aside-rule"/><p className="cgmk-aside-label">MORE</p><a className="cgmk-side-item" href={youtubeLive} target="_blank" rel="noopener noreferrer"><i className="bi bi-broadcast"/><span>Watch Live</span></a></div><Link className="cgmk-aside-visit" to="/">Visit CGMK <i className="bi bi-arrow-up-right"/></Link>
  </aside>
  <section className="cgmk-media-content" aria-labelledby="mediaHeading">
   <div className="cgmk-media-toolbar"><div className="cgmk-media-search-wrap"><i className="bi bi-search"/><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search media" aria-label="Search media"/></div><span className="cgmk-media-count" aria-live="polite">{section==="gallery"?filtered.length+" photos":"0 items"}</span></div>
   <div className="cgmk-media-filters" aria-label="Filter media">{cfg.filters.map(name=><button key={name} type="button" className={`cgmk-filter-chip ${filter===name?"active":""}`} aria-pressed={filter===name} onClick={()=>setFilter(name)}>{name}</button>)}</div>
   <div className="cgmk-media-intro"><h1 id="mediaHeading">Our <em>{cfg.title}</em></h1><h2>{cfg.sub}</h2><p>{cfg.description}</p></div>
   {filtered.length>0?<div className="cgmk-media-grid">{filtered.map(photo=><button type="button" key={photo.id} className="cgmk-library-card" onClick={()=>setActive(photo)} aria-label={`View ${photo.category} fellowship photo`}><span className="cgmk-library-art"><img src={photo.src} alt={photo.title} loading={photo.id<=8?"eager":"lazy"} decoding="async"/></span><span className="cgmk-library-caption"><strong>{photo.title}</strong><span>{photo.category} <i className="bi bi-arrow-up-right" aria-hidden="true"/></span></span></button>)}</div>:<div className="cgmk-media-no-results"><i className="bi bi-collection"/><h3>{section==="gallery"?"No matching photos":"Coming soon"}</h3><p>{search.trim()?"Try another search or category.":cfg.empty}</p></div>}
  </section>
  {active?<div className="cgmk-photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={e=>{if(e.target===e.currentTarget)setActive(null);}}><button ref={closeButton} type="button" className="cgmk-lightbox-close" aria-label="Close preview" onClick={()=>setActive(null)}><i className="bi bi-x-lg"/></button><img src={active.src} alt={active.title}/><p>{active.title}</p></div>:null}
 </main>;
}
