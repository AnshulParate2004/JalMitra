# JalMitra — Water Quality Monitoring

**जल मित्र** · Smart monitoring for household tank and tap water with real-time alerts.

ESP32 sensors send **pH**, **turbidity**, and **TDS** to the cloud; a live dashboard shows readings and history. When quality goes out of safe range, an **SMS alert** is sent and the event is stored. Built for **जलमंथन (Jalamanthan)** hackathon.

---

## Features

- **Live dashboard** — Real-time readings over WebSocket
- **History & charts** — Past readings and trends (pH, turbidity, TDS)
- **SMS alerts** — Notifications when thresholds are exceeded
- **Cloud storage** — All readings and alerts saved for later
- **ESP32 + optional SIM900A** — Wi‑Fi upload; offline SMS from device

---

## Architecture

![Architecture](architecture.png)
!!!!!
