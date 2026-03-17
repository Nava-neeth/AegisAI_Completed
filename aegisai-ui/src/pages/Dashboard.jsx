import { useEffect, useState } from "react"
import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
Legend
} from "recharts"

function Dashboard(){

const [selectedMetric,setSelectedMetric]=useState(null)

const [metrics,setMetrics]=useState({
cpu:0,
ram:0,
disk:0,
network:0
})

const [history,setHistory]=useState([])
const [processes,setProcesses]=useState([])
const [notifications,setNotifications]=useState([])
const [hoverCard,setHoverCard]=useState(null)

const clamp=v=>Math.max(0,Math.min(100,Number(v)||0))

useEffect(()=>{

const fetchMetrics=async()=>{

try{

const res=await fetch("http://127.0.0.1:8000/status")
const data=await res.json()

const newData={
time:new Date().toLocaleTimeString(),
cpu:clamp(data.cpu),
ram:clamp(data.memory),
disk:clamp(data.disk),
network:clamp(data.network)
}

setMetrics(newData)

setProcesses(
(data.processes || []).map(p =>
typeof p === "string" ? p : p.name || JSON.stringify(p)
)
)

setHistory(prev=>{
const updated=[...prev,newData]
if(updated.length>10) updated.shift()
return updated
})

const alerts=[]

if(newData.cpu>=90){
alerts.push("CPU usage high")
}

if(newData.ram>=85){
alerts.push("RAM usage high")
}

if(newData.disk>=90){
alerts.push("Disk almost full")
}

if(alerts.length===0){
alerts.push("System Running Normally")
}

setNotifications(alerts)

}catch(e){
console.log(e)
}

}

fetchMetrics()

const interval=setInterval(fetchMetrics,1500)

return()=>clearInterval(interval)

},[])



useEffect(()=>{

if(document.getElementById("notifyStyle")) return

const style=document.createElement("style")
style.id="notifyStyle"

style.innerHTML=`
@keyframes slideNotification{
0%{transform:translateX(120px);opacity:0;}
100%{transform:translateX(0);opacity:1;}
}
`

document.head.appendChild(style)

},[])



const cardColor=v=>{
if(v>=90) return "#ef4444"
if(v>=70) return "#facc15"
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



<div style={styles.header}>

<h1 style={styles.title}>
Defense Intelligence Dashboard
</h1>

</div>



<div style={styles.cards}>

<Card
title="CPU"
value={metrics.cpu}
color={cardColor(metrics.cpu)}
hover={hoverCard==="cpu"}
onHover={()=>setHoverCard("cpu")}
onLeave={()=>setHoverCard(null)}
onClick={()=>setSelectedMetric("cpu")}
/>

<Card
title="RAM"
value={metrics.ram}
color={cardColor(metrics.ram)}
hover={hoverCard==="ram"}
onHover={()=>setHoverCard("ram")}
onLeave={()=>setHoverCard(null)}
onClick={()=>setSelectedMetric("ram")}
/>

<Card
title="DISK"
value={metrics.disk}
color={cardColor(metrics.disk)}
hover={hoverCard==="disk"}
onHover={()=>setHoverCard("disk")}
onLeave={()=>setHoverCard(null)}
onClick={()=>setSelectedMetric("disk")}
/>

<Card
title="NETWORK"
value={metrics.network}
color={cardColor(metrics.network)}
hover={hoverCard==="network"}
onHover={()=>setHoverCard("network")}
onLeave={()=>setHoverCard(null)}
onClick={()=>setSelectedMetric("network")}
/>

</div>



<div style={styles.mainGrid}>


<div style={styles.chartArea}>

<div style={styles.chartTitle}>
Live Usage Trend
</div>

<button
style={styles.resetButton}
onClick={()=>setSelectedMetric(null)}
>
Show All Metrics
</button>

<ResponsiveContainer width="100%" height="90%">

<LineChart data={history}>

<CartesianGrid stroke="#334155" strokeDasharray="4 4"/>

<XAxis dataKey="time" stroke="#94a3b8"/>

<YAxis domain={[0,100]} stroke="#94a3b8"/>

<Tooltip/>

<Legend/>

{selectedMetric === null ? (
<>
<Line type="monotone" dataKey="cpu" stroke="#22c55e" strokeWidth={1} dot={{r:2}}/>
<Line type="monotone" dataKey="ram" stroke="#f59e0b" strokeWidth={1} dot={{r:2}}/>
<Line type="monotone" dataKey="disk" stroke="#ef4444" strokeWidth={1} dot={{r:2}}/>
</>
) : (
<Line
type="monotone"
dataKey={selectedMetric}
stroke="#22c55e"
strokeWidth={1}
dot={{r:2}}
/>
)}

</LineChart>

</ResponsiveContainer>

</div>



<div style={styles.processBox}>

<h3 style={{marginBottom:"6px"}}>Running Processes</h3>

{processes.map((p,i)=>(
<div key={i} style={styles.processItem}>
{p}
</div>
))}

</div>

</div>

</div>

)

}



function Card({title,value,color,hover,onHover,onLeave,onClick}){

return(

<div
style={{...styles.card,background:color}}
onMouseEnter={onHover}
onMouseLeave={onLeave}
onClick={onClick}
>

{hover && (
<div style={styles.hoverMessage}>
Click to view {title} usage graph
</div>
)}

<div style={styles.cardTitle}>{title}</div>

<div style={styles.cardValue}>
{value.toFixed(1)}%
</div>

</div>

)

}



const styles={

page:{
height:"100vh",
background:"#0f172a",
padding:"20px",
display:"flex",
flexDirection:"column",
fontFamily:"Inter, sans-serif",
color:"white",
gap:"20px"
},

header:{
display:"flex",
justifyContent:"center",
alignItems:"center"
},

title:{
fontSize:"36px",
fontWeight:"bold"
},

cards:{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"20px"
},

card:{
padding:"45px",
borderRadius:"14px",
textAlign:"center",
boxShadow:"0 0 25px rgba(0,0,0,0.4)",
position:"relative"
},

hoverMessage:{
position:"absolute",
top:"-70px",
left:"50%",
transform:"translateX(-50%)",
background:"#020617",
padding:"10px 14px",
borderRadius:"8px",
fontSize:"12px",
border:"1px solid #22c55e",
color:"#22c55e"
},

cardTitle:{fontSize:"16px"},
cardValue:{fontSize:"34px",fontWeight:"bold"},

mainGrid:{
flex:1,
display:"grid",
gridTemplateColumns:"4fr 1fr",
gap:"20px"
},

chartArea:{
background:"#1e293b",
borderRadius:"14px",
padding:"15px",
position:"relative"
},

chartTitle:{
fontSize:"20px",
marginBottom:"10px",
textAlign:"center"
},

resetButton:{
position:"absolute",
right:"20px",
top:"20px",
background:"#334155",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"6px"
},

processBox:{
background:"#1e293b",
borderRadius:"12px",
padding:"10px"
},

processItem:{
fontSize:"13px"
},

toastContainer:{
position:"fixed",
top:"75px",
left:"1150px",
display:"flex",
alignItems:"center",
animation:"slideNotification 0.6s ease forwards",
zIndex:1000
},

fireTrail:{
width:"60px",
height:"6px",
background:"linear-gradient(90deg,#f97316,#ef4444,#facc15)",
borderRadius:"4px"
},

cloudBubble:{
background:"#e2e8f0",
color:"#020617",
padding:"12px 18px",
borderRadius:"25px",
fontWeight:"600",
marginLeft:"10px",
fontSize:"14px"
}

}

export default Dashboard