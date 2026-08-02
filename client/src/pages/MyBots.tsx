import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MODULE_LABELS: Record<string, string> = {
  moduleShop: "Магазин", moduleCourses: "Курсы", moduleBroadcasts: "Рассылки",
  moduleInstagram: "Instagram", moduleAiAssistant: "AI", moduleReferral: "Рефералы",
  moduleCoupons: "Купоны", moduleMultiCurrency: "Мультивалюта", moduleCrmIntegration: "CRM",
};

export default function MyBots() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: bots, isLoading } = trpc.bots.list.useQuery(undefined, { enabled: isAuthenticated });
  const setStatus = trpc.bots.setStatus.useMutation({ onSuccess: () => utils.bots.list.invalidate() });
  const deleteBot = trpc.bots.delete.useMutation({ onSuccess: () => { utils.bots.list.invalidate(); toast.success("Бот удалён"); } });

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {!loading && <Button className="btn-frog" onClick={() => startLogin()}>Войти</Button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-accent text-xs uppercase tracking-[0.2em] mb-2">Платформа</p>
            <h1 className="font-display font-700 text-4xl text-foreground">Мои боты</h1>
          </div>
          <Button className="btn-frog btn-frog-filled" onClick={() => navigate("/bots/new")}>+ Новый бот</Button>
        </div>
        <span className="green-line mb-8 block" />

        {isLoading ? (
          <div className="text-muted-foreground text-sm animate-pulse">Загрузка...</div>
        ) : (bots ?? []).length === 0 ? (
          <div className="card-frog p-12 text-center">
            <div className="font-display font-700 text-2xl text-muted-foreground mb-4">Пока нет ботов</div>
            <Button className="btn-frog btn-frog-filled" onClick={() => navigate("/bots/new")}>Создать первого бота</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(bots ?? []).map((bot: any) => (
              <div key={bot.id} className="card-frog p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-display font-600 text-xl text-foreground">{bot.botName}</h2>
                      <span className={`text-xs px-3 py-1 rounded-full border ${bot.status === "active" ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground"}`}>
                        {bot.status === "active" ? "активен" : bot.status === "paused" ? "пауза" : "удалён"}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm mb-3">@{bot.botUsername ?? "—"}</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(MODULE_LABELS).map(([key, label]) =>
                        bot[key] ? (
                          <span key={key} className="text-xs px-2 py-0.5 border border-accent/40 text-accent rounded">{label}</span>
                        ) : null
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="btn-frog btn-frog-filled" onClick={() => navigate(`/bots/${bot.id}`)}>Управление</Button>
                    <Button size="sm" className="btn-frog btn-frog-ghost"
                      onClick={() => setStatus.mutate({ botId: bot.id, status: bot.status === "active" ? "paused" : "active" })}>
                      {bot.status === "active" ? "Пауза" : "Активировать"}
                    </Button>
                    <Button size="sm" variant="destructive" className="btn-frog btn-frog-ghost border-destructive text-destructive"
                      onClick={() => { if (confirm("Удалить этого бота?")) deleteBot.mutate({ botId: bot.id }); }}>
                      Удалить
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
