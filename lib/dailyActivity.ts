export type ActivityType = "reading" | "flashcard" | "word"

export interface DailyActivity {
  readingsGenerated: number
  flashcardsCompleted: number
  wordsSaved: number
  lastUpdateDate: string
}

export function getDailyActivityKey(email: string | undefined): string {
  if (!email) return ""
  return `daily_activity_${email}`
}

function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function shouldResetDaily(lastUpdateDate: string): boolean {
  const today = formatDate()
  return lastUpdateDate !== today
}

export function getDailyActivityData(email: string | undefined): DailyActivity {
  if (!email) {
    return {
      readingsGenerated: 0,
      flashcardsCompleted: 0,
      wordsSaved: 0,
      lastUpdateDate: formatDate(),
    }
  }

  const key = getDailyActivityKey(email)
  const storedData = localStorage.getItem(key)

  if (!storedData) {
    return {
      readingsGenerated: 0,
      flashcardsCompleted: 0,
      wordsSaved: 0,
      lastUpdateDate: formatDate(),
    }
  }

  try {
    const parsed = JSON.parse(storedData) as DailyActivity

    if (shouldResetDaily(parsed.lastUpdateDate)) {
      return {
        readingsGenerated: 0,
        flashcardsCompleted: 0,
        wordsSaved: 0,
        lastUpdateDate: formatDate(),
      }
    }

    return parsed
  } catch {
    return {
      readingsGenerated: 0,
      flashcardsCompleted: 0,
      wordsSaved: 0,
      lastUpdateDate: formatDate(),
    }
  }
}

export function incrementDailyActivity(
  email: string | undefined,
  activityType: ActivityType
): DailyActivity | null {
  if (!email) return null

  const key = getDailyActivityKey(email)
  const currentData = getDailyActivityData(email)

  switch (activityType) {
    case "reading":
      currentData.readingsGenerated += 1
      break
    case "flashcard":
      currentData.flashcardsCompleted += 1
      break
    case "word":
      currentData.wordsSaved += 1
      break
  }

  currentData.lastUpdateDate = formatDate()

  try {
    localStorage.setItem(key, JSON.stringify(currentData))
    return currentData
  } catch {
    console.error("Failed to save daily activity to localStorage")
    return null
  }
}

export function clearDailyActivity(email: string | undefined): void {
  if (!email) return
  const key = getDailyActivityKey(email)
  localStorage.removeItem(key)
}
