import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImpactScoreBadge, FormatBadge } from "@/components/ImpactScore";
import { Zap, Target, Clock, MousePointerClick, BookOpen } from "lucide-react";

export default function BlueprintsPage() {
  const [, setLocation] = useLocation();
  const [format, setFormat] = useState<string>("all");
  const [sortBy, setSortBy] = useState("score");

  const filters = useMemo(() => ({
    format: format !== "all" ? format : undefined,
    sortBy,
    sortOrder: "desc" as const,
    limit: 50,
  }), [format, sortBy]);

  const { data: blueprintsData, isLoading } = trpc.blueprints.list.useQuery(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Blueprints</h1>
        <p className="text-muted-foreground mt-1">
          Proven content structures extracted from the highest-performing posts. Use them to create your own winning content.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="reel">Reel</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Highest Score</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Blueprints Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground font-medium">
            {blueprintsData?.total || 0} blueprints available
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blueprintsData?.items.map((bp) => (
              <Card
                key={bp.id}
                className="border border-border hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setLocation(`/blueprints/${bp.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                        {bp.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <FormatBadge format={bp.format} />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {bp.usageCount} uses
                        </span>
                      </div>
                    </div>
                    <ImpactScoreBadge score={bp.score || 0} size="sm" />
                  </div>

                  {bp.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {bp.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground truncate">{bp.hookType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground truncate">{bp.pacing}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground truncate">{bp.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground truncate">CTA included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
