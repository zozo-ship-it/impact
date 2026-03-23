import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Eye,
  MousePointerClick,
  TrendingUp,
  RefreshCw,
  Search,
  PenTool,
  BarChart3,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <Badge variant="outline" className="text-xs">Not analyzed</Badge>;
  const color = score >= 75 ? "text-green-600 bg-green-50 border-green-200"
    : score >= 50 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-red-600 bg-red-50 border-red-200";
  return (
    <Badge variant="outline" className={`text-xs font-bold ${color}`}>
      {score}/100
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    sent: "bg-green-50 text-green-700 border-green-200",
    sending: "bg-blue-50 text-blue-700 border-blue-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    ready: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize ${styles[status] || ""}`}>
      {status}
    </Badge>
  );
}

export default function EmailMarketing() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("recency");
  const [search, setSearch] = useState("");
  const [showCoach, setShowCoach] = useState(false);
  const [coachMessages, setCoachMessages] = useState<Message[]>([]);
  const coachMutation = trpc.email.coach.useMutation({
    onSuccess: (response) => {
      setCoachMessages((prev) => [...prev, { role: "assistant", content: response }]);
    },
  });

  const filters = useMemo(() => ({
    status: status !== "all" ? status : undefined,
    sortBy: sortBy === "recency" ? undefined : sortBy,
    sortOrder: "desc" as const,
    search: search || undefined,
    limit: 50,
  }), [status, sortBy, search]);

  const { data: connectionStatus } = trpc.email.status.useQuery();
  const { data: campaignsData, isLoading, refetch } = trpc.email.campaigns.useQuery(filters);
  const { data: stats } = trpc.email.stats.useQuery();
  const syncMutation = trpc.email.sync.useMutation({
    onSuccess: () => refetch(),
  });

  const campaigns = campaignsData?.items || [];
  const isConnected = connectionStatus?.connected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Email Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your MailerLite campaigns and create AI-powered emails.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCoach(!showCoach)}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            AI Coach
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || !isConnected}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync"}
          </Button>
          <Button
            size="sm"
            onClick={() => setLocation("/email/compose")}
          >
            <PenTool className="h-4 w-4 mr-1.5" />
            Compose
          </Button>
        </div>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">MailerLite not connected</p>
              <p className="text-sm text-yellow-700 mt-1">
                Set the <code className="bg-yellow-100 px-1 rounded text-xs">MAILERLITE_API_KEY</code> environment variable to sync your campaigns. You can still use the AI composer to draft emails.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Campaigns Sent", value: stats.totalCampaigns, icon: Send },
            { label: "Emails Delivered", value: stats.totalSent?.toLocaleString(), icon: Mail },
            { label: "Avg Open Rate", value: `${stats.avgOpenRate}%`, icon: Eye },
            { label: "Avg Click Rate", value: `${stats.avgClickRate}%`, icon: MousePointerClick },
            { label: "Avg Score", value: `${stats.avgScore}/100`, icon: TrendingUp },
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

      {/* Sync Success */}
      {syncMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">
              Synced {syncMutation.data.synced} campaigns from MailerLite.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recency">Most Recent</SelectItem>
            <SelectItem value="openRate">Open Rate</SelectItem>
            <SelectItem value="clickRate">Click Rate</SelectItem>
            <SelectItem value="sent">Most Sent</SelectItem>
            <SelectItem value="score">AI Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {isConnected
                ? 'Click "Sync" to import your MailerLite campaigns, or compose a new email with AI.'
                : "Connect your MailerLite account or start composing emails with AI."}
            </p>
            <Button className="mt-4" onClick={() => setLocation("/email/compose")}>
              <PenTool className="h-4 w-4 mr-1.5" />
              Compose with AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setLocation(`/email/campaigns/${campaign.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{campaign.subject || campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                      <ScoreBadge score={campaign.overallScore} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{campaign.name}</p>
                  </div>
                  {campaign.status === "sent" && (
                    <div className="flex gap-6 shrink-0 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-sm font-bold font-mono text-foreground">{campaign.sent?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Opens</p>
                        <p className="text-sm font-bold font-mono text-foreground">{campaign.openRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="text-sm font-bold font-mono text-foreground">{campaign.clickRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unsubs</p>
                        <p className="text-sm font-bold font-mono text-foreground">{campaign.unsubscribeRate}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Coach */}
      {showCoach && (
        <Card className="fixed bottom-4 right-4 w-[400px] h-[500px] z-50 shadow-xl flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <AIChatBox
              messages={coachMessages}
              isLoading={coachMutation.isPending}
              placeholder="Ask me anything about your email marketing..."
              onSendMessage={(content) => {
                const newMessages: Message[] = [...coachMessages, { role: "user", content }];
                setCoachMessages(newMessages);
                coachMutation.mutate({ messages: newMessages });
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
