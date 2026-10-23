export default function TrainSeatCardSkeleton() {
  return (
    <div className="w-full max-w-5xl rounded-xl border bg-white p-6 shadow-sm animate-pulse">
      {/* Header */}
      <div className="flex justify-between">
        <div className="space-y-3">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-12 bg-gray-200 rounded-full" />
      </div>

      {/* Seats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-gray-100 p-4 space-y-3">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
