"""
Initialize Database with Sample Data

This module provides functions to populate the database with sample
water quality readings so the frontend has data to display.
"""

import random
from datetime import datetime, timedelta, timezone
from typing import List

from app.db import get_supabase


def generate_sample_readings(
    count: int = 50,
    device_id: str = "esp32_dummy",
    hours_back: int = 24,
) -> List[dict]:
    """
    Generate sample water quality readings over the specified time period.

    Args:
        count: Number of readings to generate
        device_id: Device identifier
        hours_back: How many hours back to generate data

    Returns:
        List of reading dictionaries
    """
    readings = []
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(hours=hours_back)

    # Normal ranges for good quality water
    ph_base = 7.2
    turbidity_base = 25.0
    tds_base = 200.0
    temperature_base = 22.0

    for i in range(count):
        # Calculate timestamp (distributed over the time period)
        time_offset = (i / count) * hours_back
        timestamp = start_time + timedelta(hours=time_offset)

        # Generate realistic variations
        ph = round(ph_base + random.uniform(-0.5, 0.5) + random.uniform(-0.1, 0.1), 2)
        ph = max(6.0, min(8.5, ph))  # Keep in safe range

        turbidity = round(
            turbidity_base + random.uniform(-5.0, 5.0) + random.uniform(-2.0, 2.0), 2
        )
        turbidity = max(0.0, min(80.0, turbidity))  # Keep in safe range

        tds = round(tds_base + random.uniform(-30.0, 30.0) + random.uniform(-10.0, 10.0), 2)
        tds = max(0.0, min(450.0, tds))  # Keep in safe range

        temperature = round(
            temperature_base + random.uniform(-2.0, 2.0) + random.uniform(-0.5, 0.5), 2
        )
        temperature = max(18.0, min(28.0, temperature))

        readings.append(
            {
                "device_id": device_id,
                "ph": ph,
                "turbidity": turbidity,
                "tds": tds,
                "temperature": temperature,
                "created_at": timestamp.isoformat(),
            }
        )

    return readings


def generate_sample_alerts(
    count: int = 3,
    device_id: str = "esp32_dummy",
    hours_back: int = 24,
) -> List[dict]:
    """
    Generate sample alerts over the specified time period.

    Args:
        count: Number of alerts to generate
        device_id: Device identifier
        hours_back: How many hours back to generate data

    Returns:
        List of alert dictionaries
    """
    alerts = []
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(hours=hours_back)

    alert_types = [
        {
            "message": "Water quality alert: pH 5.8 out of range (6.0-9.0)",
            "ph": 5.8,
            "turbidity": 30.0,
            "tds": 250.0,
        },
        {
            "message": "Water quality alert: Turbidity 120.5 NTU above 100.0",
            "ph": 7.2,
            "turbidity": 120.5,
            "tds": 280.0,
        },
        {
            "message": "Water quality alert: TDS 550.0 ppm above 500.0",
            "ph": 7.0,
            "turbidity": 35.0,
            "tds": 550.0,
        },
    ]

    for i in range(count):
        time_offset = (i / count) * hours_back
        timestamp = start_time + timedelta(hours=time_offset)
        alert_data = random.choice(alert_types)

        alerts.append(
            {
                "device_id": device_id,
                "message": alert_data["message"],
                "ph": alert_data["ph"],
                "turbidity": alert_data["turbidity"],
                "tds": alert_data["tds"],
                "created_at": timestamp.isoformat(),
            }
        )

    return alerts


def initialize_sample_data(
    readings_count: int = 50,
    alerts_count: int = 3,
    device_id: str = "esp32_dummy",
    hours_back: int = 24,
    force: bool = False,
) -> dict:
    """
    Initialize the database with sample data.
    Works with both Supabase and in-memory storage.

    Args:
        readings_count: Number of readings to generate
        alerts_count: Number of alerts to generate
        device_id: Device identifier
        hours_back: How many hours back to generate data
        force: If True, insert even if data already exists

    Returns:
        Dictionary with insertion results
    """
    # Lazy import to avoid circular dependency
    # Import the module and access stores/functions from it
    import app.main as main_module

    supabase = get_supabase()
    use_supabase = supabase is not None

    try:
        # Check if data already exists
        if not force:
            if use_supabase:
                existing_readings = (
                    supabase.table("water_readings")
                    .select("id", count="exact")
                    .limit(1)
                    .execute()
                )
                if existing_readings.count and existing_readings.count > 0:
                    print("[INIT] Database already has data. Use force=True to overwrite.")
                    return {
                        "success": True,
                        "message": "Data already exists",
                        "readings_inserted": 0,
                        "alerts_inserted": 0,
                    }
            else:
                # Check in-memory store
                if len(main_module.readings_store) > 0:
                    print("[INIT] In-memory store already has data. Use force=True to overwrite.")
                    return {
                        "success": True,
                        "message": "Data already exists",
                        "readings_inserted": 0,
                        "alerts_inserted": 0,
                    }

        # Generate sample data
        print(f"[INIT] Generating {readings_count} readings and {alerts_count} alerts...")
        readings = generate_sample_readings(readings_count, device_id, hours_back)
        alerts = generate_sample_alerts(alerts_count, device_id, hours_back)

        # Insert readings
        readings_inserted = 0
        if readings:
            if use_supabase:
                # Insert in batches of 50 to avoid payload size issues
                batch_size = 50
                for i in range(0, len(readings), batch_size):
                    batch = readings[i : i + batch_size]
                    result = supabase.table("water_readings").insert(batch).execute()
                    readings_inserted += len(result.data) if result.data else 0
            else:
                # Insert into in-memory store
                for reading in readings:
                    # Convert created_at to timestamp for in-memory storage
                    reading_record = {
                        "timestamp": reading.get("created_at", reading.get("timestamp")),
                        "device_id": reading["device_id"],
                        "ph": reading["ph"],
                        "turbidity": reading["turbidity"],
                        "tds": reading["tds"],
                        "temperature": reading.get("temperature"),
                    }
                    main_module._insert_reading(reading_record)
                    readings_inserted += 1
            print(f"[INIT] Inserted {readings_inserted} readings ({'Supabase' if use_supabase else 'in-memory'})")

        # Insert alerts
        alerts_inserted = 0
        if alerts:
            if use_supabase:
                result = supabase.table("water_alerts").insert(alerts).execute()
                alerts_inserted = len(result.data) if result.data else 0
            else:
                # Insert into in-memory store
                for alert in alerts:
                    # Format alert for in-memory store
                    alert_record = {
                        "timestamp": alert["created_at"],
                        "device_id": alert["device_id"],
                        "message": alert["message"],
                        "readings": {
                            "ph": alert.get("ph"),
                            "turbidity": alert.get("turbidity"),
                            "tds": alert.get("tds"),
                        },
                    }
                    main_module._insert_alert(alert_record)
                    alerts_inserted += 1
            print(f"[INIT] Inserted {alerts_inserted} alerts ({'Supabase' if use_supabase else 'in-memory'})")

        return {
            "success": True,
            "readings_inserted": readings_inserted,
            "alerts_inserted": alerts_inserted,
            "storage_type": "Supabase" if use_supabase else "in-memory",
        }

    except Exception as e:
        print(f"[INIT] Error initializing data: {e}")
        return {
            "success": False,
            "error": str(e),
            "readings_inserted": 0,
            "alerts_inserted": 0,
        }


if __name__ == "__main__":
    # Run as standalone script
    import sys

    force = "--force" in sys.argv
    result = initialize_sample_data(force=force)
    if result["success"]:
        print(
            f"✅ Successfully initialized: {result['readings_inserted']} readings, "
            f"{result['alerts_inserted']} alerts"
        )
    else:
        print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)
