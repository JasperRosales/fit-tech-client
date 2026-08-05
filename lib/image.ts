const DEFAULT_MAX_DIMENSION = 1280
const DEFAULT_QUALITY = 0.85

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Could not read the selected image file."))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not load the selected image."))
    image.src = src
  })
}

export async function compressImage(
  dataUrl: string,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY
): Promise<string> {
  const image = await loadImage(dataUrl)

  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.")
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL("image/jpeg", quality)
}
