"use client"

import dynamic from "next/dynamic"

import { FittingRoomSkeleton } from "@/components/fitting-room-skeleton"

const FittingRoom = dynamic(
  () => import("@/components/fitting-room").then((mod) => mod.FittingRoom),
  {
    loading: () => <FittingRoomSkeleton />,
  }
)

export function FittingRoomEntry() {
  return <FittingRoom />
}
