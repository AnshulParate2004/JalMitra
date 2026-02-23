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
| `DUMMY_GENERATOR_ENABLED` | No | Enable dummy data generator (`true`/`false`, default: `false`) |
| `DUMMY_GENERATOR_DEVICE_ID` | No | Device ID for dummy generator (default: `esp32_dummy`) |
| `DUMMY_GENERATOR_INTERVAL` | No | Interval between readings in seconds (default: `5.0`) |
| `DUMMY_GENERATOR_ALERT_MODE` | No | Enable alert simulation (`true`/`false`, default: `false`) |
| `INIT_SAMPLE_DATA` | No | Initialize sample data on startup (`true`/`false`, default: `true`) |
| `ALERT_DURATION_SECONDS` | No | Duration before sending persistent breach alert (default: `180` = 3 minutes) |

\* If Supabase is not set, the backend uses in-memory storage (readings/alerts lost on restart).

## Endpoints

- `GET /health` – Health + Supabase status + dummy generator status
- `POST /api/readings` – Store reading (ESP32); triggers WebSocket broadcast and optional SMS on threshold breach
- `GET /api/readings` – List readings (`?limit=50`, `?device_id=...`)
- `GET /api/readings/latest` – Latest reading
- `GET /api/alerts` – List alerts (`?limit=20`)
- `GET /api/stats` – Counts and latest timestamp
- `WebSocket /ws` – Live updates (reading/alert messages)

### Dummy Generator Control Endpoints

- `GET /api/dummy-generator/status` – Get dummy generator status
- `POST /api/dummy-generator/start` – Start the dummy generator
- `POST /api/dummy-generator/stop` – Stop the dummy generator

## Dummy Data Generator

The backend includes an integrated dummy data generator that simulates ESP32 sensor readings. This is useful for testing without physical hardware.

### Enable on Startup

Add to your `.env` file:

```env
DUMMY_GENERATOR_ENABLED=true
DUMMY_GENERATOR_DEVICE_ID=esp32_dummy
DUMMY_GENERATOR_INTERVAL=5.0
DUMMY_GENERATOR_ALERT_MODE=false
```

When enabled, the generator will automatically start when the backend starts and will:
- Generate realistic water quality readings every 5 seconds (configurable)
- Store readings in Supabase
- Broadcast via WebSocket to frontend
- Create alerts when thresholds are breached (if alert mode enabled)

### Control via API

You can start/stop the generator at runtime:

```bash
# Check status
curl http://localhost:8000/api/dummy-generator/status

# Start generator
curl -X POST http://localhost:8000/api/dummy-generator/start

# Stop generator
curl -X POST http://localhost:8000/api/dummy-generator/stop
```

### Standalone Script

You can also run the dummy generator as a standalone script:

```bash
python scripts/dummy_data_generator.py
```

See `scripts/README.md` for more details.

## Sample Data Initialization

The backend can automatically populate Supabase with sample data on startup so the frontend has data to display immediately.

### Automatic Initialization

By default, the backend will check for existing data on startup and initialize sample data if the database is empty:

- **50 readings** over the last 24 hours
- **3 sample alerts**
- Realistic water quality values within safe ranges

To disable automatic initialization, set in `.env`:
```env
INIT_SAMPLE_DATA=false
```

### Manual Initialization

You can also initialize sample data manually using the standalone script:

```bash
# Default: 50 readings, 3 alerts, last 24 hours
python scripts/init_sample_data.py

# Custom settings
python scripts/init_sample_data.py --readings 100 --alerts 5 --hours 48

# Force initialization (overwrite existing data)
python scripts/init_sample_data.py --force
```

### What Gets Created

- **Readings**: Historical water quality readings with realistic variations
  - pH: 6.0-8.5 (safe range)
  - Turbidity: 0-80 NTU (safe range)
  - TDS: 0-450 ppm (safe range)
  - Temperature: 18-28°C

- **Alerts**: Sample threshold breach alerts
  - pH out of range
  - High turbidity
  - High TDS

This ensures the frontend always has data to display, even before real sensor data arrives.
