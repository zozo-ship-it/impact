import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImpactScoreBadge, FormatBadge, NicheBadge, formatNumber } from "@/components/ImpactScore";
import { Search, Users, TrendingUp, Eye, BarChart3 } from "lucide-react";

export default function CreatorsPage() {
  const [, setLocation] = useLocation();
  const [niche, setNiche] = useState<string>("all");
  const [sortBy, setSortBy] = useState("score");
  const [search, setSearch] = useState("");

  const filters = useMemo(() => ({
    niche: niche !== "all" ? niche : undefined,
    sortBy,
    sortOrder: "desc" as const,
    search: search || undefined,
    limit: 50,
  }), [niche, sortBy, search]);

  const { data: creatorsData, isLoading } = trpc.creators.list.useQuery(filters);
  const { data: niches } = trpc.creators.niches.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Creator Profiles</h1>
        <p className="text-muted-foreground mt-1">
          Tracked creators with performance analytics and growth metrics.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Niches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {niches?.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Impact Score</SelectItem>
            <SelectItem value="followers">Followers</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="growth">Growth Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Creators Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardContent className="p-5">
                <Skeleton className="h-12 w-12 rounded-full mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground font-medium">
            {creatorsData?.total || 0} creators tracked
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {creatorsData?.items.map((creator) => (
              <Card
                key={creator.id}
                className="border border-border hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setLocation(`/creators/${creator.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-sm">
                        {creator.handle.replace("@", "").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                          {creator.handle}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {creator.niche && <NicheBadge niche={creator.niche} />}
                          {creator.topFormat && <FormatBadge format={creator.topFormat} />}
                        </div>
                      </div>
                    </div>
                    <ImpactScoreBadge score={creator.impactScore || 0} size="sm" />
                  </div>

                  {creator.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {creator.bio}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{formatNumber(creator.followerCount)}</span>
                      <span className="text-xs text-muted-foreground">followers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600">+{creator.weeklyGrowthRate?.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground">/week</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{formatNumber(creator.averageViews || 0)}</span>
                      <span className="text-xs text-muted-foreground">avg views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{creator.engagementRate?.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground">eng rate</span>
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
