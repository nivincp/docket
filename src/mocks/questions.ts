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
        response:
          'Nestlé updated the webshop delivery policy to ensure we can provide a great level of service and minimize cases where no one is there to receive the delivery.',
      },
      {
        question: 'How do I choose my delivery date?',
        expectedAnswerContains: ['SMS and email alert', 'URL link', 'range of dates'],
        response:
          "You'll receive an SMS and email alert with a URL link that lets you choose from a range of available delivery dates.",
      },
    ],
    paraphrased: [
      {
        question: 'Can I pick a specific day and time for delivery now?',
        expectedAnswerContains: ['preferred delivery date', 'between 9am – 6pm'],
        response:
          'Yes, you can now select a preferred delivery date, with deliveries typically made between 9am – 6pm.',
      },
      {
        question: 'What if no one is home when the delivery comes?',
        expectedAnswerContains: ['re-delivery', 'missed delivery', 'SMS alert'],
        response:
          "If no one is home, you'll receive an SMS alert and can arrange for a re-delivery following the missed delivery attempt.",
      },
    ],
    feesAndEdgeCases: [
      {
        question: "What's the redelivery fee if I miss the first attempt?",
        expectedAnswerContains: ['$17.20', 'reschedule', 'web platform'],
        response:
          'If you miss the first delivery attempt, a redelivery fee of $17.20 applies. You can reschedule it via the web platform.',
      },
      {
        question: 'Why do I still have to pay if my order was above $80?',
        expectedAnswerContains: [
          'free first delivery',
          'additional fees',
          'handling and fuel costs',
        ],
        response:
          'Orders above $80 are eligible for free first delivery, but additional fees may apply due to handling and fuel costs.',
      },
    ],
    ambiguousOrIncomplete: [
      {
        question: "What's the deal with address changes?",
        expectedAnswerContains: ['small fee', 'change the optimal delivery route'],
        response:
          'Changing your address may incur a small fee, as it could affect the optimal delivery route.',
      },
      {
        question: 'Can I collect my order myself instead of paying again?',
        expectedAnswerContains: ['self-collection', 'Henderson Road', 'booking platform'],
        response:
          'Yes, self-collection is available at Henderson Road and can be arranged through the booking platform.',
      },
    ],
  },
}
