import { NextRequest, NextResponse } from "next/server"
import { fetchDictionaryWord } from "cambridge-dictionary-api"

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word")

  if (!word) {
    return NextResponse.json(
      { error: "Missing word parameter" },
      { status: 400 }
    )
  }

  try {
    const rawData = await fetchDictionaryWord(word)

    if (!rawData) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 })
    }

    return NextResponse.json(rawData)
  } catch (error) {
    console.error("Dictionary API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
