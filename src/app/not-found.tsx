import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#040611] text-white p-6 text-center">
      <h2 className="mb-2 text-6xl font-bold text-[var(--primary)]">404</h2>
      <h3 className="mb-4 text-2xl font-semibold">Page Not Found</h3>
      <p className="mb-8 text-gray-400">Could not find requested resource or the page has been moved.</p>
      <Link 
        href="/"
        className="rounded-xl px-8 py-3 bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)] transition-all"
      >
        Return Home
      </Link>
    </div>
  )
}
