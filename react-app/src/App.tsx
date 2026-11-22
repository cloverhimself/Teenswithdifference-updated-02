import {useEffect,useState,type ReactNode} from "react";
import {Link,useLocation} from "react-router-dom";
import parse from "html-react-parser";
import {legacyContent} from "./content";
import {ChurchCalendar} from "./ChurchCalendar";
import {MediaPage} from "./MediaPage";
import {AboutPage} from "./AboutPage";

export const youtubeLive="https://www.youtube.com/@cgmkaruabuja977/live";
export function Legacy({html}:{html:string}):ReactNode{return parse(html);}
const navItems=[{label:"Home",to:"/"},{label:"About",to:"/about"},{label:"Media",to:"/media"},{label:"Events",to:"/#activities"},{label:"Give",to:"/give"},{label:"Contact",to:"/contact"}];
function Header(){
 const [opened,setOpened]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 const location=useLocation();
 useEffect(()=>{
   const sync=()=>setScrolled(window.scrollY>25);
   sync();window.addEventListener("scroll",sync,{passive:true});
   return()=>window.removeEventListener("scroll",sync);
 },[]);
 useEffect(()=>{setOpened(false);document.documentElement.classList.remove("cgmk-drawer-open");},[location.pathname,location.hash]);
 useEffect(()=>{
   document.documentElement.classList.toggle("cgmk-drawer-open",opened);
   const esc=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpened(false);};
   document.addEventListener("keydown",esc);
   return()=>{document.documentElement.classList.remove("cgmk-drawer-open");document.removeEventListener("keydown",esc);};
 },[opened]);
 return <header className={["cgmk-header",location.pathname!=="/"?"cgmk-inner-header":"",scrolled?"is-scrolled":"",opened?"is-menu-open":""].join(" ")} id="cgmkHeader">
 <Link className="cgmk-brand" to="/" aria-label="CGMK home">CGMK<span className="cgmk-brand-dot">.</span></Link>
 <nav className={`cgmk-nav ${opened?"is-open":""}`} id="cgmkNav" aria-label="Main navigation">
   {navItems.map(item=><Link key={item.label} to={item.to} aria-current={item.to===location.pathname?"page":undefined} onClick={()=>setOpened(false)}>{item.label}</Link>)}
 </nav>
 <a className="cgmk-nav-action" href={youtubeLive} target="_blank" rel="noopener noreferrer">Watch Live <span aria-hidden="true">↗</span></a>
 <button type="button" className="cgmk-menu-toggle" aria-label={opened?"Close navigation":"Open navigation"} aria-expanded={opened} aria-controls="cgmkNav" onClick={()=>setOpened(v=>!v)}><span/><span/></button>
 </header>;
}
function Footer(){
 const contact=[["WhatsApp","https://wa.me/2348033193319"],["Call us","tel:+2348033193319"],["YouTube","https://www.youtube.com/@cgmkaruabuja977"],["Instagram","https://www.instagram.com/cgmkaruabuja/?hl=en"]];
 return <footer className="cgmk-footer" id="footer"><div className="cgmk-site-container">
 <div className="cgmk-footer-top"><div className="cgmk-footer-lead"><Link className="cgmk-footer-logo" to="/">CGMK</Link><h2>Growing in Christ.<br/>Living with purpose.</h2><p>We'd love to welcome you to our church family in Karu, Abuja.</p></div>
 <div className="cgmk-footer-columns"><div className="cgmk-footer-col"><h3>Explore</h3>{navItems.map(n=><Link to={n.to} key={n.label}>{n.label}</Link>)}</div>
 <div className="cgmk-footer-col"><h3>Connect</h3>{contact.map(([label,url])=><a key={label} href={url} target={url.startsWith("http")?"_blank":undefined} rel={url.startsWith("http")?"noopener noreferrer":undefined}>{label}</a>)}</div></div></div>
 <div className="cgmk-footer-type">CGMK</div><div className="cgmk-footer-bottom"><span>© {new Date().getFullYear()} Christ Gospel Mission Karu.</span><span>Karu, Abuja, Nigeria</span><a href="#top">Back to top <i className="bi bi-arrow-up" aria-hidden="true"/></a></div></div></footer>;
}
function Home(){
 useEffect(()=>{
   const cards=[...document.querySelectorAll<HTMLButtonElement>(".cgmk-fellowship-card")];
   const handlers=cards.map(card=>{
    const handler=(event:MouseEvent)=>{
      if((event.target as Element)?.closest(".cgmk-fellowship-more")){window.location.assign("/media");return;}
      const pinned=card.classList.contains("is-pinned");
      cards.forEach(c=>{c.classList.remove("is-pinned");c.setAttribute("aria-pressed","false");});
      if(!pinned){card.classList.add("is-pinned");card.setAttribute("aria-pressed","true");}
    };
    card.addEventListener("click",handler);
    return()=>card.removeEventListener("click",handler);
   });
   return()=>handlers.forEach(fn=>fn());
 },[]);
 return <><main><Legacy html={legacyContent.homeHero}/><ChurchCalendar/><Legacy html={legacyContent.homePastor}/><Legacy html={legacyContent.homeFellowships}/><Legacy html={legacyContent.homeGive}/></main></>;
}
function StaticPage({page}:{page:"giveMain"|"contactMain"}){return <main><Legacy html={legacyContent[page]}/></main>;}
function NotFound(){return <main style={{minHeight:"65vh",padding:"180px 7% 75px"}}><h1>Page not found</h1><p>The page you requested isn't available.</p><Link to="/">Return home</Link></main>;}
const meta:Record<string,[string,string]>={
 "/":["CGMK | Christ Gospel Mission Karu","Grow in faith and find community in Karu, Abuja."],
 "/about":["About CGMK | Our Mission & Philosophy","Our mission, philosophy and church history."],
 "/media":["Media | CGMK","Church photographs, messages and resources."],
 "/give":["Give | CGMK","Support the work of CGM Karu through verified channels."],
 "/contact":["Connect with CGMK","Contact Christ Gospel Mission Karu."]
};
export default function App(){
 const location=useLocation();
 useEffect(()=>{
   const [title,description]=meta[location.pathname]||["CGMK","Christ Gospel Mission Karu"];
   document.title=title;
   document.querySelector('meta[name="description"]')?.setAttribute("content",description);
   const pageClasses:Record<string,string>={"/about":"cgmk-about-page","/media":"cgmk-media-page","/give":"cgmk-give-page","/contact":"cgmk-connect-page"};
   document.body.className=pageClasses[location.pathname]||"";
   const hash=location.hash;
   if(hash){requestAnimationFrame(()=>document.getElementById(hash.slice(1))?.scrollIntoView({behavior:"smooth"}));}
   else window.scrollTo({top:0,behavior:"instant"});
   return()=>{document.body.className="";};
 },[location.pathname,location.hash]);
 return <div id="top"><Header/>{location.pathname==="/"?<Home/>:location.pathname==="/about"?<AboutPage/>:location.pathname==="/media"?<MediaPage/>:location.pathname==="/give"?<StaticPage page="giveMain"/>:location.pathname==="/contact"?<StaticPage page="contactMain"/>:<NotFound/>}<Footer/></div>;
}
