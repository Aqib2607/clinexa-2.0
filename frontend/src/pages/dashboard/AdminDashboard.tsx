import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
// DataTable removed
import { PageHeader } from "@/components/ui/page-header";
import { SystemUpdates } from "@/components/SystemUpdates";
import {
  Building2,
  Users,
  Activity,
  AlertTriangle,
  Server,
  Shield,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

interface DashboardStats {
  active_users: number;
  total_users: number;
  total_doctors: number;
  total_departments: number;
  total_staff: number;
  system_uptime: string;
  security_alerts: number;
}

interface ActivityLog {
  action: string;
  details: string;
  time: string;
}

import { useUser } from "@/hooks/useUser";

export default function AdminDashboard() {
  const { data: user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
        setRecentActivity(response.data.recent_activity);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Users",
      value: stats?.active_users.toLocaleString() || "0",
      icon: Users,
      description: `Total: ${stats?.total_users}`
    },
    {
      title: "System Uptime",
      value: stats?.system_uptime || "99.9%",
      icon: Server
    },
    {
      title: "Security Alerts",
      value: stats?.security_alerts || 0,
      icon: AlertTriangle,
      description: "Requires attention"
    },
    {
      title: "Total Departments",
      value: stats?.total_departments || 0,
      icon: Building2
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome, ${user?.name || 'Admin'}`}
        description="Hospital overview and management"
      >
        <Button variant="outline" className="btn-transition">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </PageHeader>

      {/* System Updates */}
      <SystemUpdates />

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-card rounded-xl p-5 lg:p-6 shadow-card animate-slide-up stagger-1">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="flex items-center gap-2 text-sm text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                {stats ? 'Connected' : 'Checking…'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Services</span>
              <span className="flex items-center gap-2 text-sm text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                {stats ? 'Operational' : 'Checking…'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="flex items-center gap-2 text-sm text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                {stats?.active_users?.toLocaleString() ?? '—'} online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Security</span>
              <span className={`flex items-center gap-2 text-sm ${(stats?.security_alerts ?? 0) > 0 ? 'text-warning' : 'text-success'}`}>
                <span className={`h-2 w-2 rounded-full ${(stats?.security_alerts ?? 0) > 0 ? 'bg-warning' : 'bg-success'}`} />
                {(stats?.security_alerts ?? 0) > 0 ? `${stats?.security_alerts} Alerts` : 'All Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-card rounded-xl p-5 lg:p-6 shadow-card animate-slide-up stagger-2">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    {index < recentActivity.length - 1 && <div className="w-px h-full bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-card-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {log.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">No recent activity</div>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild className="w-full mt-2">
            <Link to="/admin/reports">View All Reports</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
