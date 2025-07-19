import { OpenAPIHono } from '@hono/zod-openapi'
import { serve } from '@hono/node-server'
import { askRoute, askHandler } from './routes'
import { Scalar } from '@scalar/hono-api-reference'

const app = new OpenAPIHono()

app.doc('/spec', {
  openapi: '3.0.1',
  info: {
    version: '1.0.0',
    title: 'Support API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
})

app.get('/api', Scalar({ url: '/spec' }))

app.openapi(askRoute, askHandler)

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('Server is running on http://localhost:3000')