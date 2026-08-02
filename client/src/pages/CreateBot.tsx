import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MODULES = [
  { key: "moduleShop", label: "Магазин", desc: "Каталог, корзина, заказы" },
  { key: "moduleCourses", label: "Курсы", desc: "Цифровой контент и обучение" },
  { key: "moduleBroadcasts", label: "Рассылки", desc: "Массовые рассылки" },
  { key: "moduleInstagram", label: "Instagram", desc: "Авто-DM из комментариев" },
  { key: "moduleAiAssistant", label: "AI Ассистент", desc: "Поддержка на базе GPT" },
  { key: "moduleReferral", label: "Рефералы", desc: "Система приглашений" },
  { key: "moduleCoupons", label: "Купоны", desc: "Скидочные коды" },
  { key: "moduleMultiCurrency", label: "Мультивалюта", desc: "KZT, USD, EUR" },
  { key: "moduleCrmIntegration", label: "CRM", desc: "Интеграция с CRM" },
];

export default function CreateBot() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [botToken, setBotToken] = useState("");
  const [botName, setBotName] = useState("");
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const createBot = trpc.bots.create.useMutation({
    onSuccess: (data: any) => { toast.success("Бот создан!"); navigate(`/bots/${data.id}`); },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {!loading && <Button className="btn-frog" onClick={() => startLogin()}>Войти</Button>}
    </div>
  );

  const toggle = (key: string) => setModules(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim() || !botName.trim()) { toast.error("Токен и название обязательны"); return; }
    createBot.mutate({ botToken: botToken.trim(), botName: botName.trim(), ...modules });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-accent text-xs uppercase tracking-[0.2em] mb-2">Конструктор</p>
          <h1 className="font-display font-700 text-4xl text-foreground">Новый бот</h1>
          <span className="green-line mt-4 block" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card-frog p-6 space-y-4">
            <h2 className="font-display font-600 text-lg text-foreground">Данные бота</h2>
            <div>
              <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">Telegram Bot Token</label>
              <Input value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="1234567890:AABBCCdd..." className="font-mono bg-secondary border-border text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">Название бота</label>
              <Input value={botName} onChange={e => setBotName(e.target.value)} placeholder="Мой магазин" className="bg-secondary border-border text-foreground" />
            </div>
          </div>
          <div className="card-frog p-6">
            <h2 className="font-display font-600 text-lg text-foreground mb-4">Модули</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MODULES.map(mod => (
                <button key={mod.key} type="button"
                  onClick={() => toggle(mod.key)}
                  className={`p-4 border text-left transition-all rounded-lg ${modules[mod.key] ? "border-accent bg-accent/10 glow-green" : "border-border hover:border-accent/50 hover:bg-accent/5"}`}>
                  <div className="font-display font-600 text-sm text-foreground">{mod.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{mod.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="btn-frog btn-frog-filled w-full text-lg py-4 glow-green" disabled={createBot.isPending}>
            {createBot.isPending ? "Создание..." : "Создать бота"}
          </Button>
        </form>
      </div>
    </div>
  );
}
