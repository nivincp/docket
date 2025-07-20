import weaviate, { WeaviateClient } from 'weaviate-client'
import 'dotenv/config'

async function main() {
  const client: WeaviateClient = await weaviate.connectToLocal()

  const kbCollection = client.collections.use('KnowledgeBase')

  const searchResults = await kbCollection.query.hybrid('how do i change my delivery date', {
    limit: 2,
    alpha: 0.8, // weight of each search type (0 = pure keyword search, 1 = pure vector search)
    maxVectorDistance: 0.4,
    returnMetadata: ['score'], // Return the score of results from the query vector
  })

  for (const item of searchResults.objects) {
    console.log('===== Search Result =====')
    console.log('Score:', item.metadata?.score)
    console.log('Doc Title:', item.properties.docTitle)
    console.log('Page Number:', item.properties.pageNumber)
    console.log('Found in Section:', item.properties.text)
  }

  // Close client connection
  await client.close()
}

void main()
