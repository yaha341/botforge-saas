import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MyBots from "./pages/MyBots";
import CreateBot from "./pages/CreateBot";
import BotPanel from "./pages/BotPanel";
import BotProducts from "./pages/BotProducts";
import BotOrders from "./pages/BotOrders";
import BotBroadcasts from "./pages/BotBroadcasts";
import BotInstagram from "./pages/BotInstagram";
import BotAnalytics from "./pages/BotAnalytics";
import BotSettings from "./pages/BotSettings";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      {/* Dashboard */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/bots" component={MyBots} />
      <Route path="/bots/new" component={CreateBot} />
      <Route path="/bots/:botId" component={BotPanel} />
      <Route path="/bots/:botId/products" component={BotProducts} />
      <Route path="/bots/:botId/orders" component={BotOrders} />
      <Route path="/bots/:botId/broadcasts" component={BotBroadcasts} />
      <Route path="/bots/:botId/instagram" component={BotInstagram} />
      <Route path="/bots/:botId/analytics" component={BotAnalytics} />
      <Route path="/bots/:botId/settings" component={BotSettings} />
      <Route path="/billing" component={Billing} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
