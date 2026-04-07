import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Flag,
  Tag,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "../../utils/supabase";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Users, label: "Users", to: "/users" },
  { icon: Users, label: "Rooms", to: "/matches" },
  { icon: Flag, label: "Reports", to: "/messages" },
  { icon: Tag, label: "Interests", to: "/reports" },
  { icon: BarChart2, label: "Analytics", to: "/analytics" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const router = useRouter();
  const currentPath = routerState.location.pathname;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.navigate({ to: "/login" });
  }

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} flex flex-col bg-gray-900 text-white transition-all duration-300 min-h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Kusasana</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ icon: Icon, label, to }) => {
          const active = currentPath === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
