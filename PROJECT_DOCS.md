# Docket B2B Support Platform – Project Documentation

## Overview

This project is a prototype for a next-generation B2B support platform. It leverages Generative AI and semantic search to answer product and policy questions for support agents, providing clear citations to source documents. The stack uses Node.js, TypeScript, Hono (web server), Weaviate (vector DB), Ollama (LLM/embedding), and LlamaIndex for orchestration.

## Architecture

- **Hono API Server** (`src/index.ts`): Serves REST endpoints for question answering and OpenAPI documentation.
- **Weaviate** (Docker service): Stores vectorized document chunks for semantic search.
- **Ollama** (external, on host): Provides LLM and embedding models via API.
- **LlamaIndex**: Used for document reading, chunking, and embedding orchestration.
- **Data Loader** (`src/workers/b2b/load.ts`): Reads documents, generates embeddings, and populates Weaviate.
- **Query Pipeline** (`src/lib/query.ts`): Embeds user queries, performs semantic search, constructs prompts, and calls LLM for answers.

## Key Files & Their Roles

### 1. `src/index.ts`

- Sets up the Hono server and OpenAPI documentation.
- Defines the `/` and `/api` endpoints.
- Registers the main question-answering route (`askRoute`).
- Starts the server on port 3000.

### 2. `src/lib/config.ts`

- Centralizes configuration for model names, endpoints, and Weaviate host.
- Uses `host.docker.internal` for Ollama (when running in Docker).
- Sets collection name and description for Weaviate.

### 3. `src/lib/query.ts`

- Main query function for answering user questions.
- Steps:
  1. Embeds the query using OllamaEmbedding.
  2. Connects to Weaviate using service name (`weaviate:8080`).
  3. Performs semantic vector search for relevant document chunks.
  4. Filters results by distance and content quality.
  5. Constructs a prompt with context and user query.
  6. Calls Ollama LLM for answer generation.
  7. Returns answer and citations.

### 4. `src/workers/b2b/load.ts`

- Loads and chunks documents from the `data/` directory.
- Generates embeddings for each chunk using Ollama.
- Inserts chunks into Weaviate with metadata (title, page number, etc.).
- Creates Weaviate collection/schema if not present.
- Can overwrite existing collection if needed.

### 5. `src/routes/ask.ts`

- Defines the API route and handler for question answering.
- Calls the query pipeline and returns the result.

### 6. `package.json`

- Defines scripts for loading data (`b2b:load`), querying (`b2b:query`), and running the dev server (`dev`).
- Lists all dependencies and devDependencies.

### 7. `docker-compose.yml`

- Defines two services: `weaviate` (vector DB) and `hono` (API server).
- Sets up networking so `hono` can reach `weaviate` and Ollama (on host).
- Uses an entrypoint script to wait for Weaviate, run the data loader, and then start the dev server for `hono`.
- Mounts code for live development.

### 8. `makefile`

- Provides commands for building, starting, and stopping the stack.
- Can be extended to run data loading before dev server startup.

### 9. `Dockerfile`

- Builds the `hono` service image.
- Installs dependencies and copies source code.
- Exposes port 3000 and starts the dev server.

## Data Flow

1. **Startup**: Weaviate and Hono containers start. Hono waits for Weaviate, loads documents, and starts the API server.
2. **Data Loading**: `load.ts` reads files from `data/`, chunks and embeds them, and inserts them into Weaviate.
3. **Querying**: User sends a question to the API. The query pipeline embeds the question, searches Weaviate, builds a prompt, and gets an answer from Ollama.
4. **Response**: API returns the answer and citations to the user.

## Environment & Networking

- **Ollama**: Runs on the Mac host, accessed from Docker via `host.docker.internal:11434`.
- **Weaviate**: Accessed from Hono via service name `weaviate:8080`.
- **Data**: Static files in `src/data/` (PDF, Markdown, etc.).

## How to Run

1. Install dependencies:
   ```sh
   yarn install
   ```
2. Start the stack:
   ```sh
   make build
   make up
   ```
3. Access the API:
   - [http://localhost:3000](http://localhost:3000)
   - `/api` for OpenAPI spec
   - `/ask` for question answering

## Extending & Improving

- Add support for document uploads and updates.
- Implement evaluation scripts and test coverage.
- Improve prompt engineering and result filtering.
- Scale to larger datasets and multi-user scenarios.

## References

- See `README.md` for challenge context and clarifying questions.
- All code is in `src/` except for dependencies and data files.
