# Krishi Mitra Backend - FastAPI

Backend API for Krishi Mitra - Agriculture Irrigation Advisor & Education Portal

## Tech Stack
- FastAPI
- PostgreSQL (via SQLAlchemy)
- Redis (for caching & job queues)
- Celery (for async tasks & cron jobs)
- Firebase Admin SDK (for notifications)
- Twilio (for SMS/WhatsApp)

## Folder Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment variables & settings
│   ├── database.py             # Database connection & session
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── users.py        # User management
│   │   │   ├── farms.py        # Farm operations
│   │   │   ├── irrigation.py   # Irrigation advice
│   │   │   ├── education.py    # Education content
│   │   │   └── notifications.py # Notification endpoints
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── farm.py
│   │   ├── crop.py
│   │   ├── irrigation.py
│   │   ├── education.py
│   │   └── notification.py
│   │
│   ├── schemas/                # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── farm.py
│   │   ├── irrigation.py
│   │   ├── education.py
│   │   └── notification.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py     # OTP, JWT tokens
│   │   ├── user_service.py
│   │   ├── farm_service.py
│   │   ├── irrigation_service.py
│   │   ├── crop_cycle_service.py
│   │   ├── education_service.py
│   │   └── notification_service.py
│   │
│   ├── external_apis/          # Third-party API integrations
│   │   ├── __init__.py
│   │   ├── kaegro_api.py       # Soil type API
│   │   ├── agromonitoring_api.py # Soil moisture API
│   │   ├── mapmyindia_api.py   # Geocoding & maps
│   │   └── twilio_api.py       # SMS/WhatsApp
│   │
│   ├── tasks/                  # Celery tasks (cron jobs)
│   │   ├── __init__.py
│   │   ├── celery_app.py       # Celery configuration
│   │   ├── daily_notifications.py
│   │   ├── irrigation_alerts.py
│   │   └── crop_stage_updates.py
│   │
│   ├── utils/                  # Helper functions
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   ├── calculations.py     # Irrigation calculations
│   │   ├── i18n.py             # Language translations
│   │   └── logger.py
│   │
│   └── middleware/             # Custom middleware
│       ├── __init__.py
│       ├── auth_middleware.py
│       └── error_handler.py
│
├── migrations/                 # Alembic migrations
│   └── versions/
│
├── tests/                      # Unit & integration tests
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_farms.py
│   ├── test_irrigation.py
│   └── test_apis.py
│
├── scripts/                    # Utility scripts
│   ├── seed_data.py            # Seed crop database
│   └── migrate_data.py
│
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── alembic.ini                 # Alembic config
└── docker-compose.yml          # Local development setup

```

## Key Features

### 1. Authentication
- Phone OTP verification
- JWT token-based auth
- Multi-language support

### 2. Farm Management
- Register farm with location (lat/lon)
- Crop selection & planting date
- Multiple farms per user

### 3. Irrigation Intelligence
- Daily soil moisture checks (Agromonitoring API)
- Soil type detection (Kaegro API)
- Crop cycle stage calculation
- Irrigation amount & timing recommendations

### 4. Daily Cron Jobs (6 AM IST)
- Check all farms for irrigation needs
- Generate personalized notifications
- Send SMS/WhatsApp alerts

### 5. Education Portal
- Crop guides & calendars
- Irrigation techniques
- Government schemes (PMKSY)
- Video content management

### 6. Notifications
- SMS via Twilio
- WhatsApp messages
- In-app notifications
- Multi-language support

## Environment Variables
```env
DATABASE_URL=postgresql://user:pass@localhost/krishi_mitra
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# External APIs
KAEGRO_API_URL=https://www.kaegro.com/farms/api/soil
AGROMONITORING_API_URL=http://api.agromonitoring.com/agro/1.0/soil
AGROMONITORING_API_KEY=your-key
MAPMYINDIA_API_KEY=your-key

# Twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Firebase (optional)
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed crop data
python scripts/seed_data.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Start Celery worker (for cron jobs)
celery -A app.tasks.celery_app worker --loglevel=info

# Start Celery beat (for scheduled tasks)
celery -A app.tasks.celery_app beat --loglevel=info
```
