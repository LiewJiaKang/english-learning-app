import { NextResponse } from "next/server"
import { CohereClientV2 } from "cohere-ai"

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY!,
})

const ESSAY_TYPES = ["Narrative", "Review", "Report", "Article"] as const

const LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Secondary School",
  "SPM",
] as const

type EssayType = (typeof ESSAY_TYPES)[number]

function buildPrompt(
  essayType: EssayType,
  title: string,
  theme: string,
  level: string,
  length: number
): string {
  const base = `Write an approximately ${length}-word ${essayType} essay at ${level} level.

Title: ${title}
Theme: ${theme || "No specific theme provided."}

Return ONLY a valid JSON object in this exact shape:

{
  "paragraphs": [
    "First paragraph...",
    "Second paragraph..."
  ]
}

Do not include:
- Markdown
- Code fences
- Explanations
- A title inside the paragraphs
- Any text outside the JSON object

Paragraph structure requirements:

`

  const prompts: Record<EssayType, string> = {
    Narrative:
      base +
      `Follow these requirements:
- Begin by "freezing the moment" and vividly describing the current situation.
- Include no more than 2-3 main characters.
- Begin with description before moving into the main conflict.
- Include one clear central conflict.
- Resolve the conflict within one week in the story.
- Use descriptive language.
- Use varied sentence structures.
- Maintain a clear beginning, development, climax, and resolution.
- The number of paragraphs may vary as needed.`,

    Review:
      base +
      `Write EXACTLY 4 paragraphs in this order:

1. Introduction
Introduce the subject being reviewed and give an overall impression.

2. Pros
Discuss the strengths with specific examples.
Keep all strengths in this single paragraph.

3. Cons
Discuss the weaknesses with specific examples.
Keep all weaknesses in this single paragraph.

4. Conclusion
Summarise the review and give a clear recommendation.

Use engaging but balanced language.`,

    Report:
      base +
      `Write EXACTLY 4 paragraphs in this order:

1. Introduction
State the purpose of the report and what it covers.

2. Findings / Description
Present the important facts, information, observations, or findings.

3. Recommendations
Suggest realistic improvements or future actions.

4. Conclusion
Summarise the main findings and state the overall outcome.

Use:
- Factual and impersonal language
- Formal vocabulary appropriate to the requested level
- Linking words and sentence connectors

Each paragraph must be one continuous block of text.`,

    Article:
      base +
      `Write EXACTLY 5 paragraphs in this order:

1. Introduction
Hook the reader and briefly introduce the main points.
You may include one engaging question, but avoid excessive rhetorical questions.

2. Body paragraph 1
Include a clear topic sentence and at least four supporting details, examples, or explanations.

3. Body paragraph 2
Include a clear topic sentence and at least four supporting details, examples, or explanations.

4. Body paragraph 3
Include a clear topic sentence and at least four supporting details, examples, or explanations.

5. Conclusion
Summarise the main ideas and end with a suitable thought, recommendation, or suggestion.

Use clear sentence connectors and varied sentence structures.`,
  }

  return prompts[essayType]
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

function parseParagraphs(rawText: string): string[] {
  try {
    const jsonString = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim()

    const parsed: unknown = JSON.parse(jsonString)

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("paragraphs" in parsed)
    ) {
      throw new Error("Missing paragraphs property")
    }

    const paragraphs = (parsed as { paragraphs: unknown }).paragraphs

    if (
      !Array.isArray(paragraphs) ||
      !paragraphs.every((paragraph) => typeof paragraph === "string")
    ) {
      throw new Error("Paragraphs must be an array of strings")
    }

    const cleaned = paragraphs
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)

    if (cleaned.length === 0) {
      throw new Error("No valid paragraphs returned")
    }

    return cleaned
  } catch {
    console.warn(
      "Cohere response was not valid JSON. Falling back to plain text parsing."
    )

    // Remove possible JSON / Markdown junk before splitting
    const cleanedText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .replace(/^\s*\{\s*"paragraphs"\s*:\s*\[\s*/i, "")
      .replace(/\s*\]\s*\}\s*$/, "")
      .trim()

    return cleanedText
      .split(/\n\s*\n/)
      .map((paragraph) =>
        paragraph
          .trim()
          .replace(/^["']|["'],?$/g, "")
          .trim()
      )
      .filter(Boolean)
  }
}

export async function POST(req: Request) {
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

    const { title, theme, level, essayType, length } = body as {
      title?: unknown
      theme?: unknown
      level?: unknown
      essayType?: unknown
      length?: unknown
    }

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 })
    }

    if (
      typeof essayType !== "string" ||
      !ESSAY_TYPES.includes(essayType as EssayType)
    ) {
      return NextResponse.json(
        { error: "Invalid essay type." },
        { status: 400 }
      )
    }

    if (typeof level !== "string" || !level.trim()) {
      return NextResponse.json({ error: "Level is required." }, { status: 400 })
    }

    /*
     * Uncomment this if your frontend uses a fixed list of levels:
     *
     * if (!LEVELS.includes(level as (typeof LEVELS)[number])) {
     *   return NextResponse.json(
     *     { error: "Invalid level." },
     *     { status: 400 }
     *   )
     * }
     */

    const cleanTitle = title.trim().slice(0, 200)

    const cleanTheme =
      typeof theme === "string" ? theme.trim().slice(0, 1000) : ""

    const parsedLength =
      typeof length === "number"
        ? length
        : Number.parseInt(String(length ?? ""), 10)

    const wordCount = Number.isFinite(parsedLength)
      ? Math.min(Math.max(Math.round(parsedLength), 100), 1000)
      : 300

    const userPrompt = buildPrompt(
      essayType as EssayType,
      cleanTitle,
      cleanTheme,
      level.trim(),
      wordCount
    )

    const response = await cohere.chat({
      model: "command-a-03-2025",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an English essay-writing assistant for Malaysian secondary-school students. Use standard British English, vocabulary appropriate to the requested level, and the requested essay structure. Always return valid JSON containing only a paragraphs array.",
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
        { error: "The model returned an empty response." },
        { status: 502 }
      )
    }

    const paragraphs = parseParagraphs(rawText)

    if (paragraphs.length === 0) {
      console.error("No essay paragraphs could be extracted")

      return NextResponse.json(
        { error: "Failed to parse generated essay." },
        { status: 502 }
      )
    }

    const essayBlob = [cleanTitle, ...paragraphs].join("\n\n")

    return NextResponse.json({
      result: essayBlob,
    })
  } catch (error) {
    console.error("Cohere Error:", error)

    return NextResponse.json(
      { error: "Failed to generate essay." },
      { status: 500 }
    )
  }
}
