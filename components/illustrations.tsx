import { cn } from "@/lib/utils"

function svgProps(className?: string) {
  return {
    viewBox: "0 0 96 96",
    fill: "none",
    "aria-hidden": true,
    className: cn("h-auto w-full", className),
  } as const
}

export function PersonIllustration({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="48" cy="48" r="44" className="fill-primary/10" />
      <circle
        cx="48"
        cy="33"
        r="13"
        className="fill-primary/15 stroke-primary/40"
        strokeWidth="2.5"
      />
      <path
        d="M18 87 C20 60 33 48 48 48 C63 48 76 60 78 87 Z"
        className="fill-primary/15 stroke-primary/40"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ClothingIllustration({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="48" cy="48" r="44" className="fill-primary/10" />
      <path
        d="M35 24 Q48 32 61 24 L79 40 L68 52 L64 47 L64 82 L32 82 L32 47 L28 52 L17 40 Z"
        className="fill-primary/15 stroke-primary/40"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M38 25 Q48 31 58 25"
        className="stroke-primary/30"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
