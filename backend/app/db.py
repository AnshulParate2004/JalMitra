from functools import lru_cache
from typing import Optional

from supabase import Client, create_client

from app.config import get_supabase_key, get_supabase_url, is_supabase_configured


@lru_cache
def get_supabase() -> Optional[Client]:
    if not is_supabase_configured():
        return None
    return create_client(get_supabase_url(), get_supabase_key())
