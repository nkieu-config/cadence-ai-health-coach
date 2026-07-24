import { LoadingLabel } from "@/components/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

function CoachTurnSkeleton({ tail }: { tail: string }) {
  return (
    <div className="flex gap-2.5">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className={`h-4 ${tail}`} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-4">
      <LoadingLabel />

      <div className="shrink-0 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex h-[calc(100dvh-17.75rem-env(safe-area-inset-top,0px))] min-h-96 flex-col gap-3 lg:h-[calc(100dvh-13rem)]">
        <div className="flex-1 space-y-6">
          <CoachTurnSkeleton tail="w-4/5" />
          <div className="flex justify-end">
            <Skeleton className="h-11 w-3/5 rounded-2xl rounded-br-sm" />
          </div>
          <CoachTurnSkeleton tail="w-3/4" />
        </div>

        <div className="flex items-end gap-2">
          <Skeleton className="h-11 flex-1 rounded-2xl" />
          <Skeleton className="size-11 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
