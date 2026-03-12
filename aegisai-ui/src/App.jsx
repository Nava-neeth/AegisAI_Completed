
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"

import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Alerts from "./pages/Alerts"
import System from "./pages/System"
import Welcome from "./pages/Welcome"
import NotificationBell from "./components/NotificationBell"

import "./App.css"

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

function AppRoutes() {
  const [visited, setVisited] = useState(false)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("visited")
    if (hasVisited === "true") {
      setVisited(true)
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={visited ? <Navigate to="/dashboard" /> : <Welcome />} />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/alerts"
        element={
          <MainLayout>
            <Alerts />
          </MainLayout>
        }
      />

      <Route
        path="/system"
        element={
          <MainLayout>
            <System />
          </MainLayout>
        }
      />
    </Routes>
  )
}

function MainLayout({ children }) {
  return (
    <div style={layoutStyle}>

      <Sidebar />

      <div style={contentStyle}>

        <NotificationBell />

        <div style={pageContainerStyle}>
          {children}
        </div>

      </div>

    </div>
  )
}

const layoutStyle = {
  display: "flex",
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  background: "#0f172a"
}

const contentStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "auto"
}

const pageContainerStyle = {
  width: "100%",
  height: "100%",
  padding: "30px",
  boxSizing: "border-box"
}

export default App
