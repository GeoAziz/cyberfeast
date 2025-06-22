
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="space-y-8">
      <header>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
