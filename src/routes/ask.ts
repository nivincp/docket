import { z } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

export type AppOpenAPI = OpenAPIHono;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R>;

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

const AskSchema = z.object({
    question: z.string().openapi({ example: "What is your name?" }),
})

const AnswerSchema = z.object({
    answer: z.string().openapi({ example: "I am Llama 3.2" }),
}).openapi("Answer")


export const askRoute = createRoute({
    method: 'post',
    path: '/ask',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: AskSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'The answer to the question',
            content: {
                'application/json': {
                    schema: AnswerSchema,
                },
            },
        },
    },
})

export const askHandler: AppRouteHandler<typeof askRoute> = async (c) => {
    const { question } = await c.req.valid('json')


    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama3.2",
            prompt: question,
            stream: false,
        }),
    });

    const result = await res.json();
    return c.json({ answer: result.response });
}