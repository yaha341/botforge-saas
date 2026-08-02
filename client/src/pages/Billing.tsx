import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const PLANS = [
  { id: "basic", name: "Basic", price: "35 000 ₸", period: "/год", features: ["Shop", "Courses", "Broadcasts", "Multi-Currency"], color: "border-border" },
  { id: "pro", name: "Pro", price: "65 000 ₸", period: "/год", features: ["All Basic", "Instagram", "Referral", "Coupons"], color: "border-accent" },
  { id: "enterprise", name: "Enterprise", price: "120 000 ₸", period: "/год", features: ["All Pro", "AI Assistant", "CRM Integration", "Priority Support"], color: "border-foreground" },
];

export default function Billing() {
  const { isAuthenticated, loading } = useAuth();
  const { data: bots } = trpc.bots.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscriptions } = trpc.billing.listSubscriptions.useQuery(undefined, { enabled: isAuthenticated });
  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data: any) => { if (data.paymentUrl) window.location.href = data.paymentUrl; },
    onError: (e: any) => toast.error(e.message),
  });
  const [selectedBot, setSelectedBot] = useState("");

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {!loading && <Button className="btn-brutal" onClick={() => startLogin()}>Sign In</Button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-muted-foreground font-condensed uppercase tracking-widest text-sm mb-1">Platform</p>
          <h1 className="text-5xl font-condensed font-black uppercase text-foreground">Billing</h1>
          <span className="red-line mt-4 block" />
        </div>

        {/* Bot selector */}
        <div className="border border-border p-6 mb-10">
          <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-3">Select Bot</h2>
          <select value={selectedBot} onChange={e => setSelectedBot(e.target.value)} className="bg-secondary border border-border text-foreground px-4 py-2 font-condensed uppercase text-sm w-full md:w-auto">
            <option value="">Choose a bot...</option>
            {(bots ?? []).map((b: any) => <option key={b.id} value={b.id}>{b.botName}</option>)}
          </select>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map(plan => (
            <div key={plan.id} className={`border p-6 flex flex-col ${plan.color}`}>
              <div className="text-3xl font-condensed font-black uppercase text-foreground mb-1">{plan.name}</div>
              <div className="text-2xl font-condensed font-black text-accent mb-4">{plan.price}<span className="text-sm text-muted-foreground">{plan.period}</span></div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => <li key={f} className="text-sm font-condensed uppercase text-muted-foreground flex items-center gap-2"><span className="text-accent">✓</span>{f}</li>)}
              </ul>
              <Button className="btn-brutal-red w-full" disabled={!selectedBot || createCheckout.isPending}
                onClick={() => { if (!selectedBot) { toast.error("Select a bot first"); return; } createCheckout.mutate({ botId: Number(selectedBot), plan: plan.id as any }); }}>
                Subscribe
              </Button>
            </div>
          ))}
        </div>

        {/* Active subscriptions */}
        {(subscriptions ?? []).length > 0 && (
          <div>
            <h2 className="text-2xl font-condensed font-black uppercase text-foreground mb-4">Active Subscriptions</h2>
            <span className="red-line mb-6 block" />
            <div className="space-y-3">
              {(subscriptions ?? []).map((sub: any) => (
                <div key={sub.id} className="border border-border p-4 flex items-center justify-between">
                  <div>
                    <span className="font-condensed font-black uppercase text-foreground mr-3">{sub.plan?.toUpperCase()}</span>
                    <span className="text-muted-foreground text-sm font-condensed">Bot #{sub.botId}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-condensed uppercase text-muted-foreground">Expires: {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "—"}</span>
                    <span className={`text-xs font-condensed uppercase px-2 py-0.5 border ${sub.status === "active" ? "border-accent text-accent" : "border-border text-muted-foreground"}`}>{sub.status}</span>
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
