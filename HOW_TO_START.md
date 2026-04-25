# 🚗 Predictive Maintenance — Server Startup Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser  →  React Frontend (port 5173)                 │
│               ↕ REST API calls                          │
│  Spring Boot Backend (port 8081)                        │
│               ↕ HTTP to Python                          │
│  Python ML Service (port 5000)                          │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1 — Python ML Service

> **Requires:** Python 3.8+, pip

```bash
cd python-ml

# First-time setup (create venv & install deps)
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Start the ML server
python app.py
```

✅ Running at → `http://localhost:5000`

---

## Step 2 — Spring Boot Backend

> **Requires:** Java 17+, Maven

```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw spring-boot:run
```

✅ Running at → `http://localhost:8081`

---

## Step 3 — React Frontend

> **Requires:** Node.js 18+, npm

```bash
cd frontend

# First-time setup
npm install

# Start dev server
npm run dev
```

✅ Running at → `http://localhost:5173`

---

## Quick Start (All at Once — Windows PowerShell)

Open **3 separate PowerShell windows** and run one command in each:

```powershell
# Window 1 — Python ML
cd d:\Predicitve-Maintanace-final\python-ml ; .\venv\Scripts\activate ; python app.py

# Window 2 — Java Backend
cd d:\Predicitve-Maintanace-final\backend ; .\mvnw.cmd spring-boot:run

# Window 3 — React Frontend
cd d:\Predicitve-Maintanace-final\frontend ; npm run dev
```

---

## Start Order

```
Python ML  →  Java Backend  →  React Frontend
  (5000)         (8081)            (5173)
```

> ⚠️ Always start Python ML **before** the Java backend,  
> as the backend calls into the ML service on startup.

---

## Ports Summary

| Service          | Port  | Tech             |
|------------------|-------|------------------|
| Python ML        | 5000  | Flask / Gunicorn |
| Spring Boot API  | 8081  | Java / Maven     |
| React Dashboard  | 5173  | Vite + React     |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Failed to fetch` in console | Backend not running on port 8081 |
| `Connection refused` on backend | Python ML not running on port 5000 |
| `npm: command not found` | Install Node.js from https://nodejs.org |
| `java: command not found` | Install JDK 17 from https://adoptium.net |
| `python: command not found` | Install Python 3.8+ from https://python.org |

---

## Testing the Dashboard

1. Open `http://localhost:5173` in your browser
2. Click **▶ START MONITORING** — telemetry starts auto-sending
3. Watch the gauges animate in real time
4. After **30 readings**, a **prediction result** will appear
5. Use the **📋 SNIPPET** button to get a browser-console test script
6. Toggle 🌙 / ☀ to switch between Dark and Light theme
