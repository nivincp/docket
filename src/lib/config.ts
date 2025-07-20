export const config = {
  collection: 'KnowledgeBase',
  collectionDescription:
    'A dataset for answering product and policy questions in a B2B support context.',
  models: {
    embed: 'nomic-embed-text',
    llm: 'llama3.2',
    llmEndpoint: 'http://host.docker.internal:11434',
  },
}
