"""
Data export module for water quality data.
Supports CSV and Excel export with date range filtering.
"""
import csv
import io
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.db import get_supabase
from app.main import readings_store, alerts_store


def _get_readings_by_date_range(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    device_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get readings filtered by date range."""
    supabase = get_supabase()
    
    if supabase:
        q = supabase.table("water_readings").select("*").order("created_at", desc=False)
        
        if device_id:
            q = q.eq("device_id", device_id)
        
        if start_date:
            q = q.gte("created_at", start_date.isoformat())
        
        if end_date:
            # Add one day to include the entire end date
            end_date_inclusive = end_date + timedelta(days=1)
            q = q.lt("created_at", end_date_inclusive.isoformat())
        
        r = q.execute()
        rows = r.data or []
        return [
            {
                "timestamp": x.get("created_at"),
                "ph": x["ph"],
                "turbidity": x["turbidity"],
                "tds": x["tds"],
                "device_id": x["device_id"],
                "temperature": x.get("temperature"),
            }
            for x in rows
        ]
    else:
        # In-memory store
        out = list(readings_store)
        
        if device_id:
            out = [r for r in out if r.get("device_id") == device_id]
        
        # Filter by date range
        if start_date:
            out = [
                r for r in out
                if r.get("timestamp") and datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00")) >= start_date
            ]
        
        if end_date:
            end_date_inclusive = end_date + timedelta(days=1)
            out = [
                r for r in out
                if r.get("timestamp") and datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00")) < end_date_inclusive
            ]
        
        # Sort by timestamp
        out.sort(key=lambda x: x.get("timestamp", ""))
        return out


def _get_alerts_by_date_range(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    device_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get alerts filtered by date range."""
    supabase = get_supabase()
    
    if supabase:
        q = supabase.table("water_alerts").select("*").order("created_at", desc=False)
        
        if device_id:
            q = q.eq("device_id", device_id)
        
        if start_date:
            q = q.gte("created_at", start_date.isoformat())
        
        if end_date:
            end_date_inclusive = end_date + timedelta(days=1)
            q = q.lt("created_at", end_date_inclusive.isoformat())
        
        r = q.execute()
        rows = r.data or []
        return [
            {
                "timestamp": x.get("created_at"),
                "device_id": x["device_id"],
                "message": x["message"],
                "ph": x.get("ph"),
                "turbidity": x.get("turbidity"),
                "tds": x.get("tds"),
            }
            for x in rows
        ]
    else:
        # In-memory store
        out = list(alerts_store)
        
        if device_id:
            out = [a for a in out if a.get("device_id") == device_id]
        
        # Filter by date range
        if start_date:
            out = [
                a for a in out
                if a.get("timestamp") and datetime.fromisoformat(a["timestamp"].replace("Z", "+00:00")) >= start_date
            ]
        
        if end_date:
            end_date_inclusive = end_date + timedelta(days=1)
            out = [
                a for a in out
                if a.get("timestamp") and datetime.fromisoformat(a["timestamp"].replace("Z", "+00:00")) < end_date_inclusive
            ]
        
        # Sort by timestamp
        out.sort(key=lambda x: x.get("timestamp", ""))
        return out


def export_readings_to_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    device_id: Optional[str] = None,
) -> str:
    """Export readings to CSV format."""
    readings = _get_readings_by_date_range(start_date, end_date, device_id)
    
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["timestamp", "device_id", "ph", "turbidity", "tds", "temperature"],
        extrasaction="ignore",
    )
    
    writer.writeheader()
    for reading in readings:
        writer.writerow({
            "timestamp": reading.get("timestamp", ""),
            "device_id": reading.get("device_id", ""),
            "ph": reading.get("ph", ""),
            "turbidity": reading.get("turbidity", ""),
            "tds": reading.get("tds", ""),
            "temperature": reading.get("temperature", ""),
        })
    
    return output.getvalue()


def export_alerts_to_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    device_id: Optional[str] = None,
) -> str:
    """Export alerts to CSV format."""
    alerts = _get_alerts_by_date_range(start_date, end_date, device_id)
    
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["timestamp", "device_id", "message", "ph", "turbidity", "tds"],
        extrasaction="ignore",
    )
    
    writer.writeheader()
    for alert in alerts:
        writer.writerow({
            "timestamp": alert.get("timestamp", ""),
            "device_id": alert.get("device_id", ""),
            "message": alert.get("message", ""),
            "ph": alert.get("ph", ""),
            "turbidity": alert.get("turbidity", ""),
            "tds": alert.get("tds", ""),
        })
    
    return output.getvalue()


def export_combined_to_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    device_id: Optional[str] = None,
) -> str:
    """Export both readings and alerts to a combined CSV."""
    readings = _get_readings_by_date_range(start_date, end_date, device_id)
    alerts = _get_alerts_by_date_range(start_date, end_date, device_id)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write readings section
    writer.writerow(["=== WATER QUALITY READINGS ==="])
    writer.writerow(["timestamp", "device_id", "ph", "turbidity", "tds", "temperature"])
    for reading in readings:
        writer.writerow([
            reading.get("timestamp", ""),
            reading.get("device_id", ""),
            reading.get("ph", ""),
            reading.get("turbidity", ""),
            reading.get("tds", ""),
            reading.get("temperature", ""),
        ])
    
    # Write alerts section
    writer.writerow([])
    writer.writerow(["=== WATER QUALITY ALERTS ==="])
    writer.writerow(["timestamp", "device_id", "message", "ph", "turbidity", "tds"])
    for alert in alerts:
        writer.writerow([
            alert.get("timestamp", ""),
            alert.get("device_id", ""),
            alert.get("message", ""),
            alert.get("ph", ""),
            alert.get("turbidity", ""),
            alert.get("tds", ""),
        ])
    
    return output.getvalue()
