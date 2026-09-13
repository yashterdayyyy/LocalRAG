
import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import path from "path";
import { ingestTextIntoChroma } from "../lib/chunkAndIngest";

async function run() {
    console.log("🚀 Starting Ingestion Test...");

    const filePath = path.join(process.cwd(), "knowledge/system-design-upi.md");
    console.log(`Reading file: ${filePath}`);

    try {
        const content = await fs.readFile(filePath, "utf-8");
        console.log(`File read. Size: ${content.length} chars.`);
        console.log("Triggering ingestTextIntoChroma...");

        await ingestTextIntoChroma("secondbrain", filePath, content, {});

        console.log("✅ Ingestion complete!");
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

run();
