export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#040611]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--primary)]" />
        <p className="text-sm font-medium text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
