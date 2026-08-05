/* eslint-disable @next/next/no-img-element */
"use client"

import { CheckIcon, Clock3Icon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { HistoryEntry } from "@/lib/fitting"

type ResultHistoryProps = {
  history: HistoryEntry[]
  activeImage: string | null
  onSelect: (image: string) => void
  onClear: () => void
  className?: string
  gridClassName?: string
}

export function ResultHistory({
  history,
  activeImage,
  onSelect,
  onClear,
  className,
  gridClassName,
}: ResultHistoryProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock3Icon className="size-4 text-muted-foreground" />
          Result history
        </h2>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2Icon data-icon="inline-start" />
            Clear history
          </Button>
        )}
      </div>

      {history.length > 0 ? (
        <div className={gridClassName}>
          {history.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.image)}
              aria-label="View result"
              className={cn(
                "group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-foreground/5 transition-all hover:ring-2 hover:ring-ring",
                entry.image === activeImage && "ring-2 ring-ring"
              )}
            >
              <img
                src={entry.image}
                alt="Fitting result"
                className="h-full w-full object-cover"
              />
              {entry.image === activeImage && (
                <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                  <CheckIcon className="size-3" />
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground ring-1 ring-foreground/5">
          Your generated looks will appear here.
        </p>
      )}
    </div>
  )
}
