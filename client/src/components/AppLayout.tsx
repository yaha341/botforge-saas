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
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/bots", icon: Bot, label: "My Bots" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-condensed text-2xl uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-6">
        <div className="font-condensed font-900 text-5xl uppercase text-foreground">Access Denied</div>
        <span className="red-line w-32" />
        <p className="text-muted-foreground">You need to sign in to access this page.</p>
        <button onClick={() => startLogin()} className="btn-brutal btn-brutal-filled">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <a href="/" className="font-condensed font-900 text-xl tracking-widest uppercase">
            BOT<span className="text-accent">FORGE</span>
          </a>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left font-condensed font-700 text-sm uppercase tracking-wider transition-colors
                  ${active ? "text-foreground bg-secondary border-l-2 border-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            );
          })}
          <div className="px-5 pt-4">
            <button
              onClick={() => navigate("/bots/new")}
              className="w-full flex items-center gap-2 btn-brutal btn-brutal-red text-xs py-2 px-3"
            >
              <Plus size={13} /> New Bot
            </button>
          </div>
        </nav>
        <div className="border-t border-border px-5 py-4">
          <div className="text-xs text-muted-foreground font-condensed uppercase tracking-wider mb-1 truncate">
            {user?.name || user?.email || "User"}
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors font-condensed uppercase tracking-wider"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {title && (
          <div className="border-b border-border px-8 py-5">
            <h1 className="font-condensed font-900 text-3xl uppercase text-foreground">{title}</h1>
          </div>
        )}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
