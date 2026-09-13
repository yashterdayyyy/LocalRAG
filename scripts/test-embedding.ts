
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

async function testGenAI() {
    const modelsToTest = [
        "models/embedding-001",
    ];

    console.log("--- Testing @google/generative-ai ---");
    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.embedContent("Hello world");
            console.log(`Success: ${modelName}`);
            console.log("Dimension:", result.embedding.values.length);
        } catch (error: any) {
            console.error(`Error with ${modelName}:`, error.message?.split('\n')[0] || error);
        }
    }
}

async function testAISDK() {
    console.log("--- Testing @ai-sdk/google ---");
    try {
        const { embedding } = await embed({
            model: google.textEmbeddingModel("text-embedding-004"),
            value: "Hello world",
        });
        console.log("Success: text-embedding-004 (AI SDK)");
        console.log("Dimension:", embedding.length);
    } catch (error: any) {
        console.error("Error with text-embedding-004 (AI SDK):", error.message || error);
    }
}

async function run() {
    await testGenAI();
    await testAISDK();
}

run();
