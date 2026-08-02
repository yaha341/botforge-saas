import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const FEATURES = [
  "Торговый бот — полная функциональность",
  "Магазин с каталогом и корзиной",
  "Курсы и цифровой контент",
  "Массовые рассылки",
  "Instagram автоматизация (Zernio)",
  "AI Ассистент (GPT)",
  "Реферальная система",
  "Купоны и скидки",
  "Мультивалюта (KZT, USD, EUR)",
  "CRM интеграция",
  "Аналитика и дашборды",
  "Поддержка 24/7",
  "Гибкий выбор модулей",
  "Без ограничений на пользователей",
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.2em] uppercase mb-3">Тарифы</p>
          <h1 className="font-display font-700 text-5xl text-foreground mb-4">Trading Plan</h1>
          <span className="green-line max-w-xs mx-auto block mb-6" />
          <p className="text-muted-foreground max-w-md mx-auto">
            Один тариф. Полная функциональность. Гибкий выбор модулей для вашего бизнеса.
          </p>
        </div>

        <div className="card-frog-active p-8 md:p-12 glow-green-strong max-w-lg mx-auto mb-12">
          <div className="text-center mb-8">
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-accent bg-accent/10 px-4 py-1 rounded-full mb-4">
              FrogFlow Studio
            </span>
            <h3 className="font-display font-700 text-3xl text-foreground mb-2">Trading</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-accent text-5xl font-display font-700">49 000</span>
              <span className="text-muted-foreground text-lg">₸</span>
              <span className="text-muted-foreground text-sm">/год</span>
            </div>
            <p className="text-xs text-muted-foreground">Оплата через Продамус</p>
          </div>

          <div className="space-y-3 mb-8">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs flex-shrink-0">✓</span>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => isAuthenticated ? navigate("/billing") : startLogin()}
            className="btn-frog btn-frog-filled w-full text-base py-4 glow-green"
          >
            {isAuthenticated ? "Перейти к оплате" : "Начать"}
          </button>
        </div>

        {/* FAQ-like note */}
        <div className="text-center">
          <div className="frosted rounded-xl p-8 max-w-md mx-auto">
            <h3 className="font-display font-600 text-lg text-foreground mb-3">Нужен индивидуальный план?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Мы не делим тарифы — вы получаете полную функциональность и гибкий выбор модулей. 
              Напишите нам для обсуждения особых условий.
            </p>
            <a href="https://t.me/frogflowkz" className="text-accent text-sm hover:underline">
              Написать в Telegram →
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="text-muted-foreground text-sm hover:text-accent transition-colors flex items-center gap-2 mx-auto" onClick={() => navigate("/")}>
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}
