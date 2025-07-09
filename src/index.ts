import 'dotenv/config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { ingest } from './lib'

const app = new Hono()

// ingest();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
