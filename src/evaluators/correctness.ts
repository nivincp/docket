import { CorrectnessEvaluator, Settings } from 'llamaindex'
import { Ollama } from '@llamaindex/ollama'
import { questions } from '@/mocks'
import { config } from '@/lib'
import { query } from '@/lib/query'

Settings.llm = new Ollama({
  model: config.models.llm,
  config: { host: config.models.llmEndpoint },
})

async function main() {
  const {
    provider,
    types: { basicFactRetrieval, paraphrased, feesAndEdgeCases, ambiguousOrIncomplete },
  } = questions

  // Combine all question types
  const allQuestions = [
    ...basicFactRetrieval,
    ...paraphrased,
    ...feesAndEdgeCases,
    ...ambiguousOrIncomplete,
  ]

  const evaluator = new CorrectnessEvaluator()
  const results = []

  console.log(`Evaluating ${allQuestions.length} questions...\n`)

  for (let i = 0; i < allQuestions.length; i++) {
    const { question, response: expectedResponse } = allQuestions[i]

    console.log(`Question ${i + 1}/${allQuestions.length}: ${question}`)

    // Generate actual response using your query pipeline
    const queryResult = await query({ queryText: `${provider} - ${question}`, dockerHost: true })

    if (!queryResult?.llmResponse?.output) {
      console.log('No response generated from query pipeline\n')
      results.push({
        question,
        passed: false,
        score: 0,
        reason: 'No response generated',
      })
      continue
    }

    // For correctness evaluation, we can use a custom approach
    // Since CorrectnessEvaluator doesn't directly accept expected answers,
    // let's create a custom evaluation prompt
    const evaluationPrompt = `
Query: ${provider} - ${question}
Expected Answer: ${expectedResponse}
Actual Answer: ${queryResult.llmResponse.output}

Please evaluate if the actual answer is correct and relevant to the query compared to the expected answer. 
Rate from 0-1 where 1 is completely correct and 0 is completely incorrect.
`

    const result = await evaluator.evaluateResponse({
      query: evaluationPrompt,
      response: {
        message: { content: queryResult.llmResponse.output, role: 'assistant' },
        sourceNodes: [],
        metadata: {
          citations: queryResult.citations,
          expectedResponse,
        },
        raw: { text: queryResult.llmResponse.output },
        stream: false,
        response: queryResult.llmResponse.output,
        delta: '',
      },
    })

    console.log('Expected Response:', expectedResponse)
    console.log('Actual Response:', queryResult.llmResponse.output)
    console.log(`Result: ${result.passing ? 'PASS' : 'FAIL'} (Score: ${result.score})\n`)

    results.push({
      question,
      expected: expectedResponse,
      actual: queryResult.llmResponse.output,
      passed: result.passing,
      score: result.score,
      citations: queryResult.citations?.length || 0,
    })
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length

  console.log('=== EVALUATION SUMMARY ===')
  console.log(`Total questions: ${results.length}`)
  console.log(
    `Passed: ${passedCount}/${results.length} (${((passedCount / results.length) * 100).toFixed(1)}%)`
  )
  console.log(`Average score: ${avgScore.toFixed(3)}`)
  console.log(
    `Average citations per response: ${(results.reduce((sum, r) => sum + (r.citations || 0), 0) / results.length).toFixed(1)}`
  )
}

void main()
