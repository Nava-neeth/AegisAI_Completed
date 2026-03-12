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

const [metrics,setMetrics]=useState({
cpu:0,
ram:0,
disk:0,
network:0
})

const [history,setHistory]=useState([])
const [processes,setProcesses]=useState([])
const [cpuThreshold,setCpuThreshold]=useState(90)
const [notifications,setNotifications]=useState([])
const [hoverCard,setHoverCard]=useState(null)

const clamp=v=>Math.max(0,Math.min(100,Number(v)||0))

useEffect(()=>{

const loadThreshold=async()=>{

try{
const res=await fetch("http://127.0.0.1:8000/get-cpu-threshold")
const data=await res.json()

if(data.cpu){
setCpuThreshold(data.cpu)
}

}catch(e){
console.log(e)
}

}

loadThreshold()

},[])



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
setProcesses(data.processes || [])

setHistory(prev=>{
const updated=[...prev,newData]
if(updated.length>10) updated.shift()
return updated
})

const alerts=[]

if(newData.cpu>=cpuThreshold){
alerts.push("CPU threshold exceeded")
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

const interval=setInterval(fetchMetrics,2000)

return()=>clearInterval(interval)

},[cpuThreshold])



const updateThreshold=async(v)=>{

setCpuThreshold(v)

try{

await fetch("http://127.0.0.1:8000/set-cpu-threshold",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({cpu:v})
})

}catch(e){
console.log(e)
}

}



const cardColor=v=>{
if(v>=cpuThreshold) return "#ef4444"
if(v>=cpuThreshold-20) return "#facc15"
return "#22c55e"
}



return(

<div style={styles.page}>


<div style={styles.notificationBar}>
{notifications.join("  |  ")}
</div>



<div style={styles.header}>

<h1 style={styles.title}>
System Monitoring Dashboard
</h1>

<div style={styles.thresholdBox}>
CPU Threshold
<input
value={cpuThreshold}
onChange={e=>updateThreshold(Number(e.target.value))}
style={styles.thresholdInput}
/>
</div>

</div>



<div style={styles.cards}>

<Card
title="CPU"
value={metrics.cpu}
color={cardColor(metrics.cpu)}
dataKey="cpu"
history={history}
hover={hoverCard==="cpu"}
onHover={()=>setHoverCard("cpu")}
onLeave={()=>setHoverCard(null)}
/>

<Card
title="RAM"
value={metrics.ram}
color={cardColor(metrics.ram)}
dataKey="ram"
history={history}
hover={hoverCard==="ram"}
onHover={()=>setHoverCard("ram")}
onLeave={()=>setHoverCard(null)}
/>

<Card
title="DISK"
value={metrics.disk}
color={cardColor(metrics.disk)}
dataKey="disk"
history={history}
hover={hoverCard==="disk"}
onHover={()=>setHoverCard("disk")}
onLeave={()=>setHoverCard(null)}
/>

<Card
title="NETWORK"
value={metrics.network}
color={cardColor(metrics.network)}
dataKey="network"
history={history}
hover={hoverCard==="network"}
onHover={()=>setHoverCard("network")}
onLeave={()=>setHoverCard(null)}
/>

</div>



<div style={styles.mainGrid}>


<div style={styles.chartArea}>

<div style={styles.chartTitle}>
Live Usage Trend
</div>

<ResponsiveContainer width="100%" height="90%">

<LineChart data={history}>

<CartesianGrid stroke="#334155" strokeDasharray="4 4"/>

<XAxis dataKey="time" stroke="#94a3b8"/>

<YAxis domain={[0,100]} stroke="#94a3b8"/>

<Tooltip/>

<Legend/>

<Line type="monotone" dataKey="cpu" stroke="#22c55e" strokeWidth={2} dot={{r:3}}/>

<Line type="monotone" dataKey="ram" stroke="#f59e0b" strokeWidth={2} dot={{r:3}}/>

<Line type="monotone" dataKey="disk" stroke="#ef4444" strokeWidth={2} dot={{r:3}}/>

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



function Card({title,value,color,dataKey,history,hover,onHover,onLeave}){

return(

<div
style={{...styles.card,background:color}}
onMouseEnter={onHover}
onMouseLeave={onLeave}
>

{hover && (

<div style={styles.previewChart}>

<ResponsiveContainer width="100%" height={80}>

<LineChart data={history}>

<Line
type="monotone"
dataKey={dataKey}
stroke="#ffffff"
strokeWidth={2}
dot={false}
/>

</LineChart>

</ResponsiveContainer>

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

notificationBar:{
background:"#1e293b",
padding:"10px",
borderRadius:"8px",
textAlign:"center",
fontWeight:"500"
},

header:{
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative"
},

title:{
fontSize:"36px",
fontWeight:"bold"
},

thresholdBox:{
position:"absolute",
right:"0",
display:"flex",
gap:"8px",
alignItems:"center"
},

thresholdInput:{
width:"60px",
padding:"6px",
borderRadius:"6px",
border:"2px solid #facc15",
boxShadow:"0 0 8px #facc15",
background:"#1e293b",
color:"white"
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

previewChart:{
position:"absolute",
top:"-90px",
left:"0",
width:"100%",
background:"#020617",
padding:"6px",
borderRadius:"8px"
},

cardTitle:{
fontSize:"16px"
},

cardValue:{
fontSize:"34px",
fontWeight:"bold"
},

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

processBox:{
background:"#1e293b",
borderRadius:"12px",
padding:"10px"
},

processItem:{
fontSize:"13px"
}

}

export default Dashboard