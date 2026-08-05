"use client"

import {
  BadgeCheckIcon,
  CheckIcon,
  LoaderCircleIcon,
  Trash2Icon,
  TriangleAlertIcon,
  Wand2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ClothingIllustration,
  PersonIllustration,
} from "@/components/illustrations"
import { GarmentStorage } from "@/components/garment-storage"
import { PhotoPanel } from "@/components/photo-panel"
import type { Status } from "@/lib/fitting"

type FittingControlsProps = {
  person: string | null
  garment: string | null
  status: Status
  error: string | null
  isReady: boolean
  hasAnything: boolean
  onPersonChange: (value: string | null) => void
  onGarmentChange: (value: string | null) => void
  onTryOn: () => void
  onClearAll: () => void
  storedGarments: string[]
  onSelectStoredGarment: (image: string) => void
  onAddStoredGarment: (image: string) => void
  onRemoveStoredGarment: (image: string) => void
  onClearStoredGarments: () => void
}

export function FittingControls({
  person,
  garment,
  status,
  error,
  isReady,
  hasAnything,
  onPersonChange,
  onGarmentChange,
  onTryOn,
  onClearAll,
  storedGarments,
  onSelectStoredGarment,
  onAddStoredGarment,
  onRemoveStoredGarment,
  onClearStoredGarments,
}: FittingControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <PhotoPanel
        title="Your photo"
        description="A clear photo of you"
        value={person}
        onChange={onPersonChange}
        cameraTitle="Take your photo"
        facingMode="user"
        illustration={<PersonIllustration className="size-16" />}
      />
      <PhotoPanel
        title="Garment"
        description="The clothing to try on"
        value={garment}
        onChange={onGarmentChange}
        cameraTitle="Photograph the garment"
        facingMode="environment"
        illustration={<ClothingIllustration className="size-16" />}
      />

      <GarmentStorage
        garments={storedGarments}
        current={garment}
        onSelect={onSelectStoredGarment}
        onAdd={onAddStoredGarment}
        onRemove={onRemoveStoredGarment}
        onClear={onClearStoredGarments}
      />

      {error && (
        <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-center py-1">
        {isReady ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BadgeCheckIcon className="size-3.5" />
            Ready to try on
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <CheckIcon className="size-3.5" />
            Add both photos to get started
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full"
          onClick={onTryOn}
          disabled={!isReady || status === "loading"}
        >
          {status === "loading" ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              Fitting…
            </>
          ) : (
            <>
              <Wand2Icon data-icon="inline-start" />
              Try it on
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={onClearAll}
          disabled={!hasAnything || status === "loading"}
        >
          <Trash2Icon data-icon="inline-start" />
          Clear all
        </Button>
      </div>
    </div>
  )
}
