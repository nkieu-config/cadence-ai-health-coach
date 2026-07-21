import { LoadingLabel } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <LoadingLabel />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="min-h-54 space-y-4">
            <Skeleton className="h-4 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
        </CardContent>
      </Card>
    </main>
  );
}
