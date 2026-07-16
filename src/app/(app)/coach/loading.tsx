import { PageContainer } from "@/components/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <PageContainer>
      <div className="flex flex-col space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Message bubble skeletons inside a card container */}
        <Card className="flex min-h-[400px] flex-col justify-between p-4">
          <div className="flex-1 space-y-4">
            <div className="flex justify-start">
              <Skeleton className="h-16 w-2/3 rounded-2xl rounded-tl-none" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-12 w-1/2 rounded-2xl rounded-tr-none" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-3/4 rounded-2xl rounded-tl-none" />
            </div>
          </div>

          {/* Chips and Input skeletons */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex gap-2">
              <Skeleton className="h-11 w-44 rounded-full" />
              <Skeleton className="h-11 w-44 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-11 flex-1 rounded-md" />
              <Skeleton className="h-11 w-16 rounded-md" />
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
