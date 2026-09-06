import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ingestTextIntoChroma } from "@/public/lib/chunkAndIngest";
import { getOrCreateCollection } from "@/public/lib/chromaClient";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const runtime = "nodejs";

const API_KEY = process.env.CHROMA_API_KEY!;

function hashContent(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function POST(req: NextRequest) {
  const { filePath, content, testMode } = await req.json();

  if (!filePath || !content) {
    return new Response("Missing filePath or content", { status: 400 });
  }

  const collection = await getOrCreateCollection("secondbrain");
  const fileHash = hashContent(content);

  const existing = await collection.get({
    where: { filePath },
    include: ["metadatas"],
  });
  const existingHash = existing?.metadatas?.[0]?.fileHash;

  if (existingHash === fileHash) {
    return new Response("File already ingested", { status: 200 });
  }

  //Delete the old chunks
  await collection?.delete({ where: { filePath } });

  //Ingest the new content
  await ingestTextIntoChroma("secondbrain", filePath, content, {
    fileHash: parseInt(fileHash, 16),
  });
  return Response.json({
    status: "ingested",
    filePath,
  });
}
