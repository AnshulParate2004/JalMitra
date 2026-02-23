# ESP32 Water Quality – Wi‑Fi POST + SIM900A SMS

This sketch extends your project #1 code with:

- **pH** converted to 0–14 scale (calibrate for your probe)
- **Turbidity** in NTU-like units
- **TDS** on pin 36 (use 0 or add TDS sensor)
- **Wi‑Fi:** POSTs readings to your FastAPI `POST /api/readings`
- **SIM900A:** sends SMS when pH / turbidity / TDS are out of range (works offline)

## What to set in the code

1. **Wi‑Fi**
   - `WIFI_SSID` and `WIFI_PASSWORD`

2. **Backend**
   - `API_URL` = your FastAPI base + `/api/readings`, e.g.  
     `http://192.168.1.10:8000/api/readings`

3. **SMS**
   - `ALERT_PHONE_NUMBER` = resident’s number in E.164 (e.g. `+919876543210`)

4. **SIM900A wiring (ESP32)**
   - SIM900A **RX** → GPIO **17** (ESP32 TX2)
   - SIM900A **TX** → GPIO **16** (ESP32 RX2)
   - GND common, 5 V supply for SIM900A

## Calibration

- **pH:** Adjust the formula in `readPH()` for your probe (often needs two-point calibration).
- **Turbidity:** Adjust `readTurbidityNTU()` using your sensor’s datasheet.
- **TDS:** If you don’t have a TDS sensor, readings on pin 36 will be noise; you can ignore or add a sensor later.

## Flow

- Every 5 s: read sensors → print to Serial.
- If pH/turbidity/TDS out of range → send SMS via SIM900A.
- If Wi‑Fi connected → POST JSON to FastAPI (website can show data).
