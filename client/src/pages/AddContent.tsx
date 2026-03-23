import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ImpactScoreBadge, FormatBadge, NicheBadge, formatNumber } from "@/components/ImpactScore";
import { toast } from "sonner";
import {
  Link2, Loader2, CheckCircle, ArrowRight, Eye, Heart,
  MessageCircle, Users, Zap, Target, Clock, Volume2,
  Palette, MousePointerClick, Brain, Sparkles, FileText,
  BarChart3, Crosshair, Smile,
} from "lucide-react";

function QualityBar({ label, score, icon: Icon }: { label: string; score: number | null; icon: any }) {
  if (score == null) return null;
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-xs font-mono font-bold text-foreground">{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function AddContentPage() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);

  const analyzeMutation = trpc.content.analyze.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Content analyzed and added to library!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast.error("Please enter an Instagram URL");
      return;
    }
    setResult(null);
    analyzeMutation.mutate({ url: url.trim() });
  };

  const a = result?.analysis;
  const hasGemini = result?.usedGemini;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Add Content</h1>
        <p className="text-muted-foreground mt-1">
          Paste an Instagram URL to analyze the post with AI vision, calculate its Impact Score, and add it to the library.
        </p>
      </div>

      {/* URL Input */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Link2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Instagram Post URL</p>
                <p className="text-xs text-muted-foreground">Supports reels, carousels, and image posts — AI analyzes the actual media</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="https://www.instagram.com/p/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !url.trim()}
                className="font-semibold min-w-[120px]"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {analyzeMutation.isPending && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Loader2 className="h-8 w-8 text-foreground animate-spin" />
                <Brain className="h-4 w-4 text-muted-foreground absolute -right-1 -bottom-1" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Deep content analysis in progress...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fetching real data from Instagram → Analyzing media with Gemini AI → Scoring performance → Generating blueprint
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-600">Analysis Complete — Added to Library</span>
            {result.usedBrightData && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">Live Data</span>
            )}
            {hasGemini && (
              <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-200 flex items-center gap-1">
                <Brain className="h-3 w-3" /> AI Vision
              </span>
            )}
          </div>

          {/* Score & Overview */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.creatorHandle}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <FormatBadge format={a.format} />
                    <NicheBadge niche={a.niche} />
                    {a.emotionalTone && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-1">
                        <Smile className="h-3 w-3" /> {a.emotionalTone}
                      </span>
                    )}
                  </div>
                </div>
                <ImpactScoreBadge score={result.impactScore} size="lg" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-4 border-t border-border">
                {[
                  { icon: Eye, label: "Views", value: formatNumber(a.views) },
                  { icon: Heart, label: "Likes", value: formatNumber(a.likes) },
                  { icon: MessageCircle, label: "Comments", value: formatNumber(a.comments) },
                  { icon: Users, label: "Followers", value: formatNumber(a.followerCountAtPosting) },
                  { icon: Zap, label: "Engagement", value: `${Number(a.engagementRate).toFixed(1)}%` },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <m.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm font-extrabold font-mono text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gemini Quality Scores */}
          {hasGemini && (a.hookScore != null || a.structureScore != null) && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Content Quality Scores
                  <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-200">AI Vision</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <QualityBar label="Hook Strength" score={a.hookScore} icon={Zap} />
                <QualityBar label="Content Structure" score={a.structureScore} icon={Target} />
                <QualityBar label="CTA Effectiveness" score={a.ctaScore} icon={MousePointerClick} />
                <QualityBar label="Visual Quality" score={a.visualScore} icon={Palette} />
                <QualityBar label="Overall Quality" score={a.overallQualityScore} icon={Sparkles} />
              </CardContent>
            </Card>
          )}

          {/* Hook Analysis */}
          {hasGemini && a.hookAnalysis && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Hook Analysis
                  {a.hookStrength && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      a.hookStrength === 'strong' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      a.hookStrength === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {a.hookStrength}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.hookAnalysis}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Messages & Target Audience */}
          {hasGemini && (a.keyMessages?.length > 0 || a.targetAudience) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {a.keyMessages?.length > 0 && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Key Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {a.keyMessages.map((msg: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-foreground font-mono font-bold mt-px">{i + 1}.</span>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {a.targetAudience && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Crosshair className="h-4 w-4" /> Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.targetAudience}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Transcript */}
          {hasGemini && a.transcript && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Transcript / Text Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{a.transcript}</p>
              </CardContent>
            </Card>
          )}

          {/* Blueprint Preview */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Content Blueprint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Zap, label: "Hook", value: a.hookType },
                { icon: Target, label: "Structure", value: a.contentStructure },
                { icon: Clock, label: "Pacing", value: a.pacing },
                { icon: Volume2, label: "Audio", value: a.audioStrategy },
                { icon: Palette, label: "Visual", value: a.visualStyle },
                { icon: MousePointerClick, label: "CTA", value: a.ctaStrategy },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="h-4 w-4 text-foreground/70 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground">{item.label}: </span>
                    <span className="text-xs text-muted-foreground">{item.value || "—"}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setLocation(`/posts/${result.postId}`)}>
              View Full Analysis <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            {result.blueprintId && (
              <Button variant="outline" onClick={() => setLocation(`/blueprints/${result.blueprintId}`)}>
                View Blueprint <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            <Button variant="outline" onClick={() => { setUrl(""); setResult(null); }}>
              Analyze Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
