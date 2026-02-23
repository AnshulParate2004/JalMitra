"""
Dummy Water Quality Data Generator

This script simulates ESP32 sensor readings and sends them to the backend API.
The backend will automatically:
- Store readings in Supabase
- Broadcast via WebSocket to frontend
- Check thresholds and create alerts if needed

Usage:
    python scripts/dummy_data_generator.py
    python scripts/dummy_data_generator.py --interval 10 --device-id esp32_dummy
    python scripts/dummy_data_generator.py --alert-mode  # Simulate alert conditions
"""

import argparse
import json
import random
import time
from datetime import datetime
from typing import Dict, Optional

import requests


class WaterQualitySimulator:
    """Simulates water quality sensor readings with realistic variations."""

    def __init__(
        self,
        api_url: str = "http://localhost:8000/api/readings",
        device_id: str = "esp32_dummy",
        interval: float = 5.0,
        alert_mode: bool = False,
    ):
        """
        Initialize the simulator.

        Args:
            api_url: Backend API endpoint URL
            device_id: Device identifier
            interval: Time between readings in seconds (default: 5.0, matching ESP32)
            alert_mode: If True, occasionally generates readings that trigger alerts
        """
        self.api_url = api_url
        self.device_id = device_id
        self.interval = interval
        self.alert_mode = alert_mode

        # Normal ranges for good quality water
        self.ph_normal = (6.5, 8.0)
        self.turbidity_normal = (0.0, 50.0)  # NTU
        self.tds_normal = (0.0, 300.0)  # ppm
        self.temperature_normal = (18.0, 28.0)  # Celsius

        # Alert thresholds (matching backend config)
        self.ph_min = 6.0
        self.ph_max = 9.0
        self.turbidity_max = 100.0
        self.tds_max = 500.0

        # Current state for gradual changes
        self.current_ph = random.uniform(*self.ph_normal)
        self.current_turbidity = random.uniform(*self.turbidity_normal)
        self.current_tds = random.uniform(*self.tds_normal)
        self.current_temperature = random.uniform(*self.temperature_normal)

        # Counter for alert simulation
        self.reading_count = 0

    def generate_reading(self) -> Dict:
        """
        Generate a single water quality reading with realistic variations.

        Returns:
            Dictionary containing ph, turbidity, tds, temperature, and device_id
        """
        self.reading_count += 1

        # Simulate gradual changes with some randomness
        if self.alert_mode and self.reading_count % 20 == 0:
            # Every 20th reading, simulate an alert condition
            alert_type = random.choice(["ph_low", "ph_high", "turbidity_high", "tds_high"])
            
            if alert_type == "ph_low":
                self.current_ph = random.uniform(4.0, 5.9)
            elif alert_type == "ph_high":
                self.current_ph = random.uniform(9.1, 11.0)
            elif alert_type == "turbidity_high":
                self.current_turbidity = random.uniform(100.1, 200.0)
            elif alert_type == "tds_high":
                self.current_tds = random.uniform(500.1, 800.0)
        else:
            # Normal variations with gradual drift
            self.current_ph += random.uniform(-0.1, 0.1)
            self.current_ph = max(0, min(14, self.current_ph))  # Clamp to valid range
            
            self.current_turbidity += random.uniform(-2.0, 2.0)
            self.current_turbidity = max(0, self.current_turbidity)
            
            self.current_tds += random.uniform(-10.0, 10.0)
            self.current_tds = max(0, self.current_tds)
            
            self.current_temperature += random.uniform(-0.5, 0.5)
            self.current_temperature = max(10, min(35, self.current_temperature))

        # Add small random noise to simulate sensor accuracy
        ph = round(self.current_ph + random.uniform(-0.05, 0.05), 2)
        turbidity = round(max(0, self.current_turbidity + random.uniform(-1.0, 1.0)), 2)
        tds = round(max(0, self.current_tds + random.uniform(-5.0, 5.0)), 2)
        temperature = round(self.current_temperature + random.uniform(-0.2, 0.2), 2)

        return {
            "ph": ph,
            "turbidity": turbidity,
            "tds": tds,
            "temperature": temperature,
            "device_id": self.device_id,
        }

    def send_reading(self, reading: Dict) -> bool:
        """
        Send a reading to the backend API.

        Args:
            reading: Dictionary containing sensor readings

        Returns:
            True if successful, False otherwise
        """
        try:
            response = requests.post(
                self.api_url,
                json=reading,
                headers={"Content-Type": "application/json"},
                timeout=5,
            )
            response.raise_for_status()
            result = response.json()
            
            # Check if alert was triggered
            alert_triggered = result.get("alert", False)
            
            status = "✓"
            if alert_triggered:
                status = "⚠ ALERT"
            
            print(
                f"[{datetime.now().strftime('%H:%M:%S')}] {status} "
                f"pH={reading['ph']:.2f} | "
                f"Turb={reading['turbidity']:.1f} NTU | "
                f"TDS={reading['tds']:.0f} ppm | "
                f"Temp={reading['temperature']:.1f}°C"
            )
            
            return True
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to send reading: {e}")
            return False

    def run(self):
        """Run the simulator continuously."""
        print("=" * 70)
        print("Water Quality Dummy Data Generator")
        print("=" * 70)
        print(f"API URL: {self.api_url}")
        print(f"Device ID: {self.device_id}")
        print(f"Interval: {self.interval} seconds")
        print(f"Alert Mode: {'Enabled' if self.alert_mode else 'Disabled'}")
        print("=" * 70)
        print("Press Ctrl+C to stop\n")

        try:
            while True:
                reading = self.generate_reading()
                self.send_reading(reading)
                time.sleep(self.interval)
        except KeyboardInterrupt:
            print("\n\nStopping dummy data generator...")
            print("Goodbye!")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate dummy water quality sensor readings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Default: 5 second interval, normal readings
  python scripts/dummy_data_generator.py

  # Custom interval and device ID
  python scripts/dummy_data_generator.py --interval 10 --device-id esp32_test

  # Simulate alert conditions
  python scripts/dummy_data_generator.py --alert-mode

  # Custom API URL (if backend is on different host/port)
  python scripts/dummy_data_generator.py --api-url http://192.168.1.100:8000/api/readings
        """,
    )

    parser.add_argument(
        "--api-url",
        type=str,
        default="http://localhost:8000/api/readings",
        help="Backend API endpoint URL (default: http://localhost:8000/api/readings)",
    )
    parser.add_argument(
        "--device-id",
        type=str,
        default="esp32_dummy",
        help="Device identifier (default: esp32_dummy)",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=5.0,
        help="Time between readings in seconds (default: 5.0, matching ESP32)",
    )
    parser.add_argument(
        "--alert-mode",
        action="store_true",
        help="Enable alert simulation mode (occasionally generates threshold breaches)",
    )

    args = parser.parse_args()

    simulator = WaterQualitySimulator(
        api_url=args.api_url,
        device_id=args.device_id,
        interval=args.interval,
        alert_mode=args.alert_mode,
    )

    simulator.run()


if __name__ == "__main__":
    main()
