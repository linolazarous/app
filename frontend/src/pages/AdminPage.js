import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { toast } from "sonner";
import {
  Sparkles,
  Users,
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  LayoutDashboard,
  Settings,
  Shield,
  LogOut,
  Loader2,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, usageRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/usage"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setUsage(usageRes.data.usage);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const planDistributionData = stats
    ? Object.entries(stats.plan_distribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const creditsRemaining = user ? user.credits - user.credits_used : 0;
  const creditsPercentage = user
    ? ((user.credits - user.credits_used) / user.credits) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-void-paper border-r border-white/5 flex flex-col z-40">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit font-bold text-lg text-white">
              CursorCode
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>

          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-electric/10 text-electric"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-lg bg-void-subtle border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">AI Credits</span>
              <Zap className="w-4 h-4 text-electric" />
            </div>
            <div className="text-2xl font-outfit font-bold text-white mb-2">
              {creditsRemaining}
              <span className="text-sm font-normal text-zinc-500">
                /{user?.credits}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-electric transition-all"
                style={{ width: `${creditsPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-30 bg-void/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="font-outfit font-bold text-2xl text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-zinc-400">
                Platform overview and analytics
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchData}
              className="border-white/10 text-white hover:bg-white/5"
              data-testid="refresh-data-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-void-paper border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    Total Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-electric" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-outfit font-bold text-white">
                    {stats?.total_users || 0}
                  </div>
                  <p className="text-xs text-emerald flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-void-paper border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-emerald" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-outfit font-bold text-white">
                    ${stats?.monthly_revenue || 0}
                  </div>
                  <p className="text-xs text-emerald flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-void-paper border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    Total Projects
                  </CardTitle>
                  <BarChart3 className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-outfit font-bold text-white">
                    {stats?.total_projects || 0}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Across all users
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-void-paper border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    AI Generations
                  </CardTitle>
                  <Activity className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-outfit font-bold text-white">
                    {stats?.total_generations || 0}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Total API calls
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-void-paper border-white/5">
                <CardHeader>
                  <CardTitle className="text-white font-outfit">
                    Plan Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={planDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {planDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181B",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-void-paper border-white/5">
                <CardHeader>
                  <CardTitle className="text-white font-outfit">
                    Users by Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={planDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                        <XAxis
                          dataKey="name"
                          stroke="#71717A"
                          tick={{ fill: "#A1A1AA" }}
                        />
                        <YAxis stroke="#71717A" tick={{ fill: "#A1A1AA" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181B",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-void-paper border-white/5">
              <CardHeader>
                <CardTitle className="text-white font-outfit">
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="users-table">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Credits Used
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 10).map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="py-3 px-4 text-white">{u.name}</td>
                          <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                u.plan === "pro"
                                  ? "bg-electric/20 text-electric"
                                  : u.plan === "premier"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : u.plan === "ultra"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {u.plan}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400">
                            {u.credits_used} / {u.credits}
                          </td>
                          <td className="py-3 px-4 text-zinc-500">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
