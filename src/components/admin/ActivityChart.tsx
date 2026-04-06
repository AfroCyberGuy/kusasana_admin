import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "../../utils/supabase";

interface ChartRow {
  month: string;
  signups: number;
  matches: number;
  rooms: number;
}

export default function ActivityChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: rows } = await supabase.rpc("get_activity_chart_data", {
        year,
      });
      if (rows) setData(rows as ChartRow[]);
      setLoading(false);
    }
    load();
  }, [year]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Platform Activity
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Signups, matches & rooms over time
          </p>
        </div>
        <select
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-65 text-gray-400 text-sm">
          Loading…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gMatches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRooms" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
              cursor={{ stroke: "#e5e7eb" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="signups"
              name="Signups"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#gSignups)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="matches"
              name="Matches"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gMatches)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="rooms"
              name="Rooms"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#gRooms)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
