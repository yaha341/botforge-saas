import { useLocation } from "wouter";
import { startLogin } from "@/const";

const PLANS = [
  {
    name: "Basic", price: "35 000 ₸", period: "/год",
    features: ["Торговый бот", "Бот Курсы", "Рассылки", "Мультивалюта", "До 1000 пользователей"],
    highlight: false,
  },
  {
    name: "Pro", price: "65 000 ₸", period: "/год",
    features: ["Всё из Basic", "Instagram автоматизация", "Реферальная система", "Купоны и скидки", "До 10 000 пользователей"],
    highlight: true,
  },
  {
    name: "Enterprise", price: "120 000 ₸", period: "/год",
    features: ["Всё из Pro", "AI Ассистент", "CRM интеграция", "Приоритетная поддержка", "Безлимитные пользователи"],
    highlight: false,
  },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-muted-foreground font-condensed uppercase tracking-widest text-sm mb-2">Тарифы</p>
          <h1 className="text-6xl font-condensed font-black uppercase text-foreground">Pricing</h1>
          <span className="red-line mt-4 block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.name} className={`border p-8 flex flex-col ${plan.highlight ? "border-accent" : "border-border"}`}>
              {plan.highlight && <div className="text-xs font-condensed uppercase text-accent mb-3 tracking-widest">Most Popular</div>}
              <div className="text-4xl font-condensed font-black uppercase text-foreground mb-2">{plan.name}</div>
              <div className="text-3xl font-condensed font-black text-accent mb-6">{plan.price}<span className="text-sm text-muted-foreground">{plan.period}</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm font-condensed uppercase text-muted-foreground">
                    <span className="text-accent font-black">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className={plan.highlight ? "btn-brutal-red" : "btn-brutal"} onClick={() => startLogin()}>
                Get Started
              </button>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button className="text-muted-foreground font-condensed uppercase text-sm hover:text-foreground transition-colors" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

