import { query } from '@/lib'
import { questions } from '@/mocks'

const {
  provider,
  types: { basic_fact_retrieval, paraphrased, fees_and_edge_cases, ambiguous_or_incomplete },
} = questions

async function main() {
  const queryTrace = await query({
    queryText: `${provider} - ${basic_fact_retrieval[1].question}`,
  })
  console.dir(queryTrace, { depth: null })
}

void main()
