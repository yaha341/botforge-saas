import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function MyBots() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: bots, isLoading } = trpc.bots.list.useQuery(undefined, { enabled: isAuthenticated });
  const setStatus = trpc.bots.setStatus.useMutation({ onSuccess: () => utils.bots.list.invalidate() });
  const deleteBot = trpc.bots.delete.useMutation({ onSuccess: () => { utils.bots.list.invalidate(); toast.success("Bot deleted"); } });

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {!loading && <Button className="btn-brutal" onClick={() => startLogin()}>Sign In</Button>}
    </div>
  );

  const MODULE_LABELS: Record<string, string> = {
    moduleShop: "Shop", moduleCourses: "Courses", moduleBroadcasts: "Broadcasts",
    moduleInstagram: "Instagram", moduleAiAssistant: "AI", moduleReferral: "Referral",
    moduleCoupons: "Coupons", moduleMultiCurrency: "Multi-Currency", moduleCrmIntegration: "CRM",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-muted-foreground font-condensed uppercase tracking-widest text-sm mb-1">Platform</p>
            <h1 className="text-5xl font-condensed font-black uppercase text-foreground">My Bots</h1>
          </div>
          <Button className="btn-brutal-red" onClick={() => navigate("/bots/new")}>+ New Bot</Button>
        </div>
        <span className="red-line mb-8 block" />

        {isLoading ? (
          <div className="text-muted-foreground font-condensed uppercase animate-pulse">Loading bots...</div>
        ) : (bots ?? []).length === 0 ? (
          <div className="border border-border p-12 text-center">
            <div className="text-3xl font-condensed font-black uppercase text-muted-foreground mb-4">No Bots Yet</div>
            <Button className="btn-brutal-red" onClick={() => navigate("/bots/new")}>Create Your First Bot</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(bots ?? []).map((bot: any) => (
              <div key={bot.id} className="border border-border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-condensed font-black uppercase text-foreground">{bot.botName}</h2>
                      <span className={`text-xs font-condensed uppercase px-2 py-1 border ${bot.status === "active" ? "border-accent text-accent" : "border-muted-foreground text-muted-foreground"}`}>
                        {bot.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm font-condensed uppercase mb-3">@{bot.botUsername ?? "—"}</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(MODULE_LABELS).map(([key, label]) =>
                        bot[key] ? (
                          <span key={key} className="text-xs font-condensed uppercase px-2 py-0.5 border border-accent text-accent">{label}</span>
                        ) : null
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="btn-brutal" onClick={() => navigate(`/bots/${bot.id}`)}>Manage</Button>
                    <Button size="sm" variant="outline" className="btn-brutal"
                      onClick={() => setStatus.mutate({ botId: bot.id, status: bot.status === "active" ? "paused" : "active" })}>
                      {bot.status === "active" ? "Pause" : "Resume"}
                    </Button>
                    <Button size="sm" variant="destructive" className="btn-brutal"
                      onClick={() => { if (confirm("Delete this bot?")) deleteBot.mutate({ botId: bot.id }); }}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
