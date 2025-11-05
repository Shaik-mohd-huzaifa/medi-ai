import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const bedrockApi = {
  /**
   * Generate text using the Bedrock API
   * @param {Object} payload - Request payload
   * @returns {Promise} Response data
   */
  async generateText(payload) {
    try {
      const response = await apiClient.post('/api/v1/bedrock/generate', payload)
      return response.data
    } catch (error) {
      console.error('Error generating text:', error)
      throw error
    }
  },

  /**
   * Chat completion using message history
   * @param {Object} payload - Request payload with messages array
   * @returns {Promise} Response data
   */
  async chatCompletion(payload) {
    try {
      const response = await apiClient.post('/api/v1/bedrock/chat', payload)
      return response.data
    } catch (error) {
      console.error('Error in chat completion:', error)
      throw error
    }
  },

  /**
   * Stream text generation
   * @param {Object} payload - Request payload
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise} Stream response
   */
  async streamText(payload, onChunk) {
    try {
      const response = await apiClient.post('/api/v1/bedrock/generate/stream', payload, {
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.target.responseText
          if (onChunk) {
            onChunk(chunk)
          }
        }
      })
      return response.data
    } catch (error) {
      console.error('Error streaming text:', error)
      throw error
    }
  },

  /**
   * Health check
   * @returns {Promise} Health status
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      console.error('Error checking health:', error)
      throw error
    }
  },
}

export default apiClient
