const Loading = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 rounded w-24"></div>
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="card p-6">
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading