import { Hono } from "hono";

const OLLAMA_URL = process.env.OLLAMA_URL

const ask = new Hono();

ask.post("/", async (c) => {
    const { question } = await c.req.json();

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
});

export { ask };