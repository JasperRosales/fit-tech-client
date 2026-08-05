/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import {
  CheckIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { compressImage, fileToDataUrl } from "@/lib/image"
import { cn } from "@/lib/utils"

type GarmentStorageProps = {
  garments: string[]
  current: string | null
  onSelect: (image: string) => void
  onAdd: (image: string) => void
  onRemove: (image: string) => void
  onClear: () => void
}

export function GarmentStorage({
  garments,
  current,
  onSelect,
  onAdd,
  onRemove,
  onClear,
}: GarmentStorageProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function acceptFile(file: File | undefined | null) {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or WebP).")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const raw = await fileToDataUrl(file)
      const dataUrl = await compressImage(raw)
      onAdd(dataUrl)
    } catch {
      setError("The image could not be processed. Please try a different one.")
    } finally {
      setIsProcessing(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Garment storage</CardTitle>
        <CardDescription>Reuse saved garments for fitting.</CardDescription>
        {garments.length > 0 && (
          <CardAction>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2Icon data-icon="inline-start" />
              Clear
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            aria-label="Upload a garment"
            className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-foreground/15 bg-muted/30 text-muted-foreground transition-colors hover:border-ring hover:text-foreground disabled:opacity-50"
          >
            {isProcessing ? (
              <LoaderCircleIcon className="size-5 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-5" />
            )}
          </button>

          {garments.map((image) => (
            <div
              key={image}
              className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-foreground/5"
            >
              <button
                type="button"
                onClick={() => onSelect(image)}
                aria-label="Use this saved garment"
                className={cn(
                  "h-full w-full transition-all hover:ring-2 hover:ring-ring",
                  image === current && "ring-2 ring-ring"
                )}
              >
                <img
                  src={image}
                  alt="Saved garment"
                  className="h-full w-full object-cover"
                />
                {image === current && (
                  <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                    <CheckIcon className="size-3" />
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(image)}
                aria-label="Remove saved garment"
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/45 text-white transition-opacity hover:bg-black/65"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>

        {garments.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Uploaded garments are saved here automatically.
          </p>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void acceptFile(event.target.files?.[0])}
      />
    </Card>
  )
}
