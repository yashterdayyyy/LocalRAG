"use server";

import fs from "fs/promises";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getOrCreateCollection, genAI } from "./chromaClient";

export async function ingestTextIntoChroma(
    collectionName: string,
    filePath: string,
    text: string,
    metadata: Record<string, number> = {}
) {

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1200,
        chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(text);
    const collection = await getOrCreateCollection(collectionName);
}