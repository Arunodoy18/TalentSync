import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold tracking-[0.12em] text-[#6b7280]">404</p>
      <h1 className="text-3xl font-bold text-[#212529]">Page not found</h1>
      <p className="max-w-xl text-[#6b7280]">
        The page you are trying to open does not exist or may have been moved.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className="rounded-full bg-[#003893] px-6 py-3 font-semibold text-white hover:opacity-90">
          Go to Dashboard
        </Link>
        <Link href="/" className="rounded-full border border-[#d1d5db] px-6 py-3 font-semibold text-[#212529] hover:bg-[#f9fafb]">
          Back Home
        </Link>
      </div>
    </main>
  );
}
