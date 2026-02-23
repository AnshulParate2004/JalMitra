# Krishi Mitra Backend - FastAPI Folder Structure

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
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── users.py        # User management
│   │       ├── farms.py        # Farm operations
│   │       ├── irrigation.py   # Irrigation advice
│   │       ├── education.py    # Education content
│   │       ├── notifications.py # Notification endpoints
│   │       └── voice_bot.py    # Voice bot endpoints (RAG)
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
│   │   ├── notification.py
│   │   └── voice_bot.py        # Voice bot request/response schemas
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py     # OTP, JWT tokens
│   │   ├── user_service.py
│   │   ├── farm_service.py
│   │   ├── irrigation_service.py
│   │   ├── crop_cycle_service.py
│   │   ├── education_service.py
│   │   ├── notification_service.py
│   │   ├── voice_bot_service.py # Voice bot orchestration
│   │   ├── rag_service.py      # RAG retrieval & generation
│   │   └── scheme_retrieval_service.py # Government scheme retrieval
│   │
│   ├── external_apis/          # Third-party API integrations
│   │   ├── __init__.py
│   │   ├── kaegro_api.py       # Soil type API
│   │   ├── agromonitoring_api.py # Soil moisture API
│   │   ├── mapmyindia_api.py   # Geocoding & maps
│   │   ├── twilio_api.py       # SMS/WhatsApp
│   │   └── voice_api.py        # Speech-to-Text, Text-to-Speech
│   │
│   ├── vector_db/              # Vector database for RAG
│   │   ├── __init__.py
│   │   ├── chroma_client.py    # ChromaDB client
│   │   ├── embeddings.py       # Embedding generation
│   │   └── scheme_store.py     # Government schemes vector store
│   │
│   ├── llm/                    # LLM integration for RAG
│   │   ├── __init__.py
│   │   ├── llm_client.py       # LLM client (OpenAI/Anthropic/local)
│   │   └── prompt_templates.py # RAG prompt templates
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
│   ├── migrate_data.py
│   └── seed_schemes.py         # Seed government schemes into vector DB
│
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── alembic.ini                 # Alembic config
└── docker-compose.yml          # Local development setup
```

## Key Directories Explained

### `app/api/v1/` - API Endpoints
- **auth.py**: OTP send/verify, JWT token generation
- **users.py**: User registration, profile management
- **farms.py**: Farm CRUD operations, location management
- **irrigation.py**: Get irrigation advice, calculate water needs
- **education.py**: Education content, crop guides, schemes
- **notifications.py**: Get notifications, mark as read
- **voice_bot.py**: Voice bot endpoints (text/voice input, RAG responses)

### `app/models/` - Database Models
- **user.py**: User table with phone, name, language
- **farm.py**: Farm table with location, crop, soil data
- **crop.py**: Crop database with growth stages, calendars
- **irrigation.py**: Irrigation records and recommendations
- **education.py**: Education content (videos, guides, articles)
- **notification.py**: Notification history

### `app/schemas/` - Request/Response Models
- Pydantic models for API validation
- Request schemas (input validation)
- Response schemas (output formatting)

### `app/services/` - Business Logic
- **auth_service.py**: OTP generation, JWT token management
- **user_service.py**: User CRUD operations
- **farm_service.py**: Farm management, location validation
- **irrigation_service.py**: Calculate irrigation needs, integrate APIs
- **crop_cycle_service.py**: Calculate crop stages, days since planting
- **education_service.py**: Content management, translations
- **notification_service.py**: Generate and send notifications
- **voice_bot_service.py**: Voice bot orchestration, handle user queries
- **rag_service.py**: RAG pipeline - retrieve from vector DB, generate responses
- **scheme_retrieval_service.py**: Retrieve government schemes from vector DB

### `app/external_apis/` - Third-Party Integrations
- **kaegro_api.py**: Fetch soil type by lat/lon
- **agromonitoring_api.py**: Fetch soil moisture data
- **mapmyindia_api.py**: Geocoding, reverse geocoding
- **twilio_api.py**: Send SMS/WhatsApp messages
- **voice_api.py**: Speech-to-Text (STT), Text-to-Speech (TTS) integration

### `app/vector_db/` - Vector Database for RAG
- **chroma_client.py**: ChromaDB client initialization and connection
- **embeddings.py**: Generate embeddings for schemes/content (using sentence-transformers or OpenAI)
- **scheme_store.py**: Store/retrieve government schemes from vector DB, similarity search

### `app/llm/` - LLM Integration for RAG
- **llm_client.py**: LLM client (OpenAI GPT, Anthropic Claude, or local model)
- **prompt_templates.py**: Prompt templates for RAG responses in multiple languages

### `app/tasks/` - Background Jobs (Celery)
- **celery_app.py**: Celery configuration
- **daily_notifications.py**: Daily 6 AM IST cron job
- **irrigation_alerts.py**: Check all farms, generate alerts
- **crop_stage_updates.py**: Update crop stages daily

### `app/utils/` - Helper Functions
- **validators.py**: Phone number, coordinates validation
- **calculations.py**: Irrigation amount calculations
- **i18n.py**: Multi-language support (12 languages)
- **logger.py**: Logging configuration

### `app/middleware/` - Custom Middleware
- **auth_middleware.py**: JWT token verification
- **error_handler.py**: Global exception handling

## Voice Bot with RAG Flow

1. **User asks**: "PMKSY scheme क्या है?" (via voice/text)
2. **voice_bot_service.py**: Processes query, detects intent
3. **rag_service.py**: 
   - Generates embedding for user query
   - Searches vector DB for relevant schemes
   - Retrieves top-k matching schemes
4. **llm_client.py**: 
   - Takes retrieved schemes + user query
   - Generates contextual response in user's language
5. **voice_api.py**: Converts text response to speech (if voice input)
6. **Response**: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana) एक सिंचाई योजना है..."

## Government Schemes in Vector DB

Schemes stored with:
- Scheme name (Hindi/English/Marathi)
- Description
- Eligibility criteria
- Benefits
- Application steps
- Contact information
- Metadata (category, state, etc.)

When user asks about schemes, RAG retrieves most relevant ones and LLM generates natural language response.

## Environment Variables Needed

```env
DATABASE_URL=postgresql://user:pass@localhost/krishi_mitra
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
KAEGRO_API_URL=https://www.kaegro.com/farms/api/soil
AGROMONITORING_API_URL=http://api.agromonitoring.com/agro/1.0/soil
AGROMONITORING_API_KEY=your-key
MAPMYINDIA_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Vector DB & RAG
CHROMA_DB_PATH=./chroma_db
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
LLM_PROVIDER=openai  # or anthropic, local
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Voice APIs
GOOGLE_STT_API_KEY=your-google-stt-key
GOOGLE_TTS_API_KEY=your-google-tts-key
# OR
ELEVENLABS_API_KEY=your-elevenlabs-key
```
