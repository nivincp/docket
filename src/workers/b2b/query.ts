import weaviate, { WeaviateClient } from 'weaviate-client'
import { systemPrompt } from '@/lib'
import 'dotenv/config'

async function main() {
  const client: WeaviateClient = await weaviate.connectToLocal()

  const kbCollection = client.collections.use('KnowledgeBase')

  const genResult = await kbCollection.generate.nearText('how do i change my delivery date?', {
    singlePrompt: systemPrompt(),
  })

  for (const item of genResult.objects) {
    console.log('Single generated concept:', item.generative?.text)
  }

  // Close client connection
  await client.close()
}

void main()
