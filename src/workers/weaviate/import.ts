import weaviate, { WeaviateClient } from 'weaviate-client'

const client: WeaviateClient = await weaviate.connectToLocal()

// Load data
async function getJsonData() {
  const file = await fetch(
    'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json'
  )
  return file.json()
}

async function importQuestions() {
  const questions = client.collections.get('Question')
  const data = await getJsonData()
  const result = await questions.data.insertMany(data)
  console.log('Insertion response: ', result)
}

await importQuestions()

client.close()
