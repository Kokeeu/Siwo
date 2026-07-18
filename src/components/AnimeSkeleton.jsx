export default function AnimeSkeleton({ count = 20 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-white/60 shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]"
        >
          <div className="aspect-[2/3] bg-[#e2e8f0]" />
          <div className="p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-[#e2e8f0]" />
            <div className="h-3 w-1/2 rounded bg-[#e2e8f0]" />
          </div>
        </div>
      ))}
    </div>
  );
}
