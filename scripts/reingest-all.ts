import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import path from "path";
import { ingestTextIntoChroma } from "../lib/chunkAndIngest";
import { getOrCreateCollection, chroma } from "../lib/chromaClient";

async function run() {
  console.log("Starting full re-ingestion...");
  const COLLECTION_NAME = "secondbrain";
  const knowledgeDir = path.join(process.cwd(), "knowledge");

  try {
    console.log(`Deleting existing collection: ${COLLECTION_NAME}...`);
    try {
      await chroma.deleteCollection({ name: COLLECTION_NAME });
      console.log("Collection deleted.");
    } catch (e: any) {
      console.log("Delete skipped/not found:", e?.message?.slice?.(0, 120) || e);
    }

    await getOrCreateCollection(COLLECTION_NAME);
    console.log("Collection re-created with Gemini embeddings (3072-dim).");

    const files = await fs.readdir(knowledgeDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    console.log(`Found ${mdFiles.length} markdown files.`);

    for (const file of mdFiles) {
      const abs = path.join(knowledgeDir, file);
      const rel = `knowledge/${file}`;
      console.log(`Processing: ${rel}`);
      const content = await fs.readFile(abs, "utf-8");
      await ingestTextIntoChroma(COLLECTION_NAME, rel, content, {});
      console.log(`Ingested: ${rel}`);
    }

    const collection = await getOrCreateCollection(COLLECTION_NAME);
    const count = await collection.count();
    console.log(`Done. Collection count: ${count}`);

    // Smoke query
    const q = await collection.query({
      queryTexts: ["What is a vector database?"],
      nResults: 2,
      include: ["documents", "metadatas"],
    });
    console.log(
      "Smoke query ok. First source:",
      (q.metadatas?.[0]?.[0] as any)?.filePath || "n/a"
    );
  } catch (e) {
    console.error("Error during re-ingestion:", e);
    process.exit(1);
  }
}

run();
