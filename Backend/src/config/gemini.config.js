import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// Model cache (avoid re-creating clients)
const modelCache = {};

export function getGeminiModel(modelName = DEFAULT_MODEL) {
  if (!modelCache[modelName]) {
    modelCache[modelName] = genAI.getGenerativeModel({
      model: modelName,
    });
  }
  return modelCache[modelName];
}
