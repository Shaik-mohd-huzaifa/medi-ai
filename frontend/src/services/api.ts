import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GenerateRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface ApiResponse {
  success: boolean;
  content?: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason?: string;
  error?: string;
}

export const bedrockApi = {
  /**
   * Generate text using the Bedrock API
   */
  async generateText(payload: GenerateRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/v1/bedrock/generate', payload);
      return response.data;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  },

  /**
   * Chat completion using message history
   */
  async chatCompletion(payload: ChatRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/v1/bedrock/chat', payload);
      return response.data;
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
    }
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; version: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },
};
