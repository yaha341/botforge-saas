import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MODULES = [
  { key: "moduleShop", label: "Shop", desc: "Product catalog, cart, orders" },
  { key: "moduleCourses", label: "Courses", desc: "Digital courses & lessons" },
  { key: "moduleBroadcasts", label: "Broadcasts", desc: "Mass messaging to users" },
  { key: "moduleInstagram", label: "Instagram", desc: "Comment-to-DM automation" },
  { key: "moduleAiAssistant", label: "AI Assistant", desc: "GPT-powered chat support" },
  { key: "moduleReferral", label: "Referral", desc: "Referral & affiliate system" },
  { key: "moduleCoupons", label: "Coupons", desc: "Discount codes & promos" },
  { key: "moduleMultiCurrency", label: "Multi-Currency", desc: "KZT, USD, EUR support" },
  { key: "moduleCrmIntegration", label: "CRM Integration", desc: "Connect external CRM" },
];

export default function CreateBot() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [botToken, setBotToken] = useState("");
  const [botName, setBotName] = useState("");
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const createBot = trpc.bots.create.useMutation({
    onSuccess: (data: any) => { toast.success("Bot created!"); navigate(`/bots/${data.id}`); },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {!loading && <Button className="btn-brutal" onClick={() => startLogin()}>Sign In</Button>}
    </div>
  );

  const toggle = (key: string) => setModules(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim() || !botName.trim()) { toast.error("Token and name are required"); return; }
    createBot.mutate({ botToken: botToken.trim(), botName: botName.trim(), ...modules });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-muted-foreground font-condensed uppercase tracking-widest text-sm mb-1">Constructor</p>
          <h1 className="text-5xl font-condensed font-black uppercase text-foreground">New Bot</h1>
          <span className="red-line mt-4 block" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border border-border p-6 space-y-4">
            <h2 className="text-xl font-condensed font-black uppercase text-foreground">Bot Credentials</h2>
            <div>
              <label className="block text-xs font-condensed uppercase text-muted-foreground mb-2">Telegram Bot Token</label>
              <Input value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="1234567890:AABBCCdd..." className="font-mono bg-secondary border-border text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-condensed uppercase text-muted-foreground mb-2">Bot Display Name</label>
              <Input value={botName} onChange={e => setBotName(e.target.value)} placeholder="My Shop Bot" className="bg-secondary border-border text-foreground" />
            </div>
          </div>
          <div className="border border-border p-6">
            <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-4">Select Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MODULES.map(mod => (
                <button key={mod.key} type="button"
                  onClick={() => toggle(mod.key)}
                  className={`p-4 border text-left transition-colors ${modules[mod.key] ? "border-accent bg-accent/10" : "border-border hover:border-foreground"}`}>
                  <div className="font-condensed font-black uppercase text-sm text-foreground">{mod.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-condensed">{mod.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="btn-brutal-red w-full text-lg py-4" disabled={createBot.isPending}>
            {createBot.isPending ? "Creating..." : "Create Bot"}
          </Button>
        </form>
      </div>
    </div>
  );
}
