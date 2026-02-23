"""
Tool functions for chatbot to get live data.
"""
from typing import Dict, Any, List, Optional
from app.main import _get_readings, _get_latest, _get_alerts, readings_store, alerts_store
from app.db import get_supabase


def get_latest_reading(device_id: Optional[str] = None) -> Dict[str, Any]:
    """Get the latest water quality reading."""
    reading = _get_latest(device_id)
    if reading:
        return {
            "success": True,
            "data": reading
        }
    return {
        "success": False,
        "message": "No readings available"
    }


def get_recent_readings(limit: int = 10, device_id: Optional[str] = None) -> Dict[str, Any]:
    """Get recent water quality readings."""
    readings = _get_readings(limit, device_id)
    return {
        "success": True,
        "count": len(readings),
        "data": readings
    }


def get_recent_alerts(limit: int = 10) -> Dict[str, Any]:
    """Get recent water quality alerts."""
    alerts = _get_alerts(limit)
    return {
        "success": True,
        "count": len(alerts),
        "data": alerts
    }


def get_water_quality_stats() -> Dict[str, Any]:
    """Get water quality statistics."""
    readings = _get_readings(100, None)  # Get last 100 readings for stats
    
    if not readings:
        return {
            "success": False,
            "message": "No data available for statistics"
        }
    
    ph_values = [r.get("ph") for r in readings if r.get("ph") is not None]
    turbidity_values = [r.get("turbidity") for r in readings if r.get("turbidity") is not None]
    tds_values = [r.get("tds") for r in readings if r.get("tds") is not None]
    
    stats = {}
    
    if ph_values:
        stats["ph"] = {
            "average": sum(ph_values) / len(ph_values),
            "min": min(ph_values),
            "max": max(ph_values),
            "count": len(ph_values)
        }
    
    if turbidity_values:
        stats["turbidity"] = {
            "average": sum(turbidity_values) / len(turbidity_values),
            "min": min(turbidity_values),
            "max": max(turbidity_values),
            "count": len(turbidity_values)
        }
    
    if tds_values:
        stats["tds"] = {
            "average": sum(tds_values) / len(tds_values),
            "min": min(tds_values),
            "max": max(tds_values),
            "count": len(tds_values)
        }
    
    return {
        "success": True,
        "stats": stats,
        "total_readings": len(readings)
    }


# Tool definitions for LangChain
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_latest_reading",
            "description": "Get the most recent water quality reading. Use this to check current pH, TDS, turbidity, and temperature values.",
            "parameters": {
                "type": "object",
                "properties": {
                    "device_id": {
                        "type": "string",
                        "description": "Optional device ID to filter by specific device. Leave empty for any device."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_readings",
            "description": "Get recent water quality readings. Use this to see historical data or trends.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Number of readings to retrieve (default: 10, max: 100)"
                    },
                    "device_id": {
                        "type": "string",
                        "description": "Optional device ID to filter by specific device."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_alerts",
            "description": "Get recent water quality alerts. Use this to check for any issues or warnings.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Number of alerts to retrieve (default: 10, max: 50)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_water_quality_stats",
            "description": "Get statistical summary of water quality data including averages, min, max values for pH, TDS, and turbidity.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]


def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool function by name."""
    tool_functions = {
        "get_latest_reading": lambda args: get_latest_reading(args.get("device_id")),
        "get_recent_readings": lambda args: get_recent_readings(args.get("limit", 10), args.get("device_id")),
        "get_recent_alerts": lambda args: get_recent_alerts(args.get("limit", 10)),
        "get_water_quality_stats": lambda args: get_water_quality_stats(),
    }
    
    if tool_name in tool_functions:
        try:
            return tool_functions[tool_name](arguments)
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    else:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }
