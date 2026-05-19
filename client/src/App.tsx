import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { InsightsIndex, InsightDetail } from "./pages/Insights";
import { ReportsIndex, ReportDetail } from "./pages/Reports";
import { PodcastIndex, PodcastEpisode } from "./pages/Podcast";
import { EventsIndex, EventDetail } from "./pages/Events";
import { CaseStudiesIndex, CaseStudyDetail } from "./pages/CaseStudies";
import { Impact100Index, Impact100Segment } from "./pages/Impact100";
import {
  Magazine,
  Programs,
  Roadmap,
  About,
  Contact,
  Press,
  Privacy,
  Terms,
} from "./pages/StaticPages";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import {
  AdminContent,
  AdminImpact100,
  AdminUsers,
  AdminSettings,
} from "./pages/admin/AdminPages";

function Router() {
  return (
    <Switch>
      {/* ── Public routes ─────────────────────────────────── */}
      <Route path="/" component={Home} />

      <Route path="/insights" component={InsightsIndex} />
      <Route path="/insights/:slug">
        {(params) => <InsightDetail params={params as { slug: string }} />}
      </Route>

      <Route path="/reports" component={ReportsIndex} />
      <Route path="/reports/:slug">
        {(params) => <ReportDetail params={params as { slug: string }} />}
      </Route>

      <Route path="/podcast" component={PodcastIndex} />
      <Route path="/podcast/:slug">
        {(params) => <PodcastEpisode params={params as { slug: string }} />}
      </Route>

      <Route path="/events" component={EventsIndex} />
      <Route path="/events/:slug">
        {(params) => <EventDetail params={params as { slug: string }} />}
      </Route>

      <Route path="/case-studies" component={CaseStudiesIndex} />
      <Route path="/case-studies/:slug">
        {(params) => <CaseStudyDetail params={params as { slug: string }} />}
      </Route>

      <Route path="/100" component={Impact100Index} />
      <Route path="/100/:segment">
        {(params) => <Impact100Segment params={params as { segment: string }} />}
      </Route>

      <Route path="/magazine" component={Magazine} />
      <Route path="/programs" component={Programs} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/press" component={Press} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />

      {/* ── Admin routes ──────────────────────────────────── */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/impact100" component={AdminImpact100} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* ── 404 fallback ──────────────────────────────────── */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
