import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ImpactScoreBadge, ImpactScoreCircle, FormatBadge, NicheBadge, formatNumber } from "@/components/ImpactScore";
import {
  ArrowLeft, Eye, Heart, MessageCircle, Users, ExternalLink,
  Zap, Target, Clock, Volume2, Palette, MousePointerClick, Layers,
  Brain, BarChart3, FileText, Crosshair, Smile, Sparkles,
} from "lucide-react";

function QualityBar({ label, score, icon: Icon }: { label: string; score: number | null | undefined; icon: any }) {
  if (score == null) return null;
  const s = Number(score);
  const color = s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-xs font-mono font-bold text-foreground">{s}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${s}%` }} />
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id: Number(id) });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Post not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/")}>
          Back to Library
        </Button>
      </div>
    );
  }

  const p = post as any;
  const hasGemini = p.hookScore != null || p.hookAnalysis;

  const blueprintItems = [
    { icon: Zap, label: "Hook Type", value: post.hookType },
    { icon: Target, label: "Content Structure", value: post.contentStructure },
    { icon: Clock, label: "Pacing", value: post.pacing },
    { icon: Clock, label: "Length", value: post.length },
    { icon: Volume2, label: "Audio Strategy", value: post.audioStrategy },
    { icon: Palette, label: "Visual Style", value: post.visualStyle },
    { icon: MousePointerClick, label: "CTA Strategy", value: post.ctaStrategy },
  ];

  const keyMessages: string[] = Array.isArray(p.keyMessages) ? p.keyMessages : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Library
      </Button>

      {/* Post Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <FormatBadge format={post.format} />
            {post.niche && <NicheBadge niche={post.niche} />}
            {hasGemini && (
              <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-200 flex items-center gap-1">
                <Brain className="h-3 w-3" /> AI Vision Analysis
              </span>
            )}
            {p.emotionalTone && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-1">
                <Smile className="h-3 w-3" /> {p.emotionalTone}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{post.title}</h1>
          <button
            onClick={() => setLocation(`/creators/${post.creatorId}`)}
            className="text-foreground/70 hover:text-foreground hover:underline text-sm mt-2 font-medium transition-colors"
          >
            {post.creatorHandle}
          </button>
          {post.caption && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{post.caption}</p>
          )}
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors">
              <ExternalLink className="h-3 w-3" /> View Original
            </a>
          )}
        </div>
        <ImpactScoreCircle score={post.impactScore || 0} size={100} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Eye, label: "Views", value: formatNumber(post.views) },
          { icon: Heart, label: "Likes", value: formatNumber(post.likes) },
          { icon: MessageCircle, label: "Comments", value: formatNumber(post.comments) },
          { icon: Users, label: "Followers", value: formatNumber(post.followerCountAtPosting || 0) },
          { icon: Zap, label: "Engagement", value: `${Number(post.engagementRate || 0).toFixed(1)}%` },
        ].map((m) => (
          <Card key={m.label} className="border border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <m.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-lg font-extrabold font-mono text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gemini Quality Scores */}
      {hasGemini && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Content Quality Scores
              <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-200">AI Vision</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Scored by Gemini AI analyzing the actual media content</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <QualityBar label="Hook Strength" score={p.hookScore} icon={Zap} />
            <QualityBar label="Content Structure" score={p.structureScore} icon={Target} />
            <QualityBar label="CTA Effectiveness" score={p.ctaScore} icon={MousePointerClick} />
            <QualityBar label="Visual Quality" score={p.visualScore} icon={Palette} />
            <QualityBar label="Overall Quality" score={p.overallQualityScore} icon={Sparkles} />
          </CardContent>
        </Card>
      )}

      {/* Hook Analysis */}
      {p.hookAnalysis && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Zap className="h-4 w-4" /> Hook Analysis
              {p.hookStrength && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  p.hookStrength === 'strong' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  p.hookStrength === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {p.hookStrength}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.hookAnalysis}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Messages & Target Audience */}
      {(keyMessages.length > 0 || p.targetAudience) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyMessages.length > 0 && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Key Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {keyMessages.map((msg: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-foreground font-mono font-bold mt-px shrink-0">{i + 1}.</span>
                      {msg}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {p.targetAudience && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Crosshair className="h-4 w-4" /> Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.targetAudience}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Transcript */}
      {p.transcript && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Volume2 className="h-4 w-4" /> Transcript / Text Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">{p.transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Content Blueprint */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-foreground" />
            Content Blueprint
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Reverse-engineered production template for this content
          </p>
        </CardHeader>
        <CardContent className="space-y-0">
          {blueprintItems.map((item, i) => (
            item.value && (
              <div key={item.label}>
                {i > 0 && <Separator className="my-4" />}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.value}</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </CardContent>
      </Card>

      {/* Hashtags */}
      {post.hashtags && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Hashtags</p>
            <div className="flex flex-wrap gap-2">
              {post.hashtags.split(/[,\s]+/).filter(Boolean).map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
