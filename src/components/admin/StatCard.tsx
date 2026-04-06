import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {change && (
          <p
            className={`text-xs mt-1 font-medium ${positive ? "text-emerald-600" : "text-rose-500"}`}
          >
            {positive ? "↑" : "↓"} {change} vs last month
          </p>
        )}
      </div>
    </div>
  );
}
