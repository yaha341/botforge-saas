import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NOTIF_ICONS: Record<string, string> = {
  new_bot: "🤖", subscription_purchased: "💳", payment_failed: "⚠️", system: "⚙️",
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-accent text-xs uppercase tracking-[0.2em] mb-2">Платформа</p>
          <h1 className="font-display font-700 text-4xl text-foreground">Уведомления</h1>
          <span className="green-line mt-4 block" />
        </div>
        <div className="space-y-3">
          {(notifications ?? []).length === 0 ? (
            <div className="card-frog p-8 text-center text-muted-foreground">Нет уведомлений</div>
          ) : (notifications ?? []).map((n: any) => (
            <div key={n.id} className={`card-frog p-4 flex items-start gap-4 ${n.isRead ? "opacity-60" : "card-frog-active"}`}>
              <span className="text-2xl">{NOTIF_ICONS[n.type] ?? "📢"}</span>
              <div className="flex-1">
                <div className="font-display font-600 text-foreground text-sm">{n.title}</div>
                <div className="text-muted-foreground text-sm mt-1">{n.body}</div>
                <div className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString("ru")}</div>
              </div>
              {!n.isRead && (
                <Button size="sm" className="btn-frog btn-frog-ghost text-xs" onClick={() => markRead.mutate({ id: n.id })}>Прочитано</Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
