import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
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
  User,
  CreditCard,
  Key,
  Shield,
  Bell,
  LayoutDashboard,
  Settings,
  LogOut,
  Loader2,
  Check,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // API Key states
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const demoApiKey = "cc_" + btoa(user?.id || "demo").slice(0, 32);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/subscriptions/current");
      setSubscription(response.data);
    } catch (error) {
      console.error("Failed to fetch subscription");
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(demoApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    toast.success("API key copied");
  };

  const handleUpgrade = async (plan) => {
    try {
      const response = await api.post(`/subscriptions/create-checkout?plan=${plan}`);
      if (response.data.demo) {
        toast.info("Demo mode - configure Stripe for real payments");
        return;
      }
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Failed to start checkout");
    }
  };

  const creditsRemaining = user ? user.credits - user.credits_used : 0;
  const creditsPercentage = user
    ? ((user.credits - user.credits_used) / user.credits) * 100
    : 0;

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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-electric/10 text-electric"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>

          {user?.is_admin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Credits Card */}
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

        {/* User Menu */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-30 bg-void/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-8 py-4">
            <h1 className="font-outfit font-bold text-2xl text-white">
              Settings
            </h1>
            <p className="text-sm text-zinc-400">
              Manage your account and preferences
            </p>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          <Tabs defaultValue="account" className="space-y-8">
            <TabsList className="bg-void-paper border border-white/5">
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-electric/10 data-[state=active]:text-electric"
                data-testid="tab-account"
              >
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="data-[state=active]:bg-electric/10 data-[state=active]:text-electric"
                data-testid="tab-billing"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="data-[state=active]:bg-electric/10 data-[state=active]:text-electric"
                data-testid="tab-api"
              >
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-void-paper border border-white/5"
              >
                <h3 className="font-outfit font-semibold text-lg text-white mb-6">
                  Profile Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-void-subtle border-white/10 text-white max-w-md"
                      data-testid="settings-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-void-subtle border-white/10 text-white max-w-md"
                      data-testid="settings-email-input"
                    />
                  </div>

                  <Button
                    className="bg-electric hover:bg-electric/90 text-white mt-4"
                    data-testid="save-profile-btn"
                  >
                    Save Changes
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-void-paper border border-white/5"
              >
                <h3 className="font-outfit font-semibold text-lg text-white mb-6">
                  Notifications
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      id: "email-updates",
                      label: "Product updates",
                      description: "Receive emails about new features",
                    },
                    {
                      id: "email-credits",
                      label: "Credit alerts",
                      description: "Get notified when credits are low",
                    },
                    {
                      id: "email-deploy",
                      label: "Deployment notifications",
                      description: "Receive updates about your deployments",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-sm text-zinc-500">{item.description}</p>
                      </div>
                      <Switch data-testid={`switch-${item.id}`} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-void-paper border border-white/5"
              >
                <h3 className="font-outfit font-semibold text-lg text-white mb-6">
                  Current Plan
                </h3>

                <div className="flex items-center justify-between p-4 rounded-lg bg-void-subtle border border-white/5">
                  <div>
                    <p className="font-outfit font-semibold text-white capitalize">
                      {subscription?.plan || user?.plan || "Starter"} Plan
                    </p>
                    <p className="text-sm text-zinc-400">
                      {subscription?.credits_remaining || creditsRemaining} credits remaining this month
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/pricing")}
                    className="bg-electric hover:bg-electric/90 text-white"
                    data-testid="upgrade-plan-btn"
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-void-paper border border-white/5"
              >
                <h3 className="font-outfit font-semibold text-lg text-white mb-6">
                  Credit Usage
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400">Credits Used</span>
                      <span className="text-white font-medium">
                        {user?.credits_used || 0} / {user?.credits || 10}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-electric to-emerald transition-all"
                        style={{
                          width: `${((user?.credits_used || 0) / (user?.credits || 10)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-zinc-500">
                    Credits reset at the start of each billing cycle.
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-void-paper border border-white/5"
              >
                <h3 className="font-outfit font-semibold text-lg text-white mb-2">
                  API Access
                </h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Use your API key to integrate CursorCode AI into your workflows.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={demoApiKey}
                        readOnly
                        className="bg-void-subtle border-white/10 text-white pr-24 font-mono"
                        data-testid="api-key-input"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                          data-testid="toggle-api-key-visibility"
                        >
                          {showApiKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCopyApiKey}
                          className="p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                          data-testid="copy-api-key-btn"
                        >
                          {apiKeyCopied ? (
                            <Check className="w-4 h-4 text-emerald" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-400">
                      Keep your API key secure and never share it publicly.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-void-paper border border-white/5"
              >
                <h3 className="font-outfit font-semibold text-lg text-white mb-2">
                  xAI API Configuration
                </h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Configure your xAI Grok API key for enhanced AI capabilities.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="xai-key" className="text-white">
                      xAI API Key
                    </Label>
                    <Input
                      id="xai-key"
                      type="password"
                      placeholder="xai-..."
                      className="bg-void-subtle border-white/10 text-white max-w-lg"
                      data-testid="xai-api-key-input"
                    />
                    <p className="text-xs text-zinc-500">
                      Get your API key from{" "}
                      <a
                        href="https://x.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-electric hover:underline"
                      >
                        x.ai
                      </a>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                    data-testid="save-xai-key-btn"
                  >
                    Save API Key
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
