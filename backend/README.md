# Water Quality Backend (FastAPI)

Run: `uvicorn app.main:app --reload --port 8000`

## Environment variables

Create a `.env` file (or set in shell):

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes* | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Service role key (or `SUPABASE_ANON_KEY`) |
| `TWILIO_ACCOUNT_SID` | No | For SMS alerts |
| `TWILIO_AUTH_TOKEN` | No | For SMS alerts |
| `TWILIO_PHONE_NUMBER` | No | Sender number |
| `WATER_ALERT_PHONE_NUMBER` | No | Recipient for water alerts |

\* If Supabase is not set, the backend uses in-memory storage (readings/alerts lost on restart).

## Endpoints

- `GET /health` – Health + Supabase status
- `POST /api/readings` – Store reading (ESP32); triggers WebSocket broadcast and optional SMS on threshold breach
- `GET /api/readings` – List readings (`?limit=50`, `?device_id=...`)
- `GET /api/readings/latest` – Latest reading
- `GET /api/alerts` – List alerts (`?limit=20`)
- `GET /api/stats` – Counts and latest timestamp
- `WebSocket /ws` – Live updates (reading/alert messages)
