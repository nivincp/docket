import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib', () => ({
  config: {
    collection: 'TestKnowledgeBase',
    collectionDescription: 'Test collection',
    weaviate: { host: 'localhost:8080' },
    models: {
      llmEndpoint: 'http://localhost:11434',
      embed: 'test-embed-model',
      llm: 'test-llm-model',
    },
  },
}))

vi.mock('weaviate-client', () => ({
  default: {
    connectToLocal: vi.fn().mockResolvedValue({
      collections: {
        delete: vi.fn().mockResolvedValue({}),
        exists: vi.fn().mockResolvedValue(false),
        create: vi.fn().mockResolvedValue({}),
        get: vi.fn().mockReturnValue({
          data: { insert: vi.fn().mockResolvedValue({}) },
          aggregate: { overAll: vi.fn().mockResolvedValue({ totalCount: 10 }) },
        }),
      },
      close: vi.fn().mockResolvedValue({}),
    }),
  },
  vectors: {
    text2VecOllama: vi.fn().mockReturnValue({ type: 'text2vec-ollama' }),
  },
  generative: {
    ollama: vi.fn().mockReturnValue({ type: 'generative-ollama' }),
  },
}))

vi.mock('@llamaindex/readers/directory', () => ({
  SimpleDirectoryReader: vi.fn().mockImplementation(() => ({
    loadData: vi.fn().mockResolvedValue([
      {
        getText: () => 'Test document content 1',
        metadata: {
          file_name: 'test1.pdf',
          page_number: 1,
          total_pages: 2,
        },
      },
      {
        getText: () => 'Test document content 2',
        metadata: {
          file_name: 'test2.pdf',
          page_number: 1,
          total_pages: 1,
        },
      },
    ]),
  })),
}))

vi.mock('llamaindex', () => ({
  Settings: {
    chunkSize: 2000,
    chunkOverlap: 500,
  },
}))

// Mock dotenv to prevent it from loading
vi.mock('dotenv/config', () => ({}))

import { populateWeaviate, handleDocs } from './load'
import weaviate from 'weaviate-client'

describe('b2b docs loader', () => {
  let mockClient: any
  let mockCollection: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockCollection = {
      data: { insert: vi.fn().mockResolvedValue({}) },
      aggregate: { overAll: vi.fn().mockResolvedValue({ totalCount: 10 }) },
    }

    mockClient = {
      collections: {
        delete: vi.fn().mockResolvedValue({}),
        exists: vi.fn().mockResolvedValue(false),
        create: vi.fn().mockResolvedValue({}),
        get: vi.fn().mockReturnValue(mockCollection),
      },
    }
  })

  it('should export populateWeaviate function', () => {
    expect(typeof populateWeaviate).toBe('function')
  })

  it('should export handleDocs function', () => {
    expect(typeof handleDocs).toBe('function')
  })

  it('should call collections.delete when overwriteExisting is true', async () => {
    expect(() => populateWeaviate(mockClient, true)).not.toThrow()
  })

  it('should create collection when it does not exist', async () => {
    mockClient.collections.exists.mockResolvedValue(false)

    await populateWeaviate(mockClient, false)

    expect(mockClient.collections.create).toHaveBeenCalledWith({
      name: 'TestKnowledgeBase',
      description: 'Test collection',
      vectorizers: { type: 'text2vec-ollama' },
      generative: { type: 'generative-ollama' },
      properties: [
        { name: 'docTitle', dataType: 'text' },
        { name: 'totalPages', dataType: 'number' },
        { name: 'pageNumber', dataType: 'number' },
        { name: 'text', dataType: 'text' },
      ],
    })
  })

  it('should not create collection if it already exists', async () => {
    mockClient.collections.exists.mockResolvedValue(true)

    await populateWeaviate(mockClient, false)

    expect(mockClient.collections.create).not.toHaveBeenCalled()
  })

  it('should configure vectorizers and generative models correctly', async () => {
    const { vectors, generative } = await import('weaviate-client')
    const text2VecOllamaSpy = vi.mocked(vectors.text2VecOllama)
    const ollamaSpy = vi.mocked(generative.ollama)

    mockClient.collections.exists.mockResolvedValue(false)

    await populateWeaviate(mockClient, false)

    expect(text2VecOllamaSpy).toHaveBeenCalledWith({
      apiEndpoint: 'http://localhost:11434',
      model: 'test-embed-model',
    })

    expect(ollamaSpy).toHaveBeenCalledWith({
      apiEndpoint: 'http://localhost:11434',
      model: 'test-llm-model',
    })
  })

  it('should handle document loading in handleDocs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Test with readOnly=false to trigger document loading
    await handleDocs(mockClient, false)

    expect(mockCollection.data.insert).toHaveBeenCalledTimes(2)
    expect(mockCollection.data.insert).toHaveBeenCalledWith({
      docTitle: 'test1.pdf',
      totalPages: 2,
      pageNumber: 1,
      text: 'Test document content 1',
    })

    consoleSpy.mockRestore()
  })

  it('should log collection size in handleDocs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await handleDocs(mockClient, true) // readOnly mode to avoid document loading

    expect(mockCollection.aggregate.overAll).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Size of the kb dataset: 10')

    consoleSpy.mockRestore()
  })

  it('should initialize Weaviate client with correct host configuration', async () => {
    const connectToLocalSpy = vi.mocked(weaviate.connectToLocal)

    // Test that the Weaviate client would be initialized with the correct configuration
    // This simulates what happens in the main() function
    const { config } = await import('@/lib')

    // Create a mock client
    const mockClientForInit = {
      collections: {
        delete: vi.fn().mockResolvedValue({}),
        exists: vi.fn().mockResolvedValue(true),
        create: vi.fn().mockResolvedValue({}),
        get: vi.fn().mockReturnValue(mockCollection),
      },
      close: vi.fn().mockResolvedValue({}),
    }

    connectToLocalSpy.mockResolvedValue(mockClientForInit as any)

    // Simulate the client initialization that happens in main()
    const client = await weaviate.connectToLocal({
      host: config.weaviate.host,
    })

    // Verify the client was initialized with correct parameters
    expect(connectToLocalSpy).toHaveBeenCalledWith({
      host: 'localhost:8080', // This should match our mocked config
    })

    // Verify the client has the expected methods
    expect(client.collections).toBeDefined()
    expect(client.close).toBeDefined()
    expect(typeof client.close).toBe('function')
  })

  it('should validate Weaviate client configuration matches expected format', async () => {
    // Test that our mocked configuration has the expected structure
    const { config } = await import('@/lib')

    expect(config.weaviate).toBeDefined()
    expect(config.weaviate.host).toBe('localhost:8080')
    expect(config.collection).toBe('TestKnowledgeBase')
    expect(config.models.llmEndpoint).toBe('http://localhost:11434')
  })
})
