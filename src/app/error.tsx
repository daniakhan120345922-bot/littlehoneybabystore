"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-neutral-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-amber-100 px-6 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
      >
        Try again
      </button>
    </main>
  );
}
