import weaviate, { WeaviateClient } from 'weaviate-client'
import { WeaviateVectorStore } from '@llamaindex/weaviate'
import { VectorStoreIndex, Settings } from 'llamaindex'
import { HuggingFaceEmbedding } from '@llamaindex/huggingface'
import { Ollama } from '@llamaindex/ollama'
import { systemPrompt } from '@/lib'

Settings.llm = new Ollama({
  model: 'llama3.2',
})

Settings.embedModel = new HuggingFaceEmbedding({
  modelType: 'BAAI/bge-small-en-v1.5',
})

const indexName = 'MovieReviews'

async function main() {
  try {
    const query = 'Which one is a good drama movie?'

    const client: WeaviateClient = await weaviate.connectToLocal()

    const vectorStore = new WeaviateVectorStore({
      weaviateClient: client,
      indexName,
    })

    const index = await VectorStoreIndex.fromVectorStore(vectorStore)
    const retriever = index.asRetriever({ similarityTopK: 2 })

    const queryEngine = index.asQueryEngine({
      retriever,
      customParams: {
        systemPrompt: systemPrompt(),
      },
    })

    const response = await queryEngine.query({ query })
    console.log('Query response:', response)
  } catch (e) {
    console.error(e)
  }
}

void main()
