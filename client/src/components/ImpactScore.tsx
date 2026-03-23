import { cn } from "@/lib/utils";

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-700";
  if (score >= 75) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number) {
  if (score >= 90) return "bg-emerald-50 border-emerald-200";
  if (score >= 75) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-blue-50 border-blue-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Elite";
  if (score >= 75) return "High";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Low";
}

function getScoreStroke(score: number) {
  if (score >= 90) return "text-emerald-500";
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export function ImpactScoreBadge({
  score,
  size = "md",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono font-semibold",
        getScoreBg(score),
        getScoreColor(score),
        sizeClasses[size],
        className
      )}
    >
      {score}
      <span className="text-[0.7em] opacity-70 font-sans font-medium">
        {getScoreLabel(score)}
      </span>
    </span>
  );
}

export function ImpactScoreCircle({
  score,
  size = 64,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={getScoreStroke(score)}
        />
      </svg>
      <span className={cn("absolute font-mono font-bold", getScoreColor(score))} style={{ fontSize: size * 0.28 }}>
        {score}
      </span>
    </div>
  );
}

export function FormatBadge({ format, className }: { format: string; className?: string }) {
  const colors: Record<string, string> = {
    reel: "bg-violet-50 text-violet-700 border-violet-200",
    carousel: "bg-blue-50 text-blue-700 border-blue-200",
    image: "bg-teal-50 text-teal-700 border-teal-200",
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium capitalize", colors[format] || "bg-muted text-muted-foreground border-border", className)}>
      {format}
    </span>
  );
}

export function NicheBadge({ niche, className }: { niche: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-muted/50 text-xs text-muted-foreground", className)}>
      {niche}
    </span>
  );
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
