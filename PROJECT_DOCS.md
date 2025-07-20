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

### 10. Test Files

- **`src/workers/b2b/load.test.ts`**: Unit tests for document loading functionality, Weaviate collection management, and data processing.
- **`src/lib/query.test.ts`**: Tests for the RAG query pipeline, embedding generation, vector search, result filtering, and LLM integration.

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
   - `/docs` for OpenAPI spec
   - `/ask` for question answering

4. Run evaluation (optional):

   ```sh
   yarn b2b:evaluate
   ```

   This runs the correctness evaluator against test questions for nescafe-delivery-policy.pdf to measure RAG pipeline performance.

5. Run unit tests:
   ```sh
   yarn test
   ```
   This runs unit tests for the data loading and query functionality.

## Testing

Provide coverage of core functionality:

### Data Loading Tests (`src/workers/b2b/load.test.ts`)

- covers the document loading and Weaviate collection management
- Tests Weaviate client initialization with correct configuration
- Validates collection creation, deletion, and conditional logic
- Verifies document processing, chunking, and insertion
- Tests vectorizer and generative model configuration
- Covers error handling and edge cases

### Query Pipeline Tests (`src/lib/query.test.ts`)

- Tests Weaviate client initialization for both Docker and local environments
- Validates embedding model and LLM initialization
- Tests vector search with proper filtering by distance and content quality
- Verifies citation generation and metadata handling
- Tests prompt construction and LLM integration
- Covers error scenarios and resource cleanup
- Tests edge cases like missing metadata and data type conversions

### Test Features

- External dependencies (Weaviate, Ollama, LlamaIndex) are mocked
- Tests both Docker and local development scenarios
- Proper filtering and validation of search results
- Tests failure modes and error handling paths

Run tests with:

```sh
yarn test
yarn test load.test.ts
yarn test query.test.ts
```

## Extending & Improving

- Add support for document uploads and updates.
- Add more evaluation scripts and test coverage.
- Improve prompt engineering and result filtering.
- Scale to larger datasets and multi-user scenarios.
- Add streaming support for real-time answer generation and improved user experience.

## References

- See `README.md` for challenge context and clarifying questions.
- All code is in `src/` except for dependencies and data files.
