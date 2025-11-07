# Medi-AI: Full-Stack Medical AI Assistant

A production-ready full-stack application with a Next.js frontend and FastAPI backend, integrated with AWS Bedrock and Claude 3.5 Sonnet for AI-powered medical assistance.

## 🌟 Features

### Backend (FastAPI)
- **FastAPI Framework**: Modern, fast, and high-performance web framework
- **AWS Bedrock Integration**: Seamless integration with Claude 3.5 Sonnet via AWS Bedrock
- **Multiple Endpoints**: Text generation, streaming, and chat completion
- **Type Safety**: Full Pydantic model validation
- **Auto Documentation**: Interactive API docs with Swagger UI and ReDoc
- **Configuration Management**: Environment-based configuration
- **CORS Support**: Configurable CORS middleware

### Frontend (Next.js + shadcn/ui)
- **Medical Dashboard**: Professional healthcare dashboard interface
- **Voice Call Interface**: Speech-to-text and text-to-speech capabilities
- **Medical Records Management**: View and manage health records
- **Appointment Scheduling**: Track doctor appointments and consultations
- **Medical Alerts**: Medication reminders and health notifications
- **Emergency Contacts**: Quick access to emergency services
- **AI Chat Integration**: Real-time AI medical assistance
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Fully Responsive**: Works seamlessly on all devices

## 📁 Project Structure

```
medi-ai/
├── app/                        # Backend (FastAPI)
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration settings
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   └── bedrock.py          # API endpoints
│   └── services/
│       ├── __init__.py
│       └── bedrock_service.py  # AWS Bedrock service
├── frontend/                   # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── page.tsx        # Main dashboard page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # Global styles
│   │   ├── components/         # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── MedicalDashboard.tsx
│   │   │   └── VoiceCallModal.tsx
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   ├── types/
│   │   │   └── speech.d.ts     # TypeScript types
│   │   └── lib/
│   │       └── utils.ts        # Utilities
│   ├── next.config.js
│   └── package.json
├── .env.example                # Backend environment variables
├── .gitignore
├── requirements.txt            # Python dependencies
├── run.py                      # Backend runner script
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 18+ and npm/yarn
- AWS Account with Bedrock access
- AWS credentials with appropriate permissions

## Installation

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd medi-ai
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your AWS credentials:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment (optional):**
   
   Create a `.env.local` file with:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Running the Application

### Start Backend

**From the root directory:**
```bash
uvicorn app.main:app --reload
# or
python run.py
```

The backend will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Start Frontend

**From the frontend directory:**
```bash
cd frontend
npm run dev
# or
yarn dev
```

The frontend will be available at:
- **Application**: http://localhost:3000

### Running Both

**Terminal 1 (Backend):**
```bash
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser to access the medical dashboard!

## Using the Medical Dashboard

### Main Features

1. **Medical Records**: View and access your health records and documents
2. **Appointments**: Check upcoming doctor appointments and join telehealth sessions
3. **Medical Alerts**: Receive medication reminders and health notifications
4. **Emergency Contacts**: Quick access to emergency services (911) and your healthcare providers

### AI Medical Assistant

**Text Input:**
- Type your medical question or symptom description in the input bar
- Press `Enter` to send your query
- Receive AI-powered medical guidance

**Voice Call Interface:**
- Click the phone icon (📞) to start a voice call
- Speak naturally to describe your symptoms
- Listen to AI responses through text-to-speech
- Click microphone button to toggle listening
- End call when finished

**Voice Input:**
- Click the microphone icon (🎤) for quick voice input
- Speak your question
- Text will be transcribed and sent automatically

**Features:**
- Real-time speech-to-text conversion
- Natural language understanding
- Text-to-speech responses
- Responsive design for all devices
- HIPAA-aware conversational guidance

## API Endpoints

### Health Check
```bash
GET /health
GET /api/v1/bedrock/health
```

### Text Generation
**Endpoint:** `POST /api/v1/bedrock/generate`

**Request:**
```json
{
  "prompt": "Explain quantum computing in simple terms",
  "max_tokens": 500,
  "temperature": 0.7,
  "system_prompt": "You are a helpful AI assistant"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Generated text here...",
  "model": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "usage": {
    "input_tokens": 15,
    "output_tokens": 120
  },
  "stop_reason": "end_turn"
}
```

### Streaming Generation
**Endpoint:** `POST /api/v1/bedrock/generate/stream`

Returns a text stream for real-time response generation.

### Chat Completion
**Endpoint:** `POST /api/v1/bedrock/chat`

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is FastAPI?"
    },
    {
      "role": "assistant",
      "content": "FastAPI is a modern web framework for Python."
    },
    {
      "role": "user",
      "content": "What are its main features?"
    }
  ],
  "max_tokens": 500,
  "temperature": 0.7
}
```

## Example Usage

### Using cURL

**Text Generation:**
```bash
curl -X POST "http://localhost:8000/api/v1/bedrock/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is artificial intelligence?",
    "max_tokens": 200,
    "temperature": 0.7
  }'
```

**Chat Completion:**
```bash
curl -X POST "http://localhost:8000/api/v1/bedrock/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 100
  }'
```

### Using Python

```python
import requests

# Text generation
response = requests.post(
    "http://localhost:8000/api/v1/bedrock/generate",
    json={
        "prompt": "Explain machine learning",
        "max_tokens": 300,
        "temperature": 0.7
    }
)
print(response.json())

# Chat completion
response = requests.post(
    "http://localhost:8000/api/v1/bedrock/chat",
    json={
        "messages": [
            {"role": "user", "content": "What is FastAPI?"}
        ]
    }
)
print(response.json())
```

## Configuration

### Backend Configuration

Configuration is managed through environment variables and the `app/config.py` file.

**Available settings:**

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_REGION` | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | `None` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | `None` | AWS secret key |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Bedrock model ID |
| `BEDROCK_MAX_TOKENS` | `4096` | Max tokens to generate |
| `BEDROCK_TEMPERATURE` | `0.7` | Sampling temperature |
| `API_TITLE` | `Medi-AI FastAPI Backend` | API title |
| `API_VERSION` | `1.0.0` | API version |

### Frontend Configuration

Frontend environment variables (optional):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

## AWS Bedrock Setup

1. **Enable Bedrock access** in your AWS account
2. **Request model access** for Claude 3.5 Sonnet in the AWS Bedrock console
3. **Create IAM credentials** with the following permissions:
   - `bedrock:InvokeModel`
   - `bedrock:InvokeModelWithResponseStream`

## Development

**Run with auto-reload:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Format code:**
```bash
pip install black
black app/
```

**Type checking:**
```bash
pip install mypy
mypy app/
```

## Production Deployment

### Backend Deployment

**Using Uvicorn:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Using Gunicorn with Uvicorn workers:**
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend Deployment

**Build for production:**
```bash
cd frontend
npm run build
```

**Deploy options:**
- **Netlify**: Deploy the `frontend/dist/` folder
- **Vercel**: Run `vercel` in the frontend directory
- **AWS S3 + CloudFront**: Upload dist folder to S3 bucket
- **Nginx**: Serve the dist folder as static files

**Important**: Update `VITE_API_URL` to point to your production backend URL before building.

## Security Considerations

- Never commit `.env` file with real credentials
- Use IAM roles instead of access keys when deployed on AWS
- Configure CORS `allow_origins` for production
- Implement rate limiting for production use
- Use HTTPS in production
- Consider implementing API key authentication

## Troubleshooting

### Backend Issues

**Issue: AWS credentials not found**
- Ensure `.env` file exists in root directory and contains valid credentials
- Verify AWS credentials have Bedrock permissions

**Issue: Model access denied**
- Request access to Claude models in AWS Bedrock console
- Wait for access approval (can take a few minutes)

**Issue: Import errors**
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**Issue: Cannot connect to backend**
- Ensure backend is running on port 8000
- Check VITE_API_URL in frontend/.env
- Verify CORS is enabled on backend
- Check browser console for errors

**Issue: Frontend won't start**
- Delete node_modules and reinstall: `cd frontend && rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Update Node.js to version 16+

**Issue: Messages not sending**
- Check network tab in browser dev tools
- Verify backend /health endpoint responds
- Ensure AWS credentials are configured in backend

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
