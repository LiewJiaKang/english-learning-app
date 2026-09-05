"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, X } from "lucide-react"

type GradeResult = {
  criteriaScores: {
    content: number
    communicativeAchievement: number
    language: number
    organisation: number
  }
  score: number
  strengths: string[]
  weaknesses: string[]
  grammarErrors: string[]
  vocabularySuggestions: string[]
  overallFeedback: string
}

export function EssayGrader() {
  const [question, setQuestion] = useState("")
  const [tasks, setTasks] = useState([""])
  const [essay, setEssay] = useState("")
  const [part, setPart] = useState("2")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)

  function addTask() {
    setTasks((current) => [...current, ""])
  }

  function updateTask(index: number, value: string) {
    setTasks((current) =>
      current.map((task, i) => (i === index ? value : task))
    )
  }

  function removeTask(index: number) {
    setTasks((current) => current.filter((_, i) => i !== index))
  }

  async function gradeEssay() {
    if (essay.trim().length < 50 || loading) return

    setLoading(true)
    setResult(null)

    const validTasks = tasks
      .map((task) => task.trim())
      .filter(Boolean)

    const combinedQuestion = [
      question.trim(),
      validTasks.length > 0
        ? `Tasks:\n${validTasks
          .map((task, index) => `${index + 1}. ${task}`)
          .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n")

    try {
      const response = await fetch("/api/grade-essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay,
          prompt: combinedQuestion,
          part,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to grade essay.")
      }

      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      {/* Input */}
      <div className="space-y-3">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Paste the question or task here..."
        />

        {/* Tasks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Tasks</p>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addTask}
              className="h-8 gap-1.5"
            >
              <Plus className="size-3.5" />
              Add task
            </Button>
          </div>

          {tasks.map((task, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={task}
                onChange={(e) =>
                  updateTask(index, e.target.value)
                }
                placeholder={`Task ${index + 1}`}
              />

              {tasks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(index)}
                  aria-label={`Remove task ${index + 1}`}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Paste your essay here..."
          className="min-h-80 resize-none lg:min-h-128"
        />

        <div className="flex items-center justify-between gap-2">
          <Select value={part} onValueChange={setPart}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="1">Part 1</SelectItem>
              <SelectItem value="2">Part 2</SelectItem>
              <SelectItem value="3">Part 3</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={gradeEssay}
            disabled={loading || essay.trim().length < 50}
          >
            {loading ? "Grading..." : "Grade essay"}
          </Button>
        </div>
      </div>

      {/* Grade */}
      <div className="mt-6 lg:mt-0">
        {loading ? (
          <GradeLoading />
        ) : result ? (
          <GradeResultView result={result} />
        ) : (
          <GradeEmpty />
        )}
      </div>
    </div>
  )
}

function GradeEmpty() {
  return (
    <Empty className="min-h-80 rounded-xl border border-dashed lg:min-h-[32rem]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span className="text-lg">✦</span>
        </EmptyMedia>

        <EmptyTitle>No grade yet</EmptyTitle>

        <EmptyDescription>
          Your essay assessment will appear here after you submit it.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function GradeLoading() {
  return (
    <div className="min-h-80 space-y-6 rounded-xl border p-5 lg:min-h-[32rem]">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border p-3"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

function GradeResultView({
  result,
}: {
  result: GradeResult
}) {
  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div>
        <p className="text-sm text-muted-foreground">
          Overall score
        </p>

        <p className="text-4xl font-semibold tracking-tight">
          {result.score}
          <span className="text-lg text-muted-foreground">
            {" "}
            / 20
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Score
          label="Content"
          score={result.criteriaScores.content}
        />
        <Score
          label="Communication"
          score={result.criteriaScores.communicativeAchievement}
        />
        <Score
          label="Language"
          score={result.criteriaScores.language}
        />
        <Score
          label="Organisation"
          score={result.criteriaScores.organisation}
        />
      </div>

      {result.overallFeedback && (
        <div>
          <p className="mb-1 text-sm font-medium">
            Overall feedback
          </p>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {result.overallFeedback}
          </p>
        </div>
      )}

      {result.strengths.length > 0 && (
        <FeedbackList
          title="Strengths"
          items={result.strengths}
        />
      )}

      {result.weaknesses.length > 0 && (
        <FeedbackList
          title="Areas to improve"
          items={result.weaknesses}
        />
      )}
    </div>
  )
}

function Score({
  label,
  score,
}: {
  label: string
  score: number
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-lg font-medium">
        {score}
        <span className="text-sm text-muted-foreground">
          {" "}
          / 5
        </span>
      </p>
    </div>
  )
}

function FeedbackList({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{title}</p>

      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
