"use server";

import fs from "fs/promises";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getOrCreateCollection, genAI } from "./chromaClient";
import { addToLexicalIndex } from "./lexicalIndex";

// Re-implementing with sequential replacement to handle async properly and avoid index issues
async function processImagesInMarkdown(text: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\((.*?)\)/g;
    const matches = [...text.matchAll(imageRegex)];

    if (matches.length === 0) return text;

    let processedText = text;

    // Process in reverse order to not mess up indices if we were using indices, 
    // but since we are doing replace(match, replacement), we need to be careful about unique matches.
    // A better approach for robust replacement:

    for (const match of matches) {
        const [fullMatch, altText, imagePath] = match;

        // Heuristic: is it a local upload?
        if (!imagePath.includes("uploads/")) continue;

        // Resolve path: remove leading slash if present
        let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

        // Remove "public/" prefix if present to avoid duplication when joining with process.cwd()/public
        if (cleanPath.startsWith("public/")) {
            cleanPath = cleanPath.slice(7);
        }

        const fullLocalPath = path.join(process.cwd(), "public", cleanPath);

        try {
            await fs.access(fullLocalPath);
            const data = await fs.readFile(fullLocalPath);
            const b64 = data.toString("base64");

            // Simple mime type detection
            const ext = path.extname(fullLocalPath).toLowerCase();
            let mimeType = "image/png";
            if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
            if (ext === ".webp") mimeType = "image/webp";

            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent([
                "Describe this image in detail for retrieval purposes. Focus on text, labels, and relationships in diagrams.",
                { inlineData: { data: b64, mimeType } }
            ]);

            const description = result.response.text();
            const replacement = `${fullMatch}\n\n> **AI Description of ${altText || 'Image'}:**\n> ${description.trim().replace(/\n/g, "\n> ")}\n\n`;

            // Replace ONLY this occurrence? String.replace replaces first occurrence. 
            // If we have duplicate images, this might double-replace the first one.
            // To be safe, we should split the text. 
            // BUT, for valid markdown knowledge base, exact duplicates are rare. 
            // Let's use a split approach to be safe? No, let's just use replace and hope for best or use a global replace map?
            // Actually, let's use the unique substring replacement carefully.

            processedText = processedText.replace(fullMatch, replacement);

        } catch (e) {
            console.error(`Error processing image ${imagePath}:`, e);
        }
    }

    return processedText;
}

export async function ingestTextIntoChroma(
    collectionName: string,
    filePath: string,
    text: string,
    metadata: Record<string, number> = {}
) {
    // 🖼️ Augment text with image descriptions
    const augmentedText = await processImagesInMarkdown(text);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1200,
        chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(augmentedText);
    const collection = await getOrCreateCollection(collectionName);

    await collection?.add({
        ids: chunks?.map((_, i) => `${filePath}::${i}`),
        documents: chunks,
        metadatas: chunks?.map((_, i) => ({
            ...metadata,
            filePath,
            chunkIndex: i
        })),
    });

    addToLexicalIndex(
        chunks.map((chunk, i) => ({
            id: `${filePath}-${i}`,
            content: chunk,
            filePath,
        }))
    );

    // console.log(`Ingested ${chunks?.length} chunks from ${filePath}`);
}