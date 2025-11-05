<template>
  <div class="chat-container">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-content">
        <h1 class="title">🏥 Medi-AI Chat</h1>
        <p class="subtitle">Powered by AWS Bedrock & Claude 3.5 Sonnet</p>
      </div>
      <div class="header-actions">
        <button @click="clearChat" class="btn-clear" title="Clear conversation">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <div class="status-indicator" :class="{ online: isOnline, offline: !isOnline }">
          {{ isOnline ? 'Online' : 'Offline' }}
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">💬</div>
        <h2>Welcome to Medi-AI!</h2>
        <p>Start a conversation by typing a message below.</p>
        <div class="example-prompts">
          <p class="example-label">Try asking:</p>
          <button
            v-for="example in examplePrompts"
            :key="example"
            @click="sendExamplePrompt(example)"
            class="example-prompt"
          >
            {{ example }}
          </button>
        </div>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-wrapper"
        :class="message.role"
      >
        <div class="message">
          <div class="message-avatar">
            <span v-if="message.role === 'user'">👤</span>
            <span v-else>🤖</span>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{ message.role === 'user' ? 'You' : 'Medi-AI' }}</span>
              <span class="message-time">{{ message.timestamp }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="message-wrapper assistant">
        <div class="message">
          <div class="message-avatar">
            <span>🤖</span>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-container">
      <div class="input-wrapper">
        <textarea
          v-model="userInput"
          @keydown.enter.prevent="handleEnter"
          placeholder="Type your message here..."
          class="message-input"
          rows="1"
          :disabled="isLoading"
          ref="messageInput"
        ></textarea>
        <button
          @click="sendMessage"
          class="btn-send"
          :disabled="!userInput.trim() || isLoading"
        >
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span v-else class="spinner"></span>
        </button>
      </div>
      <div class="input-info">
        <span class="char-count">{{ userInput.length }} characters</span>
        <span class="shortcut-hint">Press Enter to send • Shift+Enter for new line</span>
      </div>
    </div>
  </div>
</template>

<script>
import { bedrockApi } from '../services/api'

export default {
  name: 'ChatInterface',
  data() {
    return {
      messages: [],
      userInput: '',
      isLoading: false,
      isOnline: false,
      examplePrompts: [
        'What is artificial intelligence?',
        'Explain how machine learning works',
        'What are the benefits of cloud computing?',
      ]
    }
  },
  mounted() {
    this.checkHealth()
    this.adjustTextareaHeight()
  },
  methods: {
    async checkHealth() {
      try {
        await bedrockApi.healthCheck()
        this.isOnline = true
      } catch (error) {
        this.isOnline = false
        console.error('Health check failed:', error)
      }
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return

      const userMessage = {
        role: 'user',
        content: this.userInput.trim(),
        timestamp: this.getCurrentTime()
      }

      this.messages.push(userMessage)
      const currentInput = this.userInput
      this.userInput = ''
      this.isLoading = true
      this.scrollToBottom()

      try {
        // Prepare messages for chat API
        const apiMessages = this.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))

        const response = await bedrockApi.chatCompletion({
          messages: apiMessages,
          max_tokens: 2048,
          temperature: 0.7
        })

        if (response.success) {
          const assistantMessage = {
            role: 'assistant',
            content: response.content,
            timestamp: this.getCurrentTime()
          }
          this.messages.push(assistantMessage)
        } else {
          this.showError(response.error || 'Failed to get response')
        }
      } catch (error) {
        console.error('Error sending message:', error)
        this.showError('Failed to send message. Please try again.')
      } finally {
        this.isLoading = false
        this.scrollToBottom()
        this.$nextTick(() => {
          this.$refs.messageInput.focus()
        })
      }
    },

    sendExamplePrompt(prompt) {
      this.userInput = prompt
      this.sendMessage()
    },

    handleEnter(event) {
      if (event.shiftKey) {
        // Allow new line with Shift+Enter
        return
      }
      event.preventDefault()
      this.sendMessage()
    },

    clearChat() {
      if (confirm('Are you sure you want to clear the conversation?')) {
        this.messages = []
      }
    },

    showError(message) {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Error: ${message}`,
        timestamp: this.getCurrentTime()
      }
      this.messages.push(errorMessage)
    },

    formatMessage(content) {
      // Basic markdown-style formatting
      let formatted = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')

      return formatted
    },

    getCurrentTime() {
      const now = new Date()
      return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
      }
    }
  },
  watch: {
    userInput() {
      this.adjustTextareaHeight()
    }
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 1200px;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-clear {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

.status-indicator {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-indicator.online {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.status-indicator.offline {
  background: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f7fafc;
}

.welcome-message {
  text-align: center;
  padding: 3rem 2rem;
  color: #4a5568;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.welcome-message h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.welcome-message p {
  margin: 0 0 2rem 0;
  color: #718096;
}

.example-prompts {
  max-width: 600px;
  margin: 0 auto;
}

.example-label {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #4a5568;
}

.example-prompt {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a5568;
  font-size: 0.95rem;
  text-align: left;
}

.example-prompt:hover {
  border-color: #667eea;
  background: #f7fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Message Wrapper */
.message-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 75%;
}

.message-wrapper.user .message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.message-role {
  font-weight: 600;
  font-size: 0.9rem;
  color: #4a5568;
}

.message-time {
  font-size: 0.75rem;
  color: #a0aec0;
}

.message-text {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-wrapper.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-wrapper.assistant .message-text {
  background: white;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e0;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Input Container */
.input-container {
  padding: 1.5rem 2rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.2s;
  max-height: 120px;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.btn-send {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  font-weight: 600;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #a0aec0;
}

.char-count {
  font-weight: 500;
}

.shortcut-hint {
  font-style: italic;
}

/* Code styling */
.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.message-wrapper.user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

/* Scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f7fafc;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
  }

  .title {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .messages-container {
    padding: 1rem;
  }

  .message {
    max-width: 90%;
  }

  .input-container {
    padding: 1rem;
  }

  .shortcut-hint {
    display: none;
  }
}
</style>
