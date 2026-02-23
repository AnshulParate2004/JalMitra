# Household Water Quality - FastAPI backend with Supabase.
# ESP32 -> POST /api/readings -> store in Supabase -> broadcast via WebSocket to React (live).
# On threshold breach: store alert, send SMS, broadcast alert to React.

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import get_twilio_config, is_supabase_configured
from app.db import get_supabase
from app.websocket_manager import ws_manager

app = FastAPI(title="Household Water Quality API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory fallback when Supabase is not configured
readings_store: list[dict] = []
alerts_store: list[dict] = []

PH_MIN, PH_MAX = 6.0, 9.0
TURBIDITY_MAX_NTU = 100.0
TDS_MAX_PPM = 500.0


class ReadingIn(BaseModel):
    ph: float = Field(..., ge=0, le=14)
    turbidity: float = Field(..., ge=0)
    tds: float = Field(..., ge=0)
    device_id: str = "device1"
    temperature: Optional[float] = None


def send_sms_alert(message: str) -> bool:
    import base64
    import os
    import urllib.request
    from urllib.parse import urlencode

    sid, token, from_num, to_num = get_twilio_config()
    if not all([sid, token, from_num, to_num]):
        print(f"[SMS not configured] Would send: {message}")
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = urlencode({"To": to_num, "From": from_num, "Body": message}).encode()
    auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded", "Authorization": f"Basic {auth}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)
    except Exception as e:
        print(f"SMS send failed: {e}")
        return False


def check_thresholds(r: ReadingIn) -> list[str]:
    reasons = []
    if r.ph < PH_MIN or r.ph > PH_MAX:
        reasons.append(f"pH {r.ph} out of range ({PH_MIN}-{PH_MAX})")
    if r.turbidity > TURBIDITY_MAX_NTU:
        reasons.append(f"Turbidity {r.turbidity} NTU above {TURBIDITY_MAX_NTU}")
    if r.tds > TDS_MAX_PPM:
        reasons.append(f"TDS {r.tds} ppm above {TDS_MAX_PPM}")
    return reasons


def _insert_reading(record: dict[str, Any]) -> None:
    supabase = get_supabase()
    if supabase:
        supabase.table("water_readings").insert({
            "device_id": record["device_id"],
            "ph": record["ph"],
            "turbidity": record["turbidity"],
            "tds": record["tds"],
            "temperature": record.get("temperature"),
        }).execute()
    else:
        readings_store.append(record)
        while len(readings_store) > 500:
            readings_store.pop(0)


def _insert_alert(alert_record: dict[str, Any]) -> None:
    supabase = get_supabase()
    if supabase:
        supabase.table("water_alerts").insert({
            "device_id": alert_record["device_id"],
            "message": alert_record["message"],
            "ph": alert_record.get("readings", {}).get("ph"),
            "turbidity": alert_record.get("readings", {}).get("turbidity"),
            "tds": alert_record.get("readings", {}).get("tds"),
        }).execute()
    else:
        alerts_store.append(alert_record)
        while len(alerts_store) > 100:
            alerts_store.pop(0)


def _get_readings(limit: int, device_id: Optional[str]) -> list[dict]:
    supabase = get_supabase()
    if supabase:
        q = supabase.table("water_readings").select("*").order("created_at", desc=True).limit(limit)
        if device_id:
            q = q.eq("device_id", device_id)
        r = q.execute()
        rows = r.data or []
        return [{"timestamp": x.get("created_at"), "ph": x["ph"], "turbidity": x["turbidity"], "tds": x["tds"], "device_id": x["device_id"], "temperature": x.get("temperature")} for x in rows]
    out = list(readings_store)
    if device_id:
        out = [r for r in out if r.get("device_id") == device_id]
    out = out[-limit:]
    out.reverse()
    return out


def _get_latest(device_id: Optional[str]) -> Optional[dict]:
    supabase = get_supabase()
    if supabase:
        q = supabase.table("water_readings").select("*").order("created_at", desc=True).limit(1)
        if device_id:
            q = q.eq("device_id", device_id)
        r = q.execute()
        if not r.data:
            return None
        x = r.data[0]
        return {"timestamp": x.get("created_at"), "ph": x["ph"], "turbidity": x["turbidity"], "tds": x["tds"], "device_id": x["device_id"], "temperature": x.get("temperature")}
    out = list(readings_store)
    if device_id:
        out = [r for r in out if r.get("device_id") == device_id]
    return out[-1] if out else None


def _get_alerts(limit: int) -> list[dict]:
    supabase = get_supabase()
    if supabase:
        r = supabase.table("water_alerts").select("*").order("created_at", desc=True).limit(limit).execute()
        rows = r.data or []
        return [{"timestamp": x.get("created_at"), "device_id": x["device_id"], "message": x["message"]} for x in rows]
    out = list(alerts_store)[-limit:]
    out.reverse()
    return [{"timestamp": a.get("timestamp"), "device_id": a.get("device_id"), "message": a.get("message")} for a in out]


@app.get("/health")
def health():
    return {"status": "ok", "supabase": is_supabase_configured()}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Live updates: React connects here; backend broadcasts on every new reading/alert."""
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        ws_manager.disconnect(websocket)


@app.post("/api/readings")
async def post_reading(body: ReadingIn):
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "timestamp": now,
        "ph": body.ph,
        "turbidity": body.turbidity,
        "tds": body.tds,
        "device_id": body.device_id,
        "temperature": body.temperature,
    }
    _insert_reading(record)

    reasons = check_thresholds(body)
    if reasons:
        alert_msg = "Water quality alert: " + "; ".join(reasons)
        alert_record = {"timestamp": now, "device_id": body.device_id, "message": alert_msg, "readings": record}
        _insert_alert(alert_record)
        send_sms_alert(alert_msg)
        await ws_manager.broadcast({"type": "alert", "data": alert_record})

    await ws_manager.broadcast({"type": "reading", "data": record})
    return {"ok": True, "alert": bool(reasons)}


@app.get("/api/readings")
def get_readings(limit: int = 50, device_id: Optional[str] = None):
    return {"readings": _get_readings(limit, device_id)}


@app.get("/api/readings/latest")
def get_latest(device_id: Optional[str] = None):
    row = _get_latest(device_id)
    if not row:
        raise HTTPException(status_code=404, detail="No readings yet")
    return row


@app.get("/api/alerts")
def get_alerts(limit: int = 20):
    return {"alerts": _get_alerts(limit)}


@app.get("/api/stats")
def get_stats():
    """Summary for dashboard: total readings, alerts, and latest timestamp."""
    readings = _get_readings(limit=5000, device_id=None)
    alerts = _get_alerts(limit=1000)
    latest = _get_latest(None)
    return {
        "readings_count": len(readings),
        "alerts_count": len(alerts),
        "latest_timestamp": latest.get("timestamp") if latest else None,
        "device_id": latest.get("device_id") if latest else None,
    }
