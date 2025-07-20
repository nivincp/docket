export const questions = {
  provider: 'Nescafe',
  types: {
    basic_fact_retrieval: [
      {
        question: 'Why did Nestlé change the webshop delivery policy?',
        expected_answer_contains: [
          'ensure we can provide a great level of service',
          'minimize cases where no one is there',
        ],
      },
      {
        question: 'How do I choose my delivery date?',
        expected_answer_contains: ['SMS and email alert', 'URL link', 'range of dates'],
      },
    ],
    paraphrased: [
      {
        question: 'Can I pick a specific day and time for delivery now?',
        expected_answer_contains: ['preferred delivery date', 'between 9am – 6pm'],
      },
      {
        question: 'What if no one is home when the delivery comes?',
        expected_answer_contains: ['re-delivery', 'missed delivery', 'SMS alert'],
      },
    ],
    fees_and_edge_cases: [
      {
        question: 'What’s the redelivery fee if I miss the first attempt?',
        expected_answer_contains: ['$17.20', 'reschedule', 'web platform'],
      },
      {
        question: 'Why do I still have to pay if my order was above $80?',
        expected_answer_contains: [
          'free first delivery',
          'additional fees',
          'handling and fuel costs',
        ],
      },
    ],
    ambiguous_or_incomplete: [
      {
        question: 'What’s the deal with address changes?',
        expected_answer_contains: ['small fee', 'change the optimal delivery route'],
      },
      {
        question: 'Can I collect my order myself instead of paying again?',
        expected_answer_contains: ['self-collection', 'Henderson Road', 'booking platform'],
      },
    ],
  },
}
