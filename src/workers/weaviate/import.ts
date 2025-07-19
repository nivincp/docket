import weaviate, { WeaviateClient } from 'weaviate-client'
import fs from 'fs'
import pdf from '@cyber2024/pdf-parse-fixed'

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

async function getPdfText(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath)
  const pdfData = await pdf(dataBuffer)
  return pdfData.text
}

async function importPdfQuestions() {
  const questions = client.collections.get('Question')
  const pdfText = await getPdfText('src/data/ndg_webshop_delivery_policy_changes_faq.pdf')
  const data = [{ text: pdfText }]
  const result = await questions.data.insertMany(data)
  console.log('PDF insertion response: ', result)
}

// await importQuestions()
await importPdfQuestions()

client.close()
