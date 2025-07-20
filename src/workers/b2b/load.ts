import 'dotenv/config'

import weaviate, { WeaviateClient, vectors, generative } from 'weaviate-client'
import { SimpleDirectoryReader } from '@llamaindex/readers/directory'
import { Settings } from 'llamaindex'

Settings.chunkSize = 2000
Settings.chunkOverlap = 500

const ollamaEndpoint = 'http://host.docker.internal:11434'

async function main() {
  // Initialize Weaviate client
  const client: WeaviateClient = await weaviate.connectToLocal()
  await populateWeaviate(client, true)

  // Close client connection
  await client.close()
}

async function populateWeaviate(
  client: WeaviateClient,
  overwriteExisting: boolean = false
): Promise<void> {
  if (overwriteExisting) {
    try {
      await client.collections.delete('KnowledgeBase')
    } catch (error) {}
  }

  if (!(await client.collections.exists('KnowledgeBase'))) {
    await client.collections.create({
      name: 'KnowledgeBase',
      description: 'A dataset for answering product and policy questions in a B2B support context.',
      vectorizers: vectors.text2VecOllama({
        apiEndpoint: ollamaEndpoint,
        model: 'nomic-embed-text',
      }),
      generative: generative.ollama({
        apiEndpoint: ollamaEndpoint,
        model: 'llama3.2',
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

async function handleDocs(client: WeaviateClient, readOnly: boolean = false) {
  const kbCollection = client.collections.get('KnowledgeBase')

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

void main()
