export default function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col" aria-hidden="true">
      <header className="border-b">
        <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 fixed top-0 w-full bg-background">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded bg-muted sm:h-8 sm:w-8" />
            <div className="hidden h-5 w-24 animate-pulse rounded bg-muted sm:block" />
          </div>
          <div className="hidden h-9 w-56 animate-pulse rounded-lg bg-muted sm:ml-2 sm:block" />
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 mt-16">
        <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
          <nav className="flex-1 space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </nav>
        </aside>

        <div className="mx-auto w-full max-w-7xl flex-2 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
