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
      <div className="text-foreground font-display text-2xl tracking-widest animate-pulse">Загрузка...</div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <h1 className="font-display font-700 text-5xl text-foreground">Доступ ограничен</h1>
      <span className="green-line w-32" />
      <Button className="btn-frog btn-frog-filled" onClick={() => startLogin()}>Войти</Button>
    </div>
  );

  const activeBots = (bots ?? []).filter((b: any) => b.status === "active").length;
  const unreadNotifs = (notifications ?? []).filter((n: any) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-accent text-xs uppercase tracking-[0.2em] mb-2">Добро пожаловать</p>
          <h1 className="font-display font-700 text-4xl text-foreground">{user?.name ?? "Пользователь"}</h1>
          <span className="green-line mt-4 block" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Всего ботов", value: (bots ?? []).length },
            { label: "Активных", value: activeBots },
            { label: "Уведомлений", value: unreadNotifs },
            { label: "Платформа", value: "v2.0" },
          ].map((stat) => (
            <div key={stat.label} className="card-frog p-6">
              <div className="font-display font-700 text-4xl text-gradient-green">{stat.value}</div>
              <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button onClick={() => navigate("/bots/new")} className="card-frog-active p-6 text-left hover:glow-green transition-all">
            <div className="font-display font-600 text-xl text-foreground">+ Новый бот</div>
            <div className="text-sm text-muted-foreground mt-1">Создать Telegram-бота</div>
          </button>
          <button onClick={() => navigate("/bots")} className="card-frog p-6 text-left hover:glow-green transition-all">
            <div className="font-display font-600 text-xl text-foreground">Мои боты</div>
            <div className="text-sm text-muted-foreground mt-1">Управление ботами</div>
          </button>
          <button onClick={() => navigate("/billing")} className="card-frog p-6 text-left hover:glow-green transition-all">
            <div className="font-display font-600 text-xl text-foreground">Подписка</div>
            <div className="text-sm text-muted-foreground mt-1">Управление оплатой</div>
          </button>
        </div>

        {/* Recent Bots */}
        {(bots ?? []).length > 0 && (
          <div>
            <h2 className="font-display font-600 text-xl text-foreground mb-4">Последние боты</h2>
            <span className="green-line mb-6 block" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(bots ?? []).slice(0, 4).map((bot: any) => (
                <div key={bot.id} className="card-frog p-5 cursor-pointer hover:glow-green transition-all" onClick={() => navigate(`/bots/${bot.id}`)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-600 text-lg text-foreground">{bot.botName}</div>
                      <div className="text-muted-foreground text-sm">@{bot.botUsername ?? "—"}</div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border ${bot.status === "active" ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground"}`}>
                      {bot.status === "active" ? "активен" : bot.status === "paused" ? "пауза" : "удалён"}
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
