export const questions = {
  provider: 'Nescafe',
  types: {
    basicFactRetrieval: [
      {
        question: 'Why did Nestlé change the webshop delivery policy?',
        expectedAnswerContains: [
          'ensure we can provide a great level of service',
          'minimize cases where no one is there',
        ],
      },
      {
        question: 'How do I choose my delivery date?',
        expectedAnswerContains: ['SMS and email alert', 'URL link', 'range of dates'],
      },
    ],
    paraphrased: [
      {
        question: 'Can I pick a specific day and time for delivery now?',
        expectedAnswerContains: ['preferred delivery date', 'between 9am – 6pm'],
      },
      {
        question: 'What if no one is home when the delivery comes?',
        expectedAnswerContains: ['re-delivery', 'missed delivery', 'SMS alert'],
      },
    ],
    feesAndEdgeCases: [
      {
        question: 'What’s the redelivery fee if I miss the first attempt?',
        expectedAnswerContains: ['$17.20', 'reschedule', 'web platform'],
      },
      {
        question: 'Why do I still have to pay if my order was above $80?',
        expectedAnswerContains: [
          'free first delivery',
          'additional fees',
          'handling and fuel costs',
        ],
      },
    ],
    ambiguousOrIncomplete: [
      {
        question: 'What’s the deal with address changes?',
        expectedAnswerContains: ['small fee', 'change the optimal delivery route'],
      },
      {
        question: 'Can I collect my order myself instead of paying again?',
        expectedAnswerContains: ['self-collection', 'Henderson Road', 'booking platform'],
      },
    ],
  },
}
