export interface WordCloudResponse {
  language: string;
  cleaned_text: string;
  word_frequencies: Record<string, number>;
  total_words: number;
  unique_words: number;
  wordcloud_base64?: string;
  wordcloud_url?: string;
  message: string;
}

export interface ApiError {
  detail: string;
}

const API_BASE_URL = 'https://mrabbyilyas-wordcloud-generator.hf.space';

export class WordCloudApiService {
  static async uploadFile(file: File, language: 'english' | 'indonesian' = 'english'): Promise<WordCloudResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: WordCloudResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while uploading the file.');
    }
  }

  static async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while checking API health.');
    }
  }
}