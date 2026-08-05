import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FittingRoomSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
        </CardContent>
      </Card>

      <div className="hidden flex-col gap-4 lg:flex">
        <Skeleton className="h-28 w-full rounded-4xl" />
        <Skeleton className="h-28 w-full rounded-4xl" />
        <Skeleton className="h-44 w-full rounded-4xl" />
      </div>
    </div>
  )
}
