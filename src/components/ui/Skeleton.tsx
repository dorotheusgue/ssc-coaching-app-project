/**
 * Token-styled placeholder block. Use as a fallback inside <Suspense>
 * or as a loading state in client components.
 */
export function Skeleton({ className = "" }: { className?: string }) {
 return <div className={`bg-ink/10 animate-pulse ${className}`} />;
}
