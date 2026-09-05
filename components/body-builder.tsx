"use client"

import { useState } from "react"
import { Check, Plus, X, Hamburger, Beef, LeafyGreen, Cuboid, Circle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export type BurgerType = "single" | "double"

export interface BurgerPoint {
  point: string
  elaboration: string
  example: string
}

export interface Burger {
  id: string
  type: BurgerType
  topicSentence: string
  points: BurgerPoint[]
  linkingSentence: string
}

interface BodyBuilderProps {
  burgers: Burger[]
  setBurgers: React.Dispatch<React.SetStateAction<Burger[]>>
}

type EditableField =
  | "topicSentence"
  | "point"
  | "elaboration"
  | "example"
  | "linkingSentence"

interface EditingState {
  burgerId: string
  field: EditableField
  pointIndex?: number
  title: string
  value: string
}

const emptyPoint = (): BurgerPoint => ({
  point: "",
  elaboration: "",
  example: "",
})

export const createBurger = (type: BurgerType = "single"): Burger => ({
  id: crypto.randomUUID(),
  type,
  topicSentence: "",
  points: type === "double" ? [emptyPoint(), emptyPoint()] : [emptyPoint()],
  linkingSentence: "",
})

export function BodyBuilder({ burgers, setBurgers }: BodyBuilderProps) {
  const [activeId, setActiveId] = useState(burgers[0]?.id ?? "")
  const [editing, setEditing] = useState<EditingState | null>(null)

  const activeBurger = burgers.find((burger) => burger.id === activeId) ?? burgers[0]

  function addBurger(type: BurgerType = "single") {
    const burger = createBurger(type)
    setBurgers((current) => [...current, burger])
    setActiveId(burger.id)
  }

  function removeBurger(id: string) {
    if (burgers.length === 1) return
    setBurgers((current) => {
      const next = current.filter((burger) => burger.id !== id)
      if (id === activeId && next.length > 0) {
        setActiveId(next[0].id)
      }
      return next
    })
  }

  function updateBurger(id: string, update: Partial<Burger>) {
    setBurgers((current) =>
      current.map((burger) => (burger.id === id ? { ...burger, ...update } : burger))
    )
  }

  function updatePoint(burgerId: string, index: number, field: keyof BurgerPoint, value: string) {
    setBurgers((current) =>
      current.map((burger) => {
        if (burger.id !== burgerId) return burger
        return {
          ...burger,
          points: burger.points.map((point, i) =>
            i === index ? { ...point, [field]: value } : point
          ),
        }
      })
    )
  }

  function changeBurgerType(burgerId: string, type: BurgerType) {
    setBurgers((current) =>
      current.map((burger) => {
        if (burger.id !== burgerId) return burger
        const first = burger.points[0] ?? emptyPoint()
        const second = burger.points[1] ?? emptyPoint()
        return {
          ...burger,
          type,
          points: type === "double" ? [first, second] : [first],
        }
      })
    )
  }

  function openEditor(
    burgerId: string,
    field: EditableField,
    title: string,
    value: string,
    pointIndex?: number
  ) {
    setEditing({ burgerId, field, title, value, pointIndex })
  }

  function updateEditingValue(value: string) {
    if (!editing) return
    setEditing((current) => (current ? { ...current, value } : null))

    if (editing.field === "topicSentence" || editing.field === "linkingSentence") {
      updateBurger(editing.burgerId, { [editing.field]: value })
    } else if (editing.pointIndex !== undefined) {
      updatePoint(editing.burgerId, editing.pointIndex, editing.field, value)
    }
  }

  function isComplete(burger: Burger) {
    return Boolean(
      burger.topicSentence.trim() &&
      burger.linkingSentence.trim() &&
      burger.points.every((p) => p.point.trim() && p.elaboration.trim() && p.example.trim())
    )
  }

  if (!activeBurger) return null

  const activeIndex = burgers.findIndex((burger) => burger.id === activeBurger.id) + 1

  return (
    <>
      <div className="grid min-h-150 grid-cols-1 overflow-hidden rounded-xl border lg:grid-cols-[220px_1fr]">
        {/* Paragraph navigator */}
        <aside className="border-b bg-muted/20 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b px-3 py-3">
            <div>
              <p className="text-sm font-medium">Paragraphs</p>
              <p className="text-xs text-muted-foreground">
                {burgers.length} {burgers.length === 1 ? "paragraph" : "paragraphs"}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => addBurger()}
              aria-label="Add paragraph"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto p-2 lg:block lg:space-y-1 lg:overflow-visible">
            {burgers.map((burger, index) => {
              const active = burger.id === activeId
              const complete = isComplete(burger)
              return (
                <div key={burger.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveId(burger.id)}
                    className={[
                      "group relative min-w-40 rounded-lg border p-3 text-left transition-colors lg:w-full",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Paragraph {index + 1}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                          <Hamburger className="size-3.5" />
                          {burger.type === "double" ? (
                            <>
                              <Hamburger className="size-3.5" />
                              Double
                            </>
                          ) : (
                            "Single"
                          )}
                        </p>
                      </div>
                      {complete && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" />
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                      {burger.topicSentence || "Empty paragraph"}
                    </p>
                  </button>

                  {/* Close button – always visible on mobile, fades on desktop */}
                  {burgers.length > 1 && !complete && (
                    <button
                      type="button"
                      aria-label={`Delete paragraph ${index + 1}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBurger(burger.id)
                      }}
                      className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground transition-opacity hover:bg-muted hover:text-destructive lg:opacity-40 lg:hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })}

            <Button
              variant="ghost"
              size="sm"
              className="hidden w-full justify-start lg:flex"
              onClick={() => addBurger()}
            >
              <Plus />
              Add paragraph
            </Button>
          </div>
        </aside>

        {/* Burger editor */}
        <section className="min-w-0">
          <div className="border-b px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paragraph {activeIndex}</p>
                <h3 className="mt-1 font-semibold">Build your cheeseburger</h3>
              </div>

              <div className="flex rounded-lg border p-1">
                <Button
                  size="sm"
                  variant={activeBurger.type === "single" ? "default" : "ghost"}
                  onClick={() => changeBurgerType(activeBurger.id, "single")}
                >
                  <Hamburger className="mr-1 size-3.5" />
                  Single
                </Button>
                <Button
                  size="sm"
                  variant={activeBurger.type === "double" ? "default" : "ghost"}
                  onClick={() => changeBurgerType(activeBurger.id, "double")}
                >
                  <Hamburger className="mr-1 size-3.5" />
                  <Hamburger className="mr-1 size-3.5" />
                  Double
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {/* Top Bun */}
              <BurgerLayer
                icon={Circle}
                label="Top Bun"
                description="Topic sentence"
                value={activeBurger.topicSentence}
                onClick={() =>
                  openEditor(
                    activeBurger.id,
                    "topicSentence",
                    "Top Bun · Topic Sentence",
                    activeBurger.topicSentence
                  )
                }
              />

              {/* Separator: Top Bun → Fillings (only for single burger) */}
              {activeBurger.type === "single" && (
                <hr className="border-t border-dashed border-muted-foreground/30" />
              )}

              {activeBurger.points.map((point, index) => (
                <div key={index}>
                  {activeBurger.type === "double" && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Patty {index + 1}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <BurgerLayer
                      icon={Beef}
                      label="Chicken Patty"
                      description={activeBurger.type === "double" ? `Point ${index + 1}` : "Point"}
                      value={point.point}
                      onClick={() =>
                        openEditor(
                          activeBurger.id,
                          "point",
                          `Chicken Patty · Point${activeBurger.type === "double" ? ` ${index + 1}` : ""}`,
                          point.point,
                          index
                        )
                      }
                    />

                    <BurgerLayer
                      icon={LeafyGreen}
                      label="Lettuce"
                      description={activeBurger.type === "double" ? `Elaboration ${index + 1}` : "Elaboration"}
                      value={point.elaboration}
                      onClick={() =>
                        openEditor(
                          activeBurger.id,
                          "elaboration",
                          `Lettuce · Elaboration${activeBurger.type === "double" ? ` ${index + 1}` : ""}`,
                          point.elaboration,
                          index
                        )
                      }
                    />

                    <BurgerLayer
                      icon={Cuboid}
                      label="Cheese"
                      description={activeBurger.type === "double" ? `Example ${index + 1}` : "Example"}
                      value={point.example}
                      onClick={() =>
                        openEditor(
                          activeBurger.id,
                          "example",
                          `Cheese · Example${activeBurger.type === "double" ? ` ${index + 1}` : ""}`,
                          point.example,
                          index
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              {/* Separator: Fillings → Bottom Bun (always shown) */}
              <hr className="border-t border-dashed border-muted-foreground/30" />

              {/* Bottom Bun */}
              <div className="mt-4">
                <BurgerLayer
                  icon={Circle}
                  label="Bottom Bun"
                  description="Linking sentence"
                  value={activeBurger.linkingSentence}
                  onClick={() =>
                    openEditor(
                      activeBurger.id,
                      "linkingSentence",
                      "Bottom Bun · Linking Sentence",
                      activeBurger.linkingSentence
                    )
                  }
                />
              </div>

              <div className="mt-5 rounded-lg border border-dashed bg-muted/20 p-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">Cheeseburger technique:</span> Topic
                  sentence → Point → Elaboration → Example → Linking sentence. A double burger repeats
                  the Point, Elaboration, and Example layers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Editing dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.title}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Textarea
                autoFocus
                value={editing.value}
                onChange={(e) => updateEditingValue(e.target.value)}
                placeholder="Write your sentence..."
                className="min-h-48 resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={() => setEditing(null)}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function BurgerLayer({
  icon: Icon,
  label,
  description,
  value,
  onClick,
}: {
  icon: React.ElementType
  label: string
  description: string
  value: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold">{label}</p>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
        <p
          className={[
            "mt-0.5 truncate text-xs",
            value ? "text-muted-foreground" : "text-muted-foreground/50",
          ].join(" ")}
        >
          {value || "Click to write..."}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        Edit
      </span>
    </button>
  )
}
