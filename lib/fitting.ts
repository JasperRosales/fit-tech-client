export type Status = "idle" | "loading" | "error"

export type HistoryEntry = {
  id: string
  image: string
}

export const STORAGE_KEYS = {
  person: "fittech.person",
  garment: "fittech.garment",
  result: "fittech.result",
  history: "fittech.history",
  garmentStorage: "fittech.garmentStorage",
} as const

export const HISTORY_LIMIT = 6
export const GARMENT_STORAGE_LIMIT = 12

export function downloadName(image: string) {
  return `fittech-result.${image.startsWith("data:image/png") ? "png" : "jpg"}`
}

export function addHistoryEntry(
  previous: HistoryEntry[],
  image: string,
  limit: number = HISTORY_LIMIT
): HistoryEntry[] {
  return [{ id: crypto.randomUUID(), image }, ...previous].slice(0, limit)
}

export function addGarmentToStorage(
  previous: string[],
  image: string,
  limit: number = GARMENT_STORAGE_LIMIT
): string[] {
  if (previous.includes(image)) {
    return previous
  }

  return [image, ...previous].slice(0, limit)
}

export function removeGarmentFromStorage(
  previous: string[],
  image: string
): string[] {
  return previous.filter((item) => item !== image)
}
