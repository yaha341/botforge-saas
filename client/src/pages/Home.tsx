import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useLocation } from "wouter";

const MODULES = [
  { icon: "🛒", name: "Магазин", desc: "Каталог товаров, корзина, заказы, оплата" },
  { icon: "🎓", name: "Курсы", desc: "Цифровой контент и обучение" },
  { icon: "📢", name: "Рассылки", desc: "Массовые рассылки пользователям" },
  { icon: "📸", name: "Instagram", desc: "Авто-DM из комментариев" },
  { icon: "🤖", name: "AI Ассистент", desc: "Поддержка на базе GPT" },
  { icon: "🔗", name: "Рефералы", desc: "Система приглашений и наград" },
  { icon: "🏷️", name: "Купоны", desc: "Скидочные коды и промоакции" },
  { icon: "💱", name: "Мультивалюта", desc: "KZT, USD, EUR и другие" },
  { icon: "🔌", name: "CRM", desc: "Интеграция с CRM-системами" },
];

const FEATURES = [
  { icon: "⚡", title: "Быстрый запуск", desc: "Подключите токен бота и начните работу за 5 минут" },
  { icon: "🔄", title: "Гибкость", desc: "Выбирайте только нужные модули — никаких ограничений" },
  { icon: "📊", title: "Аналитика", desc: "Полная аналитика заказов, пользователей и выручки" },
  { icon: "🛡️", title: "Надёжность", desc: "99.9% uptime, автоматические бэкапы и мониторинг" },
];

const STATS = [
  { value: "170+", label: "Успешных сделок" },
  { value: "3", label: "Довольных клиента" },
  { value: "9", label: "Модулей" },
  { value: "24/7", label: "Поддержка" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-lg font-bold text-background">F</span>
          </div>
          <span className="font-display font-700 text-lg text-foreground">
            Frog<span className="text-gradient-green">Flow</span>
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Тарифы</a>
          <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Модули</a>
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} className="btn-frog btn-frog-filled text-sm px-5 py-2">
              Дашборд
            </button>
          ) : (
            <button onClick={() => startLogin()} className="btn-frog btn-frog-filled text-sm px-5 py-2">
              Начать
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-32 pb-20 max-w-6xl mx-auto text-center">
        <p className="text-accent text-sm tracking-[0.2em] uppercase mb-4 font-medium">
          Telegram-боты под ключ
        </p>
        <h1 className="font-display font-700 text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.1] mb-6">
          <span className="text-foreground">Автоматизируй.</span>
          <br />
          <span className="text-gradient-green">Масштабируй.</span>
          <br />
          <span className="text-foreground">Зарабатывай.</span>
        </h1>
        <span className="green-line mb-8 max-w-md mx-auto block" />
        <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          Создай полноценного торгового бота в Telegram. Магазин, курсы, рассылки, AI — выбери нужное и запусти за минуты.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => isAuthenticated ? navigate("/bots/new") : startLogin()}
            className="btn-frog btn-frog-filled text-base px-8 py-3 glow-green"
          >
            Создать бота
          </button>
          <a href="#pricing" className="btn-frog btn-frog-ghost text-base px-8 py-3">
            Посмотреть тарифы
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="card-frog p-6 text-center">
              <div className="font-display font-700 text-3xl text-gradient-green mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <span className="green-line" />

      {/* FEATURES */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.2em] uppercase mb-3">Почему FrogFlow</p>
          <h2 className="font-display font-700 text-4xl md:text-5xl text-foreground mb-4">Всё что нужно</h2>
          <span className="green-line max-w-xs mx-auto block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-frog p-8 hover:glow-green transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display font-600 text-xl text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <span className="green-line" />

      {/* MODULES */}
      <section id="modules" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.2em] uppercase mb-3">Модули</p>
          <h2 className="font-display font-700 text-4xl md:text-5xl text-foreground mb-4">Выбирай своё</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Подключай только те модули, которые нужны вашему бизнесу. Никаких ограничений.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <div key={m.name} className="card-frog p-6 hover:glow-green transition-all group cursor-default">
              <div className="text-2xl mb-3">{m.icon}</div>
              <div className="font-display font-600 text-lg text-foreground mb-1 group-hover:text-accent transition-colors">
                {m.name}
              </div>
              <div className="text-muted-foreground text-sm">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <span className="green-line" />

      {/* PRICING */}
      <section id="pricing" className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.2em] uppercase mb-3">Тариф</p>
          <h2 className="font-display font-700 text-4xl md:text-5xl text-foreground mb-4">Trading Plan</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Один тариф. Полная функциональность. Гибкий выбор модулей.</p>
        </div>

        <div className="card-frog-active p-8 md:p-12 glow-green-strong max-w-lg mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-accent bg-accent/10 px-4 py-1 rounded-full mb-4">
              Основной тариф
            </span>
            <h3 className="font-display font-700 text-3xl text-foreground mb-2">Trading</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-accent text-5xl font-display font-700">49 000</span>
              <span className="text-muted-foreground text-lg">₸</span>
              <span className="text-muted-foreground text-sm">/год</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {[
              "Торговый бот — полная функциональность",
              "Магазин с каталогом и корзиной",
              "Курсы и цифровой контент",
              "Массовые рассылки",
              "Instagram автоматизация",
              "AI Ассистент (GPT)",
              "Реферальная система",
              "Купоны и скидки",
              "Мультивалюта (KZT, USD, EUR)",
              "CRM интеграция",
              "Аналитика и дашборды",
              "Поддержка 24/7",
            ].map((feature) => (
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
            Подключить
          </button>
        </div>
      </section>

      <span className="green-line" />

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="font-display font-700 text-[clamp(2rem,5vw,4rem)] text-foreground mb-4">
          Хватит делать вручную
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
          Один Supabase. Один Vercel. Одна платформа для всех ваших ботов и клиентов.
        </p>
        <button
          onClick={() => isAuthenticated ? navigate("/dashboard") : startLogin()}
          className="btn-frog btn-frog-filled text-lg px-10 py-4 glow-green"
        >
          Начать бесплатно
        </button>
      </section>

      {/* FOOTER */}
      <span className="green-line" />
      <footer className="px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <span className="text-[10px] font-bold text-background">F</span>
          </div>
          <span>FrogFlow Studio © 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://instagram.com/frogflowkz" className="hover:text-accent transition-colors">Instagram</a>
          <span>•</span>
          <span>Telegram • Supabase • Vercel</span>
        </div>
      </footer>
    </div>
  );
}
