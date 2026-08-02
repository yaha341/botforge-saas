import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useLocation } from "wouter";

const MODULES = [
  { icon: "🛒", name: "Shop", desc: "Product catalog, cart, orders" },
  { icon: "🎓", name: "Courses", desc: "Digital content delivery" },
  { icon: "📢", name: "Broadcasts", desc: "Mass messaging to users" },
  { icon: "📸", name: "Instagram", desc: "Auto-DM from comments" },
  { icon: "🤖", name: "AI Assistant", desc: "GPT-powered chat support" },
  { icon: "🔗", name: "Referral", desc: "Invite & reward system" },
  { icon: "🏷️", name: "Coupons", desc: "Discount codes & promos" },
  { icon: "💱", name: "Multi-Currency", desc: "KZT, USD, EUR and more" },
  { icon: "🔌", name: "CRM Integration", desc: "Connect your CRM system" },
];

const PLANS = [
  {
    name: "BASIC",
    price: "35 000",
    currency: "₸",
    period: "/год",
    modules: ["Shop", "Courses", "Broadcasts"],
    highlight: false,
  },
  {
    name: "PRO",
    price: "65 000",
    currency: "₸",
    period: "/год",
    modules: ["Shop", "Courses", "Broadcasts", "Instagram", "Referral", "Coupons", "Multi-Currency"],
    highlight: true,
  },
  {
    name: "ENTERPRISE",
    price: "120 000",
    currency: "₸",
    period: "/год",
    modules: ["All modules", "AI Assistant", "CRM Integration", "Priority support"],
    highlight: false,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <span className="font-condensed font-900 text-2xl tracking-widest uppercase text-foreground">
          BOT<span className="text-accent">FORGE</span>
        </span>
        <div className="flex items-center gap-6">
          <a href="/pricing" className="font-condensed font-700 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} className="btn-brutal text-sm">
              Dashboard
            </button>
          ) : (
            <button onClick={() => startLogin()} className="btn-brutal-filled btn-brutal text-sm">
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-8 pt-24 pb-16 max-w-5xl mx-auto text-center">
        <p className="font-condensed text-accent text-sm tracking-[0.3em] uppercase mb-4">
          Multi-tenant Telegram Bot Platform
        </p>
        <h1 className="font-condensed font-900 text-[clamp(3.5rem,10vw,8rem)] leading-none uppercase text-foreground mb-6">
          Build.<br />Launch.<br />Scale.
        </h1>
        <span className="red-line mb-8 block" />
        <p className="font-sans text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          One platform. Unlimited bots. Choose your modules, connect your token, go live in minutes.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => isAuthenticated ? navigate("/bots/new") : startLogin()}
            className="btn-brutal btn-brutal-filled text-base px-10 py-4"
          >
            Create Your Bot
          </button>
          <a href="/pricing" className="btn-brutal text-base px-10 py-4">
            View Pricing
          </a>
        </div>
      </section>

      <span className="red-line" />

      {/* MODULES */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="font-condensed font-900 text-5xl uppercase text-foreground mb-2">Modules</h2>
        <p className="text-muted-foreground mb-10">Pick only what you need. Pay for what you use.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {MODULES.map((m) => (
            <div key={m.name} className="bg-card p-6 hover:bg-secondary transition-colors group">
              <div className="text-3xl mb-3">{m.icon}</div>
              <div className="font-condensed font-800 text-xl uppercase text-foreground group-hover:text-accent transition-colors">
                {m.name}
              </div>
              <div className="text-muted-foreground text-sm mt-1">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <span className="red-line" />

      {/* PRICING */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="font-condensed font-900 text-5xl uppercase text-foreground mb-2">Pricing</h2>
        <p className="text-muted-foreground mb-10">Annual billing. No hidden fees.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 flex flex-col ${plan.highlight ? "bg-accent" : "bg-card"}`}
            >
              <div className={`font-condensed font-900 text-3xl uppercase mb-1 ${plan.highlight ? "text-white" : "text-foreground"}`}>
                {plan.name}
              </div>
              <div className={`font-condensed font-900 text-5xl mb-1 ${plan.highlight ? "text-white" : "text-foreground"}`}>
                {plan.currency}{plan.price}
              </div>
              <div className={`text-sm mb-6 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.period}
              </div>
              <ul className="flex-1 space-y-2 mb-8">
                {plan.modules.map((mod) => (
                  <li key={mod} className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-white" : "text-muted-foreground"}`}>
                    <span className="text-xs">▸</span> {mod}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => isAuthenticated ? navigate("/billing") : startLogin()}
                className={`btn-brutal text-sm w-full ${plan.highlight ? "border-white text-white hover:bg-white hover:text-accent" : ""}`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <span className="red-line" />

      {/* CTA */}
      <section className="px-8 py-24 text-center">
        <h2 className="font-condensed font-900 text-[clamp(2rem,6vw,5rem)] uppercase text-foreground mb-4">
          Stop doing it manually.
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          One Supabase. One Vercel. One platform for all your bots and all your clients.
        </p>
        <button
          onClick={() => isAuthenticated ? navigate("/dashboard") : startLogin()}
          className="btn-brutal btn-brutal-filled text-lg px-12 py-5"
        >
          Start Building
        </button>
      </section>

      {/* FOOTER */}
      <span className="red-line" />
      <footer className="px-8 py-6 flex items-center justify-between text-muted-foreground text-xs font-condensed uppercase tracking-widest">
        <span>BotForge © 2026</span>
        <span>Powered by Telegram · Supabase · Vercel</span>
      </footer>
    </div>
  );
}
