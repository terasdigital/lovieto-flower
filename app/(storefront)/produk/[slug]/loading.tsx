export default function ProdukDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="grid gap-10 md:grid-cols-2">
        <div className="h-[480px] rounded-lg bg-muted" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-16 w-full animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
