import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function BotBroadcasts() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const bid = Number(botId);
  const { data: broadcasts } = trpc.broadcasts.list.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const createBroadcast = trpc.broadcasts.create.useMutation({ onSuccess: () => { utils.broadcasts.list.invalidate(); toast.success("Broadcast created"); } });
  const sendBroadcast = trpc.broadcasts.send.useMutation({ onSuccess: () => { utils.broadcasts.list.invalidate(); toast.success("Broadcast queued"); } });
  const [form, setForm] = useState({ title: "", message: "", scheduledAt: "" });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/bots/${botId}`)} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-4 hover:text-foreground transition-colors block">← Back</button>
        <h1 className="text-5xl font-condensed font-black uppercase text-foreground mb-2">Broadcasts</h1>
        <span className="red-line mb-8 block" />
        <div className="border border-border p-6 mb-8">
          <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-4">New Broadcast</h2>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border text-foreground" />
            <textarea placeholder="Message text..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} className="w-full bg-secondary border border-border text-foreground px-3 py-2 font-condensed text-sm resize-none focus:outline-none focus:border-foreground" />
            <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} className="bg-secondary border-border text-foreground" />
          </div>
          <Button className="btn-brutal-red mt-4" onClick={() => {
            if (!form.title || !form.message) { toast.error("Title and message required"); return; }
            createBroadcast.mutate({ botId: bid, title: form.title, message: form.message, scheduledAt: form.scheduledAt || undefined });
            setForm({ title: "", message: "", scheduledAt: "" });
          }}>Create Broadcast</Button>
        </div>
        <div className="space-y-4">
          {(broadcasts ?? []).length === 0 ? (
            <div className="border border-border p-8 text-center text-muted-foreground font-condensed uppercase">No broadcasts yet</div>
          ) : (broadcasts ?? []).map((b: any) => (
            <div key={b.id} className="border border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-condensed font-black uppercase text-foreground text-lg">{b.title}</div>
                  <div className="text-muted-foreground text-sm mt-1 font-condensed">{b.message?.slice(0, 80)}...</div>
                  <div className="flex gap-4 mt-2 text-xs font-condensed uppercase text-muted-foreground">
                    <span>Sent: {b.sentCount}/{b.totalRecipients}</span>
                    <span>Failed: {b.failedCount}</span>
                    {b.scheduledAt && <span>Scheduled: {new Date(b.scheduledAt).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-condensed uppercase px-2 py-1 border ${b.status === "sent" ? "border-accent text-accent" : b.status === "sending" ? "border-yellow-500 text-yellow-500" : "border-border text-muted-foreground"}`}>{b.status}</span>
                  {b.status === "draft" && (
                    <Button size="sm" className="btn-brutal-red" onClick={() => sendBroadcast.mutate({ broadcastId: b.id, botId: bid })}>Send Now</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
