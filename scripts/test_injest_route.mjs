import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const API_KEY = process.env.CHROMA_API_KEY;
const API_URL = "http://localhost:3000/api/injest";

console.log("=========================================");
console.log("🧪 Testing /api/injest Endpoint");
console.log("=========================================\n");

const knowledgePath = join(__dirname, "..", "knowledge", "rag_system_guide.md");
const content = readFileSync(knowledgePath, "utf-8");

console.log(`📄 Knowledge file loaded: knowledge/rag_system_guide.md (${content.length} characters)\n`);

async function runTests() {
    // Test 1: Unauthorized Request
    console.log("Test 1: Testing unauthorized request (no token)...");
    try {
        const res1 = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: "knowledge/rag_system_guide.md", content: "test" }),
        });
        console.log(`  Status: ${res1.status} (Expected: 401)`);
        const text1 = await res1.text();
        console.log(`  Response: ${text1}\n`);
    } catch (err) {
        console.error("  Error in Test 1:", err.message);
    }

    // Test 2: Invalid Payload
    console.log("Test 2: Testing invalid payload (missing content)...");
    try {
        const res2 = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ filePath: "knowledge/rag_system_guide.md" }),
        });
        console.log(`  Status: ${res2.status} (Expected: 400)`);
        const text2 = await res2.text();
        console.log(`  Response: ${text2}\n`);
    } catch (err) {
        console.error("  Error in Test 2:", err.message);
    }

    // Test 3: Valid Ingestion Request
    console.log("Test 3: Testing authorized ingestion with knowledge file...");
    try {
        const res3 = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                filePath: "knowledge/rag_system_guide.md",
                content: content,
            }),
        });
        console.log(`  Status: ${res3.status}`);
        const data3 = await res3.json();
        console.log(`  Response:`, JSON.stringify(data3, null, 2));
    } catch (err) {
        console.error("  Error in Test 3:", err.message);
    }
}

runTests();
