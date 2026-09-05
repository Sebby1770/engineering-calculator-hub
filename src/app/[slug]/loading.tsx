export default function CalculatorPageLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8" role="status">
      <span className="sr-only">Loading calculator page…</span>
      <div className="h-4 w-64 rounded bg-surface-100 dark:bg-surface-800" />
      <div className="mt-8 h-10 w-3/5 max-w-xl rounded bg-surface-100 dark:bg-surface-800" />
      <div className="mt-3 h-5 w-4/5 max-w-2xl rounded bg-surface-100 dark:bg-surface-800" />
      <div className="mt-8 rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-20 rounded-lg bg-surface-100 dark:bg-surface-800" />
          <div className="h-20 rounded-lg bg-surface-100 dark:bg-surface-800" />
        </div>
        <div className="mt-5 h-12 w-40 rounded-lg bg-brand-100 dark:bg-brand-950" />
      </div>
    </div>
  );
}
