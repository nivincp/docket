## Scope

# Take-Home Challenge: Problem Statement

## Background

You’ve joined an early-stage team working on a next-generation **B2B support platform**. The vision:  
Leverage **Generative AI** to deliver faster, more accurate, and context-aware answers to customer and internal support questions.

The market is **crowded**, expectations are **high**, and you need to move **fast** while laying the right foundations for growth.

## Your Challenge

Imagine it’s your **first week**. You’ve been asked to demonstrate—by shipping a **working prototype**—how you would approach delivering a **core question-answering experience** that sets the groundwork for a **reliable**, **scalable**, and **continually improving product**.

### Primary Goal

Deliver a **minimum viable solution (MVP)** that allows a **user to ask a question** and **receive a helpful, trustworthy answer**, with **clarity on where the answer came from**.

## Considerations & Constraints

- You have **~8 hours** of focused work.
- Access to a small “seed” set of reference documents (e.g., FAQs, manuals, policies).
- You must demo to **non-technical stakeholders**, not just engineers.
- No requirements doc or spec — you must:
  - Clarify ambiguities and document key assumptions.
  - Break down the problem into actionable parts.
  - Balance **speed** and **foresight**.
  - Demonstrate how you would **measure**, **iterate**, and **collaborate**.

## Deliverables

1. **Working MVP**
   - Show a working flow where users can ask a question and get an answer.
   - Be explicit about what’s **real vs stubbed**, and **why**.

2. **Approach Summary**
   - How you understood and broke down the problem.
   - Key choices and your rationale.
   - How you measured/validated the result.
   - How you’d iterate and improve it.

3. **High-Level Architecture & Roadmap**
   - What needs to change to **scale**, **build trust**, **control costs**, and support **continuous improvement**?
   - Identify **key risks** and how you’d mitigate them (both product & system level).
   - How would you **collaborate** with teammates (junior devs, PMs, designers) to go faster?

4. **Short Reflection**
   - If given **another week**, what would you prioritize next?
   - How would you measure **success with real users**?

## Tools & Workflow

You can use **any tools**, **languages**, or **workflows** you prefer.  
Focus on:

- Clarity of thought
- Sound structure
- Practical decisions

**Polish is less important** than being thoughtful and resourceful.

## What We’re Looking For

- Can you **turn ambiguity** into **valuable execution**?
- Do you show **ownership**, **product thinking**, and **technical judgment**?
- Are you thoughtful about **risks**, **validation**, and **iteration**?
- Can you **communicate** your approach clearly and concisely?
- Do you **enable others** in a high-agency, high-ambiguity environment?

## Need Help?

If you need a sample document set or have any questions, just ask!  
Part of the challenge is **framing the right questions** and making **smart assumptions**.

# Clarifying Questions & Answers

## 1. Who’s the main user here?

**Primary user:** Support agents at B2B companies  
**Context:**  
They use this tool to quickly answer customer queries via **chat**, **email**, or **phone**.

In later stages, it may expand to end customers, but for now, **design for internal support agent workflows**.

## 2. What kind of questions should it handle?

Focus on:

- FAQs
- Product “how-tos”
- Policy-related queries  
  (from internal docs, knowledge bases, SOPs)

Not for:

- Long-form research
- Troubleshooting logs
- Code-level debugging (yet)

## 3. How accurate do answers need to be?

Target: "**Mostly right** with **clear sources**"

For MVP:

- Occasional misses are okay **as long as sources/citations are shown**
- Avoid hallucinated or made-up information
- If no relevant info, **say so clearly**

## 4. What makes an answer feel trustworthy?

- Clear **citations**: doc titles + section headers or line numbers
- Optional but helpful:
  - Confidence scores
  - Short rationale (`e.g., found in doc X, section Y`)
- Bonus:
  - Highlight matched text
  - Include relevant snippets

## 5. Any sample docs I could use to test with?

Yes

Use **public company** support content in:

- Markdown
- PDF
- HTML

Examples: Slack, AWS, Notion, Stripe product FAQs

> No need to spend time on ETL — structure can be simple.

## 6. Are docs static for now, or should I think about user uploads?

**Static for now**  
Assume a **small set (10–50 docs)** loaded at startup or from disk.

Bonus:  
Briefly outline how you’d support **uploads/updates** in the future.

## 7. Can I assume everything’s in English?

Yes
Only **English** is in scope for this take-home.

## 8. Any limits on using APIs like OpenAI or Pinecone?

No hard limits
You can use:

- OpenAI
- Cohere
- Pinecone
- Weaviate
- Any cloud/vector API

If needed:

- Mock paid APIs
- Explain your setup

You’re not expected to deploy live or incur cost, but the prototype should **demonstrate scalability**.

## 9. What would a successful demo look like?

A simple curl or UI request that:

- Accepts a **product or policy question**
- Returns a **relevant answer**
- Includes a **citation to the original doc/section**

The answer should be **"good enough to help a human agent"**, not perfect.

Bonus:

- Evaluation scripts
- A `README.md`
- Partial test coverage
