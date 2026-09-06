# Retrieval-Augmented Generation (RAG) Architecture & Knowledge Base

## Overview

Retrieval-Augmented Generation (RAG) optimizes the output of Large Language Models (LLMs) by referencing an authoritative knowledge base outside of its training data sources before generating a response.

## Core Pipeline Stages

### 1. Document Ingestion & Chunking

- Documents from sources like Markdown, PDF, and DOCX are parsed and split into manageable chunks.
- LangChain's `RecursiveCharacterTextSplitter` uses semantic boundaries (paragraphs, sentences, words) with a chunk size of 1200 characters and 200 characters overlap.
- Chunk overlap ensures critical context is preserved across split boundaries.

### 2. Embedding Generation

- Text chunks are converted into dense vector representations using state-of-the-art embedding models (such as Google Gemini `text-embedding-004` or OpenAI `text-embedding-3-small`).
- Embeddings capture semantic similarity so conceptually related content clusters close together in vector space.

### 3. Vector Storage in ChromaDB

- Vector embeddings, chunk metadata (source file path, chunk index, document hash), and raw text are indexed in ChromaDB.
- Hashing (e.g., SHA-256) enables deduplication: if a file has not changed, ingestion is skipped to save compute and API costs.
- When a document is modified, outdated chunks for that file path are deleted and replaced with fresh vectors.

### 4. Query Retrieval & Context Augmentation

- When a user submits a prompt, the query is embedded into the same vector space.
- ChromaDB performs cosine similarity search or Approximate Nearest Neighbor (ANN) search to retrieve top-$k$ relevant chunks.
- The retrieved chunks are formatted into a system prompt grounding the LLM with factual context.

### 5. Grounded Generation

- The LLM generates responses citing sources and relying strictly on the retrieved context, dramatically mitigating hallucinations.

## Key Benefits

- **Hallucination Prevention**: Output is strictly anchored to validated domain documentation.
- **Dynamic Updates**: New information is available immediately upon document indexing without expensive model fine-tuning.
- **Privacy & Security**: Internal company documentation remains secure and under access-controlled vector stores.
- **Conclusion**: This is the current state of the machines and growing at current pace
