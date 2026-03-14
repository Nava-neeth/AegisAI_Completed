import { useEffect, useState } from "react"

function System(){

const [systemHealth,setSystemHealth]=useState("Healthy")
const [threatCount,setThreatCount]=useState(0)
const [anomalyLevel,setAnomalyLevel]=useState("Low")
const [notifications,setNotifications]=useState([])



useEffect(()=>{

const fetchSystem=async()=>{

try{

const res=await fetch("http://127.0.0.1:8000/status")
const data=await res.json()

const cpu=data.cpu || 0
const ram=data.memory || 0

let alerts=[]

if(cpu>85 || ram>85){
setSystemHealth("Critical")
setAnomalyLevel("High")
alerts.push("System under high load")
}

else if(cpu>60 || ram>60){
setSystemHealth("Warning")
setAnomalyLevel("Medium")
alerts.push("System load increasing")
}

else{
setSystemHealth("Healthy")
setAnomalyLevel("Low")
alerts.push("System operating normally")
}

setThreatCount(Math.floor(Math.random()*5))

setNotifications(alerts)

}catch(e){
console.log(e)
}

}

fetchSystem()

const interval=setInterval(fetchSystem,3000)

return ()=>clearInterval(interval)

},[])



useEffect(()=>{

const style=document.createElement("style")

style.innerHTML=`
@keyframes slideNotification{
0%{transform:translateX(0);}
60%{transform:translateX(-45vw);}
100%{transform:translateX(-45vw);}
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



return(

<div style={styles.page}>


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

toastContainer:{
position:"fixed",
top:"75px",
right:"380px",
display:"flex",
alignItems:"center",
animation:"slideNotification 0.9s ease forwards",
zIndex:1000
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