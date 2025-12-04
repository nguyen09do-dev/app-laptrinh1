export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-6 md:p-10 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="h-10 bg-midnight-800 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-midnight-800 rounded w-2/3"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6">
              <div className="h-4 bg-midnight-800 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-midnight-800 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-midnight-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Workflow Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="h-6 bg-midnight-800 rounded w-1/3 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-midnight-800 rounded mb-4"></div>
            ))}
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="h-6 bg-midnight-800 rounded w-1/2 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-midnight-800 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
