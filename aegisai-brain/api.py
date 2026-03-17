from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psutil
import os
import time
import win32gui
import win32process
import smtplib
from email.mime.text import MIMEText

app = FastAPI()

# -----------------------------
# SETTINGS
# -----------------------------
CPU_THRESHOLD = 90
RAM_THRESHOLD = 90

SCAN_INTERVAL = 2
ACTION_COOLDOWN = 1

EMAIL_THRESHOLD = 70

EMAIL_SENDER = "your_email@gmail.com"
EMAIL_PASSWORD = "your_app_password"
EMAIL_RECEIVER = "your_email@gmail.com"

SAFE_PROCESS_NAMES = [
    "system","system idle process","services.exe","wininit.exe",
    "lsass.exe","csrss.exe","smss.exe","explorer.exe",
    "python.exe","uvicorn.exe","code.exe",
    "chrome.exe","msedge.exe",
    "dwm.exe","memcompression",
    "shellexperiencehost.exe","msmpeng.exe"
]

CURRENT_PID = os.getpid()

LAST_SCAN = 0
LAST_ACTION = 0
LAST_EMAIL_TIME = 0
LAST_NOTIFICATION = "System Running Normally"

LAST_NET = psutil.net_io_counters()

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
# FOREGROUND PROCESS PROTECTION
# -----------------------------
def get_foreground_pid():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        return pid
    except:
        return None

# -----------------------------
# EMAIL ALERT
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

        LAST_EMAIL_TIME = time.time()

    except:
        pass

# -----------------------------
# CORE ENGINE (FULL LOGIC)
# -----------------------------
def scan_and_kill():

    global LAST_NOTIFICATION

    active_pid = get_foreground_pid()

    print("Scanning processes...")

    processes = list(psutil.process_iter(['pid','name']))
    print(f"Processes scanned: {len(processes)}")

    killed_any = False

    for proc in processes:
        try:
            pid = proc.info['pid']
            name = proc.info['name']

            if not name:
                continue

            name_l = name.lower()

            # PROTECTION
            if pid in (0,4): continue
            if pid == CURRENT_PID: continue
            if pid == active_pid: continue
            if name_l in SAFE_PROCESS_NAMES: continue

            cpu = proc.cpu_percent(interval=0.05)
            mem = proc.memory_percent()

            # 🔥 FINAL CONDITION (CPU + RAM BOTH INCLUDED)
            if cpu >= CPU_THRESHOLD or mem >= RAM_THRESHOLD:

                print(f"Heavy process found: {name} CPU={cpu:.1f} RAM={mem:.1f}")

                proc.kill()

                print(f"Process killed: {name}")

                LAST_NOTIFICATION = f"Process killed: {name}"
                killed_any = True

        except:
            continue

    if not killed_any:
        print("No process exceeds threshold")
        LAST_NOTIFICATION = "System Running Normally"

# -----------------------------
# API
# -----------------------------
@app.get("/status")
def status():

    global LAST_SCAN, LAST_ACTION, LAST_NET

    try:

        cpu = psutil.cpu_percent(interval=0.2)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage("C:\\").percent

        # NETWORK (real-time)
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

        now = time.time()

        # -----------------------------
        # MAIN LOGIC
        # -----------------------------
        if cpu > CPU_THRESHOLD or memory > RAM_THRESHOLD:

            if now - LAST_SCAN > SCAN_INTERVAL:
                LAST_SCAN = now

                if now - LAST_ACTION > ACTION_COOLDOWN:
                    scan_and_kill()
                    LAST_ACTION = now

        # -----------------------------
        # EMAIL ALERT
        # -----------------------------
        if cpu > EMAIL_THRESHOLD:
            send_email_alert(f"High system load detected: CPU {cpu}%")

        return {
            "cpu": round(cpu,1),
            "memory": round(memory,1),
            "disk": round(disk,1),
            "network": round(network,2),
            "processes": process_list[:20],
            "notification": LAST_NOTIFICATION
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))