import { CloudClient, EmbeddingFunction } from "chromadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.CHROMA_API_KEY!;
const tenant = process.env.CHROMA_TENANT!;
const database = process.env.CHROMA_DATABASE!;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

if (!apiKey || !tenant || !database || !geminiApiKey) {
  throw new Error("CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE, and GOOGLE_GENERATIVE_AI_API_KEY must be set");
}

export const genAI = new GoogleGenerativeAI(geminiApiKey);

class GeminiEmbeddingFunction implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    // usage: "gemini-embedding-001" outputs 3072 dimensions
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const results = await Promise.all(
      texts.map((text) => model.embedContent(text))
    );
    return results.map((r) => r.embedding.values);
  }
}

export const embeddingFunction = new GeminiEmbeddingFunction();

export const chroma = new CloudClient({
  apiKey,
  tenant,
  database,
});

export async function getOrCreateCollection(name: string) {
  return chroma.getOrCreateCollection({
    name,
    embeddingFunction,
  });
}
