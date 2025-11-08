# Medi-AI Backend

FastAPI backend server with OpenAI and ElevenLabs integration.

## Features

- **OpenAI GPT-4o**: Chat completion for medical assistance
- **OpenAI Whisper**: Speech-to-text transcription
- **ElevenLabs**: Natural text-to-speech voice synthesis
- **CORS enabled**: For frontend integration
- **RESTful API**: Well-structured endpoints

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **OpenAI SDK**: For GPT-4o and Whisper
- **ElevenLabs SDK**: For voice synthesis
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update `.env` with your API keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_monolingual_v1
```

### 3. Run the Server

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health status

### Chat & Text Generation
- `POST /api/v1/bedrock/generate` - Generate text
- `POST /api/v1/bedrock/generate/stream` - Stream text generation
- `POST /api/v1/bedrock/chat` - Chat completion

### Speech Recognition
- `POST /api/v1/transcription/whisper` - Transcribe audio to text

### Voice Synthesis
- `POST /api/v1/voice/text-to-speech` - Convert text to speech
- `POST /api/v1/voice/text-to-speech/stream` - Stream TTS
- `GET /api/v1/voice/voices` - List available voices

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── config.py          # Configuration settings
│   ├── main.py            # FastAPI application
│   ├── routes/            # API endpoints
│   │   ├── openai.py      # OpenAI routes
│   │   ├── transcription.py  # Whisper routes
│   │   └── voice.py       # ElevenLabs routes
│   └── services/          # Business logic
│       ├── openai_service.py      # OpenAI integration
│       └── elevenlabs_service.py  # ElevenLabs integration
├── requirements.txt       # Python dependencies
├── run.py                # Server startup script
├── .env.example          # Environment template
└── README.md             # This file
```

## Development

### Running in Development Mode

```bash
uvicorn app.main:app --reload
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model | `gpt-4o` |
| `OPENAI_TEMPERATURE` | Response randomness | `0.7` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Required |
| `ELEVENLABS_VOICE_ID` | Default voice | `21m00Tcm4TlvDq8ikWAM` (Rachel) |
| `ELEVENLABS_MODEL_ID` | TTS model | `eleven_monolingual_v1` |

## Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **ElevenLabs**: https://elevenlabs.io/

## CORS Configuration

The backend allows requests from all origins for development. For production, update CORS settings in `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## License

MIT
