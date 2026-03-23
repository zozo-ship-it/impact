import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Copy,
  Check,
  FileText,
  Code,
  Eye,
  Mail,
  Upload,
} from "lucide-react";

export default function EmailComposer() {
  const [, setLocation] = useLocation();

  // Form state
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState<string>("newsletter");
  const [tone, setTone] = useState<string>("professional");
  const [audience, setAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");

  // Result state
  const [result, setResult] = useState<{
    subject: string;
    previewText: string;
    htmlContent: string;
    textContent: string;
    templateId: number;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState("preview");

  // Push to MailerLite state
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [showPushForm, setShowPushForm] = useState(false);

  const { data: connectionStatus } = trpc.email.status.useQuery();
  const composeMutation = trpc.email.compose.useMutation({
    onSuccess: (data) => setResult(data),
  });
  const pushMutation = trpc.email.pushToMailerlite.useMutation({
    onSuccess: () => {
      setShowPushForm(false);
    },
  });

  const handleCompose = () => {
    if (!topic) return;
    composeMutation.mutate({
      topic,
      goal: goal as any,
      tone: tone as any,
      audience: audience || undefined,
      keyPoints: keyPoints || undefined,
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePush = () => {
    if (!result || !fromEmail || !fromName) return;
    pushMutation.mutate({
      templateId: result.templateId,
      fromEmail,
      fromName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => setLocation("/email")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">AI Email Composer</h1>
        <p className="text-muted-foreground mt-1">
          Describe what you want to say and let AI craft a high-converting email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Email Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / What's the email about? *</Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., Announcing our Spring Sale with 30% off all products..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="re-engagement">Re-engagement</SelectItem>
                      <SelectItem value="product-launch">Product Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience (optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Small business owners, 25-45 years old"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyPoints">Key Points to Include (optional)</Label>
                <Textarea
                  id="keyPoints"
                  placeholder="e.g., Free shipping over $50, Limited time offer, New arrivals section..."
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCompose}
                disabled={!topic || composeMutation.isPending}
              >
                <Sparkles className={`h-4 w-4 mr-1.5 ${composeMutation.isPending ? "animate-pulse" : ""}`} />
                {composeMutation.isPending ? "Composing..." : "Generate Email"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Result */}
        <div className="space-y-4">
          {composeMutation.isPending && (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">AI is crafting your email...</p>
              </CardContent>
            </Card>
          )}

          {composeMutation.isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">
                  Failed to generate email: {composeMutation.error.message}
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              {/* Subject & Preview */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Subject Line</p>
                      <p className="font-semibold text-foreground">{result.subject}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.subject, "subject")}
                    >
                      {copied === "subject" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Preview Text</p>
                      <p className="text-sm text-muted-foreground">{result.previewText}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.previewText, "preview")}
                    >
                      {copied === "preview" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Content Tabs */}
              <Card>
                <CardHeader className="pb-0">
                  <Tabs value={previewTab} onValueChange={setPreviewTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="preview" className="text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                      </TabsTrigger>
                      <TabsTrigger value="html" className="text-xs">
                        <Code className="h-3.5 w-3.5 mr-1" /> HTML
                      </TabsTrigger>
                      <TabsTrigger value="text" className="text-xs">
                        <FileText className="h-3.5 w-3.5 mr-1" /> Plain Text
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="pt-4">
                  {previewTab === "preview" && (
                    <div
                      className="border rounded-lg p-4 bg-white max-h-[500px] overflow-auto"
                      dangerouslySetInnerHTML={{ __html: result.htmlContent }}
                    />
                  )}
                  {previewTab === "html" && (
                    <div className="relative">
                      <pre className="border rounded-lg p-4 bg-muted/50 text-xs overflow-auto max-h-[500px] whitespace-pre-wrap">
                        {result.htmlContent}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(result.htmlContent, "html")}
                      >
                        {copied === "html" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                  {previewTab === "text" && (
                    <div className="relative">
                      <pre className="border rounded-lg p-4 bg-muted/50 text-sm overflow-auto max-h-[500px] whitespace-pre-wrap">
                        {result.textContent}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(result.textContent, "text")}
                      >
                        {copied === "text" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopy(result.htmlContent, "fullHtml")}
                >
                  {copied === "fullHtml" ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  Copy HTML
                </Button>

                {connectionStatus?.connected && (
                  <Button
                    className="flex-1"
                    onClick={() => setShowPushForm(!showPushForm)}
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    Push to MailerLite
                  </Button>
                )}
              </div>

              {/* Push to MailerLite Form */}
              {showPushForm && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Create as MailerLite Draft</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">From Email</Label>
                        <Input
                          placeholder="you@company.com"
                          value={fromEmail}
                          onChange={(e) => setFromEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">From Name</Label>
                        <Input
                          placeholder="Your Company"
                          value={fromName}
                          onChange={(e) => setFromName(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handlePush}
                      disabled={!fromEmail || !fromName || pushMutation.isPending}
                    >
                      <Send className={`h-4 w-4 mr-1.5 ${pushMutation.isPending ? "animate-pulse" : ""}`} />
                      {pushMutation.isPending ? "Creating draft..." : "Create Draft in MailerLite"}
                    </Button>
                    {pushMutation.isSuccess && (
                      <p className="text-sm text-green-600 text-center">
                        Draft created successfully! Check your MailerLite dashboard.
                      </p>
                    )}
                    {pushMutation.isError && (
                      <p className="text-sm text-red-600 text-center">
                        {pushMutation.error.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Empty state */}
          {!result && !composeMutation.isPending && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground">Your email will appear here</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the brief and click Generate to create an AI-powered email.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
