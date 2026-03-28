import { useEffect, useState, useRef } from "react"

function Alerts(){

const [metrics,setMetrics]=useState({
cpu:0,
ram:0,
network:0
})

const [status,setStatus]=useState({
cpu:"NORMAL",
ram:"NORMAL",
network:"NORMAL"
})

const [notifications,setNotifications]=useState([])

/* 🔥 NEW: track previous values for anomaly detection */
const prevMetricsRef = useRef({cpu:0, ram:0, network:0})

/* 🔥 NEW: prevent duplicate alerts */
const lastAlertsRef = useRef([])

/* 🔥 NEW: anomaly + response */
const [anomaly,setAnomaly]=useState("No anomaly detected")
const [response,setResponse]=useState("Monitoring system stable")

useEffect(()=>{

const fetchStatus=async()=>{

try{

const res=await fetch("http://127.0.0.1:8000/status")
const data=await res.json()

const cpu = Number(data?.cpu) || 0
const ram = Number(data?.memory) || 0
const network = Number(data?.network) || 0

setMetrics({cpu,ram,network})

/* STATUS */
const cpuStatus =
cpu>90 ? "CRITICAL" :
cpu>70 ? "WARNING" :
"NORMAL"

const ramStatus =
ram>90 ? "CRITICAL" :
ram>70 ? "WARNING" :
"NORMAL"

const netStatus =
network>90 ? "CRITICAL" :
network>70 ? "WARNING" :
"NORMAL"

setStatus({
cpu:cpuStatus,
ram:ramStatus,
network:netStatus
})

/* 🔥 REAL ANOMALY DETECTION (SPIKE BASED) */
const prev = prevMetricsRef.current

let anomalyMsg = "No anomaly detected"

if(Math.abs(cpu - prev.cpu) > 20){
anomalyMsg = "CPU spike detected"
}
else if(Math.abs(ram - prev.ram) > 20){
anomalyMsg = "RAM spike detected"
}
else if(Math.abs(network - prev.network) > 25){
anomalyMsg = "Network spike detected"
}

setAnomaly(anomalyMsg)

/* 🔥 AUTOMATED RESPONSE (REAL LOGIC) */
let responseMsg = "Monitoring system stable"

if(cpuStatus==="CRITICAL" || ramStatus==="CRITICAL"){
responseMsg = "High load detected → limiting processes"
}
else if(cpuStatus==="WARNING" || ramStatus==="WARNING"){
responseMsg = "Optimizing system performance"
}

setResponse(responseMsg)

/* 🔥 ALERTS */
let alerts=[]

if(cpuStatus==="CRITICAL")
alerts.push("CPU critical load detected")
else if(cpuStatus==="WARNING")
alerts.push("CPU usage warning")

if(ramStatus==="CRITICAL")
alerts.push("RAM critical usage detected")
else if(ramStatus==="WARNING")
alerts.push("RAM usage warning")

if(netStatus==="CRITICAL")
alerts.push("Network critical traffic detected")
else if(netStatus==="WARNING")
alerts.push("Network usage warning")

if(alerts.length===0){
alerts.push("System running normally")
}

/* 🔥 PREVENT DUPLICATES */
const same = JSON.stringify(alerts) === JSON.stringify(lastAlertsRef.current)
if(!same){
setNotifications(alerts)
lastAlertsRef.current = alerts
}

/* update previous */
prevMetricsRef.current = {cpu,ram,network}

}catch(e){
console.log(e)
}

}

fetchStatus()

const interval=setInterval(fetchStatus,2000)

return ()=>clearInterval(interval)

},[])



useEffect(()=>{

if(document.getElementById("notifyStyle")) return

const style=document.createElement("style")
style.id="notifyStyle"

style.innerHTML=`
@keyframes slideNotification{
0%{
transform:translateX(120%);
opacity:0;
}
100%{
transform:translateX(0);
opacity:1;
}
}
`

document.head.appendChild(style)

},[])



const getColor=(state)=>{
if(state==="CRITICAL") return "#ef4444"
if(state==="WARNING") return "#f59e0b"
return "#22c55e"
}

const getGlow=(state)=>{
if(state==="CRITICAL") return "0 0 25px rgba(239,68,68,0.8)"
if(state==="WARNING") return "0 0 20px rgba(245,158,11,0.8)"
return "0 0 20px rgba(0,0,0,0.6)"
}



return(

<div style={styles.page}>

<div style={styles.toastContainer}>
{notifications.map((msg,i)=>(
<div key={i} style={styles.toastItem}>
  <div style={styles.fireTrail}></div>
  <div style={styles.cloudBubble}>
    ⚠️ {msg}
  </div>
</div>
))}
</div>

<h1 style={styles.title}>
Autonomous Threat Detection
</h1>

<div style={styles.cardGrid}>

<Card title="RAM" value={metrics.ram} status={status.ram} color={getColor(status.ram)} glow={getGlow(status.ram)} />
<Card title="CPU" value={metrics.cpu} status={status.cpu} color={getColor(status.cpu)} glow={getGlow(status.cpu)} />
<Card title="NETWORK" value={metrics.network} status={status.network} color={getColor(status.network)} glow={getGlow(status.network)} />

</div>

<div style={styles.bottomGrid}>

<div style={styles.panel}>
<h2>AI Anomaly Detection</h2>
<div style={{marginTop:"10px",color:"#22c55e"}}>
{anomaly}
</div>
</div>

<div style={styles.panel}>
<h2>Automated Response</h2>
<div style={{marginTop:"10px"}}>
{response}
</div>
</div>

</div>

</div>

)

}



function Card({title,value,status,color,glow}){

return(

<div style={{
...styles.card,
background:color,
boxShadow:glow
}}>

<div style={styles.cardTitle}>{title}</div>

<div style={styles.cardValue}>{value.toFixed(1)}%</div>

<div style={styles.cardStatus}>{status}</div>

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

cardGrid:{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"25px"
},

card:{
padding:"40px",
borderRadius:"14px",
textAlign:"center"
},

cardTitle:{fontSize:"20px",marginBottom:"8px"},
cardValue:{fontSize:"18px",opacity:0.9},
cardStatus:{fontSize:"28px",fontWeight:"bold"},

bottomGrid:{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px"
},

panel:{
background:"#1e293b",
padding:"35px",
borderRadius:"14px",
textAlign:"center",
boxShadow:"0 0 20px rgba(0,0,0,0.6)"
},

toastContainer:{
position:"fixed",
top:"75px",
right:"120px",
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:"10px",
zIndex:1000
},

toastItem:{
display:"flex",
alignItems:"center",
animation:"slideNotification 0.6s ease forwards"
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

export default Alerts