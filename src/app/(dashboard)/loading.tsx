// Shared loading skeleton component for dashboard pages
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-800 rounded-lg" />
          <div className="h-4 w-72 bg-surface-800/60 rounded" />
        </div>
        <div className="h-9 w-28 bg-surface-800 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-panel p-5 rounded-xl space-y-3">
            <div className="h-3 w-20 bg-surface-800 rounded" />
            <div className="h-7 w-32 bg-surface-800 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-800">
          <div className="h-9 w-64 bg-surface-800 rounded-lg" />
        </div>
        <div className="divide-y divide-surface-800">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="h-4 w-32 bg-surface-800 rounded" />
              <div className="h-4 w-48 bg-surface-800/60 rounded" />
              <div className="ml-auto h-4 w-20 bg-surface-800/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
