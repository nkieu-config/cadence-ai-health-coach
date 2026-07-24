import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingLabel() {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      กำลังโหลด
    </span>
  );
}

export function TextCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }, (_, line) => (
          <Skeleton key={line} className={cn("h-4", line === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </CardContent>
    </Card>
  );
}

export function TextPageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <PageContainer width="content" className="space-y-6">
      <LoadingLabel />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: cards }, (_, card) => (
          <TextCardSkeleton key={card} />
        ))}
      </div>
    </PageContainer>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-11 w-20 rounded-full" />
              <Skeleton className="h-11 w-24 rounded-full" />
              <Skeleton className="h-11 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// หน้าเช็คอินใช้ width="content" + คอลัมน์ฟอร์ม max-w-md (step rail อยู่ซ้ายที่ lg)
// โครงนี้ต้องตรงกับหน้าจริง ไม่งั้นเนื้อหากระโดดตอน stream เข้า
export function FormSkeleton() {
  return (
    <PageContainer width="content" className="space-y-6">
      <LoadingLabel />
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,28rem)] lg:items-start lg:gap-8">
        <div className="hidden space-y-2 lg:block">
          {Array.from({ length: 4 }, (_, row) => (
            <Skeleton key={row} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <CardSkeleton rows={3} />
        </div>
      </div>
    </PageContainer>
  );
}

export function HistorySkeleton() {
  return (
    <PageContainer width="content" className="space-y-4">
      <LoadingLabel />
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-6">
        {Array.from({ length: 2 }, (_, section) => (
          <div key={section} className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-3 lg:grid-cols-2">
              {Array.from({ length: 4 }, (_, card) => (
                <Skeleton key={card} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export function ContentSkeleton() {
  return (
    <PageContainer width="content" className="space-y-6">
      <LoadingLabel />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full rounded-full lg:w-72" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
