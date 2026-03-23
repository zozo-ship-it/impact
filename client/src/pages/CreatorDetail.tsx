import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImpactScoreBadge, ImpactScoreCircle, FormatBadge, NicheBadge, formatNumber } from "@/components/ImpactScore";
import { ArrowLeft, Users, TrendingUp, Eye, BarChart3, Calendar, Film } from "lucide-react";

export default function CreatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: creator, isLoading } = trpc.creators.getById.useQuery({ id: Number(id) });
  const { data: creatorPosts } = trpc.posts.getByCreator.useQuery(
    { creatorId: Number(id) },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Creator not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/creators")}>
          Back to Creators
        </Button>
      </div>
    );
  }

  const metrics = [
    { icon: Users, label: "Followers", value: formatNumber(creator.followerCount) },
    { icon: TrendingUp, label: "Weekly Growth", value: `+${creator.weeklyGrowthRate?.toFixed(1)}%`, color: "text-emerald-600" },
    { icon: Eye, label: "Avg Views", value: formatNumber(creator.averageViews || 0) },
    { icon: BarChart3, label: "Engagement", value: `${creator.engagementRate?.toFixed(1)}%` },
    { icon: Calendar, label: "Posts/Week", value: `${creator.postingFrequency?.toFixed(1)}` },
    { icon: Film, label: "Top Format", value: creator.topFormat || "N/A" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => setLocation("/creators")} className="text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Creators
      </Button>

      {/* Creator Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="h-16 w-16 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl shrink-0">
            {creator.handle.replace("@", "").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{creator.handle}</h1>
              <ImpactScoreBadge score={creator.impactScore || 0} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              {creator.niche && <NicheBadge niche={creator.niche} />}
              {creator.topFormat && <FormatBadge format={creator.topFormat} />}
            </div>
            {creator.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{creator.bio}</p>
            )}
          </div>
        </div>
        <ImpactScoreCircle score={creator.impactScore || 0} size={100} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <p className={`text-xl font-extrabold font-mono ${m.color || "text-foreground"}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">What's Working</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-700 font-semibold">Strong Engagement</p>
            <p className="text-xs text-muted-foreground mt-1">
              {creator.engagementRate?.toFixed(1)}% engagement rate is {(creator.engagementRate || 0) > 5 ? "above" : "near"} the platform average. {creator.topFormat === "reel" ? "Reels are driving the most interaction." : creator.topFormat === "carousel" ? "Carousels are the strongest format." : "Image posts resonate well with the audience."}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Growth Trajectory</p>
            <p className="text-xs text-muted-foreground mt-1">
              Growing at {creator.weeklyGrowthRate?.toFixed(1)}% per week with {formatNumber(creator.averageViews || 0)} average views per post. Posting {creator.postingFrequency?.toFixed(1)}x per week.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Indexed Content */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Indexed Content ({creatorPosts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {creatorPosts && creatorPosts.length > 0 ? (
            <div className="space-y-3">
              {creatorPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => setLocation(`/posts/${post.id}`)}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FormatBadge format={post.format} />
                      <span className="text-xs text-muted-foreground">{formatNumber(post.views)} views</span>
                      <span className="text-xs text-muted-foreground">{post.engagementRate?.toFixed(1)}% eng</span>
                    </div>
                  </div>
                  <ImpactScoreBadge score={post.impactScore || 0} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No indexed content yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
