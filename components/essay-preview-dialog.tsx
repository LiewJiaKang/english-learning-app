"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EssayPreviewDialogProps {
  essay: string
}

export function EssayPreviewDialog({
  essay,
}: EssayPreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(essay)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Check />
          Finish
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Your Essay</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border bg-muted/30 p-4 sm:p-6">
          {essay ? (
            <p className="whitespace-pre-wrap text-sm leading-7">
              {essay}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your essay is empty. Start writing to see it here.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={!essay}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy essay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
