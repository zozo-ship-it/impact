import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ImpactScoreCircle, FormatBadge } from "@/components/ImpactScore";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  ArrowLeft, Zap, Target, Clock, Volume2, Palette,
  MousePointerClick, BookOpen, Sparkles, Loader2,
} from "lucide-react";

export default function BlueprintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: blueprint, isLoading } = trpc.blueprints.getById.useQuery({ id: Number(id) });

  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [generatedBrief, setGeneratedBrief] = useState<string | null>(null);

  const useBlueprintMutation = trpc.blueprints.use.useMutation({
    onSuccess: (data) => {
      setGeneratedBrief(data.brief);
      toast.success("Content brief generated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleUseBlueprint = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    useBlueprintMutation.mutate({
      blueprintId: Number(id),
      topic: topic.trim(),
      niche: niche.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Blueprint not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/blueprints")}>
          Back to Blueprints
        </Button>
      </div>
    );
  }

  const details = [
    { icon: Zap, label: "Hook Type", value: blueprint.hookType },
    { icon: Target, label: "Structure", value: blueprint.structure },
    { icon: Clock, label: "Pacing", value: blueprint.pacing },
    { icon: Clock, label: "Length", value: blueprint.length },
    { icon: Volume2, label: "Audio Strategy", value: blueprint.audioStrategy },
    { icon: Palette, label: "Visual Style", value: blueprint.visualStyle },
    { icon: MousePointerClick, label: "CTA Strategy", value: blueprint.ctaStrategy },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => setLocation("/blueprints")} className="text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blueprints
      </Button>

      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <FormatBadge format={blueprint.format} />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {blueprint.usageCount} uses
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{blueprint.name}</h1>
          {blueprint.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{blueprint.description}</p>
          )}
        </div>
        <ImpactScoreCircle score={blueprint.score || 0} size={100} />
      </div>

      {/* Blueprint Details */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Blueprint Specification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {details.map((item, i) => (
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

      {/* Use Blueprint */}
      <Card className="border-2 border-foreground/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-foreground" />
            Use This Blueprint
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate a personalized content brief adapted to your topic
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Your topic (e.g., 'morning routine for productivity')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Your niche (optional)"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="sm:w-[200px]"
            />
            <Button
              onClick={handleUseBlueprint}
              disabled={useBlueprintMutation.isPending || !topic.trim()}
              className="font-semibold"
            >
              {useBlueprintMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Brief"
              )}
            </Button>
          </div>

          {generatedBrief && (
            <div className="mt-4 p-5 rounded-lg bg-muted/50 border border-border">
              <div className="prose prose-sm max-w-none">
                <Streamdown>{generatedBrief}</Streamdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
