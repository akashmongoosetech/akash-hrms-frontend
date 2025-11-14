import { cn } from "../../lib/utils";

export function BaseSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
}

export function UniversalSkeleton({
  type = "card",
  rows = 5,
  columns = 5,
  count = 8,
  lines = 3,
  size = 40,
  className = "",
}) {
  // -------------------------------------------------------------
  // CARD SKELETON
  // -------------------------------------------------------------
  if (type === "card") {
    return (
      <div className={cn("p-3 bg-white dark:bg-neutral-900 rounded-lg border", className)}>
        <BaseSkeleton className="w-full h-40 mb-3 rounded-lg" />
        <BaseSkeleton className="w-3/4 h-4 mb-2" />
        <BaseSkeleton className="w-1/2 h-4" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // GRID SKELETON
  // -------------------------------------------------------------
  if (type === "grid") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border rounded-lg p-3 bg-white dark:bg-neutral-900">
            <BaseSkeleton className="w-full h-40 mb-3 rounded-lg" />
            <BaseSkeleton className="w-3/4 h-4 mb-2" />
            <BaseSkeleton className="w-1/2 h-4" />
          </div>
        ))}
      </div>
    );
  }

  // -------------------------------------------------------------
  // TABLE SKELETON
  // -------------------------------------------------------------
  if (type === "table") {
    return (
      <div className={cn("w-full border rounded-lg overflow-hidden", className)}>
        {/* Header */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {[...Array(columns)].map((_, i) => (
            <BaseSkeleton key={i} className="h-6 m-2" />
          ))}
        </div>

        {/* Rows */}
        {[...Array(rows)].map((_, r) => (
          <div
            key={r}
            className="grid py-2"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {[...Array(columns)].map((_, c) => (
              <BaseSkeleton key={c} className="h-5 m-2" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEXT LINES
  // -------------------------------------------------------------
  if (type === "text") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {[...Array(lines)].map((_, i) => (
          <BaseSkeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  // -------------------------------------------------------------
  // AVATAR
  // -------------------------------------------------------------
  if (type === "avatar") {
    return (
      <BaseSkeleton
        className={cn("rounded-full", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  // -------------------------------------------------------------
  // DEFAULT FALLBACK
  // -------------------------------------------------------------
  return <BaseSkeleton className={className} />;
}
