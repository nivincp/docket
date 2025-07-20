export interface QueryTrace {
  query: string
  citations?: Citation[]
  llmResponse?: LLMResponse
}

export interface Citation {
  distance: number | undefined
  source: {
    document: string
    pageNumber: number
  }
  excerpt: string
}

export interface LLMResponse {
  model: string
  output?: string // optional final answer
}
