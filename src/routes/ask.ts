import { query } from '@/lib'
import { z } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import { questions } from '@/mocks'

export type AppOpenAPI = OpenAPIHono
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R>

const {
  provider,
  types: { basicFactRetrieval, paraphrased, feesAndEdgeCases, ambiguousOrIncomplete },
} = questions

const askSchema = z.object({
  provider: z
    .enum([
      'cognitive',
      'microsoft',
      'fluentpro',
      'nescafe',
      'fsas',
      'onesource',
      'gigamon',
      'teradata',
      'juniper',
    ])
    .openapi({ example: 'nescafe' }),
  question: z.string().openapi({ example: feesAndEdgeCases[0].question }),
})

const citationSchema = z.object({
  distance: z.number().optional(),
  source: z.object({
    document: z.string(),
    pageNumber: z.number(),
  }),
  excerpt: z.string(),
})

const llMResponseSchema = z.object({
  model: z.string(),
  output: z.string().optional(),
})

const answerSchema = z
  .object({
    query: z.string(),
    citations: z.array(citationSchema).optional(),
    llmResponse: llMResponseSchema.optional(),
  })
  .openapi('QueryResponse')

export const askRoute = createRoute({
  method: 'post',
  path: '/ask',
  request: {
    body: {
      content: {
        'application/json': {
          schema: askSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'The answer to the question',
      content: {
        'application/json': {
          schema: answerSchema,
        },
      },
    },
  },
})

export const askHandler: AppRouteHandler<typeof askRoute> = async (c) => {
  const { provider, question } = await c.req.valid('json')
  const queryText = `${provider} - ${question}`

  const res = await query({ queryText })
  return c.json(res)
}
