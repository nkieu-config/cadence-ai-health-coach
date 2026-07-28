import { LoadingLabel } from "@/components/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

function CoachTurnSkeleton({ tail }: { tail: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className={`h-4 ${tail}`} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[46rem] flex-col">
      <LoadingLabel />

      <div className="flex h-[calc(100dvh-14rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] min-h-48 flex-col gap-3 lg:h-[calc(100dvh-8.5rem)]">
        <div className="flex min-h-11 shrink-0 items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="hidden h-4 w-72 lg:block" />
          </div>
          <Skeleton className="h-11 w-28 shrink-0 rounded-lg" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card">
          <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden p-5">
            <CoachTurnSkeleton tail="w-4/5" />
            <div className="flex justify-end">
              <Skeleton className="h-11 w-3/5 rounded-2xl rounded-br-sm" />
            </div>
            <CoachTurnSkeleton tail="w-3/4" />
          </div>

          <div className="shrink-0 border-t border-border/40 p-5">
            <div className="flex items-end gap-2">
              <Skeleton className="h-11 flex-1 rounded-lg" />
              <Skeleton className="size-11 shrink-0 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
