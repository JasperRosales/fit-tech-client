/* eslint-disable @next/next/no-img-element */
import { LockKeyholeIcon } from "lucide-react"

import { FittingRoomEntry } from "@/components/fitting-room-entry"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/fit-tech.ico"
              alt="FitTech logo"
              className="size-8 rounded-lg object-cover"
            />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">FitTech</span>
              <span className="text-[10px] text-muted-foreground">
                Virtual fitting room
              </span>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
            <LockKeyholeIcon className="size-3" />
            Photos stay on this device
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 sm:px-6">
        <section className="py-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            <span className="size-1.5 rounded-full bg-primary" />
            Virtual fitting room
          </div>
          <h1 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            See how clothes look on you before you buy
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Upload a photo of yourself and a garment, and FitTech will digitally
            try the outfit on you.
          </p>
        </section>

        <FittingRoomEntry />
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1.5 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} FitTech. All rights reserved.</span>
          <span>
            AI fitting powered by{" "}
            <a
              href="https://ai.google.dev/gemini-api/docs"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Google Gemini
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
