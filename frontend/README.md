# Medi-AI Frontend

Next.js frontend for the Medi-AI medical assistant application with shadcn/ui components.

## Features

- 🏥 Medical Dashboard with comprehensive UI
- 📞 Voice Call Interface with speech recognition and synthesis
- 🗂️ Medical Records Management
- 📅 Appointment Scheduling
- 🔔 Medical Alerts & Notifications
- 🚨 Emergency Contacts
- 💬 AI-Powered Chat Interface
- 🎨 Modern UI with shadcn/ui and Tailwind CSS
- 📱 Fully Responsive Design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **AI Integration**: AWS Bedrock (Claude 3.5 Sonnet)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 8000

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (optional):**
   
   Create a `.env.local` file in the frontend directory:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Running the Application

**Development mode:**
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**Production build:**
```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Main dashboard page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── MedicalDashboard.tsx
│   │   └── VoiceCallModal.tsx
│   ├── services/         # API services
│   │   └── api.ts        # Bedrock API client
│   ├── types/            # TypeScript definitions
│   │   └── speech.d.ts   # Web Speech API types
│   └── lib/              # Utilities
│       └── utils.ts      # Helper functions
├── public/               # Static assets
└── package.json          # Dependencies
```

## Features Overview

### Medical Dashboard
- View medical records
- Manage appointments
- Track medication reminders
- Access emergency contacts

### Voice Call Interface
- Real-time speech-to-text
- Text-to-speech responses
- Hands-free medical consultation
- Natural conversation flow

### AI Chat
- Context-aware medical responses
- Conversation history
- Symptom description support
- Health information queries

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

### API Integration

The frontend communicates with the FastAPI backend for AI responses:

- **Health Check**: `GET /health`
- **Chat Completion**: `POST /api/v1/bedrock/chat`
- **Text Generation**: `POST /api/v1/bedrock/generate`

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 80+
- Safari 14+

**Note**: Voice features require browsers with Web Speech API support (Chrome, Edge recommended).

## Development

**Lint code:**
```bash
npm run lint
```

**Type check:**
```bash
npm run type-check
```

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t medi-ai-frontend .
docker run -p 3000:3000 medi-ai-frontend
```

### Environment Variables for Production
Set `NEXT_PUBLIC_API_URL` to your production backend URL.

## Troubleshooting

**Issue: Cannot connect to backend**
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in environment

**Issue: Voice features not working**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

**Issue: Build errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check Node.js version: `node -v`

## Contributing

Contributions are welcome! Please follow the existing code style and patterns.

## License

MIT License
