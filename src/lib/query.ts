import weaviate, { WeaviateClient } from 'weaviate-client'
import { Ollama, OllamaEmbedding } from '@llamaindex/ollama'
import { systemPrompt, config } from '@/lib'
import { QueryTrace } from '@/types/'

const embedModel = new OllamaEmbedding({ model: config.models.embed })
const llm = new Ollama({ model: config.models.llm })

const client: WeaviateClient = await weaviate.connectToLocal()

export async function query({ queryText }: { queryText: string }) {
  try {
    let queryTrace: QueryTrace = { query: queryText }

    console.log('Query:', queryText)
    console.log('Generating query embedding...')

    const queryEmbedding = await embedModel.getTextEmbedding(queryText)

    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding')
    }

    const kbCollection = client.collections.get(config.collection)

    console.log('Performing semantic vector search...')
    const result = await kbCollection.query.nearVector(queryEmbedding, {
      limit: 2,
      returnMetadata: ['distance'],
    })

    // Filter results by similarity and valid documents
    const validResults = result.objects.filter(
      (obj) =>
        obj.metadata?.distance !== undefined &&
        obj.metadata.distance < 0.5 && // Lower distance = more accurate
        obj.properties.text && // Must have text content
        typeof obj.properties.text === 'string' &&
        (obj.properties.text as string).length > 10 // Must have meaningful content
    )

    if (validResults.length === 0) {
      return
    }

    queryTrace.citations = validResults.map((obj) => ({
      distance: obj.metadata?.distance,
      source: {
        document: obj.properties.docTitle != null ? String(obj.properties.docTitle) : '',
        pageNumber:
          typeof obj.properties.pageNumber === 'number'
            ? obj.properties.pageNumber
            : Number(obj.properties.pageNumber) || 0,
      },
      excerpt: (obj.properties.text as string).substring(0, 200), // Short excerpt
    }))

    // Combine retrieved text as context
    const context = validResults.map((obj) => obj.properties.text as string).join('\n\n')

    const prompt = `${systemPrompt()} Context: ${context} User Query: ${queryText} Answer:`

    console.log('Generating response with LLM...')
    const response = await llm.complete({ prompt })

    queryTrace.llmResponse = {
      model: config.models.llm,
      output: response.text,
    }

    await client.close()

    return queryTrace
  } catch (e) {
    console.error(e)
  }
}
