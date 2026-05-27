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

// ----- Global cache -----
const wordCache = new Map<string, IWord | null>()

export async function fetchWord(word: string): Promise<IWord | null> {
  if (wordCache.has(word)) {
    return wordCache.get(word)!
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    )

    if (!res.ok) {
      wordCache.set(word, null)
      return null
    }

    const data = await res.json()
    const result = data[0] ?? null

    wordCache.set(word, result)
    return result
  } catch {
    wordCache.set(word, null)
    return null
  }
}

export function playSound(url: string) {
  if (!url) return
  new Audio(url).play()
}
