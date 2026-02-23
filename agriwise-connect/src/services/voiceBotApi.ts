/**
 * Voice Bot API Service
 * Handles communication with backend RAG API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface VoiceBotQuery {
  query: string;
  language: string;
}

export interface VoiceBotResponse {
  response: string;
  audio_url?: string;
  message?: string;
  schemes?: Array<{
    name: string;
    description: string;
    eligibility: string[];
    benefits: string[];
  }>;
}

export const voiceBotApi = {
  /**
   * Send query to voice bot and get RAG response
   */
  async query(query: VoiceBotQuery): Promise<VoiceBotResponse> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/voice_bot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Voice bot API error: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get available government schemes
   */
  async getSchemes(language: string = 'hi'): Promise<VoiceBotResponse> {
    return this.query({
      query: 'सरकारी योजनाएं क्या हैं?',
      language,
    });
  },
};
