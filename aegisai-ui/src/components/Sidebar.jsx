import { NavLink } from "react-router-dom"
import { LayoutDashboard, Bell, Cpu, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

function Sidebar(){

/* SIDEBAR STARTS CLOSED */

const [collapsed,setCollapsed] = useState(true)

const linkStyle = ({isActive}) => ({
display:"flex",
alignItems:"center",
gap:"12px",
padding:"12px 14px",
marginBottom:"10px",
borderRadius:"8px",
textDecoration:"none",
fontSize:"14px",
fontWeight:"500",
color:"#e2e8f0",
background:isActive ? "rgba(255,255,255,0.12)" : "transparent",
transition:"all .25s ease"
})

return(

<div style={{
width: collapsed ? "70px":"210px",
height:"100vh",
background:"rgba(15,23,42,0.45)",
backdropFilter:"blur(16px)",
borderRight:"1px solid rgba(255,255,255,0.06)",
padding:"20px 12px",
display:"flex",
flexDirection:"column",
transition:"all .3s ease",
boxShadow:"0 0 25px rgba(59,130,246,0.08)"
}}>

{/* HEADER */}

<div style={{
display:"flex",
alignItems:"center",
justifyContent: collapsed ? "center":"space-between",
marginBottom:"20px"
}}>

{!collapsed && (
<h2 style={{
fontSize:"18px",
fontWeight:"600",
letterSpacing:"0.5px",
color:"#f8fafc",
}}>
  AegisAI
</h2>
)}

<div
onClick={()=>setCollapsed(!collapsed)}
style={{
cursor:"pointer",
padding:"6px",
borderRadius:"6px",
background:"rgba(255,255,255,0.06)"
}}
>
{collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
</div>

</div>

{/* NAVIGATION */}

<nav style={{marginTop:"10px"}}>

<NavLink to="/dashboard" style={linkStyle} className="nav-item">
<LayoutDashboard size={18}/>
{!collapsed && "Dashboard"}
</NavLink>

<NavLink to="/alerts" style={linkStyle} className="nav-item">
<Bell size={18}/>
{!collapsed && "Alerts"}
</NavLink>

<NavLink to="/system" style={linkStyle} className="nav-item">
<Cpu size={18}/>
{!collapsed && "System"}
</NavLink>

</nav>

{/* SYSTEM STATUS */}

{!collapsed && (

<div style={{
marginTop:"auto",
padding:"10px",
borderRadius:"8px",
background:"rgba(255,255,255,0.05)",
display:"flex",
alignItems:"center",
gap:"8px",
fontSize:"12px",
color:"#cbd5f5"
}}>

<span style={{
width:"8px",
height:"8px",
borderRadius:"50%",
background:"#22c55e",
boxShadow:"0 0 10px #22c55e"
}}/>

System Monitoring Active

</div>

)}

</div>

)

}

export default Sidebar