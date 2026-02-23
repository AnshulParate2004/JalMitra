"""
Time-based Alert Monitor

Tracks threshold breaches over time and sends alerts if parameters
stay out of range for a specified duration (e.g., 3 minutes).
"""

import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional
from collections import defaultdict

from app.config import get_twilio_config
from app.main import PH_MIN, PH_MAX, TURBIDITY_MAX_NTU, TDS_MAX_PPM


class AlertMonitor:
    """Monitors threshold breaches over time and triggers alerts after duration."""

    def __init__(self, alert_duration_seconds: int = 180):  # 3 minutes default
        """
        Initialize the alert monitor.

        Args:
            alert_duration_seconds: Duration in seconds before sending alert (default: 180 = 3 minutes)
        """
        self.alert_duration = alert_duration_seconds
        # Track when each device's parameters first breached threshold
        # Format: {device_id: {parameter: first_breach_timestamp}}
        self.breach_start_times: Dict[str, Dict[str, float]] = defaultdict(dict)
        # Track if alert already sent for current breach
        self.alert_sent: Dict[str, Dict[str, bool]] = defaultdict(dict)

    def check_and_alert(
        self,
        device_id: str,
        ph: float,
        turbidity: float,
        tds: float,
        current_time: Optional[float] = None,
    ) -> list[str]:
        """
        Check if parameters are out of range and send alerts if breach duration exceeded.

        Args:
            device_id: Device identifier
            ph: pH value
            turbidity: Turbidity value (NTU)
            tds: TDS value (ppm)
            current_time: Current timestamp (defaults to now)

        Returns:
            List of alert messages sent
        """
        if current_time is None:
            current_time = time.time()

        alerts_sent = []
        device_key = device_id

        # Check pH
        ph_breach = ph < PH_MIN or ph > PH_MAX
        if ph_breach:
            if "ph" not in self.breach_start_times[device_key]:
                # First time breaching - record start time
                self.breach_start_times[device_key]["ph"] = current_time
                self.alert_sent[device_key]["ph"] = False
            else:
                # Already breaching - check duration
                breach_duration = current_time - self.breach_start_times[device_key]["ph"]
                if breach_duration >= self.alert_duration and not self.alert_sent[device_key].get("ph", False):
                    # Send alert
                    ph_status = "too low" if ph < PH_MIN else "too high"
                    alert_msg = (
                        f"⚠️ ALERT: pH level {ph_status} ({ph:.2f}) for {int(breach_duration)} seconds. "
                        f"Safe range: {PH_MIN}-{PH_MAX}"
                    )
                    alerts_sent.append(alert_msg)
                    self.alert_sent[device_key]["ph"] = True
        else:
            # pH is back in range - reset tracking
            if "ph" in self.breach_start_times[device_key]:
                del self.breach_start_times[device_key]["ph"]
                self.alert_sent[device_key]["ph"] = False

        # Check Turbidity
        turbidity_breach = turbidity > TURBIDITY_MAX_NTU
        if turbidity_breach:
            if "turbidity" not in self.breach_start_times[device_key]:
                self.breach_start_times[device_key]["turbidity"] = current_time
                self.alert_sent[device_key]["turbidity"] = False
            else:
                breach_duration = current_time - self.breach_start_times[device_key]["turbidity"]
                if breach_duration >= self.alert_duration and not self.alert_sent[device_key].get("turbidity", False):
                    alert_msg = (
                        f"⚠️ ALERT: Turbidity too high ({turbidity:.1f} NTU) for {int(breach_duration)} seconds. "
                        f"Safe limit: {TURBIDITY_MAX_NTU} NTU"
                    )
                    alerts_sent.append(alert_msg)
                    self.alert_sent[device_key]["turbidity"] = True
        else:
            if "turbidity" in self.breach_start_times[device_key]:
                del self.breach_start_times[device_key]["turbidity"]
                self.alert_sent[device_key]["turbidity"] = False

        # Check TDS
        tds_breach = tds > TDS_MAX_PPM
        if tds_breach:
            if "tds" not in self.breach_start_times[device_key]:
                self.breach_start_times[device_key]["tds"] = current_time
                self.alert_sent[device_key]["tds"] = False
            else:
                breach_duration = current_time - self.breach_start_times[device_key]["tds"]
                if breach_duration >= self.alert_duration and not self.alert_sent[device_key].get("tds", False):
                    alert_msg = (
                        f"⚠️ ALERT: TDS too high ({tds:.0f} ppm) for {int(breach_duration)} seconds. "
                        f"Safe limit: {TDS_MAX_PPM} ppm"
                    )
                    alerts_sent.append(alert_msg)
                    self.alert_sent[device_key]["tds"] = True
        else:
            if "tds" in self.breach_start_times[device_key]:
                del self.breach_start_times[device_key]["tds"]
                self.alert_sent[device_key]["tds"] = False

        return alerts_sent

    def reset_device(self, device_id: str):
        """Reset tracking for a specific device."""
        device_key = device_id
        if device_key in self.breach_start_times:
            del self.breach_start_times[device_key]
        if device_key in self.alert_sent:
            del self.alert_sent[device_key]


# Global instance
_alert_monitor: Optional[AlertMonitor] = None


def get_alert_monitor() -> AlertMonitor:
    """Get the global alert monitor instance."""
    global _alert_monitor
    if _alert_monitor is None:
        import os
        duration = int(os.environ.get("ALERT_DURATION_SECONDS", "180"))  # Default 3 minutes
        _alert_monitor = AlertMonitor(alert_duration_seconds=duration)
    return _alert_monitor
