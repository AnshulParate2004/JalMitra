"""
Integrated Dummy Water Quality Data Generator

This module provides a background task that automatically generates
dummy sensor readings when the backend starts (if enabled).
"""

import asyncio
import os
import random
from datetime import datetime
from typing import Dict, Optional

from app.config import is_supabase_configured


class DummyDataGenerator:
    """Background task that generates dummy water quality readings."""

    def __init__(
        self,
        device_id: str = "esp32_dummy",
        interval: float = 5.0,
        alert_mode: bool = False,
        enabled: bool = True,
    ):
        """
        Initialize the dummy data generator.

        Args:
            device_id: Device identifier
            interval: Time between readings in seconds (default: 5.0, matching ESP32)
            alert_mode: If True, occasionally generates readings that trigger alerts
            enabled: If False, generator won't run
        """
        self.device_id = device_id
        self.interval = interval
        self.alert_mode = alert_mode
        self.enabled = enabled
        self.running = False
        self.task: Optional[asyncio.Task] = None

        # Normal ranges for good quality water
        self.ph_normal = (6.5, 8.0)
        self.turbidity_normal = (0.0, 50.0)  # NTU
        self.tds_normal = (0.0, 300.0)  # ppm
        self.temperature_normal = (18.0, 28.0)  # Celsius

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

    async def process_reading(self, reading: Dict) -> None:
        """
        Process a reading through the backend (same as POST /api/readings).

        Args:
            reading: Dictionary containing sensor readings
        """
        # Lazy imports to avoid circular dependency
        from datetime import timezone
        from app.main import ReadingIn, _insert_reading, _insert_alert, check_thresholds, send_sms_alert
        from app.websocket_manager import ws_manager

        now = datetime.now(timezone.utc).isoformat()
        record = {
            "timestamp": now,
            "ph": reading["ph"],
            "turbidity": reading["turbidity"],
            "tds": reading["tds"],
            "device_id": reading["device_id"],
            "temperature": reading["temperature"],
        }

        # Store reading
        _insert_reading(record)

        # Only check time-based alerts (3-minute persistent breach)
        # NO immediate alerts - only after 3 minutes of continuous breach
        from app.alert_monitor import get_alert_monitor
        alert_monitor = get_alert_monitor()
        time_based_alerts = alert_monitor.check_and_alert(
            device_id=reading["device_id"],
            ph=reading["ph"],
            turbidity=reading["turbidity"],
            tds=reading["tds"],
        )
        
        # Send time-based alerts if any (only after 3 minutes)
        for alert_msg in time_based_alerts:
            alert_record = {
                "timestamp": now,
                "device_id": reading["device_id"],
                "message": alert_msg,
                "readings": record,
            }
            _insert_alert(alert_record)
            send_sms_alert(alert_msg)
            await ws_manager.broadcast({"type": "alert", "data": alert_record})
            print(f"[DUMMY] [ALERT] {alert_msg}")

        # Always broadcast reading (every 5 seconds)

            # Log alert
            print(
                f"[DUMMY] [{datetime.now().strftime('%H:%M:%S')}] ⚠ ALERT "
                f"pH={reading['ph']:.2f} | "
                f"Turb={reading['turbidity']:.1f} NTU | "
                f"TDS={reading['tds']:.0f} ppm | "
                f"Temp={reading['temperature']:.1f}°C"
            )
        else:
            # Log normal reading
            print(
                f"[DUMMY] [{datetime.now().strftime('%H:%M:%S')}] ✓ "
                f"pH={reading['ph']:.2f} | "
                f"Turb={reading['turbidity']:.1f} NTU | "
                f"TDS={reading['tds']:.0f} ppm | "
                f"Temp={reading['temperature']:.1f}°C"
            )

        # Always broadcast reading via WebSocket
        await ws_manager.broadcast({"type": "reading", "data": record})

    async def run_loop(self) -> None:
        """Run the generator loop continuously."""
        print(f"[DUMMY] Generator started: device_id={self.device_id}, interval={self.interval}s, alert_mode={self.alert_mode}")
        
        while self.running:
            try:
                reading = self.generate_reading()
                await self.process_reading(reading)
                await asyncio.sleep(self.interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[DUMMY] Error generating reading: {e}")
                await asyncio.sleep(self.interval)

    async def start(self) -> None:
        """Start the generator."""
        if not self.enabled:
            print("[DUMMY] Generator is disabled")
            return

        if self.running:
            print("[DUMMY] Generator is already running")
            return

        self.running = True
        self.task = asyncio.create_task(self.run_loop())
        print("[DUMMY] Generator started in background")

    async def stop(self) -> None:
        """Stop the generator."""
        if not self.running:
            return

        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        print("[DUMMY] Generator stopped")

    def get_status(self) -> Dict:
        """Get the current status of the generator."""
        return {
            "enabled": self.enabled,
            "running": self.running,
            "device_id": self.device_id,
            "interval": self.interval,
            "alert_mode": self.alert_mode,
            "readings_generated": self.reading_count,
        }


# Global instance
_dummy_generator: Optional[DummyDataGenerator] = None


def get_dummy_generator() -> Optional[DummyDataGenerator]:
    """Get the global dummy generator instance."""
    return _dummy_generator


def set_dummy_generator(generator: DummyDataGenerator) -> None:
    """Set the global dummy generator instance."""
    global _dummy_generator
    _dummy_generator = generator


def initialize_dummy_generator() -> DummyDataGenerator:
    """Initialize the dummy generator from environment variables."""
    enabled = os.environ.get("DUMMY_GENERATOR_ENABLED", "false").lower() == "true"
    device_id = os.environ.get("DUMMY_GENERATOR_DEVICE_ID", "esp32_dummy")
    interval = float(os.environ.get("DUMMY_GENERATOR_INTERVAL", "5.0"))
    alert_mode = os.environ.get("DUMMY_GENERATOR_ALERT_MODE", "false").lower() == "true"

    return DummyDataGenerator(
        device_id=device_id,
        interval=interval,
        alert_mode=alert_mode,
        enabled=enabled,
    )
