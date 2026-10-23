import TrainSeatCardSkeleton from "@/components/common/TrainSeatLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6 pt-5">
        <div className="h-20 animate-pulse rounded-2xl bg-brand-100" />
        {Array.from({ length: 3 }).map((_, i) => (
          <TrainSeatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
