[![SlopTeacher](https://app.slopteacher.com/api/badge/hyrzyhxGKAc2RjA-qiD88He8qQJnEkDsZv2BtAe8MUo.h6AHpaq8ZrEVfwhdiywDbc2DjHcWglRCmB0UAo0QZQc.svg)](https://app.slopteacher.com/b/hyrzyhxGKAc2RjA-qiD88He8qQJnEkDsZv2BtAe8MUo.h6AHpaq8ZrEVfwhdiywDbc2DjHcWglRCmB0UAo0QZQc)
# LocalRAG

AI-powered personal knowledge assistant built with Next.js. Ingest markdown from `knowledge/`, embed it into **Chroma Cloud**, and chat with streaming RAG answers backed by **Gemini** and **MongoDB** session history.

## Credits / based on

This project was built following the **Build Your Own ChatGPT** RAG series:

- Docs: [Coding Adda — Introduction](https://docs.addacoding.in/docs/projects/build-your-own-chatgpt/01-introduction)
- Video playlist: [Build Your Own CHATGPT (YouTube)](https://www.youtube.com/playlist?list=PLI7xwGSSw_fJepk_EVoTRAR9kmisLdKI5)

Live flow:

```
knowledge/*.md → ingest (API / script / GitHub Action) → Chroma Cloud
                                                      ↓
Browser chat UI  →  /api/chat  →  hybrid search + Gemini stream  →  Mongo history
```

## Features

- Landing page, docs, and full chat UI with sidebar sessions
- Streaming answers via Vercel AI SDK + Gemini
- Hybrid retrieval (semantic Chroma + lexical MiniSearch)
- Persistent chat sessions/messages in MongoDB
- Knowledge ingest with content hashing and re-chunking
- GitHub Action to ingest changed `knowledge/**` files on push

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion |
| Chat | `@ai-sdk/react`, `ai`, `@ai-sdk/google` |
| Embeddings / LLM | Google Gemini (`gemini-embedding-001`, `gemini-flash-latest`) |
| Vector store | Chroma Cloud (`chromadb` `CloudClient`) |
| Sessions | MongoDB |
| Ingest | LangChain text splitter + `/api/injest` |
| CI | `.github/workflows/convertToEmbeddings.yml` |

## Repo layout

```
app/
  page.tsx                 Landing page
  docs/page.tsx            Documentation UI
  chat/                    Chat shell + session pages
  api/chat/                Streaming RAG endpoint
  api/sessions/            Create / list chat sessions
  api/messages/[sessionId] Load / delete messages
  api/injest/              Ingest markdown into Chroma
  components/              UI + chat helpers
lib/
  chromaClient.ts          Chroma Cloud + Gemini embeddings
  chunkAndIngest.ts        Chunking + collection.add
  hybridSearch.ts          Semantic + lexical retrieval
  mongodb.ts               Mongo client
  chatSessions.ts          Session helpers
  chatMessages.ts          Message helpers
knowledge/                 Source docs watched by the Action
scripts/reingest-all.ts    Wipe collection and re-ingest all knowledge
public/uploads/            Images referenced from knowledge markdown
```

## Environment

Copy `.env.example` to `.env` (gitignored) and fill in:

```env
GOOGLE_GENERATIVE_AI_API_KEY=

CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=

# Either works:
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
# MONGO_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
```

GitHub Actions secrets (for auto-ingest):

- `INGEST_API_URL` — public URL of your deployed `/api/injest`
- `INGEST_API_KEY` — must match `CHROMA_API_KEY` (Bearer token)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### First-time knowledge load

If Chroma is empty or you hit embedding dimension mismatches, recreate and ingest:

```bash
npx tsx scripts/reingest-all.ts
```

Or POST a single file (dev server must be running):

```bash
curl -X POST http://localhost:3000/api/injest \
  -H "Authorization: Bearer $CHROMA_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @- <<'EOF'
{"filePath":"knowledge/rag_system_guide.md","content":"...file text..."}
EOF
```

Collection name: `secondbrain` (Gemini embeddings, 3072 dimensions).

## API overview

| Endpoint | Purpose |
|---|---|
| `POST /api/sessions` | Create a chat session |
| `GET /api/sessions` | List recent sessions |
| `GET /api/messages/:sessionId` | Load message history |
| `DELETE /api/messages/:sessionId` | Delete session + messages |
| `POST /api/chat?sessionId=...` | Streaming RAG reply |
| `POST /api/injest` | Ingest/update a knowledge file (Bearer auth required) |

### Ingest payload

```json
{
  "filePath": "knowledge/rag_system_guide.md",
  "content": "<full file text>"
}
```

Responses: `401` unauthorized, `400` invalid body, `{ "status": "skipped" }` unchanged hash, `{ "status": "ingested", "filePath": "..." }` on write.

## GitHub Action

Workflow: **Ingest Knowledge Base** (`.github/workflows/convertToEmbeddings.yml`)

- Triggers on push to `knowledge/**` or `workflow_dispatch`
- Detects changed files and POSTs each to `INGEST_API_URL` with `Authorization: Bearer $INGEST_API_KEY`

## Notes

- Chat answers use retrieved context only; empty Chroma → weak or “not in LocalRAG yet” answers.
- Do not commit `.env`. Copy `.env.example` → `.env` and fill in real keys. Rotate keys if they were ever shared.
