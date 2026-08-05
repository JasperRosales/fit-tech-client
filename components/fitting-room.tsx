/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon, TriangleAlertIcon, Wand2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { FittingControls } from "@/components/fitting-controls"
import { ResultHistory } from "@/components/result-history"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  STORAGE_KEYS,
  addGarmentToStorage,
  addHistoryEntry,
  downloadName,
  removeGarmentFromStorage,
  type HistoryEntry,
  type Status,
} from "@/lib/fitting"

export function FittingRoom() {
  const [person, setPerson] = useLocalStorage<string | null>(
    STORAGE_KEYS.person,
    null
  )
  const [garment, setGarment] = useLocalStorage<string | null>(
    STORAGE_KEYS.garment,
    null
  )
  const [result, setResult] = useLocalStorage<string | null>(
    STORAGE_KEYS.result,
    null
  )
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    STORAGE_KEYS.history,
    []
  )
  const [storedGarments, setStoredGarments] = useLocalStorage<string[]>(
    STORAGE_KEYS.garmentStorage,
    []
  )

  const [status, setStatus] = React.useState<Status>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const isReady = Boolean(person && garment)
  const hasAnything = Boolean(person || garment || result)

  async function handleTryOn() {
    if (!person || !garment) {
      return
    }

    setDrawerOpen(false)
    setStatus("loading")
    setError(null)

    try {
      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person, garment }),
      })

      const data = (await response.json()) as { image?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.")
      }

      if (!data.image) {
        throw new Error("The fitting service did not return an image.")
      }

      const image = data.image
      setResult(image)
      setHistory((previous) => addHistoryEntry(previous, image))
    } catch (err) {
      setStatus("error")
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setStatus("idle")
    }
  }

  function handleClearAll() {
    setPerson(null)
    setGarment(null)
    setResult(null)
    setError(null)
    setStatus("idle")
  }

  function handleClearHistory() {
    setHistory([])
  }

  function saveGarment(image: string) {
    setStoredGarments((previous) => addGarmentToStorage(previous, image))
  }

  function handleGarmentChange(value: string | null) {
    setGarment(value)
    if (value) {
      saveGarment(value)
    }
  }

  function handleSelectStoredGarment(image: string) {
    setGarment(image)
  }

  function handleAddStoredGarment(image: string) {
    setGarment(image)
    saveGarment(image)
  }

  function handleRemoveStoredGarment(image: string) {
    setStoredGarments((previous) => removeGarmentFromStorage(previous, image))
  }

  function handleClearStoredGarments() {
    setStoredGarments([])
  }

  const controls = (
    <FittingControls
      person={person}
      garment={garment}
      status={status}
      error={error}
      isReady={isReady}
      hasAnything={hasAnything}
      onPersonChange={setPerson}
      onGarmentChange={handleGarmentChange}
      onTryOn={() => void handleTryOn()}
      onClearAll={handleClearAll}
      storedGarments={storedGarments}
      onSelectStoredGarment={handleSelectStoredGarment}
      onAddStoredGarment={handleAddStoredGarment}
      onRemoveStoredGarment={handleRemoveStoredGarment}
      onClearStoredGarments={handleClearStoredGarments}
    />
  )

  return (
    <section className="w-full">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,28rem)_minmax(0,360px)] lg:items-start lg:justify-center">
        <Card size="sm" className="w-full max-w-[28rem] lg:sticky lg:top-[70px]">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col ms-2 gap-1">
                <p className="font-heading text-base font-medium">Preview</p>
                <p className="text-xs text-muted-foreground">
                  Your virtual fitting appears here.
                </p>
              </div>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  render={<a href={result} download={downloadName(result)} />}
                >
                  <DownloadIcon data-icon="inline-start" />
                  Download
                </Button>
              )}
            </div>

            {status === "loading" ? (
              <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
            ) : result ? (
              <div className="overflow-hidden rounded-3xl bg-muted ring-1 ring-foreground/5">
                <img
                  src={result}
                  alt="Virtual fitting result"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-3xl bg-muted/50 text-center text-muted-foreground ring-1 ring-foreground/5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-foreground/5">
                  <Wand2Icon className="size-5" />
                </div>
                <div className="space-y-1 px-6">
                  <p className="text-sm font-medium">No preview yet</p>
                  <p className="text-xs">
                    Add a photo and a garment, then press “Try it on”.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="hidden lg:flex lg:flex-col lg:gap-4">{controls}</div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive lg:hidden">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <ResultHistory
        className="mt-8 hidden lg:block"
        gridClassName="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
        history={history}
        activeImage={result}
        onSelect={(image) => setResult(image)}
        onClear={handleClearHistory}
      />

      <Button
        size="lg"
        onClick={() => setDrawerOpen(true)}
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg lg:hidden"
      >
        <PlusIcon />
      </Button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} showSwipeHandle>
        <DrawerContent className="[--drawer-height:min(88dvh,46rem)]">
          <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3 pb-1">
            <DrawerTitle>Add your photos</DrawerTitle>
            <DrawerClose
              render={
                <Button variant="ghost" size="icon" aria-label="Close panel">
                  <XIcon className="size-4" />
                </Button>
              }
            />
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-2 pb-6 overscroll-contain">
            {controls}
            <Separator />
            <ResultHistory
              gridClassName="grid grid-cols-3 gap-3"
              history={history}
              activeImage={result}
              onSelect={(image) => {
                setResult(image)
                setDrawerOpen(false)
              }}
              onClear={handleClearHistory}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </section>
  )
}
