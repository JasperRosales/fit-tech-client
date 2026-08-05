import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-image"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const TRY_ON_PROMPT =
  "You are a virtual fitting room. Take the person shown in the first image " +
  "and the garment shown in the second image, and produce a realistic photo of " +
  "the person wearing that garment. Keep the person's face, body proportions, " +
  "pose, background, and lighting exactly the same. Match the garment's style, " +
  "color, pattern, and fabric to the garment image. Return only the resulting image."

type InlineData = { mimeType: string; data: string }

function dataUrlToInlineData(dataUrl: string): InlineData {
  const [meta, data] = dataUrl.split(",")
  const mimeType = /data:(.+?);base64/.exec(meta)?.[1] ?? "image/jpeg"
  return { mimeType, data }
}

function geminiErrorMessage(raw: string, status: number): string {
  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: string }
    }
    const message = parsed?.error?.message?.split("\n")[0]?.trim()
    if (message) {
      return message
    }
  } catch {
    // The upstream body was not JSON; fall back to the generic message.
  }

  return `Gemini returned an error (${status}).`
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

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "The Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.",
      },
      { status: 500 }
    )
  }

  const person = dataUrlToInlineData(body.person)
  const garment = dataUrlToInlineData(body.garment)

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: TRY_ON_PROMPT },
          { inline_data: { mime_type: person.mimeType, data: person.data } },
          { inline_data: { mime_type: garment.mimeType, data: garment.data } },
        ],
      },
    ],
    generationConfig: { responseModalities: ["IMAGE"] },
  }

  try {
    const upstream = await fetch(
      `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(90_000),
      }
    )

    const raw = await upstream.text()

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: geminiErrorMessage(raw, upstream.status),
          detail: raw.slice(0, 500),
        },
        { status: upstream.status === 429 ? 429 : 502 }
      )
    }

    let json: {
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }>
        }
      }>
      promptFeedback?: { blockReason?: string }
    }

    try {
      json = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        {
          error: "Gemini returned an unexpected response.",
          detail: raw.slice(0, 500),
        },
        { status: 502 }
      )
    }

    const part = json?.candidates?.[0]?.content?.parts?.find(
      (candidatePart) => candidatePart.inlineData?.data
    )

    if (!part?.inlineData?.data) {
      const blockReason = json?.promptFeedback?.blockReason
      return NextResponse.json(
        {
          error: blockReason
            ? `The request was blocked by Gemini (${blockReason}).`
            : "Gemini did not return an image.",
        },
        { status: 502 }
      )
    }

    const mimeType = part.inlineData.mimeType ?? "image/png"
    const format = mimeType === "image/png" ? "png" : "jpg"

    return NextResponse.json({
      image: `data:${mimeType};base64,${part.inlineData.data}`,
      format,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not reach the Gemini API.",
      },
      { status: 500 }
    )
  }
}
