from datetime import datetime, timezone
from typing import Any, Optional, List, Dict
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load .env file from backend directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from app.config import get_twilio_config, is_supabase_configured
from app.db import get_supabase
from app.dummy_generator import get_dummy_generator, initialize_dummy_generator
from app.websocket_manager import ws_manager

app = FastAPI(title="Household Water Quality API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        print(f"[SMS not configured] Would send to {to_num or 'N/A'}: {message}")
        return False

    print(f"[SMS] Sending alert to {to_num}: {message[:50]}...")
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = urlencode({"To": to_num, "From": from_num, "Body": message}).encode()
    auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded", "Authorization": f"Basic {auth}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                print(f"[SMS] ✅ Alert sent successfully to {to_num}")
                return True
            else:
                print(f"[SMS] ⚠️  Failed to send: HTTP {resp.status}")
                return False
    except Exception as e:
        print(f"[SMS] ❌ Send failed to {to_num}: {e}")
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
        return [{
            "timestamp": x.get("created_at"),
            "device_id": x["device_id"],
            "message": x["message"],
            "readings": {
                "ph": x.get("ph"),
                "turbidity": x.get("turbidity"),
                "tds": x.get("tds"),
            } if any([x.get("ph"), x.get("turbidity"), x.get("tds")]) else None
        } for x in rows]
    out = list(alerts_store)[-limit:]
    out.reverse()
    return [{
        "timestamp": a.get("timestamp"),
        "device_id": a.get("device_id"),
        "message": a.get("message"),
        "readings": a.get("readings")
    } for a in out]


@app.on_event("startup")
async def startup_event():
    """Initialize and start dummy generator on startup if enabled."""
    import os
    from app.dummy_generator import set_dummy_generator
    from app.init_data import initialize_sample_data
    from app.config import get_twilio_config
    
    # Log SMS configuration
    sid, token, from_num, to_num = get_twilio_config()
    if all([sid, token, from_num, to_num]):
        print(f"[STARTUP] ✅ SMS alerts configured - Recipient: {to_num}")
    else:
        print(f"[STARTUP] ⚠️  SMS alerts not configured - Recipient: {to_num or 'Not set'}")
        print(f"[STARTUP]    Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and WATER_ALERT_PHONE_NUMBER in .env")
    
    # Initialize sample data if enabled and database is empty
    init_data_enabled = os.environ.get("INIT_SAMPLE_DATA", "true").lower() == "true"
    if init_data_enabled:
        print("[STARTUP] Checking for sample data initialization...")
        result = initialize_sample_data(
            readings_count=50,
            alerts_count=3,
            device_id="esp32_dummy",
            hours_back=24,
            force=False,
        )
        if result["success"]:
            if result.get("readings_inserted", 0) > 0:
                print(f"[STARTUP] ✅ Initialized {result['readings_inserted']} readings and {result['alerts_inserted']} alerts")
            else:
                print("[STARTUP] Database already has data")
        else:
            print(f"[STARTUP] ⚠️  Sample data initialization skipped: {result.get('error', 'Unknown error')}")
    
    # Initialize dummy generator
    generator = initialize_dummy_generator()
    set_dummy_generator(generator)
    if generator.enabled:
        await generator.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Stop dummy generator on shutdown."""
    generator = get_dummy_generator()
    if generator:
        await generator.stop()


@app.get("/health")
def health():
    generator = get_dummy_generator()
    return {
        "status": "ok",
        "supabase": is_supabase_configured(),
        "dummy_generator": generator.get_status() if generator else {"enabled": False},
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
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
    from app.alert_monitor import get_alert_monitor
    
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

    # Only check time-based alerts (3-minute persistent breach)
    # NO immediate alerts - only after 3 minutes of continuous breach
    alert_monitor = get_alert_monitor()
    time_based_alerts = alert_monitor.check_and_alert(
        device_id=body.device_id,
        ph=body.ph,
        turbidity=body.turbidity,
        tds=body.tds,
    )
    
    # Send time-based alerts if any (only after 3 minutes)
    for alert_msg in time_based_alerts:
        alert_record = {
            "timestamp": now,
            "device_id": body.device_id,
            "message": alert_msg,
            "readings": record,
        }
        _insert_alert(alert_record)
        send_sms_alert(alert_msg)
        await ws_manager.broadcast({"type": "alert", "data": alert_record})
        print(f"[ALERT] {alert_msg}")

    # Always broadcast reading (every 5 seconds)
    await ws_manager.broadcast({"type": "reading", "data": record})
    return {
        "ok": True,
        "alert": len(time_based_alerts) > 0,
        "time_based_alerts": len(time_based_alerts),
    }


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
    readings = _get_readings(limit=5000, device_id=None)
    alerts = _get_alerts(limit=1000)
    latest = _get_latest(None)
    return {
        "readings_count": len(readings),
        "alerts_count": len(alerts),
        "latest_timestamp": latest.get("timestamp") if latest else None,
        "device_id": latest.get("device_id") if latest else None,
    }


# Dummy Generator Control Endpoints
@app.get("/api/dummy-generator/status")
async def get_dummy_generator_status():
    """Get the status of the dummy data generator."""
    generator = get_dummy_generator()
    if not generator:
        raise HTTPException(status_code=404, detail="Dummy generator not initialized")
    return generator.get_status()


@app.post("/api/dummy-generator/start")
async def start_dummy_generator():
    """Start the dummy data generator."""
    generator = get_dummy_generator()
    if not generator:
        raise HTTPException(status_code=404, detail="Dummy generator not initialized")
    if generator.running:
        return {"status": "already_running", "message": "Generator is already running"}
    await generator.start()
    return {"status": "started", "message": "Dummy generator started"}


@app.post("/api/dummy-generator/stop")
async def stop_dummy_generator():
    """Stop the dummy data generator."""
    generator = get_dummy_generator()
    if not generator:
        raise HTTPException(status_code=404, detail="Dummy generator not initialized")
    if not generator.running:
        return {"status": "already_stopped", "message": "Generator is already stopped"}
    await generator.stop()
    return {"status": "stopped", "message": "Dummy generator stopped"}


@app.post("/api/init-sample-data")
async def init_sample_data_endpoint(force: bool = False):
    """Manually initialize sample data."""
    from app.init_data import initialize_sample_data
    
    result = initialize_sample_data(
        readings_count=50,
        alerts_count=3,
        device_id="esp32_dummy",
        hours_back=24,
        force=force,
    )
    
    if result["success"]:
        return {
            "status": "success",
            "message": f"Initialized {result['readings_inserted']} readings and {result['alerts_inserted']} alerts",
            "readings_inserted": result["readings_inserted"],
            "alerts_inserted": result["alerts_inserted"],
            "storage_type": result.get("storage_type", "unknown"),
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize data: {result.get('error', 'Unknown error')}"
        )


class ChatbotRequest(BaseModel):
    message: str
    alerts: Optional[List[Dict[str, Any]]] = []
    session_id: Optional[str] = "default"


from fastapi.responses import StreamingResponse


@app.post("/api/chatbot")
async def chatbot_endpoint(request: ChatbotRequest):
    """Chatbot endpoint for water quality assistance (non-streaming)."""
    try:
        from app.chatbot import get_chatbot_response
        
        response = get_chatbot_response(
            user_message=request.message,
            alerts=request.alerts or [],
            session_id=request.session_id or "default",
        )
        
        return {"response": response}
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot not configured: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )


@app.post("/api/chatbot/stream")
async def chatbot_stream_endpoint(request: ChatbotRequest):
    """Chatbot endpoint with streaming and tool calling support."""
    try:
        from app.chatbot import get_chatbot_response_stream
        
        async def generate():
            try:
                async for chunk in get_chatbot_response_stream(
                    user_message=request.message,
                    alerts=request.alerts or [],
                    session_id=request.session_id or "default",
                ):
                    yield f"data: {chunk}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"[CHATBOT STREAM ERROR] {error_trace}")
                # Fallback to non-streaming
                from app.chatbot import get_chatbot_response
                try:
                    response = get_chatbot_response(
                        user_message=request.message,
                        alerts=request.alerts or [],
                        session_id=request.session_id or "default",
                    )
                    yield f"data: {response}\n\n"
                except Exception as e2:
                    yield f"data: I apologize, but I'm experiencing technical difficulties. Please try again later.\n\n"
                yield "data: [DONE]\n\n"
        
        return StreamingResponse(generate(), media_type="text/event-stream")
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot not configured: {str(e)}"
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[CHATBOT ENDPOINT ERROR] {error_trace}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )


class ExportRequest(BaseModel):
    start_date: Optional[str] = None  # ISO format date string
    end_date: Optional[str] = None  # ISO format date string
    device_id: Optional[str] = None
    export_type: str = "readings"  # "readings", "alerts", or "combined"


from fastapi.responses import Response


@app.post("/api/export/csv")
async def export_csv(request: ExportRequest):
    """Export water quality data to CSV format."""
    from app.export import export_readings_to_csv, export_alerts_to_csv, export_combined_to_csv
    
    try:
        # Parse dates
        start_date = None
        end_date = None
        
        if request.start_date:
            start_date = datetime.fromisoformat(request.start_date.replace("Z", "+00:00"))
        
        if request.end_date:
            end_date = datetime.fromisoformat(request.end_date.replace("Z", "+00:00"))
        
        # Generate CSV
        if request.export_type == "readings":
            csv_content = export_readings_to_csv(start_date, end_date, request.device_id)
            filename = f"water_readings_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        elif request.export_type == "alerts":
            csv_content = export_alerts_to_csv(start_date, end_date, request.device_id)
            filename = f"water_alerts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        elif request.export_type == "combined":
            csv_content = export_combined_to_csv(start_date, end_date, request.device_id)
            filename = f"water_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        else:
            raise HTTPException(status_code=400, detail="Invalid export_type. Must be 'readings', 'alerts', or 'combined'")
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")


@app.get("/api/export/csv")
async def export_csv_get(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    device_id: Optional[str] = None,
    export_type: str = "readings",
):
    """Export water quality data to CSV format (GET endpoint)."""
    request = ExportRequest(
        start_date=start_date,
        end_date=end_date,
        device_id=device_id,
        export_type=export_type,
    )
    return await export_csv(request)
