import fs from 'node:fs/promises'
import { HuggingFaceEmbedding } from '@llamaindex/huggingface'
import { Ollama } from '@llamaindex/ollama'
import { Document, Settings, VectorStoreIndex, storageContextFromDefaults } from 'llamaindex'
import pdf from '@cyber2024/pdf-parse-fixed'
import { systemPrompt } from '../lib'

Settings.llm = new Ollama({
    model: 'llama3.2'
})

Settings.embedModel = new HuggingFaceEmbedding({
    modelType: 'BAAI/bge-small-en-v1.5',
})

// Settings.chunkSize = 2000
// Settings.chunkOverlap = 500

export async function pdfParser(pdfPath: string): Promise<string> {
    const dataBuffer = await fs.readFile(pdfPath)
    const data = await pdf(dataBuffer)
    return data.text
}

const files = [
    {
        source: 'Delivery Policy FAQ',
        fileName: 'ndg_webshop_delivery_policy_changes_faq.pdf',
    },
]

export async function createVectorStoreIndex(text: string): Promise<VectorStoreIndex> {
    const document = new Document({
        text,
        metadata: files[0],
    })

    const storageContext = await storageContextFromDefaults({
        persistDir: './storage',
    })

    console.log('Creating index')

    const index = await VectorStoreIndex.fromDocuments([document], {
        storageContext,
    })

    console.log('Index created')
    return index
}

export async function readVectorStoreIndex(): Promise<VectorStoreIndex> {
    const storageContext = await storageContextFromDefaults({
        persistDir: './storage',
    })

    console.log('reading index')

    const index = await VectorStoreIndex.fromDocuments([], {
        storageContext,
    })

    console.log('read index')
    return index
}

async function query(query: string) {
    if (!query || query.length < 5) {
        console.error('Invalid or too short query.')
        return
    }

    const index = await readVectorStoreIndex()
    const queryEngine = index.asQueryEngine({
        similarityTopK: 3,
        customParams: {
            systemPrompt: systemPrompt(),
            metadata: files[0]
        },
    })

    const response = await queryEngine.query({
        query,
    })

    console.log(response)

    if (response.sourceNodes?.length) {
        for (const source of response.sourceNodes) {
            console.log('Source:', source.node.metadata)
        }
    }

    console.log(response.toString())
}

const queryMode = true

async function main() {
    if (queryMode) {
        await query('why there is an extra charge')
        return
    }

    const file = files[0].fileName
    const text = await pdfParser(`./src/data/${file}`)
    await createVectorStoreIndex(text)
}

main().catch(console.error)
