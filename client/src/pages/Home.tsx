import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImpactScoreBadge, FormatBadge, NicheBadge, formatNumber } from "@/components/ImpactScore";
import { Search, Eye, Heart, MessageCircle, Users, TrendingUp, BarChart3, Layers } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [niche, setNiche] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [sortBy, setSortBy] = useState("score");
  const [search, setSearch] = useState("");

  const filters = useMemo(() => ({
    niche: niche !== "all" ? niche : undefined,
    format: format !== "all" ? format : undefined,
    sortBy,
    sortOrder: "desc" as const,
    search: search || undefined,
    limit: 50,
  }), [niche, format, sortBy, search]);

  const { data: postsData, isLoading } = trpc.posts.list.useQuery(filters);
  const { data: niches } = trpc.posts.niches.useQuery();
  const { data: stats } = trpc.stats.overview.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Content Library</h1>
        <p className="text-muted-foreground mt-1">
          Discover high-performing Instagram content, analyzed and scored by real impact.
        </p>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Posts Analyzed", value: stats.postCount, icon: BarChart3 },
            { label: "Creators Tracked", value: stats.creatorCount, icon: Users },
            { label: "Blueprints", value: stats.blueprintCount, icon: Layers },
            { label: "Avg Impact Score", value: stats.avgScore, icon: TrendingUp },
          ].map((stat) => (
            <Card key={stat.label} className="border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-extrabold font-mono mt-1 text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className="h-5 w-5 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
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
            <SelectItem value="score">Impact Score</SelectItem>
            <SelectItem value="views">Views</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="recency">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground font-medium">
            {postsData?.total || 0} posts found
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {postsData?.items.map((post) => (
              <Card
                key={post.id}
                className="border border-border hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setLocation(`/posts/${post.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.creatorHandle}
                      </p>
                    </div>
                    <ImpactScoreBadge score={post.impactScore || 0} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <FormatBadge format={post.format} />
                    {post.niche && <NicheBadge niche={post.niche} />}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{formatNumber(post.views)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{formatNumber(post.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{formatNumber(post.comments)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs">{formatNumber(post.followerCountAtPosting || 0)} followers</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {post.engagementRate?.toFixed(1)}% eng
                    </span>
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
