
import dotenv from "dotenv";
dotenv.config();

import { getOrCreateCollection } from "../lib/chromaClient";

async function verify() {
    console.log("🔍 Verifying fix...");
    try {
        const collection = await getOrCreateCollection("secondbrain");
        const count = await collection.count();
        console.log(`✅ Collection count: ${count}`);

        if (count === 0) {
            console.warn("⚠️ Collection is empty. Re-ingestion might have failed to find files.");
        } else {
            console.log("✅ Collection is populated.");
        }

        const results = await collection.query({
            queryTexts: ["What is UPI?"],
            nResults: 1
        });

        console.log("✅ Query successful!", results.documents);
    } catch (e) {
        console.error("❌ Verification failed:", e);
    }
}

verify();
