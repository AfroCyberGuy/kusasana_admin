import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "../../utils/supabase";
import AdminLayout from "../../components/admin/AdminLayout";
import ActivityChart from "../../components/admin/ActivityChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/analytics/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AnalyticsPage,
});

const ageData = [
  { range: "18-22", users: 420 },
  { range: "23-27", users: 780 },
  { range: "28-32", users: 640 },
  { range: "33-37", users: 390 },
  { range: "38-42", users: 210 },
  { range: "43+", users: 130 },
];

const genderData = [
  { name: "Female", value: 54 },
  { name: "Male", value: 43 },
  { name: "Non-binary", value: 3 },
];

const GENDER_COLORS = ["#f43f5e", "#8b5cf6", "#0ea5e9"];

const retentionData = [
  { week: "W1", rate: 100 },
  { week: "W2", rate: 72 },
  { week: "W3", rate: 58 },
  { week: "W4", rate: 49 },
  { week: "W5", rate: 43 },
  { week: "W6", rate: 38 },
  { week: "W7", rate: 35 },
  { week: "W8", rate: 33 },
];

export default function AnalyticsPage() {
  return (
    <AdminLayout title="Analytics">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {/* Age Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Age Distribution
          </h2>
          <p className="text-sm text-gray-500 mb-4">Users by age group</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={ageData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="users" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Split */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Gender Split
          </h2>
          <p className="text-sm text-gray-500 mb-4">User gender breakdown</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {genderData.map((_, i) => (
                  <Cell
                    key={`cell-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: static data
                      i
                    }`}
                    fill={GENDER_COLORS[i]}
                  />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity + Retention */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <ActivityChart />
        </div>
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            User Retention
          </h2>
          <p className="text-sm text-gray-500 mb-4">8-week cohort retention</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={retentionData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}%`, "Retention"]}
              />
              <Bar dataKey="rate" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
