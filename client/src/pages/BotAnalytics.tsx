import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BotAnalytics() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats } = trpc.analytics.getBotStats.useQuery({ botId: Number(botId) }, { enabled: isAuthenticated });

  const kpis = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0 },
    { label: "Revenue (KZT)", value: stats?.totalRevenue?.toLocaleString() ?? 0 },
    { label: "Active Users", value: stats?.activeUsers ?? 0 },
    { label: "Broadcasts Sent", value: stats?.broadcastsSent ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/bots/${botId}`)} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-4 hover:text-foreground transition-colors block">← Back</button>
        <h1 className="text-5xl font-condensed font-black uppercase text-foreground mb-2">Analytics</h1>
        <span className="red-line mb-8 block" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {kpis.map(k => (
            <div key={k.label} className="border border-border p-6">
              <div className="text-4xl font-condensed font-black text-foreground">{k.value}</div>
              <div className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mt-1">{k.label}</div>
            </div>
          ))}
        </div>
        {(stats?.ordersChart ?? []).length > 0 && (
          <div className="border border-border p-6">
            <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-6">Orders — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.ordersChart ?? []}>
                <XAxis dataKey="date" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11, fontFamily: "Barlow Condensed" }} />
                <YAxis tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "oklch(0.11 0 0)", border: "1px solid oklch(0.22 0 0)", color: "oklch(0.98 0 0)" }} />
                <Bar dataKey="count" fill="oklch(0.55 0.22 27)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
