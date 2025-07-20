export const config = {
  collection: 'KnowledgeBase',
  collectionDescription:
    'A dataset for answering product and policy questions in a B2B support context.',
  models: {
    embed: 'qllama/bge-small-en-v1.5',
    llm: 'llama3.2',
    llmEndpoint: process.env.OLLAMA_HOST,
  },
  weaviate: {
    host: 'weaviate',
  },
}
