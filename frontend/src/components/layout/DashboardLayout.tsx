import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Stethoscope,
  ClipboardList,
  UserCog,
  Activity,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAuthStore } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  role: "super_admin" | "doctor" | "nurse" | "patient";
  userName?: string;
}

const roleConfig = {
  super_admin: {
    title: "Admin",
    color: "bg-primary",
    navItems: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
      { name: "Appointments", href: "/admin/appointments", icon: Calendar },
      { name: "Departments", href: "/admin/departments", icon: Building2 },
      { name: "Staff", href: "/admin/staff", icon: Users },
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  doctor: {
    title: "Doctor Portal",
    color: "bg-primary",
    navItems: [
      { name: "Dashboard", href: "/doctor", icon: LayoutDashboard },
      { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
      { name: "Patients", href: "/doctor/patients", icon: Users },
      { name: "Prescriptions", href: "/doctor/prescriptions", icon: ClipboardList },
      { name: "Schedule", href: "/doctor/schedule", icon: Activity },
      { name: "Settings", href: "/doctor/settings", icon: Settings },
    ],
  },
  nurse: {
    title: "Nurse Portal",
    color: "bg-primary",
    navItems: [
      { name: "Dashboard", href: "/nurse", icon: LayoutDashboard },
      { name: "Patients", href: "/nurse/patients", icon: Users },
      { name: "Vitals", href: "/nurse/vitals", icon: Activity },
      { name: "Tasks", href: "/nurse/tasks", icon: ClipboardList },
      { name: "Settings", href: "/nurse/settings", icon: Settings },
    ],
  },
  patient: {
    title: "Patient Portal",
    color: "bg-primary",
    navItems: [
      { name: "Dashboard", href: "/patient", icon: LayoutDashboard },
      { name: "Appointments", href: "/patient/appointments", icon: Calendar },
      { name: "Records", href: "/patient/records", icon: FileText },
      { name: "Prescriptions", href: "/patient/prescriptions", icon: ClipboardList },
      { name: "Settings", href: "/patient/settings", icon: Settings },
    ],
  },
};

import { useUser } from "@/hooks/useUser.ts";

export function DashboardLayout({ role: propRole, userName: propUserName = "User" }: DashboardLayoutProps) {
  const { data: user, isLoading } = useUser();
  const { logout, isAuthenticated, hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Role guard: redirect if not authenticated or wrong role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (user && user.role !== propRole) {
      const roleRedirects: Record<string, string> = {
        super_admin: '/admin',
        doctor: '/doctor',
        nurse: '/nurse',
        patient: '/patient',
      };
      navigate(roleRedirects[user.role] || '/login', { replace: true });
    }
  }, [isAuthenticated, user, propRole, navigate]);

  // Use user data if available, otherwise fall back to props
  const role = user?.role || propRole;
  const userName = isLoading ? "Loading..." : (user?.name || propUserName);

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const isActive = (href: string) => {
    const isRoot = href === '/admin' || href === '/doctor' || href === '/nurse' || href === '/patient';
    if (isRoot) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  // Real notifications from API
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = (notificationsData?.data || notificationsData || []).map((n: {
    id: string | number;
    type?: string;
    data?: { title?: string; message?: string; type?: string };
    read_at: string | null;
    created_at: string;
  }) => ({
    id: String(n.id),
    type: (n.data?.type || n.type || 'info') as 'info' | 'warning' | 'success',
    title: n.data?.title || 'Notification',
    message: n.data?.message || '',
    timestamp: n.created_at,
    read: !!n.read_at,
  }));

  const handleNotificationClick = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Clinexa Logo"
              className="h-9 w-9"
            />
            <span className="text-lg font-bold text-sidebar-foreground">Clinexa</span>
          </Link>
          <button
            className="lg:hidden p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent">
            <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
            <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60">{config.title}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {config.navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-md"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="global-search"
                id="global-search"
                placeholder="Search..."
                className="w-64 lg:w-80 pl-10 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllRead={handleMarkAllRead}
            />
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {userName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{config.title}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main ref={mainRef} className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
