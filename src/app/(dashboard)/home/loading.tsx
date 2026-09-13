export default function HomeLoading() {
  return (
    <div className="space-y-6 animate-pulse pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-surface-800 rounded-lg" />
          <div className="h-4 w-64 bg-surface-800/60 rounded" />
        </div>
        <div className="h-4 w-48 bg-surface-800/40 rounded hidden sm:block" />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel p-5 rounded-xl border-l-4 border-l-surface-700 space-y-3">
            <div className="h-3 w-20 bg-surface-800 rounded" />
            <div className="h-7 w-28 bg-surface-800 rounded" />
            <div className="h-3 w-16 bg-surface-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl lg:col-span-2" style={{ height: 320 }}>
          <div className="p-5 border-b border-surface-800">
            <div className="h-5 w-40 bg-surface-800 rounded" />
          </div>
          <div className="p-6 flex items-end gap-3 h-[calc(100%-60px)]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                <div className="bg-surface-800 rounded-sm" style={{ height: `${30 + Math.random() * 100}px` }} />
                <div className="bg-surface-700 rounded-sm" style={{ height: `${20 + Math.random() * 70}px` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-xl" style={{ height: 320 }}>
          <div className="p-5 border-b border-surface-800">
            <div className="h-5 w-32 bg-surface-800 rounded" />
          </div>
          <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] gap-4">
            <div className="w-32 h-32 rounded-full border-8 border-surface-800" />
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 w-16 bg-surface-800 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-xl overflow-hidden">
            <div className="p-5 border-b border-surface-800">
              <div className="h-5 w-36 bg-surface-800 rounded" />
            </div>
            <div className="divide-y divide-surface-800/50">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="px-5 py-3 flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 bg-surface-800 rounded" />
                    <div className="h-3 w-20 bg-surface-800/60 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-surface-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
