import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: bots } = trpc.bots.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 5 }, { enabled: isAuthenticated });

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground font-condensed text-2xl uppercase tracking-widest animate-pulse">Loading...</div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <h1 className="text-5xl font-condensed font-black uppercase text-foreground">Access Denied</h1>
      <span className="red-line w-32" />
      <Button className="btn-brutal" onClick={() => startLogin()}>Sign In</Button>
    </div>
  );

  const activeBots = (bots ?? []).filter((b: any) => b.status === "active").length;
  const unreadNotifs = (notifications ?? []).filter((n: any) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-muted-foreground font-condensed uppercase tracking-widest text-sm mb-1">Welcome back</p>
          <h1 className="text-5xl font-condensed font-black uppercase text-foreground">{user?.name ?? "User"}</h1>
          <span className="red-line mt-4 block" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Bots", value: (bots ?? []).length },
            { label: "Active Bots", value: activeBots },
            { label: "Notifications", value: unreadNotifs },
            { label: "Platform", value: "v1.0" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border p-6">
              <div className="text-4xl font-condensed font-black text-foreground">{stat.value}</div>
              <div className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button onClick={() => navigate("/bots/new")} className="btn-brutal-red p-6 text-left border border-accent">
            <div className="text-2xl font-condensed font-black uppercase">+ New Bot</div>
            <div className="text-sm opacity-70 mt-1 font-condensed uppercase">Create a Telegram bot</div>
          </button>
          <button onClick={() => navigate("/bots")} className="btn-brutal p-6 text-left">
            <div className="text-2xl font-condensed font-black uppercase">My Bots</div>
            <div className="text-sm opacity-70 mt-1 font-condensed uppercase">Manage your bots</div>
          </button>
          <button onClick={() => navigate("/billing")} className="btn-brutal p-6 text-left">
            <div className="text-2xl font-condensed font-black uppercase">Billing</div>
            <div className="text-sm opacity-70 mt-1 font-condensed uppercase">Manage subscriptions</div>
          </button>
        </div>

        {/* Recent Bots */}
        {(bots ?? []).length > 0 && (
          <div>
            <h2 className="text-2xl font-condensed font-black uppercase text-foreground mb-4">Recent Bots</h2>
            <span className="red-line mb-6 block" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(bots ?? []).slice(0, 4).map((bot: any) => (
                <div key={bot.id} className="border border-border p-5 cursor-pointer hover:border-foreground transition-colors" onClick={() => navigate(`/bots/${bot.id}`)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-condensed font-black uppercase text-lg text-foreground">{bot.botName}</div>
                      <div className="text-muted-foreground text-sm font-condensed uppercase">@{bot.botUsername ?? "unknown"}</div>
                    </div>
                    <span className={`text-xs font-condensed uppercase px-2 py-1 border ${bot.status === "active" ? "border-accent text-accent" : "border-muted-foreground text-muted-foreground"}`}>
                      {bot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
