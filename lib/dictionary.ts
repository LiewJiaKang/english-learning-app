export interface IDefinition {
  definition: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
}

export interface IMeaning {
  partOfSpeech: string
  definitions: IDefinition[]
}

export interface IWord {
  word: string
  phonetic?: string
  phonetics?: {
    text?: string
    audio?: string
  }[]
  meanings: IMeaning[]
}

// ---------- TYPES FOR CAMBRIDGE API ----------

interface CambridgeDialect {
  audio: string
  phonetic: string
}

interface CambridgeDefinition {
  definition: string
  partOfSpeech: string
  level?: string // e.g., "A1", "B2", "C1" – optional
  examples: string[]
  synonyms?: string[] // optional if not present in the actual response
  antonyms?: string[] // optional if not present
}

// The actual response from your /api/dictionary endpoint (Cambridge format)
export interface CambridgeApiResponse {
  word: string
  dialects: {
    us: CambridgeDialect
    uk: CambridgeDialect
  }
  definitions: CambridgeDefinition[]
  derivedForms?: Record<string, string[]> // optional, e.g., { noun: ["abandonment"] }
}

// ----- Global cache -----
const wordCache = new Map<string, IWord | null>()

export async function fetchWord(word: string): Promise<IWord | null> {
  if (wordCache.has(word) && wordCache.get(word) !== null) {
    return wordCache.get(word)!
  }

  let cambridgePhonetics: { text?: string; audio?: string }[] | undefined
  let cambridgeRawData: CambridgeApiResponse

  try {
    const response = await fetch(
      `/api/dictionary?word=${encodeURIComponent(word)}`
    )
    if (response.ok) {
      cambridgeRawData = await response.json()
      if (cambridgeRawData?.dialects) {
        cambridgePhonetics = []
        if (cambridgeRawData.dialects.uk) {
          cambridgePhonetics.push({
            text: cambridgeRawData.dialects.uk.phonetic || undefined,
            audio: cambridgeRawData.dialects.uk.audio || undefined,
          })
        }
        if (cambridgeRawData.dialects.us) {
          cambridgePhonetics.push({
            text: cambridgeRawData.dialects.us.phonetic || undefined,
            audio: cambridgeRawData.dialects.us.audio || undefined,
          })
        }
      }

      if (
        cambridgeRawData?.definitions &&
        Array.isArray(cambridgeRawData.definitions) &&
        cambridgeRawData.definitions.length > 0
      ) {
        const result = transformCambridgeToOldShape(cambridgeRawData)
        wordCache.set(word, result)
        return result
      }
    }
  } catch (error) {
    console.warn("Cambridge API error, falling back to FreeDictionary:", error)
  }

  try {
    const fallbackResponse = await fetch(
      `https://freedictionaryapi.com/api/v1/entries/en/${word}`
    )

    if (!fallbackResponse.ok) {
      wordCache.set(word, null)
      return null
    }

    const freeData = await fallbackResponse.json()
    const result = transformFreeToOldShape(freeData)

    if (result && cambridgePhonetics && cambridgePhonetics.length > 0) {
      result.phonetics = cambridgePhonetics
      result.phonetic = cambridgePhonetics[0]?.text || result.phonetic
    }

    wordCache.set(word, result)
    return result
  } catch (error) {
    console.error("Both Cambridge and FreeDictionary failed:", error)
    wordCache.set(word, null)
    const placeholder: IWord = {
      word,
      meanings: [
        {
          partOfSpeech: "unknown",
          definitions: [
            {
              definition: "Definition unavailable. Please try again later.",
              example: undefined,
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
    }
    // Optionally keep any phonetics we already fetched (though unlikely)
    if (cambridgePhonetics && cambridgePhonetics.length > 0) {
      placeholder.phonetics = cambridgePhonetics
      placeholder.phonetic = cambridgePhonetics[0]?.text
    }
    wordCache.set(word, placeholder)
    return placeholder
  }
}

// ---------- TYPES FOR FREEDICTIONARY API ----------
interface FreePronunciation {
  type: string
  text: string
  tags?: string[]
}

interface FreeSense {
  definition: string
  tags?: string[]
  examples?: string[]
  quotes?: { text: string; reference: string }[]
  synonyms?: string[]
  antonyms?: string[]
  translations?: { language: { code: string; name: string }; word: string }[]
  subsenses?: FreeSense[]
}

interface FreeEntry {
  language: { code: string; name: string }
  partOfSpeech: string
  pronunciations?: FreePronunciation[]
  forms?: { word: string; tags: string[] }[]
  senses?: FreeSense[]
  synonyms?: string[]
  antonyms?: string[]
}

interface FreeApiResponse {
  word: string
  entries: FreeEntry[]
  source: { url: string; license: { name: string; url: string } }
}

// ---------- TRANSFORMER FOR CAMBRIDGE (existing) ----------
function transformCambridgeToOldShape(
  rawData: CambridgeApiResponse
): IWord | null {
  if (!rawData || !rawData.word) return null

  const phonetics: { text?: string; audio?: string }[] = []
  if (rawData.dialects) {
    if (rawData.dialects.us) {
      phonetics.push({
        text: rawData.dialects.us.phonetic || undefined,
        audio: rawData.dialects.us.audio || undefined,
      })
    }
    if (rawData.dialects.uk) {
      phonetics.push({
        text: rawData.dialects.uk.phonetic || undefined,
        audio: rawData.dialects.uk.audio || undefined,
      })
    }
  }

  const definitionsByPartOfSpeech = new Map<string, IDefinition[]>()

  if (rawData.definitions && Array.isArray(rawData.definitions)) {
    for (const def of rawData.definitions) {
      const partOfSpeech = def.partOfSpeech || "unknown"
      if (!definitionsByPartOfSpeech.has(partOfSpeech)) {
        definitionsByPartOfSpeech.set(partOfSpeech, [])
      }
      definitionsByPartOfSpeech.get(partOfSpeech)!.push({
        definition: def.definition || "No definition available",
        example: def.examples?.[0] || undefined,
        synonyms: def.synonyms || [],
        antonyms: def.antonyms || [],
      })
    }
  }

  const meanings: IMeaning[] = []
  for (const [partOfSpeech, definitions] of definitionsByPartOfSpeech) {
    meanings.push({
      partOfSpeech,
      definitions:
        definitions.length > 0
          ? definitions
          : [{ definition: "No definition found for this word." }],
    })
  }

  if (meanings.length === 0) {
    meanings.push({
      partOfSpeech: "unknown",
      definitions: [{ definition: "No definition found for this word." }],
    })
  }

  return {
    word: rawData.word,
    phonetic: phonetics[0]?.text || undefined,
    phonetics: phonetics.length > 0 ? phonetics : undefined,
    meanings,
  }
}

// ---------- TRANSFORMER FOR FREEDICTIONARY ----------
function transformFreeToOldShape(rawData: FreeApiResponse): IWord | null {
  if (!rawData || !rawData.word || !rawData.entries) return null

  const firstEntry = rawData.entries[0] // Each entry is a part of speech

  // Build phonetics from pronunciations
  const phonetics =
    firstEntry?.pronunciations?.map((p: FreePronunciation) => ({
      text: p.text,
      audio: undefined, // FreeDictionary API doesn't provide audio URLs in this schema
    })) || []

  // Extract definitions (senses) and subsenses
  const definitions: IDefinition[] = []

  const extractSenses = (senses: FreeSense[], parentPrefix = "") => {
    for (const sense of senses) {
      if (sense.definition) {
        definitions.push({
          definition: parentPrefix + sense.definition,
          example: sense.examples?.[0] || undefined,
          synonyms: sense.synonyms || [],
          antonyms: sense.antonyms || [],
        })
      }
      if (sense.subsenses && sense.subsenses.length > 0) {
        extractSenses(sense.subsenses, parentPrefix + "→ ")
      }
    }
  }

  if (firstEntry.senses) {
    extractSenses(firstEntry.senses)
  }

  const meanings: IMeaning[] = [
    {
      partOfSpeech: firstEntry.partOfSpeech || "unknown",
      definitions:
        definitions.length > 0
          ? definitions
          : [{ definition: "No definition found for this word." }],
    },
  ]

  return {
    word: rawData.word,
    phonetic: phonetics[0]?.text || undefined,
    phonetics: phonetics.length > 0 ? phonetics : undefined,
    meanings,
  }
}

// ---------- PLAY SOUND (unchanged) ----------
export function playSound(url: string) {
  if (!url) {
    console.warn("No audio URL provided")
    return
  }

  try {
    new Audio(url).play()
  } catch (error) {
    console.warn("Failed to play audio:", error)
  }
}
