import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function BotSettings() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const bid = Number(botId);
  const { data: bot } = trpc.bots.get.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const { data: settings } = trpc.bots.getSettings.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const updateSettings = trpc.bots.updateSettings.useMutation({ onSuccess: () => toast.success("Settings saved") });
  const [form, setForm] = useState({ welcomeMessage: "", currency: "KZT", language: "ru", adminTelegramId: "" });

  useEffect(() => {
    if (settings) setForm({ welcomeMessage: settings.welcomeMessage ?? "", currency: settings.currency ?? "KZT", language: settings.language ?? "ru", adminTelegramId: settings.adminTelegramId?.toString() ?? "" });
  }, [settings]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/bots/${botId}`)} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-4 hover:text-foreground transition-colors block">← Back</button>
        <h1 className="text-5xl font-condensed font-black uppercase text-foreground mb-2">Settings</h1>
        <div className="text-muted-foreground font-condensed uppercase text-sm mb-2">{(bot as any)?.botName}</div>
        <span className="red-line mb-8 block" />
        <div className="border border-border p-6 space-y-5">
          <div>
            <label className="block text-xs font-condensed uppercase text-muted-foreground mb-2">Welcome Message</label>
            <textarea value={form.welcomeMessage} onChange={e => setForm(p => ({ ...p, welcomeMessage: e.target.value }))} rows={3} className="w-full bg-secondary border border-border text-foreground px-3 py-2 font-condensed text-sm resize-none focus:outline-none focus:border-foreground" placeholder="Welcome to our bot!" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-condensed uppercase text-muted-foreground mb-2">Currency</label>
              <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className="w-full bg-secondary border border-border text-foreground px-3 py-2 font-condensed text-sm">
                <option value="KZT">KZT</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="RUB">RUB</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-condensed uppercase text-muted-foreground mb-2">Language</label>
              <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} className="w-full bg-secondary border border-border text-foreground px-3 py-2 font-condensed text-sm">
                <option value="ru">Russian</option><option value="kz">Kazakh</option><option value="en">English</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-condensed uppercase text-muted-foreground mb-2">Admin Telegram ID</label>
            <Input value={form.adminTelegramId} onChange={e => setForm(p => ({ ...p, adminTelegramId: e.target.value }))} placeholder="123456789" className="bg-secondary border-border text-foreground font-mono" />
          </div>
          <Button className="btn-brutal-red w-full" onClick={() => updateSettings.mutate({ botId: bid, welcomeMessage: form.welcomeMessage, currency: form.currency, language: form.language, adminTelegramId: form.adminTelegramId ? Number(form.adminTelegramId) : undefined })}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
