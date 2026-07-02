type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`kl-skeleton ${className}`.trim()}
      aria-hidden
    />
  );
}
