import weaviate, { WeaviateClient } from 'weaviate-client'

const client: WeaviateClient = await weaviate.connectToLocal()

const questions = client.collections.get('Question')

const result = await questions.query.nearText('biology', {
  limit: 2,
})

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2))
})

client.close() // Close the client connection
