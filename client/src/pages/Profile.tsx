import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ImpactScoreCircle, formatNumber } from "@/components/ImpactScore";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { toast } from "sonner";
import {
  AlertTriangle, AlertCircle, Info, Instagram, Sparkles, BarChart3,
} from "lucide-react";

export default function ProfilePage() {
  const [handle, setHandle] = useState("");
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: comparison } = trpc.profile.comparison.useQuery(undefined, { enabled: !!profile });
  const utils = trpc.useUtils();
  const connectMutation = trpc.profile.connect.useMutation({
    onSuccess: () => {
      toast.success("Profile connected successfully!");
      utils.profile.get.invalidate();
      utils.profile.comparison.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // AI Coach chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are an expert Instagram growth coach. Provide specific, actionable advice based on the user's profile data.",
    },
  ]);

  const chatMutation = trpc.coach.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  const handleConnect = () => {
    if (!handle.trim()) {
      toast.error("Please enter your Instagram handle");
      return;
    }
    connectMutation.mutate({ instagramHandle: handle.trim() });
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Not connected state
  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Connect your Instagram to see your performance and get AI coaching.
          </p>
        </div>

        <Card className="border border-border shadow-sm max-w-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Instagram className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Connect Your Instagram</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Enter your Instagram handle to analyze your content, compare against top creators, and get personalized coaching.
                </p>
              </div>
              <div className="flex gap-2 w-full max-w-sm">
                <Input
                  placeholder="@yourhandle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                />
                <Button onClick={handleConnect} disabled={connectMutation.isPending}>
                  {connectMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const diagnostics = profile.diagnostics ? JSON.parse(profile.diagnostics as string) : [];

  const severityConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    high: { icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    medium: { icon: AlertCircle, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    low: { icon: Info, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Your performance analysis and AI-powered coaching.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="border border-border shadow-sm flex-1">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-lg shrink-0">
                {profile.instagramHandle.replace("@", "").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile.instagramHandle}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{profile.niche}</p>
                {profile.bio && <p className="text-xs text-muted-foreground mt-2">{profile.bio}</p>}
              </div>
              <ImpactScoreCircle score={profile.impactScore || 0} size={80} />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Followers</p>
                <p className="text-lg font-extrabold font-mono text-foreground">{formatNumber(profile.followerCount || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Views</p>
                <p className="text-lg font-extrabold font-mono text-foreground">{formatNumber(profile.averageViews || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-lg font-extrabold font-mono text-foreground">{profile.engagementRate?.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Card */}
        {comparison && (
          <Card className="border border-border shadow-sm flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <BarChart3 className="h-4 w-4 text-foreground" />
                vs. Library Average
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Impact Score", yours: Number(profile.impactScore) || 0, avg: Number(comparison.libraryAvg.impactScore) || 0, suffix: "" },
                { label: "Engagement Rate", yours: Number(profile.engagementRate) || 0, avg: Number(comparison.libraryAvg.avgEngagement) || 0, suffix: "%" },
                { label: "Avg Views", yours: Number(profile.averageViews) || 0, avg: Number(comparison.libraryAvg.avgViews) || 0, suffix: "", isNumber: true },
              ].map((item) => {
                const ratio = item.avg > 0 ? (item.yours / item.avg) * 100 : 0;
                const isBelow = ratio < 80;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={isBelow ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
                        {item.isNumber ? formatNumber(item.yours) : item.yours.toFixed(1)}{item.suffix}
                        {" vs "}
                        {item.isNumber ? formatNumber(item.avg) : item.avg.toFixed(1)}{item.suffix}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isBelow ? "bg-red-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diagnostics */}
      {diagnostics.length > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <AlertTriangle className="h-5 w-5 text-foreground" />
              AI Diagnostics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Actionable insights based on your content analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics.map((d: any, i: number) => {
              const config = severityConfig[d.severity] || severityConfig.low;
              const Icon = config.icon;
              return (
                <div key={i} className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
                  <div className="flex items-start gap-2.5">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                    <p className="text-sm text-foreground leading-relaxed">{d.message}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* AI Coach */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-foreground" />
            AI Coach
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask your personal growth coach anything about your Instagram strategy
          </p>
        </CardHeader>
        <CardContent>
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending}
            placeholder="Ask your coach anything..."
            height="400px"
            emptyStateMessage="Ask me about your content strategy, growth tactics, or how to improve your Impact Score"
            suggestedPrompts={[
              "What should I focus on first to grow?",
              "How can I improve my hooks?",
              "What content format should I use more?",
              "Give me a 30-day growth plan",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
