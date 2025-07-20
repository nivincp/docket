import 'dotenv/config'

import weaviate, { WeaviateClient, vectors, generative } from 'weaviate-client'
import { SimpleDirectoryReader } from '@llamaindex/readers/directory'
import { Settings } from 'llamaindex'
import { config } from '@/lib'

Settings.chunkSize = 2000
Settings.chunkOverlap = 500

async function main() {
  // Initialize Weaviate client
  const client: WeaviateClient = await weaviate.connectToLocal({
    host: config.weaviate.host,
  })
  await populateWeaviate(client, true)

  // Close client connection
  await client.close()
}

export async function populateWeaviate(
  client: WeaviateClient,
  overwriteExisting: boolean = false
): Promise<void> {
  if (overwriteExisting) {
    try {
      await client.collections.delete(config.collection)
    } catch (error) {}
  }

  if (!(await client.collections.exists(config.collection))) {
    await client.collections.create({
      name: config.collection,
      description: config.collectionDescription,
      vectorizers: vectors.text2VecOllama({
        apiEndpoint: config.models.llmEndpoint,
        model: config.models.embed,
      }),
      generative: generative.ollama({
        apiEndpoint: config.models.llmEndpoint,
        model: config.models.llm,
      }),
      properties: [
        { name: 'docTitle', dataType: 'text' },
        { name: 'totalPages', dataType: 'number' },
        { name: 'pageNumber', dataType: 'number' },
        { name: 'text', dataType: 'text' },
      ],
    })
  }

  await handleDocs(client)
}

export async function handleDocs(client: WeaviateClient, readOnly: boolean = false) {
  const kbCollection = client.collections.get(config.collection)

  if (readOnly === false) {
    const reader = new SimpleDirectoryReader()
    const documents = await reader.loadData('./data')

    for (const doc of documents) {
      const { page_number: pageNumber, total_pages: totalPages, file_name: fileName } = doc.metadata
      const item = {
        docTitle: fileName,
        totalPages,
        pageNumber,
        text: doc.getText(),
      }

      await kbCollection.data.insert(item as Record<string, string>)
    }
  }

  // Get collection size
  const kbCount = await kbCollection.aggregate.overAll()
  console.log(`Size of the kb dataset: ${kbCount.totalCount}`)
}

// Only run main if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
}
