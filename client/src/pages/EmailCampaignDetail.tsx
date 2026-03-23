import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Mail,
  Eye,
  MousePointerClick,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Send,
  UserMinus,
  ShieldAlert,
  BarChart3,
  Target,
  Heart,
  Lightbulb,
} from "lucide-react";

function ScoreRing({ score, label, size = "md" }: { score: number; label: string; size?: "sm" | "md" }) {
  const color = score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const bg = score >= 75 ? "bg-green-50" : score >= 50 ? "bg-yellow-50" : "bg-red-50";
  const isMd = size === "md";
  return (
    <div className={`flex flex-col items-center gap-2 ${isMd ? "p-4" : "p-3"} rounded-lg ${bg}`}>
      <span className={`${isMd ? "text-3xl" : "text-2xl"} font-extrabold font-mono ${color}`}>{score}</span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function EmailCampaignDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const id = Number(params.id);

  const { data: campaign, isLoading, refetch } = trpc.email.getById.useQuery({ id });
  const analyzeMutation = trpc.email.analyze.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-semibold text-foreground">Campaign not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/email")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to campaigns
        </Button>
      </div>
    );
  }

  const hasAnalysis = campaign.overallScore != null;
  const recommendations: string[] = campaign.recommendations
    ? (typeof campaign.recommendations === 'string' ? JSON.parse(campaign.recommendations) : campaign.recommendations)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => setLocation("/email")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{campaign.subject || campaign.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize">{campaign.status}</Badge>
            {campaign.fromName && (
              <span className="text-sm text-muted-foreground">
                From: {campaign.fromName} &lt;{campaign.fromEmail}&gt;
              </span>
            )}
          </div>
        </div>
        {campaign.status === "sent" && (
          <Button
            onClick={() => analyzeMutation.mutate({ campaignId: campaign.id })}
            disabled={analyzeMutation.isPending}
          >
            <Sparkles className={`h-4 w-4 mr-1.5 ${analyzeMutation.isPending ? "animate-pulse" : ""}`} />
            {analyzeMutation.isPending ? "Analyzing..." : hasAnalysis ? "Re-Analyze" : "Analyze with AI"}
          </Button>
        )}
      </div>

      {/* Performance Stats */}
      {campaign.status === "sent" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Sent", value: campaign.sent?.toLocaleString() || "0", icon: Send },
            { label: "Opens", value: campaign.opensCount?.toLocaleString() || "0", icon: Eye, sub: `${campaign.openRate}%` },
            { label: "Unique Opens", value: campaign.uniqueOpens?.toLocaleString() || "0", icon: Eye },
            { label: "Clicks", value: campaign.clicksCount?.toLocaleString() || "0", icon: MousePointerClick, sub: `${campaign.clickRate}%` },
            { label: "Click-to-Open", value: `${campaign.clickToOpenRate}%`, icon: TrendingUp },
            { label: "Unsubscribes", value: campaign.unsubscribes?.toString() || "0", icon: UserMinus, sub: `${campaign.unsubscribeRate}%` },
            { label: "Spam Reports", value: campaign.spamCount?.toString() || "0", icon: ShieldAlert },
          ].map((stat) => (
            <Card key={stat.label} className="border border-border shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
                <p className="text-xl font-extrabold font-mono text-foreground">{stat.value}</p>
                {stat.sub && <p className="text-xs text-muted-foreground font-mono">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Analysis */}
      {hasAnalysis && (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreRing score={campaign.overallScore!} label="Overall Score" size="md" />
            <ScoreRing score={campaign.subjectLineScore!} label="Subject Line" size="sm" />
            <ScoreRing score={campaign.contentScore!} label="Content" size="sm" />
            <ScoreRing score={campaign.ctaScore!} label="CTA" size="sm" />
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Subject Line Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Progress value={campaign.subjectLineScore!} className="flex-1" />
                  <span className="text-sm font-bold font-mono">{campaign.subjectLineScore}/100</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{campaign.subjectLineAnalysis}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Progress value={campaign.contentScore!} className="flex-1" />
                  <span className="text-sm font-bold font-mono">{campaign.contentScore}/100</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{campaign.contentAnalysis}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4" /> CTA Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Progress value={campaign.ctaScore!} className="flex-1" />
                  <span className="text-sm font-bold font-mono">{campaign.ctaScore}/100</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{campaign.ctaAnalysis}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" /> Audience & Tone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Target Audience</p>
                  <p className="text-sm text-foreground">{campaign.targetAudience}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Emotional Tone</p>
                  <Badge variant="outline">{campaign.emotionalTone}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground/5 text-xs font-bold text-foreground shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Not analyzed yet prompt */}
      {!hasAnalysis && campaign.status === "sent" && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground">Ready for AI Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Get detailed insights on your subject line, content quality, CTA effectiveness, and actionable recommendations.
            </p>
            <Button
              className="mt-4"
              onClick={() => analyzeMutation.mutate({ campaignId: campaign.id })}
              disabled={analyzeMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Campaign Name</p>
              <p className="font-medium text-foreground">{campaign.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Type</p>
              <p className="font-medium text-foreground capitalize">{campaign.type}</p>
            </div>
            {campaign.previewText && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-1">Preview Text</p>
                <p className="font-medium text-foreground">{campaign.previewText}</p>
              </div>
            )}
            {campaign.sentAt && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Sent At</p>
                <p className="font-medium text-foreground">{new Date(campaign.sentAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
