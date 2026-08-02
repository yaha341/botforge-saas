import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";

const MODULE_LABELS: Record<string, string> = {
  moduleShop: "Магазин", moduleCourses: "Курсы", moduleBroadcasts: "Рассылки",
  moduleInstagram: "Instagram", moduleAiAssistant: "AI Ассистент", moduleReferral: "Рефералы",
  moduleCoupons: "Купоны", moduleMultiCurrency: "Мультивалюта", moduleCrmIntegration: "CRM",
};

export default function BotPanel() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: bot, isLoading } = trpc.bots.get.useQuery({ botId: Number(botId) }, { enabled: isAuthenticated && !!botId });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground font-display text-2xl animate-pulse">Загрузка...</div></div>;
  if (!bot) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground font-display text-2xl">Бот не найден</div></div>;

  const webhookUrl = `/api/webhook/${bot.botToken}`;
  const NAV = [
    { path: "products", label: "Товары" }, { path: "orders", label: "Заказы" },
    { path: "broadcasts", label: "Рассылки" }, { path: "instagram", label: "Instagram" },
    { path: "analytics", label: "Аналитика" }, { path: "settings", label: "Настройки" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => navigate("/bots")} className="text-muted-foreground text-xs tracking-wider mb-2 hover:text-accent transition-colors">← Назад к ботам</button>
            <h1 className="font-display font-700 text-4xl text-foreground">{(bot as any).botName}</h1>
            <div className="text-muted-foreground text-sm mt-1">@{(bot as any).botUsername ?? "—"}</div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border mt-8 ${(bot as any).status === "active" ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground"}`}>
            {(bot as any).status === "active" ? "активен" : (bot as any).status === "paused" ? "пауза" : "удалён"}
          </span>
        </div>
        <span className="green-line mb-8 block" />

        {/* Webhook URL */}
        <div className="card-frog p-4 mb-8">
          <div className="text-xs text-muted-foreground mb-1">Webhook URL</div>
          <div className="font-mono text-sm text-foreground break-all">{webhookUrl}</div>
        </div>

        {/* Active Modules */}
        <div className="mb-8">
          <h2 className="font-display font-600 text-xl text-foreground mb-3">Модули</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODULE_LABELS).map(([key, label]) =>
              (bot as any)[key] ? (
                <span key={key} className="text-sm px-3 py-1 border border-accent text-accent rounded">{label}</span>
              ) : (
                <span key={key} className="text-sm px-3 py-1 border border-border text-muted-foreground line-through rounded">{label}</span>
              )
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {NAV.map(item => (
            <button key={item.path} onClick={() => navigate(`/bots/${botId}/${item.path}`)}
              className="card-frog p-6 text-left hover:glow-green transition-all">
              <div className="font-display font-600 text-lg text-foreground">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
