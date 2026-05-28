import { useEffect, useState, useRef } from "react"

function System(){

const [systemHealth,setSystemHealth]=useState("Healthy")
const [threatCount,setThreatCount]=useState(0)
const [anomalyLevel,setAnomalyLevel]=useState("Low")
const [notifications,setNotifications]=useState("System operating normally")

const [threatLogs,setThreatLogs]=useState([])
const [showLogs,setShowLogs]=useState(false)

const prevMetricsRef = useRef({cpu:0, ram:0})
const lastHealthRef = useRef("Healthy")
const lastThreatRef = useRef(null)

const resetTimerRef = useRef(null)

useEffect(()=>{

const fetchSystem=async()=>{

try{

const res=await fetch("http://127.0.0.1:8000/status")
if(!res.ok) return

const data=await res.json()

const cpu=data?.cpu || 0
const ram=data?.memory || 0

let health="Healthy"

if(cpu>85 || ram>85){
health="Critical"
}
else if(cpu>70 || ram>70){
health="Warning"
}

setSystemHealth(health)

const prev = prevMetricsRef.current

let anomaly="Low"

if(Math.abs(cpu - prev.cpu) > 40 || Math.abs(ram - prev.ram) > 40){
anomaly="High"
}
else if(cpu>70 || ram>70){
anomaly="Medium"
}

setAnomalyLevel(anomaly)

/* SINGLE NOTIFICATION */
if(health !== lastHealthRef.current){

let message = ""

if(health==="Critical") message="System under high load"
else if(health==="Warning") message="System load increasing"
else message="System operating normally"

setNotifications(message)
lastHealthRef.current = health
}

/* THREAT DETECTION */
let threatMessage = null

if(data?.ml_anomaly === "Anomaly Detected"){
threatMessage = "Anomaly Detected"
}
else if(data?.notification && data.notification.includes("Process killed")){
threatMessage = data.notification
}
else if(health==="Critical"){
threatMessage = "Critical System Load"
}

if(threatMessage && threatMessage !== lastThreatRef.current){

setThreatCount(prev=>{
if(prev >= 10) return prev
return prev + 1
})

setThreatLogs(prev=>{
return [threatMessage, ...prev].slice(0,10)
})

lastThreatRef.current = threatMessage

if(resetTimerRef.current){
clearTimeout(resetTimerRef.current)
}

resetTimerRef.current = setTimeout(()=>{
setThreatCount(0)
setThreatLogs([])
lastThreatRef.current = null
},20000)

}

prevMetricsRef.current = {cpu, ram}

}catch(e){
console.log("System fetch error:",e)
}

}

fetchSystem()
const interval=setInterval(fetchSystem,2000)

return ()=>clearInterval(interval)

},[])



useEffect(()=>{

if(document.getElementById("systemAnim")) return

const style=document.createElement("style")
style.id="systemAnim"

style.innerHTML=`
@keyframes slideNotificationSystem{
0%{transform:translateX(120%);opacity:0;}
100%{transform:translateX(0);opacity:1;}
}
`

document.head.appendChild(style)

},[])



const getHealthColor=()=>{
if(systemHealth==="Critical") return "#ef4444"
if(systemHealth==="Warning") return "#f59e0b"
return "#22c55e"
}

const getAnomalyColor=()=>{
if(anomalyLevel==="High") return "#ef4444"
if(anomalyLevel==="Medium") return "#f59e0b"
return "#22c55e"
}

const getThreatColor=()=>{
if(threatCount>=5) return "#ef4444"
if(threatCount>=2) return "#f59e0b"
return "#22c55e"
}



return(

<div style={styles.page}>

{/* SINGLE NOTIFICATION */}
<div style={styles.toastContainer}>
<div style={styles.toastItem}>
<div style={styles.fireTrail}></div>
<div style={styles.cloudBubble}>
⚠️ {notifications}
</div>
</div>
</div>

<h1 style={styles.title}>
Defense Control System
</h1>

<div style={styles.middleGrid}>

{/* ✅ SYSTEM HEALTH WITH GLOW */}
<div style={{
...styles.card,
borderColor:getHealthColor(),
boxShadow:`0 0 15px ${getHealthColor()}`
}}>
<h2>System Health</h2>

<div style={{
...styles.bigValue,
color:getHealthColor()
}}>
{systemHealth}
</div>

</div>

{/* ✅ THREAT BOX (ALREADY HAD GLOW) */}
<div 
style={{
...styles.card,
borderColor:getThreatColor(),
boxShadow:`0 0 15px ${getThreatColor()}`
}}
onMouseEnter={()=>setShowLogs(true)}
onMouseLeave={()=>setShowLogs(false)}
>

<h2>Threat Occurrence</h2>

<div style={{
...styles.bigValue,
color:getThreatColor()
}}>
{threatCount}
</div>

{showLogs && threatLogs.length>0 && (
<div style={styles.logBox}>
{threatLogs.map((t,i)=>(
<div key={i} style={styles.logItem}>{t}</div>
))}
</div>
)}

</div>

</div>

{/* ✅ ANOMALY WITH GLOW */}
<div style={{
...styles.card,
...styles.anomalyCard,
borderColor:getAnomalyColor(),
boxShadow:`0 0 15px ${getAnomalyColor()}`
}}>

<h2>Anomaly Level</h2>

<div style={{
...styles.bigValue,
color:getAnomalyColor()
}}>
{anomalyLevel}
</div>

</div>

</div>
)
}



const styles={

page:{
height:"100vh",
background:"#0f172a",
padding:"25px",
display:"flex",
flexDirection:"column",
gap:"25px",
fontFamily:"Inter, sans-serif",
color:"white"
},

title:{
textAlign:"center",
fontSize:"36px",
fontWeight:"bold"
},

middleGrid:{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px"
},

card:{
background:"#1e293b",
padding:"40px",
borderRadius:"14px",
border:"2px solid transparent",
boxShadow:"0 0 15px rgba(0,0,0,0.6)",
textAlign:"center",
position:"relative"
},

bigValue:{
fontSize:"32px",
fontWeight:"bold",
marginTop:"10px"
},

anomalyCard:{
marginTop:"10px"
},

logBox:{
position:"absolute",
top:"100%",
left:"50%",
transform:"translateX(-50%)",
background:"#020617",
padding:"10px",
borderRadius:"8px",
marginTop:"10px",
width:"220px",
boxShadow:"0 0 20px rgba(0,0,0,0.6)",
zIndex:999
},

logItem:{
fontSize:"12px",
padding:"4px 0",
borderBottom:"1px solid #334155"
},

toastContainer:{
position:"fixed",
top:"75px",
right:"120px",
zIndex:1000
},

toastItem:{
display:"flex",
alignItems:"center",
animation:"slideNotificationSystem 0.6s ease forwards"
},

fireTrail:{
width:"60px",
height:"6px",
background:"linear-gradient(90deg,#f97316,#ef4444,#facc15)",
borderRadius:"4px",
boxShadow:"0 0 20px #f96516"
},

cloudBubble:{
background:"#e2e8f0",
color:"#020617",
padding:"12px 18px",
borderRadius:"25px",
fontWeight:"600",
marginLeft:"10px",
boxShadow:"0 0 20px rgba(0,0,0,0.4)",
fontSize:"14px"
}

}

export default System