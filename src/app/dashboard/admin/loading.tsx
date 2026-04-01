export default function Loading() {
  return (
    <div className="flex-1 space-y-6">
      <div className="skeleton-glass h-9 w-64" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="skeleton-glass h-36" />
        <div className="skeleton-glass h-36" />
        <div className="skeleton-glass h-36" />
      </div>
    </div>
  );
}