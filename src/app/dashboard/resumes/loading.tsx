export default function Loading() {
  return (
    <div className="flex-1 space-y-6">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-[#e5e7eb]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 animate-pulse rounded-2xl bg-[#f3f4f6]" />
        <div className="h-36 animate-pulse rounded-2xl bg-[#f3f4f6]" />
        <div className="h-36 animate-pulse rounded-2xl bg-[#f3f4f6]" />
      </div>
    </div>
  );
}