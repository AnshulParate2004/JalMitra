"""
Standalone script to initialize sample data in Supabase.

Usage:
    python scripts/init_sample_data.py
    python scripts/init_sample_data.py --force  # Overwrite existing data
    python scripts/init_sample_data.py --readings 100 --alerts 5
"""

import argparse
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.init_data import initialize_sample_data


def main():
    parser = argparse.ArgumentParser(
        description="Initialize Supabase with sample water quality data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Initialize with default settings (50 readings, 3 alerts)
  python scripts/init_sample_data.py

  # Force initialization even if data exists
  python scripts/init_sample_data.py --force

  # Custom number of readings and alerts
  python scripts/init_sample_data.py --readings 100 --alerts 5

  # Custom device ID and time range
  python scripts/init_sample_data.py --device-id esp32_1 --hours 48
        """,
    )

    parser.add_argument(
        "--readings",
        type=int,
        default=50,
        help="Number of readings to generate (default: 50)",
    )
    parser.add_argument(
        "--alerts",
        type=int,
        default=3,
        help="Number of alerts to generate (default: 3)",
    )
    parser.add_argument(
        "--device-id",
        type=str,
        default="esp32_dummy",
        help="Device identifier (default: esp32_dummy)",
    )
    parser.add_argument(
        "--hours",
        type=int,
        default=24,
        help="Hours back to generate data (default: 24)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force initialization even if data already exists",
    )

    args = parser.parse_args()

    print("=" * 70)
    print("Sample Data Initialization")
    print("=" * 70)
    print(f"Readings: {args.readings}")
    print(f"Alerts: {args.alerts}")
    print(f"Device ID: {args.device_id}")
    print(f"Time Range: Last {args.hours} hours")
    print(f"Force: {args.force}")
    print("=" * 70)
    print()

    result = initialize_sample_data(
        readings_count=args.readings,
        alerts_count=args.alerts,
        device_id=args.device_id,
        hours_back=args.hours,
        force=args.force,
    )

    if result["success"]:
        print()
        print("=" * 70)
        print("✅ Initialization Complete!")
        print("=" * 70)
        print(f"Readings inserted: {result['readings_inserted']}")
        print(f"Alerts inserted: {result['alerts_inserted']}")
        print("=" * 70)
        sys.exit(0)
    else:
        print()
        print("=" * 70)
        print("❌ Initialization Failed")
        print("=" * 70)
        print(f"Error: {result.get('error', 'Unknown error')}")
        print("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
