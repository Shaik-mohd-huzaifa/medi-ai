# Medi-AI Frontend

A modern, responsive Vue.js chat interface for interacting with the Medi-AI backend powered by AWS Bedrock and Claude 3.5 Sonnet.

## Features

- 💬 **Real-time Chat Interface**: Clean and intuitive chat UI
- 🎨 **Modern Design**: Beautiful gradient design with smooth animations
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast**: Built with Vite for lightning-fast development
- 🔄 **Auto-scroll**: Automatically scrolls to latest messages
- ✨ **Typing Indicators**: Visual feedback when AI is responding
- 📝 **Message Formatting**: Support for bold, italic, and code formatting
- 🎯 **Example Prompts**: Quick start with pre-defined prompts
- 🚦 **Health Status**: Real-time backend connection status
- ⌨️ **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

## Tech Stack

- **Vue 3**: Progressive JavaScript framework
- **Vite**: Next generation frontend tooling
- **Axios**: Promise-based HTTP client
- **CSS3**: Modern styling with gradients and animations

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   └── ChatInterface.vue  # Main chat component
│   ├── services/
│   │   └── api.js            # API service layer
│   ├── App.vue               # Root component
│   ├── main.js               # Application entry point
│   └── style.css             # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Prerequisites

- Node.js 16+ and npm/yarn
- Running Medi-AI backend (see backend README)

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` if needed:
   ```
   VITE_API_URL=http://localhost:8000
   ```

## Development

**Start the development server:**
```bash
npm run dev
```
or
```bash
yarn dev
```

The application will be available at http://localhost:3000

**Hot Module Replacement (HMR)** is enabled, so changes will reflect instantly.

## Building for Production

**Create production build:**
```bash
npm run build
```
or
```bash
yarn build
```

The optimized files will be in the `dist/` directory.

**Preview production build:**
```bash
npm run preview
```

## Usage

### Starting a Conversation

1. Make sure the backend is running on port 8000
2. Open the frontend at http://localhost:3000
3. Check that the status shows "Online" in the header
4. Type a message in the input box or click an example prompt
5. Press Enter to send (or Shift+Enter for a new line)

### Features Overview

**Message Input:**
- Type your message in the text area at the bottom
- Press `Enter` to send
- Press `Shift + Enter` to add a new line
- Character count is displayed below the input

**Chat Features:**
- Messages are color-coded (purple for user, white for AI)
- Timestamps show when each message was sent
- Avatar icons distinguish between user and AI
- Typing indicator shows when AI is thinking
- Auto-scroll keeps latest messages visible

**Header Actions:**
- **Clear button**: Clears the entire conversation (with confirmation)
- **Status indicator**: Shows connection status to backend

**Example Prompts:**
- Click any example prompt to quickly start a conversation
- Examples appear when the chat is empty

### Message Formatting

The chat supports basic markdown-style formatting:

- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- `` `code` `` → `code`
- Line breaks are preserved

## API Integration

The frontend communicates with the backend through the API service (`src/services/api.js`):

**Available Methods:**

```javascript
import { bedrockApi } from './services/api'

// Chat completion (used by the interface)
await bedrockApi.chatCompletion({
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  max_tokens: 2048,
  temperature: 0.7
})

// Single text generation
await bedrockApi.generateText({
  prompt: 'Explain AI',
  max_tokens: 500
})

// Health check
await bedrockApi.healthCheck()
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

### Vite Config

The `vite.config.js` includes:
- Vue plugin configuration
- Development server on port 3000
- Proxy configuration for API calls

## Customization

### Changing Colors

Edit the gradient colors in `src/App.vue` and `src/components/ChatInterface.vue`:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modifying Example Prompts

Edit the `examplePrompts` array in `ChatInterface.vue`:

```javascript
examplePrompts: [
  'Your custom prompt 1',
  'Your custom prompt 2',
  'Your custom prompt 3',
]
```

### Adjusting Max Tokens

Change the `max_tokens` value in the `sendMessage` method:

```javascript
const response = await bedrockApi.chatCompletion({
  messages: apiMessages,
  max_tokens: 2048,  // Adjust this value
  temperature: 0.7
})
```

## Troubleshooting

**Issue: Cannot connect to backend**
- Ensure backend is running on port 8000
- Check VITE_API_URL in .env file
- Verify CORS is enabled on backend
- Check browser console for errors

**Issue: Messages not sending**
- Check network tab in browser dev tools
- Verify backend health endpoint responds
- Ensure backend AWS credentials are configured

**Issue: Build fails**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Node.js to version 16+
- Check for syntax errors in Vue files

**Issue: Styling looks broken**
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Check that style.css is loaded in dev tools

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Performance Tips

- Messages are rendered efficiently with Vue's virtual DOM
- Auto-scroll only triggers when new messages arrive
- Large message histories are handled gracefully
- Consider implementing pagination for very long conversations

## Deployment

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Netlify
3. Set environment variable `VITE_API_URL` to your production backend URL

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variable in Vercel dashboard

### Deploy to GitHub Pages

1. Update `vite.config.js` with base path
2. Build: `npm run build`
3. Deploy `dist/` to gh-pages branch

## Contributing

Contributions are welcome! Please ensure:
- Code follows Vue 3 Composition or Options API conventions
- Components are properly documented
- Styles are scoped to components
- Changes are tested in multiple browsers

## License

MIT License
