# LocalRAG

Next.js 16 app that ingests markdown from this repo into **Chroma Cloud** (collection `secondbrain`). Query, retrieval, and a chat UI are not built yet.

## What works today

```
knowledge/*.md  →  git push  →  GitHub Action  →  ngrok  →  POST /api/injest  →  chunk  →  Chroma Cloud
```

- Markdown under `knowledge/` is the source of truth the Action watches.
- `POST /api/injest` hashes content, deletes previous chunks for that `filePath` if the hash changed, then splits and writes vectors.
- Chunking uses LangChain `RecursiveCharacterTextSplitter` (`chunkSize: 1200`, `chunkOverlap: 200`).
- Chroma Cloud embeds on `collection.add` (default embedding function). Collection name: `secondbrain`.

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 16 (App Router, webpack), React 19, TypeScript |
| Ingest API | `app/api/injest/route.ts` (Node runtime) |
| Splitter | `@langchain/textsplitters` |
| Vector store | Chroma Cloud (`chromadb` `CloudClient`) |
| CI | `.github/workflows/convertToEmbeddings.yml` |
| Tunnel | ngrok → local `localhost:3000` |

`package.json` also lists AI SDK, OpenAI, MongoDB, Postgres, Prisma, PDF/DOCX parsers, and chat UI libraries. Those are **not used** by the current ingest path.

## Repo layout

```
app/
  api/injest/route.ts     Ingest endpoint
  page.tsx                Default Next.js starter page
  layout.tsx              Root layout
public/lib/
  chromaClient.ts         Chroma Cloud + Gemini clients
  chunkAndIngest.ts       Split text and collection.add
knowledge/                Documents the GitHub Action ingests
scripts/test_injest_route.mjs   Local smoke tests against localhost:3000
.github/workflows/convertToEmbeddings.yml
```

`public/knowledge/` holds sample markdown. It is **not** watched by the Action.

## API

`POST /api/injest`

```json
{
  "filePath": "knowledge/rag_system_guide.md",
  "content": "<full file text>"
}
```

| Response | When |
|---|---|
| `400` `"Missing filePath or content"` | Body incomplete |
| `200` `"File already ingested"` | Stored `fileHash` equals SHA-256 hex of `content` |
| `200` `{ "status": "ingested", "filePath": "..." }` | Chunks written |

The route reads `CHROMA_API_KEY` but does **not** check `Authorization`. The Action still sends `Bearer ${{ secrets.INGEST_API_KEY }}`.

Chunk records in Chroma:

- **id:** `{filePath}__{chunkIndex}`
- **document:** chunk text
- **metadata:** `filePath`, `chunkIndex`, `fileHash` (`parseInt(sha256Hex, 16)`)

## Environment

Create `.env` (gitignored):

```
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
GOOGLE_GENERATIVE_AI_API_KEY=
```

GitHub repo secret used by the workflow: `INGEST_API_KEY`.

## Run locally

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Ingest smoke test (requires the dev server):

```bash
node scripts/test_injest_route.mjs
```

Test 1 in that script expects `401` if no auth header; the route currently does not return `401`. Tests 2–3 match missing-body / ingest behavior.

## GitHub Action

Workflow: **Ingest Knowledge Base** (`.github/workflows/convertToEmbeddings.yml`)

- **Triggers:** push to `knowledge/**`, or `workflow_dispatch`
- Checks out with `fetch-depth: 2`
- Lists changed files with `tj-actions/changed-files@v46`
- For each file, `jq` builds `{ filePath, content }` and `curl` POSTs to the ngrok ingest URL (hardcoded in the workflow), including `ngrok-skip-browser-warning`

CI ingest only succeeds if **Next is running on port 3000** and **ngrok is forwarding** to the URL in the workflow file.

## Not implemented

- Query embedding and top-k retrieval
- Prompt grounding / LLM answers
- Chat UI (`app/page.tsx` is still the create-next-app template)
