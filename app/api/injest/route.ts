import crypto from "crypto";
import { NextRequest } from "next/server";
import { ingestTextIntoChroma } from "@/lib/chunkAndIngest";
import { getOrCreateCollection } from "@/lib/chromaClient";

export const runtime = "nodejs";

const API_KEY = process.env.CHROMA_API_KEY!;

function hashContent(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${API_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { filePath, content } = await req.json();

  if (!filePath || !content) {
    return new Response("Invalid payload", { status: 400 });
  }

  const collection = await getOrCreateCollection("secondbrain");
  const fileHash = hashContent(content);

  // 🔍 Check if file already ingested with same hash
  const existing = await collection.get({
    where: { filePath },
    include: ["metadatas"],
  });

  const existingHash = existing.metadatas?.[0]?.fileHash;

  if (existingHash === fileHash) {
    // console.log(`Skipping unchanged file: ${filePath}`);
    return Response.json({ status: "skipped" });
  }

  // ♻️ Delete old chunks
  await collection.delete({ where: { filePath } });

  // ➕ Ingest new content
  await ingestTextIntoChroma(
    "secondbrain",
    filePath,
    content,
    { fileHash: parseInt(fileHash, 16) }
  );

  return Response.json({ status: "ingested", filePath });
}
