import { ApiError, Client } from "magic-hour"
import { NextRequest, NextResponse } from "next/server"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const API_TOKEN = process.env.API_KEY

const client = new Client({ token: API_TOKEN })

const GARMENT_TYPE = "upper_body"

type DecodedImage = {
  extension: string
  data: Buffer
}

function dataUrlToImage(dataUrl: string): DecodedImage {
  const [meta, data] = dataUrl.split(",")
  const mimeType = /data:(.+?);base64/.exec(meta)?.[1] ?? "image/jpeg"
  const extension =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : "jpg"
  return { extension, data: Buffer.from(data, "base64") }
}

function mimeForPath(filePath: string): string {
  return filePath.toLowerCase().endsWith(".png")
    ? "image/png"
    : filePath.toLowerCase().endsWith(".webp")
      ? "image/webp"
      : "image/jpeg"
}

async function apiErrorMessage(error: unknown): Promise<string> {
  if (error instanceof ApiError) {
    try {
      const raw = await error.response.clone().text()
      const parsed = JSON.parse(raw) as { error?: { message?: string } }
      const message = parsed?.error?.message?.split("\n")[0]?.trim()
      if (message) {
        return message
      }
    } catch {
      // The upstream body was not JSON; fall through to the default message.
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Could not reach the Magic Hour API."
}

export async function POST(request: NextRequest) {
  let body: { person?: string; garment?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!body.person || !body.garment) {
    return NextResponse.json(
      { error: "Both a person photo and a garment photo are required." },
      { status: 400 }
    )
  }

  if (!API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "The Magic Hour API key is not configured. Add API_KEY to your .env file.",
      },
      { status: 500 }
    )
  }

  const person = dataUrlToImage(body.person)
  const garment = dataUrlToImage(body.garment)

  const dir = await mkdtemp(join(tmpdir(), "fittech-"))
  const personPath = join(dir, `person.${person.extension}`)
  const garmentPath = join(dir, `garment.${garment.extension}`)

  try {
    await writeFile(personPath, person.data)
    await writeFile(garmentPath, garment.data)

    const result = await client.v1.aiClothesChanger.generate(
      {
        assets: {
          garmentFilePath: garmentPath,
          garmentType: GARMENT_TYPE,
          personFilePath: personPath,
        },
        name: "FitTech Clothes Changer",
      },
      {
        waitForCompletion: true,
        downloadOutputs: true,
        downloadDirectory: dir,
      }
    )

    if (result.status !== "complete") {
      const detail = result.error
        ? `${result.error.message}`
        : `The generation ended with status "${result.status}".`
      return NextResponse.json({ error: detail }, { status: 502 })
    }

    const outputPath = result.downloadedPaths?.[0]

    if (!outputPath) {
      return NextResponse.json(
        { error: "The fitting service did not return an image." },
        { status: 502 }
      )
    }

    const output = await readFile(outputPath)
    const mimeType = mimeForPath(outputPath)
    const format = mimeType === "image/png" ? "png" : "jpg"

    return NextResponse.json({
      image: `data:${mimeType};base64,${output.toString("base64")}`,
      format,
    })
  } catch (error) {
    return NextResponse.json(
      { error: await apiErrorMessage(error) },
      {
        status:
          error instanceof ApiError && error.response.status === 401 ? 401 : 502,
      }
    )
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
