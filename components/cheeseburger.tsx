"use client"

import { useMemo, useState } from "react"
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  BodyBuilder,
  createBurger,
  type Burger,
} from "@/components/body-builder"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Introduction {
  hookType: string
  hook: string
  background: string
  thesis: string
}

interface Conclusion {
  restatement: string
  finalWords: string
}

// ─────────────────────────────────────────────
// Initial values
// ─────────────────────────────────────────────

const initialIntroduction: Introduction = {
  hookType: "question",
  hook: "",
  background: "",
  thesis: "",
}

const initialConclusion: Conclusion = {
  restatement: "",
  finalWords: "",
}

const hookPlaceholders = {
  question:
    "Ask a thought-provoking question related to your topic...",
  anecdote:
    "Tell a short, relevant story or personal experience...",
  quote:
    "Start with a relevant quotation...",
  data:
    "Begin with a surprising fact or statistic...",
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function EssayBuilder() {
  const [tab, setTab] = useState("introduction")

  const [introduction, setIntroduction] =
    useState<Introduction>(initialIntroduction)

  const [burgers, setBurgers] = useState<Burger[]>([
    createBurger("single"),
  ])

  const [conclusion, setConclusion] =
    useState<Conclusion>(initialConclusion)

  // ─────────────────────────────────────────────
  // Essay generation
  // ─────────────────────────────────────────────

  const essay = useMemo(() => {
    const body = burgers
      .map((burger) => {
        const sentences = [
          burger.topicSentence,

          ...burger.points.flatMap((point) => [
            point.point,
            point.elaboration,
            point.example,
          ]),

          burger.linkingSentence,
        ]

        return sentences
          .map((sentence) => sentence.trim())
          .filter(Boolean)
          .join(" ")
      })
      .filter(Boolean)
      .join("\n\n")

    const intro = [
      introduction.hook,
      introduction.background,
      introduction.thesis,
    ]
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .join(" ")

    const ending = [
      conclusion.restatement,
      conclusion.finalWords,
    ]
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .join(" ")

    return [intro, body, ending]
      .filter(Boolean)
      .join("\n\n")
  }, [introduction, burgers, conclusion])

  // ─────────────────────────────────────────────
  // Progress
  // ─────────────────────────────────────────────

  const totalFields =
    5 +
    burgers.reduce(
      (total, burger) =>
        total +
        2 +
        burger.points.length * 3,
      0
    )

  const completedFields =
    [
      introduction.hook,
      introduction.background,
      introduction.thesis,
      conclusion.restatement,
      conclusion.finalWords,
    ].filter(Boolean).length +
    burgers.reduce((total, burger) => {
      const fields = [
        burger.topicSentence,
        burger.linkingSentence,

        ...burger.points.flatMap((point) => [
          point.point,
          point.elaboration,
          point.example,
        ]),
      ]

      return (
        total +
        fields.filter(Boolean).length
      )
    }, 0)

  const progress =
    totalFields > 0
      ? Math.round(
        (completedFields / totalFields) * 100
      )
      : 0

  // ─────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────

  const tabs = [
    "introduction",
    "body",
    "conclusion",
  ]

  const nextTab = () => {
    const index = tabs.indexOf(tab)

    if (index < tabs.length - 1) {
      setTab(tabs[index + 1])
    }
  }

  const previousTab = () => {
    const index = tabs.indexOf(tab)

    if (index > 0) {
      setTab(tabs[index - 1])
    }
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="size-5" />

            <h1 className="text-xl font-semibold">
              Essay Builder
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            Build your essay paragraph by paragraph.
          </p>
        </div>

        {/* Desktop progress */}

        <div className="hidden w-32 shrink-0 space-y-1.5 sm:block">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <Progress value={progress} />
        </div>
      </div>

      {/* Mobile progress */}

      <div className="space-y-1.5 sm:hidden">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <Progress value={progress} />
      </div>

      {/* Main tabs */}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="introduction">
            Introduction
          </TabsTrigger>

          <TabsTrigger value="body">
            Body
          </TabsTrigger>

          <TabsTrigger value="conclusion">
            Conclusion
          </TabsTrigger>
        </TabsList>

        {/* ─────────────────────────────────────── */}
        {/* INTRODUCTION */}
        {/* ─────────────────────────────────────── */}

        <TabsContent
          value="introduction"
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Introduction
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Hook → Background → Thesis
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Hook */}

              <div className="space-y-3">
                <Label>1. Hook</Label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["question", "Question"],
                    ["anecdote", "Anecdote"],
                    ["quote", "Quote"],
                    ["data", "Data"],
                  ].map(([value, label]) => (
                    <Button
                      key={value}
                      type="button"
                      variant={
                        introduction.hookType === value
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setIntroduction((current) => ({
                          ...current,
                          hookType: value,
                        }))
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                <Textarea
                  value={introduction.hook}
                  onChange={(event) =>
                    setIntroduction((current) => ({
                      ...current,
                      hook: event.target.value,
                    }))
                  }
                  placeholder={
                    hookPlaceholders[
                    introduction.hookType as keyof typeof hookPlaceholders
                    ]
                  }
                  className="min-h-24 resize-none"
                />
              </div>

              {/* Background */}

              <div className="space-y-2">
                <Label>2. Background</Label>

                <Textarea
                  value={introduction.background}
                  onChange={(event) =>
                    setIntroduction((current) => ({
                      ...current,
                      background: event.target.value,
                    }))
                  }
                  placeholder="Introduce the topic and give your reader some context..."
                  className="min-h-24 resize-none"
                />
              </div>

              {/* Thesis */}

              <div className="space-y-2">
                <Label>3. Thesis statement</Label>

                <Textarea
                  value={introduction.thesis}
                  onChange={(event) =>
                    setIntroduction((current) => ({
                      ...current,
                      thesis: event.target.value,
                    }))
                  }
                  placeholder="State the main argument or position of your essay..."
                  className="min-h-24 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────────────────────────────── */}
        {/* BODY */}
        {/* ─────────────────────────────────────── */}

        <TabsContent value="body" className="mt-6">
          <BodyBuilder
            burgers={burgers}
            setBurgers={setBurgers}
          />
        </TabsContent>

        {/* ─────────────────────────────────────── */}
        {/* CONCLUSION */}
        {/* ─────────────────────────────────────── */}

        <TabsContent
          value="conclusion"
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Conclusion
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Restatement → Final words
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Restatement */}

              <div className="space-y-2">
                <Label>
                  1. Restatement of main ideas
                </Label>

                <Textarea
                  value={conclusion.restatement}
                  onChange={(event) =>
                    setConclusion((current) => ({
                      ...current,
                      restatement:
                        event.target.value,
                    }))
                  }
                  placeholder="Summarise your main ideas without simply copying your introduction..."
                  className="min-h-28 resize-none"
                />
              </div>

              {/* Final words */}

              <div className="space-y-2">
                <Label>2. Final words</Label>

                <Textarea
                  value={conclusion.finalWords}
                  onChange={(event) =>
                    setConclusion((current) => ({
                      ...current,
                      finalWords: event.target.value,
                    }))
                  }
                  placeholder="End with a memorable thought, suggestion, prediction, or question..."
                  className="min-h-28 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}

      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={previousTab}
          disabled={tab === "introduction"}
        >
          <ChevronLeft />
          Previous
        </Button>

        {tab !== "conclusion" ? (
          <Button
            type="button"
            onClick={nextTab}
          >
            Next
            <ChevronRight />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => {
              console.log(essay)
            }}
          >
            <Check />
            Finish
          </Button>
        )}
      </div>

      {/* Preview */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Preview
          </CardTitle>
        </CardHeader>

        <CardContent>
          {essay ? (
            <p className="whitespace-pre-wrap text-sm leading-7">
              {essay}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your essay will appear here as you write.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
