import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AIService {
  private embeddingModel = genAI.getGenerativeModel({
    model: 'gemini-embedding-001',
  });

  async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing. Returning an empty embedding.');
      return [];
    }
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      return [];
    }
  }

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (
      !vecA ||
      !vecB ||
      vecA.length === 0 ||
      vecB.length === 0 ||
      vecA.length !== vecB.length
    ) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const aiService = new AIService();
