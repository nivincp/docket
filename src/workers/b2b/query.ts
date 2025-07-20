import { query } from '@/lib'
import { questions } from '@/mocks'

const {
  provider,
  types: { basicFactRetrieval, paraphrased, feesAndEdgeCases, ambiguousOrIncomplete },
} = questions

async function main() {
  const { question, expectedAnswerContains } = feesAndEdgeCases[1]

  const queryTrace = await query({ queryText: `${provider} - ${question}` })

  console.dir(queryTrace, { depth: null })
  console.log('Expected to find:', expectedAnswerContains)
}

void main()
