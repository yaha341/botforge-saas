import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function BotInstagram() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const bid = Number(botId);
  const { data: accounts } = trpc.instagram.listAccounts.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const { data: rules } = trpc.instagram.listRules.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const disconnect = trpc.instagram.disconnect.useMutation({ onSuccess: () => { utils.instagram.listAccounts.invalidate(); toast.success("Disconnected"); } });
  const createRule = trpc.instagram.createRule.useMutation({ onSuccess: () => { utils.instagram.listRules.invalidate(); toast.success("Rule created"); } });
  const deleteRule = trpc.instagram.deleteRule.useMutation({ onSuccess: () => { utils.instagram.listRules.invalidate(); toast.success("Rule deleted"); } });
  const [ruleForm, setRuleForm] = useState({ igAccountId: "", keyword: "", dmMessage: "", postId: "" });

  const startOAuth = () => {
    window.location.href = `/api/zernio/connect?botId=${botId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/bots/${botId}`)} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-4 hover:text-foreground transition-colors block">← Back</button>
        <h1 className="text-5xl font-condensed font-black uppercase text-foreground mb-2">Instagram</h1>
        <span className="red-line mb-8 block" />

        {/* Connected Accounts */}
        <div className="border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-condensed font-black uppercase text-foreground">Connected Accounts</h2>
            <Button className="btn-brutal-red" onClick={startOAuth}>+ Connect Instagram</Button>
          </div>
          {(accounts ?? []).length === 0 ? (
            <div className="text-muted-foreground font-condensed uppercase text-sm">No accounts connected</div>
          ) : (accounts ?? []).map((acc: any) => (
            <div key={acc.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="font-condensed font-black uppercase text-foreground">@{acc.igUsername}</div>
                <div className="text-muted-foreground text-xs font-condensed">ID: {acc.igAccountId}</div>
              </div>
              <Button size="sm" variant="destructive" className="btn-brutal" onClick={() => disconnect.mutate({ accountId: acc.id, botId: bid })}>Disconnect</Button>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div className="border border-border p-6 mb-8">
          <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-4">Keyword Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <select value={ruleForm.igAccountId} onChange={e => setRuleForm(p => ({ ...p, igAccountId: e.target.value }))} className="bg-secondary border border-border text-foreground px-3 py-2 font-condensed text-sm">
              <option value="">Select Account</option>
              {(accounts ?? []).map((a: any) => <option key={a.id} value={a.id}>@{a.igUsername}</option>)}
            </select>
            <Input placeholder="Keyword (e.g. price)" value={ruleForm.keyword} onChange={e => setRuleForm(p => ({ ...p, keyword: e.target.value }))} className="bg-secondary border-border text-foreground" />
            <Input placeholder="Post ID (optional)" value={ruleForm.postId} onChange={e => setRuleForm(p => ({ ...p, postId: e.target.value }))} className="bg-secondary border-border text-foreground" />
            <Input placeholder="DM message to send" value={ruleForm.dmMessage} onChange={e => setRuleForm(p => ({ ...p, dmMessage: e.target.value }))} className="bg-secondary border-border text-foreground" />
          </div>
          <Button className="btn-brutal-red" onClick={() => {
            if (!ruleForm.igAccountId || !ruleForm.keyword || !ruleForm.dmMessage) { toast.error("Fill all required fields"); return; }
            createRule.mutate({ botId: bid, igAccountId: Number(ruleForm.igAccountId), keyword: ruleForm.keyword, dmMessage: ruleForm.dmMessage, postId: ruleForm.postId || undefined });
            setRuleForm({ igAccountId: "", keyword: "", dmMessage: "", postId: "" });
          }}>Add Rule</Button>
        </div>
        <div className="space-y-3">
          {(rules ?? []).map((r: any) => (
            <div key={r.id} className="border border-border p-4 flex items-center justify-between">
              <div>
                <span className="font-condensed font-black uppercase text-foreground mr-3">"{r.keyword}"</span>
                <span className="text-muted-foreground text-sm font-condensed">→ {r.dmMessage?.slice(0, 50)}</span>
                {r.postId && <span className="text-xs text-muted-foreground font-condensed ml-2">(Post: {r.postId})</span>}
                <span className="text-xs text-muted-foreground font-condensed ml-2">Triggered: {r.triggeredCount}x</span>
              </div>
              <Button size="sm" variant="destructive" className="btn-brutal" onClick={() => deleteRule.mutate({ ruleId: r.id, botId: bid })}>Delete</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
