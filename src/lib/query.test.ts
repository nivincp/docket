import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib', () => ({
  config: {
    collection: 'TestKnowledgeBase',
    models: {
      embed: 'test-embed-model',
      llm: 'test-llm-model',
      llmEndpoint: 'http://localhost:11434',
    },
    weaviate: {
      host: 'weaviate',
      dockerHost: 'localhost:8080',
    },
  },
  systemPrompt: vi.fn().mockReturnValue('You are a helpful assistant.'),
}))

vi.mock('weaviate-client', () => ({
  default: {
    connectToLocal: vi.fn(),
  },
}))

vi.mock('@llamaindex/ollama', () => ({
  OllamaEmbedding: vi.fn(),
  Ollama: vi.fn(),
}))

vi.mock('@/types/', () => ({
  QueryTrace: {},
}))

import { query } from './query'
import weaviate from 'weaviate-client'
import { OllamaEmbedding, Ollama } from '@llamaindex/ollama'

describe('query.ts', () => {
  let mockClient: any
  let mockCollection: any
  let mockEmbedModel: any
  let mockLlm: any

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockCollection = {
      query: {
        nearVector: vi.fn().mockResolvedValue({
          objects: [
            {
              metadata: { distance: 0.3 },
              properties: {
                text: 'This is a test document about product support policies and procedures.',
                docTitle: 'test-doc.pdf',
                pageNumber: 1,
              },
            },
            {
              metadata: { distance: 0.4 },
              properties: {
                text: 'Additional information about customer service and technical support guidelines.',
                docTitle: 'support-guide.pdf',
                pageNumber: 2,
              },
            },
          ],
        }),
      },
    }

    mockClient = {
      collections: {
        get: vi.fn().mockReturnValue(mockCollection),
      },
      close: vi.fn().mockResolvedValue({}),
    }

    // Mock embedding model
    mockEmbedModel = {
      getTextEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4, 0.5]),
    }

    // Mock LLM
    mockLlm = {
      complete: vi.fn().mockResolvedValue({
        text: 'Based on the provided context, here is the answer to your question.',
      }),
    }

    vi.mocked(weaviate.connectToLocal).mockResolvedValue(mockClient)
    vi.mocked(OllamaEmbedding).mockImplementation(() => mockEmbedModel as any)
    vi.mocked(Ollama).mockImplementation(() => mockLlm as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should export query function', () => {
    expect(typeof query).toBe('function')
  })

  it('should initialize Weaviate client with dockerHost when dockerHost=true', async () => {
    await query({ queryText: 'test query', dockerHost: true })

    expect(weaviate.connectToLocal).toHaveBeenCalledWith({
      host: 'localhost:8080',
    })
  })

  it('should initialize Weaviate client with regular host when dockerHost=false', async () => {
    await query({ queryText: 'test query', dockerHost: false })

    expect(weaviate.connectToLocal).toHaveBeenCalledWith({
      host: 'weaviate',
    })
  })

  it('should initialize Weaviate client with regular host when dockerHost is undefined', async () => {
    await query({ queryText: 'test query' })

    expect(weaviate.connectToLocal).toHaveBeenCalledWith({
      host: 'weaviate',
    })
  })

  it('should initialize embedding model with correct configuration', async () => {
    await query({ queryText: 'test query' })

    expect(OllamaEmbedding).toHaveBeenCalledWith({
      model: 'test-embed-model',
      config: { host: 'http://localhost:11434' },
    })
  })

  it('should initialize LLM with correct configuration', async () => {
    await query({ queryText: 'test query' })

    expect(Ollama).toHaveBeenCalledWith({
      model: 'test-llm-model',
      config: { host: 'http://localhost:11434' },
    })
  })

  it('should generate query embedding', async () => {
    await query({ queryText: 'test query' })

    expect(mockEmbedModel.getTextEmbedding).toHaveBeenCalledWith('test query')
  })

  it('should throw error when embedding generation fails', async () => {
    mockEmbedModel.getTextEmbedding.mockResolvedValue(null)

    const result = await query({ queryText: 'test query' })

    expect(result).toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })

  it('should perform vector search with correct parameters', async () => {
    await query({ queryText: 'test query' })

    expect(mockCollection.query.nearVector).toHaveBeenCalledWith([0.1, 0.2, 0.3, 0.4, 0.5], {
      limit: 2,
      returnMetadata: ['distance'],
    })
  })

  it('should filter results by distance threshold', async () => {
    mockCollection.query.nearVector.mockResolvedValue({
      objects: [
        {
          metadata: { distance: 0.3 },
          properties: {
            text: 'Good result with low distance',
            docTitle: 'good-doc.pdf',
            pageNumber: 1,
          },
        },
        {
          metadata: { distance: 0.8 }, // High distance, should be filtered
          properties: {
            text: 'Poor result with high distance',
            docTitle: 'poor-doc.pdf',
            pageNumber: 1,
          },
        },
      ],
    })

    const result = await query({ queryText: 'test query' })

    expect(result?.citations).toHaveLength(1)
    expect(result?.citations?.[0].source.document).toBe('good-doc.pdf')
  })

  it('should filter out results with insufficient text content', async () => {
    mockCollection.query.nearVector.mockResolvedValue({
      objects: [
        {
          metadata: { distance: 0.3 },
          properties: {
            text: 'Short', // Too short, should be filtered
            docTitle: 'short-doc.pdf',
            pageNumber: 1,
          },
        },
        {
          metadata: { distance: 0.3 },
          properties: {
            text: 'This is a sufficiently long text that should pass the filter',
            docTitle: 'good-doc.pdf',
            pageNumber: 1,
          },
        },
      ],
    })

    const result = await query({ queryText: 'test query' })

    expect(result?.citations).toHaveLength(1)
    expect(result?.citations?.[0].source.document).toBe('good-doc.pdf')
  })

  it('should return undefined when no valid results are found', async () => {
    mockCollection.query.nearVector.mockResolvedValue({
      objects: [
        {
          metadata: { distance: 0.8 }, // High distance
          properties: {
            text: 'Poor result',
            docTitle: 'poor-doc.pdf',
            pageNumber: 1,
          },
        },
      ],
    })

    const result = await query({ queryText: 'test query' })

    expect(result).toBeUndefined()
  })

  it('should generate correct citations from valid results', async () => {
    const result = await query({ queryText: 'test query' })

    expect(result?.citations).toHaveLength(2)
    expect(result?.citations?.[0]).toEqual({
      distance: 0.3,
      source: {
        document: 'test-doc.pdf',
        pageNumber: 1,
      },
      excerpt: 'This is a test document about product support policies and procedures.',
    })
    expect(result?.citations?.[1]).toEqual({
      distance: 0.4,
      source: {
        document: 'support-guide.pdf',
        pageNumber: 2,
      },
      excerpt: 'Additional information about customer service and technical support guidelines.',
    })
  })

  it('should handle pageNumber as string and convert to number', async () => {
    mockCollection.query.nearVector.mockResolvedValue({
      objects: [
        {
          metadata: { distance: 0.3 },
          properties: {
            text: 'Test document with string page number',
            docTitle: 'test-doc.pdf',
            pageNumber: '5', // String page number
          },
        },
      ],
    })

    const result = await query({ queryText: 'test query' })

    expect(result?.citations?.[0].source.pageNumber).toBe(5)
  })

  it('should generate LLM prompt with correct format', async () => {
    await query({ queryText: 'test query' })

    const expectedContext =
      'This is a test document about product support policies and procedures.\n\nAdditional information about customer service and technical support guidelines.'

    // Verify that the LLM was called with a prompt containing the expected parts
    expect(mockLlm.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Context: ' + expectedContext),
      })
    )

    expect(mockLlm.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('User Query: test query Answer:'),
      })
    )

    // Also verify that systemPrompt was called
    const { systemPrompt } = await import('@/lib')
    expect(systemPrompt).toHaveBeenCalled()
  })

  it('should return complete QueryTrace object', async () => {
    const result = await query({ queryText: 'test query' })

    expect(result).toEqual({
      query: 'test query',
      citations: [
        {
          distance: 0.3,
          source: { document: 'test-doc.pdf', pageNumber: 1 },
          excerpt: 'This is a test document about product support policies and procedures.',
        },
        {
          distance: 0.4,
          source: { document: 'support-guide.pdf', pageNumber: 2 },
          excerpt:
            'Additional information about customer service and technical support guidelines.',
        },
      ],
      llmResponse: {
        model: 'test-llm-model',
        output: 'Based on the provided context, here is the answer to your question.',
      },
    })
  })

  it('should close Weaviate client after processing', async () => {
    await query({ queryText: 'test query' })

    expect(mockClient.close).toHaveBeenCalled()
  })

  it('should handle exceptions and log errors', async () => {
    const error = new Error('Test error')
    vi.mocked(weaviate.connectToLocal).mockRejectedValue(error)

    const result = await query({ queryText: 'test query' })

    expect(result).toBeUndefined()
    expect(console.error).toHaveBeenCalledWith(error)
  })

  it('should handle missing metadata distance', async () => {
    mockCollection.query.nearVector.mockResolvedValue({
      objects: [
        {
          metadata: {}, // Missing distance
          properties: {
            text: 'Test document without distance metadata',
            docTitle: 'test-doc.pdf',
            pageNumber: 1,
          },
        },
      ],
    })

    const result = await query({ queryText: 'test query' })

    expect(result).toBeUndefined()
  })

  it('should handle null docTitle gracefully', async () => {
    mockCollection.query.nearVector.mockResolvedValue({
      objects: [
        {
          metadata: { distance: 0.3 },
          properties: {
            text: 'Test document with null doc title',
            docTitle: null,
            pageNumber: 1,
          },
        },
      ],
    })

    const result = await query({ queryText: 'test query' })

    expect(result?.citations?.[0].source.document).toBe('')
  })
})
