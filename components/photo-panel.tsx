/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  CameraIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { CameraModalProps } from "@/components/camera-modal"
import { compressImage, fileToDataUrl } from "@/lib/image"
import { cn } from "@/lib/utils"

const CameraModal = dynamic<CameraModalProps>(
  () =>
    import("@/components/camera-modal").then((mod) => mod.CameraModal),
  { ssr: false }
)

type PhotoPanelProps = {
  title: string
  description: string
  value: string | null
  onChange: (dataUrl: string | null) => void
  cameraTitle: string
  facingMode?: "user" | "environment"
  illustration?: React.ReactNode
}

export function PhotoPanel({
  title,
  description,
  value,
  onChange,
  cameraTitle,
  facingMode = "environment",
  illustration,
}: PhotoPanelProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [cameraOpen, setCameraOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
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
      onChange(dataUrl)
    } catch {
      setError("The image could not be processed. Please try a different one.")
    } finally {
      setIsProcessing(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    void acceptFile(event.dataTransfer.files?.[0])
  }

  return (
    <>
      <Card
        size="sm"
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "transition-all",
          isDragging && "ring-2 ring-ring bg-muted"
        )}
      >
        <CardContent className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={`${title} preview`}
            className={cn(
              "relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/5 transition-colors hover:ring-ring",
              isDragging && "ring-2 ring-ring"
            )}
          >
            {value ? (
              <img
                src={value}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                {illustration ?? (
                  <ImagePlusIcon className="size-6 text-muted-foreground" />
                )}
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </button>

            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isProcessing}
              >
                <ImagePlusIcon data-icon="inline-start" />
                {value ? "Replace" : "Upload"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCameraOpen(true)}
                disabled={isProcessing}
              >
                <CameraIcon data-icon="inline-start" />
                Camera
              </Button>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(null)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Remove
                </Button>
              )}
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlertIcon className="size-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void acceptFile(event.target.files?.[0])}
      />

      {cameraOpen && (
        <CameraModal
          open
          onOpenChange={setCameraOpen}
          facingMode={facingMode}
          title={cameraTitle}
          onCapture={onChange}
        />
      )}
    </>
  )
}
