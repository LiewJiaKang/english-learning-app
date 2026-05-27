import { NextResponse } from "next/server"
import { CohereClientV2 } from "cohere-ai"

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY!,
})

function buildPrompt(
  essayType: string,
  title: string,
  theme: string,
  level: string,
  length: number
): string {
  const base = `Write a ${length}-word ${essayType} essay at ${level} level.
Title: ${title}
Theme: ${theme}

IMPORTANT: Return your response as a JSON object with a "paragraphs" array containing the essay paragraphs as strings.
Example format: { "paragraphs": ["First paragraph...", "Second paragraph...", ...] }
Do not include any other text, markdown, or explanations outside the JSON object.

Paragraph structure requirements:

`

  const prompts: Record<string, string> = {
    Narrative:
      base +
      `Follow these requirements:
- Begin by "freezing the moment": describe the current situation vividly.
- Describe the main character(s) (2-3 characters max).
- Start with description, then enter the imagination/conflict.
- Include a single conflict.
- Resolve the conflict within one week in the story.

Use descriptive language and varied sentences. The number of paragraphs can vary, but ensure all elements are covered.`,

    Review:
      base +
      `Write EXACTLY 4 paragraphs in this order:
1. Introduction: introduce the subject and your overall impression.
2. Pros: discuss strengths with specific examples. (one paragraph only)
3. Cons: discuss weaknesses with specific examples. (one paragraph only)
4. Conclusion: summarise and give a recommendation.`,

    Report:
      base +
      `Write EXACTLY 4 paragraphs in this order:
1. Introduction: state the purpose of the report and what it covers.
2. Findings/Description: present key information, facts, or observations.
3. Recommendations: suggest improvements or future actions.
4. Conclusion: summarise main points and overall outcome.

Use factual, impersonal language and linking words. Each paragraph should be a single block of text.`,

    Article:
      base +
      `Write EXACTLY 5 paragraphs in this order:
1. Introduction: hook the reader and outline main points.
2. Body paragraph 1: clear topic sentence + at least four supporting details/examples.
3. Body paragraph 2: clear topic sentence + at least four supporting details/examples.
4. Body paragraph 3: clear topic sentence + at least four supporting details/examples.
5. Conclusion: summarise main points and end with a thought or suggestion.

Include minimal questions in the first paragraph of the article to engage the reader. Use sentence connectors.`,
  }

  return (
    prompts[essayType] ||
    base +
      "Write in full paragraphs with a clear title, varied sentences, and descriptive language."
  )
}

export async function POST(req: Request) {
  try {
    const { title, theme, level, essayType, length } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 })
    }

    const wordCount = parseInt(length) || 300
    const userPrompt = buildPrompt(essayType, title, theme, level, wordCount)

    const response = await cohere.chat({
      model: "command-a-03-2025",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an essay writer in Malaysia who writes clearly, engagingly, and with proper structure. You always output valid JSON as requested.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const rawText =
      response.message.content?.[0]?.type === "text"
        ? response.message.content[0].text
        : ""

    // Attempt to parse JSON from the response
    let paragraphs: string[] = []
    try {
      // Strip any markdown code block fences
      const jsonStr = rawText.replace(/```json\s*|\s*```/g, "").trim()
      const parsed = JSON.parse(jsonStr)
      if (parsed.paragraphs && Array.isArray(parsed.paragraphs)) {
        paragraphs = parsed.paragraphs
      } else {
        throw new Error("Invalid JSON structure")
      }
    } catch (e) {
      // Fallback: split by double newlines
      console.warn("JSON parsing failed, falling back to plain text splitting")
      paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    }

    // Build the final essay blob: title first, then paragraphs separated by double newlines
    const essayBlob = [title, ...paragraphs].join("\n\n")

    return NextResponse.json({ result: essayBlob })
  } catch (error) {
    console.error("Cohere Error:", error)
    return NextResponse.json(
      { error: "Failed to generate essay." },
      { status: 500 }
    )
  }
}
