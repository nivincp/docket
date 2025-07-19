import weaviate, { WeaviateClient } from 'weaviate-client'

const client: WeaviateClient = await weaviate.connectToLocal()

const questions = client.collections.get('Question')

const result = await questions.generate.nearText(
  'biology',
  {
    groupedTask: 'Write a tweet with emojis about these facts.',
  },
  {
    limit: 2,
  }
)

console.log(result.generated)

client.close()
