import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import CreatorsPage from "./pages/Creators";
import CreatorDetailPage from "./pages/CreatorDetail";
import ProfilePage from "./pages/Profile";
import BlueprintsPage from "./pages/Blueprints";
import BlueprintDetailPage from "./pages/BlueprintDetail";
import AddContentPage from "./pages/AddContent";
import PostDetailPage from "./pages/PostDetail";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/creators" component={CreatorsPage} />
        <Route path="/creators/:id" component={CreatorDetailPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/blueprints" component={BlueprintsPage} />
        <Route path="/blueprints/:id" component={BlueprintDetailPage} />
        <Route path="/add" component={AddContentPage} />
        <Route path="/posts/:id" component={PostDetailPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
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
