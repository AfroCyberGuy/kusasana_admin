import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Heart, MessageSquare, Flag } from "lucide-react";
import { supabase } from "../utils/supabase";
import AdminLayout from "../components/admin/AdminLayout";
import StatCard from "../components/admin/StatCard";
import RecentUsers from "../components/admin/RecentUsers";
import ActivityChart from "../components/admin/ActivityChart";
import UserMap from "../components/admin/UserMap";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: DashboardPage,
});

export interface Profile {
  uuid: string;
  fullname: string;
  username?: string;
  email?: string;
  dob?: string;
  gender_id?: string;
  location_country?: string;
  is_active?: boolean;
  is_profile_complete?: boolean;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalMatches: number;
  totalRooms: number;
  totalCountries: number;
}

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  age?: number;
}

function DashboardPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMatches: 0,
    totalRooms: 0,
    totalCountries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [
          profilesRes,
          profilesCountRes,
          matchesRes,
          roomsRes,
          countriesRes,
          locationsRes,
        ] = await Promise.allSettled([
          supabase
            .from("profiles")
            .select(
              "uuid, fullname, username, email, dob, gender_id, location_country, is_active, is_profile_complete, created_at",
            )
            .order("uuid", { ascending: false })
            .limit(20),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("matches").select("*", { count: "exact", head: true }),
          supabase.from("rooms").select("*", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("location_country")
            .not("location_country", "is", null),
          supabase.rpc("get_user_map_locations"),
        ]);

        if (profilesRes.status === "fulfilled" && !profilesRes.value.error) {
          setUsers((profilesRes.value.data as Profile[]) ?? []);
        }

        if (
          profilesCountRes.status === "fulfilled" &&
          !profilesCountRes.value.error
        ) {
          setStats((prev) => ({
            ...prev,
            totalUsers: profilesCountRes.value.count ?? 0,
          }));
        }

        if (matchesRes.status === "fulfilled" && !matchesRes.value.error) {
          setStats((prev) => ({
            ...prev,
            totalMatches: matchesRes.value.count ?? 0,
          }));
        }

        if (roomsRes.status === "fulfilled" && !roomsRes.value.error) {
          setStats((prev) => ({
            ...prev,
            totalRooms: roomsRes.value.count ?? 0,
          }));
        }

        if (countriesRes.status === "fulfilled" && !countriesRes.value.error) {
          const countries = new Set(
            (countriesRes.value.data ?? []).map(
              (r: { location_country: string }) => r.location_country,
            ),
          );
          setStats((prev) => ({ ...prev, totalCountries: countries.size }));
        }

        if (locationsRes.status === "fulfilled" && !locationsRes.value.error) {
          setMapLocations((locationsRes.value.data as MapLocation[]) ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={loading ? "—" : stats.totalUsers.toLocaleString()}
          change="11%"
          positive
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Total Matches"
          value={loading ? "—" : stats.totalMatches.toLocaleString()}
          change="8%"
          positive
          icon={Heart}
          color="bg-violet-500"
        />
        <StatCard
          title="Active Rooms"
          value={loading ? "—" : stats.totalRooms.toLocaleString()}
          change="15%"
          positive
          icon={MessageSquare}
          color="bg-sky-500"
        />
        <StatCard
          title="Countries"
          value={loading ? "—" : stats.totalCountries.toLocaleString()}
          change=""
          positive
          icon={Flag}
          color="bg-amber-500"
        />
      </div>

      {/* Chart + Map */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
        <div className="xl:col-span-3">
          <ActivityChart />
        </div>
        <div className="xl:col-span-2">
          <UserMap locations={mapLocations} />
        </div>
      </div>

      {/* Recent Users Table */}
      <RecentUsers users={users} loading={loading} />
    </AdminLayout>
  );
}
