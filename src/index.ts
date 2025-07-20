import { OpenAPIHono } from '@hono/zod-openapi'
import { serve } from '@hono/node-server'
import { askRoute, askHandler } from './routes'
import { Scalar } from '@scalar/hono-api-reference'

const app = new OpenAPIHono()
const title = 'Support API'

app.doc31('/spec', {
  openapi: '3.1.1',
  info: {
    version: '1.0.0',
    title,
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
})

app.get('/', (c) => {
  return c.text('Welcome to the Support API! Visit /docs for the OpenAPI spec.')
})

app.get('/docs', Scalar({ theme: 'saturn', url: '/spec', pageTitle: title }))

app.openapi(askRoute, askHandler)

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('Server is running on http://localhost:3000')
