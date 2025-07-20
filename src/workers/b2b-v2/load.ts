import 'dotenv/config'

import weaviate, { WeaviateClient } from 'weaviate-client'
import { CSVReader } from '@llamaindex/readers/csv'
import { WeaviateVectorStore } from '@llamaindex/weaviate'
import { storageContextFromDefaults, VectorStoreIndex, Settings } from 'llamaindex'
import { HuggingFaceEmbedding } from '@llamaindex/huggingface'

const indexName = 'MovieReviews'

Settings.embedModel = new HuggingFaceEmbedding({
  modelType: 'BAAI/bge-small-en-v1.5',
})

Settings.chunkSize = 2000
Settings.chunkOverlap = 500

async function main() {
  try {
    const reader = new CSVReader(false)
    const docs = await reader.loadData('./data/movie_reviews.csv')
    console.log('CSV loaded, docs count:', docs.length)

    const client: WeaviateClient = await weaviate.connectToLocal()

    const vectorStore = new WeaviateVectorStore({
      weaviateClient: client,
      indexName,
    })
    console.log('Vector store initialized')

    const storageContext = await storageContextFromDefaults({ vectorStore })
    console.log('Storage context ready')

    await VectorStoreIndex.fromDocuments(docs, { storageContext })
    console.log('Successfully loaded data into Weaviate')
  } catch (e) {
    console.error(e)
  }
}

void main()
