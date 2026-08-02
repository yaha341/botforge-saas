import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useLocation } from "wouter";
import { ReactNode } from "react";
import { Bot, LayoutDashboard, Bell, CreditCard, LogOut, Plus } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/bots", icon: Bot, label: "Мои боты" },
  { href: "/billing", icon: CreditCard, label: "Подписка" },
  { href: "/notifications", icon: Bell, label: "Уведомления" },
];

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-2xl tracking-widest text-muted-foreground animate-pulse">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-6">
        <div className="font-display font-700 text-5xl text-foreground">Доступ ограничен</div>
        <span className="green-line w-32" />
        <p className="text-muted-foreground">Войдите, чтобы получить доступ к дашборду.</p>
        <button onClick={() => startLogin()} className="btn-frog btn-frog-filled">
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <a href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <span className="text-xs font-bold text-background">F</span>
            </div>
            <span className="font-display font-600 text-sm tracking-wider uppercase">
              Frog<span className="text-gradient-green">Flow</span>
            </span>
          </a>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left font-sans font-500 text-sm transition-colors
                  ${active
                    ? "text-foreground bg-secondary border-l-2 border-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            );
          })}
          <div className="px-5 pt-4">
            <button
              onClick={() => navigate("/bots/new")}
              className="w-full flex items-center gap-2 btn-frog btn-frog-ghost text-xs py-2 px-3"
            >
              <Plus size={13} /> Новый бот
            </button>
          </div>
        </nav>
        <div className="border-t border-border px-5 py-4">
          <div className="text-xs text-muted-foreground mb-1 truncate">
            {user?.name || user?.email || "Пользователь"}
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            <LogOut size={12} /> Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {title && (
          <div className="border-b border-border px-8 py-5">
            <h1 className="font-display font-700 text-3xl text-foreground">{title}</h1>
          </div>
        )}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
