export interface SM2Data {
  repetition: number
  interval: number
  easinessFactor: number
  nextReviewDate: Date
}

/**
 * SuperMemo-2 Spaced Repetition Algorithm
 *
 * @param quality 0-5 rating of recall quality
 *   0: Complete blackout
 *   1: Incorrect response; the correct one remembered
 *   2: Incorrect response; where the correct one seemed easy to recall
 *   3: Correct response recalled with serious difficulty
 *   4: Correct response after a hesitation
 *   5: Perfect response
 * @param prevRepetition number of times successfully recalled
 * @param prevInterval previous interval in days
 * @param prevEasinessFactor previous easiness factor (default 2.5)
 * @returns SM2Data object with updated values
 */
export function calculateSM2(
  quality: number,
  prevRepetition: number,
  prevInterval: number,
  prevEasinessFactor: number
): SM2Data {
  let repetition = prevRepetition
  let interval = prevInterval

  // Easiness factor formula
  let easinessFactor =
    prevEasinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3
  }

  // Calculate interval and repetition based on quality
  if (quality < 3) {
    // Failed recall
    repetition = 0
    interval = 1
  } else {
    // Successful recall
    if (repetition === 0) {
      interval = 1
    } else if (repetition === 1) {
      interval = 6
    } else {
      interval = Math.round(prevInterval * easinessFactor)
    }
    repetition++
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    repetition,
    interval,
    easinessFactor,
    nextReviewDate,
  }
}
