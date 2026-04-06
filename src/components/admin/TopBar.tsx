import { Bell, Search, Moon, Sun } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  function toggleTheme() {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 bg-white border-b border-gray-200 px-6 py-3">
      <h1 className="text-xl font-semibold text-gray-800 flex-1">{title}</h1>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
        />
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <button
        type="button"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
      </button>
      <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          Admin
        </span>
      </div>
    </header>
  );
}
