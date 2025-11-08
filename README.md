# Medi-AI: Full-Stack Medical AI Assistant 🏥

A production-ready full-stack medical assistance application with Next.js frontend and FastAPI backend, powered by OpenAI GPT-4o and ElevenLabs voice synthesis.

## 🌟 Features

### AIRA - AI Responsive & Intelligent Assistant
Your comprehensive medical AI assistant that can help with:
- 🩺 Symptom analysis and health guidance
- 📅 Appointment scheduling support
- 💊 Medication information
- 🏃 Health coaching
- 🚨 Emergency guidance
- 🗣️ Natural voice conversations

### Backend (FastAPI)
- **OpenAI GPT-4o**: Advanced AI chat completion
- **OpenAI Whisper**: Speech-to-text transcription
- **ElevenLabs**: Natural text-to-speech synthesis
- **FastAPI Framework**: Modern, fast, high-performance
- **Type Safety**: Full Pydantic validation
- **Auto Documentation**: Swagger UI and ReDoc
- **CORS Support**: Configurable middleware

### Frontend (Next.js + shadcn/ui)
- **Modern Medical Dashboard**: Professional healthcare interface
- **Voice Conversations**: Full speech-to-text and text-to-speech
- **Medical Records**: Health records management
- **Appointments**: Doctor appointments tracking
- **Alerts & Reminders**: Medication and health notifications
- **Emergency Access**: Quick emergency contacts
- **Real-time AI Chat**: Instant medical assistance
- **Responsive Design**: Works on all devices

## 📁 Project Structure

```
medi-ai/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── config.py          # Configuration settings
│   │   ├── routes/            # API endpoints
│   │   │   ├── openai.py      # Chat completion
│   │   │   ├── transcription.py  # Whisper STT
│   │   │   └── voice.py       # ElevenLabs TTS
│   │   └── services/          # Business logic
│   │       ├── openai_service.py
│   │       └── elevenlabs_service.py
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                # Server startup
│   ├── .env.example          # Environment template
│   └── README.md             # Backend documentation
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── MedicalDashboard.tsx
│   │   │   ├── VoiceCallModal.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   ├── types/
│   │   │   └── speech.d.ts    # TypeScript types
│   │   └── lib/
│   │       └── utils.ts       # Utilities
│   ├── next.config.js
│   └── package.json
│
├── .gitignore
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and npm/yarn
- **OpenAI API Key** (for GPT-4o and Whisper)
- **ElevenLabs API Key** (for voice synthesis)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Shaik-mohd-huzaifa/medi-ai.git
cd medi-ai
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `backend/.env` with your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7

ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_monolingual_v1
```

### 3. Frontend Setup

```bash
# Navigate to frontend (from root)
cd frontend

# Install dependencies
npm install
# or
yarn install

# Configure environment (optional)
# Create frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Start Backend

**From the `backend` directory:**

```bash
# Option 1: Using run script
python run.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Start Frontend

**From the `frontend` directory:**

```bash
npm run dev
# or
yarn dev
```

Frontend available at:
- **Application**: http://localhost:3000

### Running Both (Two Terminals)

**Terminal 1 (Backend):**
```bash
cd backend
python run.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser! 🎉

## 🎯 Using AIRA Voice Assistant

### Voice Conversation Flow

1. **Start Voice Call**: Click the phone icon (📞) in the top right
2. **Speak**: Click the microphone button and describe your health concern
3. **AI Processing**: 
   - Your speech → Whisper API → Text transcription
   - Text → GPT-4o → AI response
   - Response → ElevenLabs → Natural voice audio
4. **Listen**: AIRA responds with natural, professional voice
5. **Continue**: Click mic again to continue the conversation
6. **End Call**: Click "End Call" when finished

### Text Chat

- Type your question in the chat input at the bottom
- Press `Enter` to send
- Receive instant AI responses
- Click microphone icon for quick voice input

## 🔌 API Endpoints

### Health & Status
- `GET /` - Welcome message
- `GET /health` - Health check

### Chat & AI
- `POST /api/v1/bedrock/generate` - Generate text
- `POST /api/v1/bedrock/generate/stream` - Stream generation
- `POST /api/v1/bedrock/chat` - Chat completion

### Speech Recognition
- `POST /api/v1/transcription/whisper` - Transcribe audio to text

### Voice Synthesis
- `POST /api/v1/voice/text-to-speech` - Convert text to speech
- `POST /api/v1/voice/text-to-speech/stream` - Stream TTS
- `GET /api/v1/voice/voices` - List available voices

Full API documentation: http://localhost:8000/docs

## 🔑 Getting API Keys

### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create an account or sign in
3. Generate a new API key
4. Copy to `backend/.env` as `OPENAI_API_KEY`

### ElevenLabs
1. Visit https://elevenlabs.io/
2. Create an account or sign in
3. Navigate to Profile → API Keys
4. Generate a new API key
5. Copy to `backend/.env` as `ELEVENLABS_API_KEY`

## 🛠️ Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload

# Format code
pip install black
black app/

# Type checking
pip install mypy
mypy app/
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## 📦 Production Deployment

### Backend

**Using Docker:**
```bash
cd backend
docker build -t medi-ai-backend .
docker run -p 8000:8000 --env-file .env medi-ai-backend
```

**Using Gunicorn:**
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend

**Build:**
```bash
cd frontend
npm run build
```

**Deploy to:**
- **Vercel**: `vercel deploy`
- **Netlify**: Deploy `.next` folder
- **AWS S3 + CloudFront**: Upload build output

**⚠️ Important**: Update `NEXT_PUBLIC_API_URL` to your production backend URL before building.

## 🔒 Security

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Configure CORS properly for production
- ✅ Implement rate limiting
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly

## 🐛 Troubleshooting

### Backend Issues

**Cannot start server:**
```bash
# Activate virtual environment
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**API Key errors:**
- Verify API keys in `backend/.env`
- Check keys are valid and not expired
- Ensure no extra spaces in `.env` file

### Frontend Issues

**Cannot connect to backend:**
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Open http://localhost:8000/health to test backend

**Build errors:**
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o and Whisper
- **ElevenLabs** for natural voice synthesis
- **FastAPI** for the excellent framework
- **Next.js** and **shadcn/ui** for frontend tools

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation in `/backend/README.md`
- Review API docs at http://localhost:8000/docs

---

**Made with ❤️ for better healthcare accessibility**
