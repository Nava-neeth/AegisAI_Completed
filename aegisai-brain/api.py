from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psutil
import os
import time
import win32gui
import win32process
import smtplib
from email.mime.text import MIMEText
import threading

# ✅ ML IMPORT (ADDED)
from sklearn.ensemble import IsolationForest

GREEN = "\033[92m"
RESET = "\033[0m"

app = FastAPI()

# -----------------------------
# SETTINGS
# -----------------------------
CPU_THRESHOLD = 90
RAM_THRESHOLD = 90

EMAIL_THRESHOLD = 90

EMAIL_SENDER = "navaneethnavaneeth876@gmail.com"
EMAIL_PASSWORD = "iymaoveutcroakhw"
EMAIL_RECEIVER = "navaneethns5656@gmail.com"

SAFE_PROCESS_NAMES = [
    "system","system idle process","services.exe","wininit.exe",
    "lsass.exe","csrss.exe","smss.exe","explorer.exe",
    "python.exe","uvicorn.exe","code.exe",
    "msedge.exe",
    "dwm.exe","memcompression",
    "shellexperiencehost.exe","msmpeng.exe"
]

CURRENT_PID = os.getpid()

LAST_EMAIL_TIME = 0
LAST_NOTIFICATION = "System Running Normally"
LAST_NOTIFICATION_TIME = 0

LAST_NET = psutil.net_io_counters()

# 🔥 CACHE STORAGE
CACHE = {
    "cpu": 0,
    "memory": 0,
    "disk": 0,
    "network": 0,
    "processes": []
}

# -----------------------------
# ✅ ML VARIABLES (ADDED)
# -----------------------------
ML_MODEL = IsolationForest(contamination=0.1)
ML_DATA = []
ML_READY = False
ML_RESULT = "Normal"

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# FOREGROUND PROTECTION
# -----------------------------
def get_active_tree():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)

        tree = [pid]
        try:
            parent = psutil.Process(pid)
            tree += [p.pid for p in parent.children(recursive=True)]
        except:
            pass

        return tree
    except:
        return []

# -----------------------------
# EMAIL
# -----------------------------
def send_email_alert(message):
    global LAST_EMAIL_TIME

    if time.time() - LAST_EMAIL_TIME < 60:
        return

    try:
        msg = MIMEText(message)
        msg["Subject"] = "AegisAI Alert"
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECEIVER

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        server.quit()

        print("Email sent")
        LAST_EMAIL_TIME = time.time()

    except:
        print("Email failed")

# -----------------------------
# CORE ENGINE
# -----------------------------
def scan_and_kill():

    global LAST_NOTIFICATION, LAST_NOTIFICATION_TIME

    active_tree = get_active_tree()
    processes = list(psutil.process_iter(['pid','name']))

    print("\nScanning processes...")
    print(f"Processes scanned: {len(processes)}")

    for proc in processes:
        try:
            pid = proc.info['pid']
            name = proc.info['name']

            if not name:
                continue

            name_l = name.lower()

            if pid in (0,4): continue
            if pid == CURRENT_PID: continue
            if pid in active_tree: continue
            if name_l in SAFE_PROCESS_NAMES: continue

            cpu = proc.cpu_percent(interval=0)
            mem = proc.memory_percent()

            if cpu >= CPU_THRESHOLD or mem >= RAM_THRESHOLD:

                print(f"Heavy process found: {name} (CPU {cpu:.1f}%)")

                proc.kill()

                print(f"{GREEN}✔ Process killed: {name}{RESET}")
                
                LAST_NOTIFICATION = f"Process killed: {name}"
                LAST_NOTIFICATION_TIME = time.time()

                return

        except:
            continue

    print("No heavy process found")
    if time.time() - LAST_NOTIFICATION_TIME > 15:
        LAST_NOTIFICATION = "System Running Normally"

# -----------------------------
# BACKGROUND CACHE UPDATER
# -----------------------------
def background_worker():

    global CACHE, LAST_NET
    global ML_DATA, ML_READY, ML_RESULT

    while True:
        try:
            cpu = psutil.cpu_percent(interval=None)
            memory = psutil.virtual_memory().percent
            disk = psutil.disk_usage("C:\\").percent

            net_now = psutil.net_io_counters()
            network = (net_now.bytes_sent + net_now.bytes_recv -
                       LAST_NET.bytes_sent - LAST_NET.bytes_recv) / (1024*1024)
            LAST_NET = net_now

            process_list = []
            for p in psutil.process_iter(['name']):
                try:
                    process_list.append(p.info['name'])
                except:
                    continue

            CACHE.update({
                "cpu": round(cpu,1),
                "memory": round(memory,1),
                "disk": round(disk,1),
                "network": round(network,2),
                "processes": process_list[:20]
            })

            # -----------------------------
            # ✅ ML LOGIC (ADDED)
            # -----------------------------
            ML_DATA.append([cpu, memory])

            if len(ML_DATA) > 20:
                ML_DATA.pop(0)

            if len(ML_DATA) >= 10:
                ML_MODEL.fit(ML_DATA)
                ML_READY = True

            if ML_READY:
                result = ML_MODEL.predict([[cpu, memory]])
                ML_RESULT = "Anomaly Detected" if result[0] == -1 else "Normal"

            # -----------------------------
            # EXISTING LOGIC (UNCHANGED)
            # -----------------------------
            if cpu > CPU_THRESHOLD or memory > RAM_THRESHOLD:
                scan_and_kill()

            if cpu > EMAIL_THRESHOLD:
                send_email_alert(f"High CPU detected: {cpu}%")
                
            time.sleep(1)

        except:
            continue

# START BACKGROUND THREAD
threading.Thread(target=background_worker, daemon=True).start()

# -----------------------------
# API
# -----------------------------
@app.get("/status")
def status():

    global LAST_NOTIFICATION

    try:

        if time.time() - LAST_NOTIFICATION_TIME > 15:
            LAST_NOTIFICATION = "System Running Normally"

        return {
            "cpu": CACHE["cpu"],
            "memory": CACHE["memory"],
            "disk": CACHE["disk"],
            "network": CACHE["network"],
            "processes": CACHE["processes"],
            "notification": LAST_NOTIFICATION,
            
            # ✅ ML OUTPUT (ADDED)
            "ml_anomaly": ML_RESULT
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))