export default function LessonLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3.5 w-32 rounded bg-gray-200" />
        <div className="h-3 w-3 rounded bg-gray-200" />
        <div className="h-3.5 w-24 rounded bg-gray-200" />
        <div className="h-3 w-3 rounded bg-gray-200" />
        <div className="h-3.5 w-40 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video placeholder */}
          <div className="aspect-video w-full rounded-2xl bg-gray-200" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-7 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>

          {/* Description lines */}
          <div className="space-y-2 pt-1">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-9 w-40 rounded-lg bg-gray-200" />
            <div className="h-9 w-28 rounded-lg bg-gray-200" />
          </div>

          {/* Prev / Next nav */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-5">
            <div className="h-9 w-32 rounded-lg bg-gray-200" />
            <div className="h-9 w-32 rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sidebar header */}
          <div className="h-5 w-28 rounded bg-gray-200" />
          {/* Lesson list items */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
