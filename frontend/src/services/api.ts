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

  /**
   * Transcribe audio using OpenAI Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/transcription/whisper`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  },

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(text: string, voiceId?: string): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/voice/text-to-speech`,
        {
          text,
          voice_id: voiceId,
        },
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  },

  /**
   * Get available ElevenLabs voices
   */
  async getVoices(): Promise<{ success: boolean; voices: Array<{ voice_id: string; name: string; category?: string }> }> {
    try {
      const response = await apiClient.get('/api/v1/voice/voices');
      return response.data;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  },

  /**
   * Search the web using Firecrawl
   */
  async searchWeb(query: string, limit: number = 5, format: string = 'markdown'): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/search/web', {
        query,
        limit,
        format,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching web:', error);
      throw error;
    }
  },

  /**
   * Scrape a URL using Firecrawl
   */
  async scrapeUrl(url: string, formats: string[] = ['markdown']): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/search/scrape', {
        url,
        formats,
      });
      return response.data;
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw error;
    }
  },

  /**
   * Crawl a website using Firecrawl
   */
  async crawlWebsite(url: string, maxDepth: number = 2, limit: number = 10): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/search/crawl', {
        url,
        max_depth: maxDepth,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error('Error crawling website:', error);
      throw error;
    }
  },
};
