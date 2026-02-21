import Skeleton from "../ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Summary kartice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>

      {/* Grafikoni */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-48 w-full rounded-full mx-auto max-w-[200px]" />
        </div>
      </div>

      {/* Poslednje transakcije */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-5 w-44 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
