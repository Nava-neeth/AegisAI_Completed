import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

function Welcome() {

const navigate = useNavigate()

const [loading,setLoading] = useState(false)
const [progress,setProgress] = useState(0)
const [typed,setTyped] = useState("")
const [mouse,setMouse] = useState({x:0,y:0})

const subtitle = "Autonomous Threat & Intelligence System"

useEffect(()=>{

const move = e=>{
  setMouse({
    x:e.clientX,
    y:e.clientY
  })
}

window.addEventListener("mousemove",move)

return ()=>window.removeEventListener("mousemove",move)

},[])

useEffect(()=>{

let i=0

const typing=setInterval(()=>{

  if(i<subtitle.length){
    setTyped(subtitle.slice(0,i+1))
    i++
  }else{
    clearInterval(typing)
  }

},35)

return ()=>clearInterval(typing)

},[])

const handleEnter=()=>{

setLoading(true)

let value=0

const interval=setInterval(()=>{

  value+=5
  setProgress(value)

  if(value>=100){
    clearInterval(interval)
    sessionStorage.setItem("visited","true")
    navigate("/dashboard",{replace:true})
  }

},80)

}

return(

<div style={wrapper}>

  <style>{`

  @keyframes gradientFlow{
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }

  @keyframes float{
    0%{transform:translateY(0)}
    50%{transform:translateY(-8px)}
    100%{transform:translateY(0)}
  }

  @keyframes fadeIn{
    from{opacity:0; transform:translateY(30px)}
    to{opacity:1; transform:translateY(0)}
  }

  @keyframes glow{
    0%{opacity:.5}
    50%{opacity:1}
    100%{opacity:.5}
  }

  @keyframes shine{
    0%{background-position:-200px}
    100%{background-position:200px}
  }

  @keyframes particlesMove{
    0%{background-position:0 0}
    100%{background-position:900px 900px}
  }

  `}</style>

  {/* background grid */}
  <div style={particles}></div>

  {/* parallax light layer */}
  <div
    style={{
      ...parallaxLight,
      transform:`translate(${mouse.x*0.02}px,${mouse.y*0.02}px)`
    }}
  />

  {/* mouse glow */}
  <div
    style={{
      ...mouseLight,
      left:mouse.x-200,
      top:mouse.y-200
    }}
  />

  {!loading &&(

    <div
    style={{
      ...panel,
      transform:`translate(${mouse.x*0.01}px,${mouse.y*0.01}px)`
    }}
    >

      <div style={pulse}></div>

      <h1 style={title}>
       Welcome To AegisAI
      </h1>

      <p style={subtitleStyle}>
        {typed}
      </p>

      <button
      style={button}
      onClick={handleEnter}
      onMouseEnter={(e)=>{
        e.target.style.transform="scale(1.06)"
        e.target.style.boxShadow="0 0 45px #38bdf8"
      }}
      onMouseLeave={(e)=>{
        e.target.style.transform="scale(1)"
        e.target.style.boxShadow="0 0 20px #38bdf8"
      }}
      >
        Enter System
      </button>

    </div>

  )}

  {loading &&(

    <div style={panel}>

      <h2 style={bootTitle}>
        Initializing AI Core...
      </h2>

      <div style={progressBg}>

        <div
        style={{
          ...progressBar,
          width:`${progress}%`
        }}
        />

      </div>

      <p style={progressText}>
        {progress}% Loading AI Modules
      </p>

    </div>

  )}

</div>

)

}

/* MAIN WRAPPER */

const wrapper={
height:"100vh",
width:"100vw",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(270deg,#020617,#0f172a,#020617)",
backgroundSize:"400% 400%",
animation:"gradientFlow 18s ease infinite",
color:"white",
overflow:"hidden",
position:"relative"
}

/* PARTICLES */

const particles={
position:"absolute",
width:"100%",
height:"100%",
backgroundImage:"radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)",
backgroundSize:"70px 70px",
animation:"particlesMove 45s linear infinite",
opacity:.35
}

/* PARALLAX LIGHT */

const parallaxLight={
position:"absolute",
width:"600px",
height:"600px",
background:"radial-gradient(circle,rgba(56,189,248,.15),transparent 70%)",
filter:"blur(80px)",
pointerEvents:"none"
}

/* MOUSE LIGHT */

const mouseLight={
position:"absolute",
width:"400px",
height:"400px",
background:"radial-gradient(circle,rgba(56,189,248,.18),transparent 60%)",
pointerEvents:"none",
transition:"all .15s linear",
filter:"blur(50px)"
}

/* PANEL */

const panel={
backdropFilter:"blur(20px)",
background:"rgba(15,23,42,.55)",
border:"1px solid rgba(255,255,255,.06)",
padding:"70px 90px",
borderRadius:"18px",
textAlign:"center",
animation:"fadeIn 1.2s ease",
boxShadow:"0 0 80px rgba(56,189,248,.15)",
position:"relative"
}

/* TITLE */

const title={
fontSize:"66px",
marginBottom:"12px",
color:"#e2e8f0",
textShadow:"0 0 40px rgba(56,189,248,.9)",
animation:"float 4s ease-in-out infinite"
}

/* SUBTITLE */

const subtitleStyle={
fontSize:"18px",
color:"#94a3b8",
marginBottom:"45px",
letterSpacing:"1px",
minHeight:"24px"
}

/* BUTTON */

const button={
padding:"16px 60px",
fontSize:"17px",
borderRadius:"10px",
border:"none",
background:"#38bdf8",
color:"white",
cursor:"pointer",
boxShadow:"0 0 20px #38bdf8",
transition:"all .3s ease"
}

/* PULSE */

const pulse={
position:"absolute",
width:"250px",
height:"250px",
background:"radial-gradient(circle,rgba(56,189,248,.2),transparent)",
top:"-60px",
left:"50%",
transform:"translateX(-50%)",
filter:"blur(45px)",
animation:"glow 3s infinite"
}

/* BOOT */

const bootTitle={
fontSize:"32px",
marginBottom:"28px",
animation:"glow 2s infinite"
}

/* PROGRESS */

const progressBg={
width:"420px",
height:"12px",
background:"#1e293b",
borderRadius:"8px",
overflow:"hidden",
margin:"0 auto"
}

const progressBar={
height:"100%",
background:"linear-gradient(90deg,#38bdf8,#60a5fa,#38bdf8)",
backgroundSize:"200%",
animation:"shine 2s linear infinite",
transition:"width .25s ease"
}

const progressText={
marginTop:"16px",
color:"#94a3b8",
fontSize:"14px"
}

export default Welcome