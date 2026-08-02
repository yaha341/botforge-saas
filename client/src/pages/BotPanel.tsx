import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";

const MODULE_LABELS: Record<string, string> = {
  moduleShop: "Shop", moduleCourses: "Courses", moduleBroadcasts: "Broadcasts",
  moduleInstagram: "Instagram", moduleAiAssistant: "AI Assistant", moduleReferral: "Referral",
  moduleCoupons: "Coupons", moduleMultiCurrency: "Multi-Currency", moduleCrmIntegration: "CRM",
};

export default function BotPanel() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: bot, isLoading } = trpc.bots.get.useQuery({ botId: Number(botId) }, { enabled: isAuthenticated && !!botId });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground font-condensed text-2xl uppercase animate-pulse">Loading...</div></div>;
  if (!bot) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground font-condensed text-2xl uppercase">Bot not found</div></div>;

  const webhookUrl = `/api/webhook/${bot.botToken}`;
  const NAV = [
    { path: "products", label: "Products" }, { path: "orders", label: "Orders" },
    { path: "broadcasts", label: "Broadcasts" }, { path: "instagram", label: "Instagram" },
    { path: "analytics", label: "Analytics" }, { path: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => navigate("/bots")} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-2 hover:text-foreground transition-colors">← Back to Bots</button>
            <h1 className="text-5xl font-condensed font-black uppercase text-foreground">{(bot as any).botName}</h1>
            <div className="text-muted-foreground font-condensed uppercase text-sm mt-1">@{(bot as any).botUsername ?? "—"}</div>
          </div>
          <span className={`text-sm font-condensed uppercase px-3 py-1 border mt-8 ${(bot as any).status === "active" ? "border-accent text-accent" : "border-muted-foreground text-muted-foreground"}`}>
            {(bot as any).status}
          </span>
        </div>
        <span className="red-line mb-8 block" />

        {/* Webhook URL */}
        <div className="border border-border p-4 mb-8 bg-secondary">
          <div className="text-xs font-condensed uppercase text-muted-foreground mb-1">Webhook URL</div>
          <div className="font-mono text-sm text-foreground break-all">{webhookUrl}</div>
        </div>

        {/* Active Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-3">Active Modules</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODULE_LABELS).map(([key, label]) =>
              (bot as any)[key] ? (
                <span key={key} className="text-sm font-condensed uppercase px-3 py-1 border border-accent text-accent">{label}</span>
              ) : (
                <span key={key} className="text-sm font-condensed uppercase px-3 py-1 border border-border text-muted-foreground line-through">{label}</span>
              )
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {NAV.map(item => (
            <button key={item.path} onClick={() => navigate(`/bots/${botId}/${item.path}`)}
              className="btn-brutal p-6 text-left border border-border hover:border-foreground transition-colors">
              <div className="text-xl font-condensed font-black uppercase">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
