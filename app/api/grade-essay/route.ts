import { NextRequest, NextResponse } from "next/server"
import { CohereClientV2 } from "cohere-ai"

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY!,
})

const VALID_PARTS = ["1", "2", "3"] as const

type Part = (typeof VALID_PARTS)[number]

function buildGradingPrompt(essay: string, prompt: string, part: Part): string {
  const baseInstruction = `
You are an experienced SPM English examiner.

Evaluate the following essay using FOUR criteria. Each criterion must receive a score from 0 to 5.

The four criteria are:

1. Content (0-5)
[One point per content/elaboration]
Did the candidate answer all parts of the question?
Is the answer relevant?
Is the reader fully informed?
Did the candidate give enough information?
Did the candidate misunderstand the task?

2. Communicative Achievement (0-5)
Is the correct format used?
Is the tone suitable?
Is the writing formal or informal when needed?
Is the style suitable for the reader?
Does the writing keep the reader interested?
Are all purposes of the task archived?

3. Language (0-5)
Is the vocabulary suitable?
Is there a range orf vocabulary?
Are the grammar structures simple or complex?
Are the words and grammar used correctly?
Do errors affect meaning?

4. Organisation (0-5)
Are the ideas clear?
Are the ideas in a good order?
Are paragraphs used properly?
Are linking words used?
Is the writing easy to follow?

Examiners must choose the mark that best matches the candidate's writing. Do not focus on only one small mistake.
Candidates must be consistent in English style (British/American).
Length is not directly marked.
If the answer is too short, it may not have enough content or language, if the answer is too long, it may go off topic or become confusing.
Be fair and realistic. Do not award marks simply because the essay sounds sophisticated.
Consider the expected CEFR level and task requirements for the specified SPM part.
`

  const partSpecific: Record<Part, string> = {
    "1": `
SPM PART 1 — SHORT COMMUNICATIVE MESSAGE / EMAIL

Expected CEFR level: A2-B1
Expected length: approximately 80 words

Focus on:
- Directly addressing all points in the prompt
- Clear and simple communication
- Appropriate friendly or informal register
- Relevant details
- Basic but accurate language
`,

    "2": `
SPM PART 2 — GUIDED WRITING

Expected CEFR level: B1
Expected length: 125-150 words

Focus on:
- Addressing the task fully
- Developing ideas with reasons and examples
- Clear paragraphing, variety of cohesive devices
- Appropriate register
- Connected and understandable writing
- Use a range of everyday vocabulary with occasional use of less common lexis.
`,

    "3": `
SPM PART 3 — EXTENDED WRITING

Expected CEFR level: B2
Expected length: 200-250 words

Focus on:
- Fully addressing the task
- Developing ideas systematically
- Clear and detailed explanations or arguments
- Appropriate tone, style, and register
- Varied and accurate language
- Effective organisation and cohesion
- Use a range of vocabulary including less common lexis.
`,
  }

  return `
${baseInstruction}

${partSpecific[part]}

ESSAY PROMPT:
${prompt || "No prompt provided."}

ESSAY:
${essay}

Return ONLY valid JSON using exactly this structure:

{
  "criteriaScores": {
    "content": 0,
    "communicativeAchievement": 0,
    "language": 0,
    "organisation": 0
  },
  "strengths": [
    "string"
  ],
  "weaknesses": [
    "string"
  ],
  "grammarErrors": [
    "string"
  ],
  "vocabularySuggestions": [
    "string"
  ],
  "overallFeedback": "string"
}

Important:
- Each criterion score MUST be an integer from 0 to 5.
- Do NOT include a total score. The application will calculate it.
- Do NOT include markdown.
- Do NOT include code fences.
- Do NOT include explanations outside the JSON object.
- Grammar errors should only identify genuine errors.
- Vocabulary suggestions should be useful and appropriate for the student's level.
- Feedback should be constructive rather than unnecessarily harsh.
`
}

function extractText(content: unknown): string {
  if (!Array.isArray(content)) {
    return ""
  }

  return content
    .filter(
      (
        item
      ): item is {
        type: "text"
        text: string
      } =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        "text" in item &&
        item.type === "text" &&
        typeof item.text === "string"
    )
    .map((item) => item.text)
    .join("")
    .trim()
}

function parseAIResponse(rawText: string) {
  const jsonString = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim()

  const parsed: unknown = JSON.parse(jsonString)

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("criteriaScores" in parsed)
  ) {
    throw new Error("Missing criteriaScores")
  }

  const result = parsed as {
    criteriaScores: unknown
    strengths?: unknown
    weaknesses?: unknown
    grammarErrors?: unknown
    vocabularySuggestions?: unknown
    overallFeedback?: unknown
  }

  if (
    typeof result.criteriaScores !== "object" ||
    result.criteriaScores === null
  ) {
    throw new Error("Invalid criteriaScores")
  }

  const scores = result.criteriaScores as Record<string, unknown>

  const scoreKeys = [
    "content",
    "communicativeAchievement",
    "language",
    "organisation",
  ]

  for (const key of scoreKeys) {
    const value = scores[key]

    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 5
    ) {
      throw new Error(`Invalid ${key} score`)
    }
  }

  const ensureStringArray = (value: unknown, field: string): string[] => {
    if (value === undefined) {
      return []
    }

    if (
      !Array.isArray(value) ||
      !value.every((item) => typeof item === "string")
    ) {
      throw new Error(`Invalid ${field}`)
    }

    return value.map((item) => item.trim()).filter(Boolean)
  }

  if (
    result.overallFeedback !== undefined &&
    typeof result.overallFeedback !== "string"
  ) {
    throw new Error("Invalid overallFeedback")
  }

  return {
    criteriaScores: {
      content: scores.content as number,
      communicativeAchievement: scores.communicativeAchievement as number,
      language: scores.language as number,
      organisation: scores.organisation as number,
    },
    strengths: ensureStringArray(result.strengths, "strengths"),
    weaknesses: ensureStringArray(result.weaknesses, "weaknesses"),
    grammarErrors: ensureStringArray(result.grammarErrors, "grammarErrors"),
    vocabularySuggestions: ensureStringArray(
      result.vocabularySuggestions,
      "vocabularySuggestions"
    ),
    overallFeedback:
      typeof result.overallFeedback === "string"
        ? result.overallFeedback.trim()
        : "",
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.COHERE_API_KEY) {
      console.error("COHERE_API_KEY is not configured")

      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      )
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const { essay, prompt, part } = body as {
      essay?: unknown
      prompt?: unknown
      part?: unknown
    }

    if (typeof essay !== "string" || essay.trim().length < 50) {
      return NextResponse.json(
        { error: "Essay must be at least 50 characters." },
        { status: 400 }
      )
    }

    if (typeof part !== "string" || !VALID_PARTS.includes(part as Part)) {
      return NextResponse.json({ error: "Invalid SPM part." }, { status: 400 })
    }

    if (prompt !== undefined && typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt." }, { status: 400 })
    }

    const cleanEssay = essay.trim().slice(0, 15000)
    const cleanPrompt =
      typeof prompt === "string" ? prompt.trim().slice(0, 3000) : ""

    const userPrompt = buildGradingPrompt(cleanEssay, cleanPrompt, part as Part)

    const response = await cohere.chat({
      model: "command-a-03-2025",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an experienced SPM English examiner. Provide fair, consistent, constructive feedback. Follow the requested JSON format exactly.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const rawText = extractText(response.message.content)

    if (!rawText) {
      console.error("Cohere returned an empty response")

      return NextResponse.json(
        { error: "The grading model returned an empty response." },
        { status: 502 }
      )
    }

    let result

    try {
      result = parseAIResponse(rawText)
    } catch (error) {
      console.error("Failed to parse Cohere response:", error)

      return NextResponse.json(
        { error: "Failed to parse AI grading response." },
        { status: 502 }
      )
    }

    // Calculate the total ourselves rather than trusting the model.
    const score =
      result.criteriaScores.content +
      result.criteriaScores.communicativeAchievement +
      result.criteriaScores.language +
      result.criteriaScores.organisation

    return NextResponse.json({
      ...result,
      score,
    })
  } catch (error) {
    console.error("Cohere Grading Error:", error)

    return NextResponse.json(
      { error: "Failed to grade essay." },
      { status: 500 }
    )
  }
}
