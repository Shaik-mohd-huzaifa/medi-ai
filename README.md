# Medi-AI FastAPI Backend

A production-ready FastAPI backend with AWS Bedrock integration for AI-powered applications.

## Features

- **FastAPI Framework**: Modern, fast, and high-performance web framework
- **AWS Bedrock Integration**: Seamless integration with Claude 3.5 Sonnet via AWS Bedrock
- **Multiple Endpoints**: Text generation, streaming, and chat completion
- **Type Safety**: Full Pydantic model validation
- **Auto Documentation**: Interactive API docs with Swagger UI and ReDoc
- **Configuration Management**: Environment-based configuration
- **CORS Support**: Configurable CORS middleware

## Project Structure

```
medi-ai/
├── app/
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
├── .env.example                # Example environment variables
├── .gitignore
├── requirements.txt
└── README.md
```

## Prerequisites

- Python 3.9 or higher
- AWS Account with Bedrock access
- AWS credentials with appropriate permissions

## Installation

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

## Running the Application

**Start the development server:**
```bash
uvicorn app.main:app --reload
```

Or run directly:
```bash
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

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

**Using Uvicorn:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Using Gunicorn with Uvicorn workers:**
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## Security Considerations

- Never commit `.env` file with real credentials
- Use IAM roles instead of access keys when deployed on AWS
- Configure CORS `allow_origins` for production
- Implement rate limiting for production use
- Use HTTPS in production
- Consider implementing API key authentication

## Troubleshooting

**Issue: AWS credentials not found**
- Ensure `.env` file exists and contains valid credentials
- Verify AWS credentials have Bedrock permissions

**Issue: Model access denied**
- Request access to Claude models in AWS Bedrock console
- Wait for access approval (can take a few minutes)

**Issue: Import errors**
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
