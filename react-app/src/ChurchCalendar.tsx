import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
const week=[{day:0,name:"Sunday Service",time:"9:00 AM"},{day:2,name:"Bible Study",time:"6:00 PM"},{day:4,name:"Prayer Meeting",time:"6:00 PM"}] as const;
type CalendarDate={year:number;month:number;date:number};
function lagosToday():CalendarDate{
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Lagos",year:"numeric",month:"numeric",day:"numeric"}).formatToParts(new Date());
 const get=(type:string)=>Number(parts.find(p=>p.type===type)?.value);
 return {year:get("year"),month:get("month")-1,date:get("day")};
}
const utc=(y:number,m:number,d:number)=>new Date(Date.UTC(y,m,d));
const dateKey=(y:number,m:number,d:number)=>[y,String(m+1).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
const months=new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric",timeZone:"UTC"});
const label=(y:number,m:number)=>months.format(utc(y,m,1));
export function ChurchCalendar(){
 const today=useMemo(lagosToday,[]);
 const [year,setYear]=useState(today.year);
 const [month,setMonth]=useState(today.month);
 const [selected,setSelected]=useState<string|null>(null);
 const startOffset=utc(year,month,1).getUTCDay();
 const daysInMonth=utc(year,month+1,0).getUTCDate();
 const currentStart=selected?Date.parse(selected+"T00:00:00Z"):Date.UTC(today.year,today.month,today.date);
 const upcoming=useMemo(()=>{
  const result:{date:Date;name:string;time:string}[]=[];
  for(let offset=0;offset<35&&result.length<3;offset++){
   const date=new Date(currentStart+offset*86400000);
   const gathering=week.find(w=>w.day===date.getUTCDay());
   if(gathering)result.push({date,name:gathering.name,time:gathering.time});
  }
  return result;
 },[currentStart]);
 const changeMonth=(by:number)=>{
  const date=utc(year,month+by,1);
  setYear(date.getUTCFullYear());setMonth(date.getUTCMonth());setSelected(null);
 };
 return <section className="cgmk-month-section" id="activities" aria-labelledby="month-heading"><div className="cgmk-site-container">
 <div className="cgmk-month-heading"><div><h2 id="month-heading">Join us this week.</h2><p>Worship, Bible study and prayer at CGM Karu.</p></div><Link to="/contact">Plan your visit <i className="bi bi-arrow-up-right" aria-hidden="true"/></Link></div>
 <div className="cgmk-month-layout">
  <div className="cgmk-calendar" aria-label="Monthly church gathering calendar">
   <div className="cgmk-calendar-header"><div><h3>{label(year,month)}</h3></div><div className="cgmk-calendar-controls"><button type="button" aria-label="Previous month" onClick={()=>changeMonth(-1)}><i className="bi bi-chevron-left"/></button><button type="button" aria-label="Next month" onClick={()=>changeMonth(1)}><i className="bi bi-chevron-right"/></button></div></div>
   <div className="cgmk-calendar-weekdays" aria-hidden="true">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><span key={day}>{day}</span>)}</div>
   <div className="cgmk-calendar-days" aria-label="Days of the month">
     {Array.from({length:startOffset},(_,i)=><span key={`blank-${i}`} className="cgmk-calendar-blank"/>)}
     {Array.from({length:daysInMonth},(_,i)=>{
       const day=i+1,date=utc(year,month,day),weekday=date.getUTCDay(),service=week.find(w=>w.day===weekday);
       const key=dateKey(year,month,day);
       return <button key={day} type="button" data-weekday={weekday} className={[(service?"has-event":""),(year===today.year&&month===today.month&&day===today.date?"is-today":""),(selected===key?"is-selected":"")].join(" ")} aria-label={`${day} ${label(year,month)}${service?", "+service.name+" at "+service.time+" WAT":""}`} aria-pressed={selected===key} onClick={()=>setSelected(prev=>prev===key?null:key)}>{day}</button>;
     })}
   </div>
   <div className="cgmk-calendar-legend"><span><i className="cgmk-dot cgmk-dot-sun"/> Sunday Service</span><span><i className="cgmk-dot cgmk-dot-tue"/> Bible Study</span><span><i className="cgmk-dot cgmk-dot-thu"/> Prayer Meeting</span></div>
  </div>
  <div className="cgmk-upcoming"><div className="cgmk-upcoming-head"><div><h3>Upcoming gatherings</h3></div><span className="cgmk-upcoming-tz">WAT · Nigeria</span></div>
   <div className="cgmk-upcoming-list" aria-live="polite">{upcoming.map(item=><article key={item.date.toISOString()} className="cgmk-upcoming-item"><div className="cgmk-upcoming-date"><strong>{item.date.getUTCDate()}</strong><span>{new Intl.DateTimeFormat("en-GB",{month:"short",timeZone:"UTC"}).format(item.date)}</span></div><div><h4>{item.name}</h4><p>{item.time} WAT · {new Intl.DateTimeFormat("en-GB",{weekday:"long",timeZone:"UTC"}).format(item.date)}</p></div><i className="bi bi-arrow-up-right" aria-hidden="true"/></article>)}</div>
   <p className="cgmk-calendar-disclaimer">Regular weekly gatherings. Special events will appear here when their dates are confirmed.</p>
  </div>
 </div></div></section>;
}
