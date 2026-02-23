"""
Quick test script to check if sample data exists and initialize if needed.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.init_data import initialize_sample_data
from app.main import readings_store, alerts_store, _get_readings, _get_latest, _get_alerts

def main():
    print("=" * 70)
    print("Testing Sample Data")
    print("=" * 70)
    
    # Check current data
    readings = _get_readings(limit=5, device_id=None)
    latest = _get_latest(None)
    alerts = _get_alerts(limit=5)
    
    print(f"\nCurrent Status:")
    print(f"  Readings in store: {len(readings_store)}")
    print(f"  Alerts in store: {len(alerts_store)}")
    print(f"  Latest reading: {'Yes' if latest else 'No'}")
    print(f"  Total readings (API): {len(readings)}")
    print(f"  Total alerts (API): {len(alerts)}")
    
    if latest:
        print(f"\nLatest Reading:")
        print(f"  pH: {latest['ph']}")
        print(f"  Turbidity: {latest['turbidity']} NTU")
        print(f"  TDS: {latest['tds']} ppm")
        print(f"  Temperature: {latest.get('temperature', 'N/A')}°C")
        print(f"  Device: {latest['device_id']}")
        print(f"  Timestamp: {latest.get('timestamp', 'N/A')}")
    
    if len(readings) == 0:
        print("\n⚠️  No data found! Initializing sample data...")
        result = initialize_sample_data(force=True)
        if result["success"]:
            print(f"✅ Successfully initialized:")
            print(f"   - {result['readings_inserted']} readings")
            print(f"   - {result['alerts_inserted']} alerts")
            print(f"   - Storage: {result.get('storage_type', 'unknown')}")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
            sys.exit(1)
    else:
        print(f"\n✅ Data exists! Found {len(readings)} readings and {len(alerts)} alerts")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
