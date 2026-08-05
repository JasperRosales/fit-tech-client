/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { CheckIcon, LoaderCircleIcon, RefreshCcwIcon, CameraIcon, TriangleAlertIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { compressImage } from "@/lib/image"

export type CameraModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  facingMode?: "user" | "environment"
  title?: string
  onCapture: (dataUrl: string) => void
}

export function CameraModal({
  open,
  onOpenChange,
  facingMode = "environment",
  title = "Take a photo",
  onCapture,
}: CameraModalProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const [session, setSession] = React.useState(0)
  const [status, setStatus] = React.useState<"starting" | "ready" | "error">("starting")
  const [error, setError] = React.useState<string | null>(null)
  const [shot, setShot] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const stopStream = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  React.useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function startCamera() {
      setStatus("starting")
      setError(null)
      setShot(null)

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error")
        setError(
          "Camera capture is not supported by this browser. Upload an image instead."
        )
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 } },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setStatus("ready")
      } catch {
        if (!cancelled) {
          setStatus("error")
          setError(
            "Camera access was denied or is unavailable. Check your browser permissions and try again, or upload an image instead."
          )
        }
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [open, session, facingMode, stopStream])

  function handleCapture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    ctx.drawImage(video, 0, 0)
    stopStream()
    setShot(canvas.toDataURL("image/jpeg", 0.92))
  }

  function handleRetake() {
    setShot(null)
    setSession((current) => current + 1)
  }

  async function handleUseShot() {
    if (!shot) {
      return
    }

    setIsSaving(true)
    try {
      const dataUrl = await compressImage(shot)
      onCapture(dataUrl)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Frame your subject, then press the capture button.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted ring-1 ring-foreground/5">
          {shot ? (
            <img
              src={shot}
              alt="Captured photo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {status === "starting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/60 text-muted-foreground">
                  <LoaderCircleIcon className="size-6 animate-spin" />
                  <span className="text-xs">Starting camera…</span>
                </div>
              )}
              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                  <TriangleAlertIcon className="size-6 text-destructive" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {shot ? (
            <>
              <Button
                variant="outline"
                onClick={handleRetake}
                disabled={isSaving}
              >
                <RefreshCcwIcon data-icon="inline-start" />
                Retake
              </Button>
              <Button onClick={handleUseShot} disabled={isSaving}>
                {isSaving ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <CheckIcon data-icon="inline-start" />
                )}
                Use photo
              </Button>
            </>
          ) : (
            <Button onClick={handleCapture} disabled={status !== "ready"}>
              <CameraIcon data-icon="inline-start" />
              Capture
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
