import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px] w-full">
      <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-semibold mb-3 tracking-tight">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] max-w-[420px] mb-8 text-base">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="btn-interaction inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)/90] h-10 px-8 py-2"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}




