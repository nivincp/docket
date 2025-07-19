import weaviate, { WeaviateClient, generative, vectors } from 'weaviate-client'

const client: WeaviateClient = await weaviate.connectToLocal()

await client.collections.create({
  name: 'Question',
  vectorizers: vectors.text2VecOllama({
    apiEndpoint: 'http://host.docker.internal:11434',
    model: 'nomic-embed-text',
  }),
  generative: generative.ollama({
    apiEndpoint: 'http://host.docker.internal:11434',
    model: 'llama3.2',
  }),
})

client.close()
