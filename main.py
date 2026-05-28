import time
import psutil
import os
import win32gui
import win32process
from email_alert import send_email_alert

from automation.actions import Actions
from logic.decision_engine import DecisionEngine

# 🔥 SYSTEM THRESHOLDS
SAFE_CPU_LEVEL = 15
SAFE_MEMORY_LEVEL = 15

# 🔥 SAFE PROCESS LIST
SAFE_PROCESS_NAMES = [
    "system",
    "system idle process",
    "python.exe",
    "uvicorn.exe",
    "services.exe",
    "wininit.exe",
    "lsass.exe",
    "csrss.exe",
    "smss.exe",
    "explorer.exe"
]

actions = Actions()
decision_engine = DecisionEngine()

print("🧠 AegisAI Brain Started...")

# Protect this process
CURRENT_PID = os.getpid()

def get_active_pid():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        return pid
    except:
        return None


def kill_heavy_process():

    print("🔍 Searching for heavy process...")

    processes = []

    # Warm up CPU counters
    for proc in psutil.process_iter():
        try:
            proc.cpu_percent(None)
        except:
            pass

    time.sleep(0.5)

    active_pid = get_active_pid()

    for proc in psutil.process_iter(['pid', 'name']):
        try:
            pid = proc.info['pid']
            name = proc.info['name']

            if not name:
                continue

            name_lower = name.lower()

            # 🔒 PROTECTION RULES
            if pid in (0, 4):
                continue

            if pid == CURRENT_PID:
                continue

            if pid == active_pid:
                continue

            if name_lower in SAFE_PROCESS_NAMES:
                continue

            cpu = proc.cpu_percent(interval=0.2)
            mem = proc.memory_percent()

            print(f"Process {pid} ({name}) CPU: {cpu:.1f}% MEM: {mem:.1f}%")

            # Intelligent score
            score = (cpu * 2) + mem

            if score > 100:
                processes.append((score, proc))

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    if not processes:
        print("✅ No heavy process found.")
        return

    processes.sort(reverse=True, key=lambda x: x[0])
    highest_score, target = processes[0]

    print(f"🔥 Killing {target.pid} ({target.name()}) Score: {highest_score:.1f}")

    try:
        target.terminate()
        target.wait(timeout=3)
        print("✅ Process terminated successfully")
    except Exception as e:
        print("⚠ Kill failed:", e)


# 🔥 MAIN LOOP

psutil.cpu_percent(None)

while True:
    try:
        current_cpu = psutil.cpu_percent(interval=1)
        current_memory = psutil.virtual_memory().percent

        print("--------------------------------------------------")
        print(f"CPU Usage    : {current_cpu:.1f}%  | Threshold: {SAFE_CPU_LEVEL}%")
        print(f"Memory Usage : {current_memory:.1f}% | Threshold: {SAFE_MEMORY_LEVEL}%")
        print("--------------------------------------------------")

        # Risk classification
        if current_cpu > SAFE_CPU_LEVEL and current_memory > SAFE_MEMORY_LEVEL:
            risk = "HIGH"
        elif current_cpu > SAFE_CPU_LEVEL:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        anomaly = False
        suspicious = False

        decision = decision_engine.decide(anomaly, risk, suspicious)

        print(f"Decision: {decision}")

        if decision == "ALERT":
            actions.alert()

        elif decision == "RESTART_SERVICE":
            actions.restart_service("Spooler")
            print("🔁 Restarted Spooler")

        elif decision == "KILL_PROCESS":
            kill_heavy_process()

        # Overload auto-mitigation
        if current_cpu > SAFE_CPU_LEVEL or current_memory > SAFE_MEMORY_LEVEL:
            print("⚠ Overload detected — Intelligent Mitigation Started")
            kill_heavy_process()

        time.sleep(2)

    except Exception as e:
        print("Error:", e)
        time.sleep(2)