import { useEffect, useState, useRef } from "react"

function System(){

const [systemHealth,setSystemHealth]=useState("Healthy")
const [threatCount,setThreatCount]=useState(0)
const [anomalyLevel,setAnomalyLevel]=useState("Low")
const [notifications,setNotifications]=useState([])

/* 🔥 FIX: useRef instead of state */
const lastHealthRef = useRef("Healthy")

useEffect(()=>{

const fetchSystem=async()=>{

try{

const res=await fetch("http://127.0.0.1:8000/status")
if(!res.ok) return

const data=await res.json()

const cpu=data?.cpu || 0
const ram=data?.memory || 0

let health="Healthy"
let anomaly="Low"

if(cpu>85 || ram>85){
health="Critical"
anomaly="High"
}
else if(cpu>60 || ram>60){
health="Warning"
anomaly="Medium"
}

/* SET STATES */
setSystemHealth(health)
setAnomalyLevel(anomaly)

/* 🔥 FIX: compare using ref (no duplicate triggers) */
if(health !== lastHealthRef.current){

let message = ""

if(health==="Critical")
message="System under high load"

else if(health==="Warning")
message="System load increasing"

else
message="System operating normally"

/* 🔥 NO DUPLICATE NOTIFICATIONS */
setNotifications(prev=>{
if(prev[0] === message) return prev
return [message, ...prev].slice(0,5)
})

lastHealthRef.current = health
}

/* threat count */
setThreatCount(prev=>{
if(health==="Critical") return Math.min(prev+1,10)
return prev
})

}catch(e){
console.log("System fetch error:",e)
}

}

fetchSystem()
const interval=setInterval(fetchSystem,2000)

return ()=>clearInterval(interval)

},[])

/* animation loader */
useEffect(()=>{

if(document.getElementById("systemAnim")) return

const style=document.createElement("style")
style.id="systemAnim"

style.innerHTML=`
@keyframes slideNotification{
0%{transform:translateX(120px);opacity:0;}
100%{transform:translateX(0);opacity:1;}
}
`

document.head.appendChild(style)

},[])

/* COLORS */
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

return(

<div style={styles.page}>

{/* 🔥 NOTIFICATIONS */}
{notifications.map((msg,i)=>(

<div key={i} style={styles.toastContainer}>
  <div style={styles.fireTrail}></div>

  <div style={styles.cloudBubble}>
    ⚠️ {msg}
  </div>
</div>
))}

<h1 style={styles.title}>
Defense Control System
</h1>

<div style={styles.middleGrid}>

<div style={{
...styles.card,
borderColor:getHealthColor()
}}>
<h2>System Health</h2>

<div style={{
...styles.bigValue,
color:getHealthColor()
}}>
{systemHealth}
</div>

</div>

<div style={styles.card}>
<h2>Threat Occurrence</h2>

<div style={styles.bigValue}>
{threatCount}
</div>

</div>

</div>

<div style={{
...styles.card,
...styles.anomalyCard,
borderColor:getAnomalyColor()
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
textAlign:"center"
},

bigValue:{
fontSize:"32px",
fontWeight:"bold",
marginTop:"10px"
},

anomalyCard:{
marginTop:"10px"
},

/* 🔥 NOTIFICATION STYLE */
toastContainer:{
position:"fixed",
top:"75px",
right:"120px",
display:"flex",
alignItems:"center",
animation:"slideNotification 0.6s ease forwards",
zIndex:1000
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