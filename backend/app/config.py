import os
from typing import Optional

def get_supabase_url() -> str:
    url = os.environ.get("SUPABASE_URL", "").strip()
    if not url:
        raise ValueError("SUPABASE_URL is required. Set it in .env")
    return url.rstrip("/")

def get_supabase_key() -> str:
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "").strip()
    if not key:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required.")
    return key

def get_twilio_config() -> tuple[str, str, str, str]:
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
    token = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
    from_num = os.environ.get("TWILIO_PHONE_NUMBER", "").strip()
    # Load alert recipient phone number from environment
    # Default to +918208170566 if not set
    to_num = os.environ.get("WATER_ALERT_PHONE_NUMBER", "+918208170566").strip()
    if not to_num:
        to_num = "+918208170566"  # Fallback default
    return sid, token, from_num, to_num

def is_supabase_configured() -> bool:
    return bool(os.environ.get("SUPABASE_URL", "").strip() and (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.environ.get("SUPABASE_ANON_KEY", "").strip()
    ))
