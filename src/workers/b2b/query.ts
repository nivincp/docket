import weaviate, { WeaviateClient } from 'weaviate-client'
import { Ollama, OllamaEmbedding } from '@llamaindex/ollama'
import { systemPrompt } from '@/lib'

async function main() {
  try {
    const query = 'why there was extra charges?'

    const client: WeaviateClient = await weaviate.connectToLocal()

    // Use vector-based semantic search (like LlamaIndex)
    const embedModel = new OllamaEmbedding({
      model: 'nomic-embed-text',
    })

    console.log('Generating query embedding...')
    const queryEmbedding = await embedModel.getTextEmbedding(query)

    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding')
    }

    // Query Weaviate directly with nearText (faster - Weaviate handles embedding)
    const kbCollection = client.collections.get('KnowledgeBase')

    console.log('Performing semantic vector search...')
    const result = await kbCollection.query.nearVector(queryEmbedding, {
      limit: 5, // Get more results to filter
      returnMetadata: ['score', 'distance'],
    })

    if (result.objects.length > 0) {
      console.log('First result metadata:', result.objects[0].metadata)
    }

    // Filter results by similarity and valid documents
    const validResults = result.objects.filter(
      (obj) =>
        obj.metadata?.distance !== undefined &&
        obj.metadata.distance < 0.8 && // Lower distance = higher similarity
        obj.properties.text && // Must have text content
        typeof obj.properties.text === 'string' &&
        (obj.properties.text as string).length > 10 // Must have meaningful content
    )

    if (validResults.length === 0) {
      console.log('No relevant results found. Let me check what documents are available...')

      // Check available documents
      const allDocs = await kbCollection.query.fetchObjects({
        limit: 5,
      })

      console.log('Available documents:')
      allDocs.objects.forEach((obj, index) => {
        console.log(`${index + 1}. ${obj.properties.docTitle} (Page: ${obj.properties.pageNumber})`)
      })
      return
    }

    console.log(`Found ${validResults.length} relevant results:`)
    validResults.forEach((obj, index) => {
      console.log(`\nResult ${index + 1}:`)
      console.log(`Distance: ${obj.metadata?.distance} (lower = more similar)`)
      console.log(`Document: ${obj.properties.docTitle}`)
      console.log(`Page: ${obj.properties.pageNumber}`)
      const text = obj.properties.text as string
      console.log(`Text: ${text?.substring(0, 200)}...`)
    })

    // Use Ollama LLM to generate response based on retrieved context
    const llm = new Ollama({
      model: 'llama3.2',
    })

    // Combine retrieved text as context
    const context = validResults.map((obj) => obj.properties.text as string).join('\n\n')

    const prompt = `${systemPrompt()}

Context:
${context}

User Query: ${query}

Answer:`

    console.log('\n--- Generating response with Llama 3.2 ---')
    const response = await llm.complete({ prompt })
    console.log('\nLLM Response:')
    console.log(response.text)

    // Close client connection
    await client.close()
  } catch (e) {
    console.error(e)
  }
}

void main()
