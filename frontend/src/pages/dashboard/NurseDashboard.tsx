import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SystemUpdates } from "@/components/SystemUpdates";
import {
  Users,
  Activity,
  ClipboardCheck,
  Clock,
  ThermometerSun,
  Heart,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface NurseDashboardData {
  stats: {
    assigned_patients: number;
    pending_vitals: number;
    tasks_completed: number;
    tasks_total: number;
    shift_ends: string;
  };
  patients: Array<{
    id: string;
    patient_name: string;
    patient_id: number;
    bed_number: string;
    ward: string;
    doctor: string;
    vitals_status: 'due' | 'completed';
    last_vitals: string;
    admission_date: string;
  }>;
  recent_vitals: Array<{
    id: string;
    patient_name: string;
    bp: string;
    temperature: string;
    pulse: string;
    spo2: string;
    time_ago: string;
  }>;
}

export default function NurseDashboard() {
  const { data: user } = useUser();

  const { data, isLoading } = useQuery<NurseDashboardData>({
    queryKey: ['nurse-dashboard'],
    queryFn: async () => {
      const response = await api.get('/nurse/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.stats;
  const patients = data?.patients || [];
  const recentVitals = data?.recent_vitals || [];

  const statCards = [
    { title: "Assigned Patients", value: stats?.assigned_patients ?? 0, icon: Users, description: "Currently admitted" },
    { title: "Pending Vitals", value: stats?.pending_vitals ?? 0, icon: Activity },
    { title: "Tasks Completed", value: stats?.tasks_total ? `${stats.tasks_completed}/${stats.tasks_total}` : "0/0", icon: ClipboardCheck },
    { title: "Shift Ends", value: stats?.shift_ends ?? "N/A", icon: Clock },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome, ${user?.name || 'Nurse'}`}
        description="Your assigned patients and tasks"
      >
        <Button className="btn-transition" asChild>
          <Link to="/nurse/vitals">
            <Plus className="h-4 w-4 mr-2" />
            Record Vitals
          </Link>
        </Button>
      </PageHeader>

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
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assigned Patients */}
        <div className="lg:col-span-2 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">Assigned Patients</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/nurse/patients">View All</Link>
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {patients.length > 0 ? patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 lg:px-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <span className="font-bold text-muted-foreground text-xs">{patient.bed_number}</span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{patient.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{patient.ward} · {patient.doctor}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={patient.vitals_status === 'due' ? 'pending' : 'completed'} />
                      <p className="text-xs text-muted-foreground mt-1">Last: {patient.last_vitals}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pl-16">
                    <Button size="sm" variant="outline" className="btn-transition" asChild>
                      <Link to={`/nurse/patients/${patient.id}`}>View Chart</Link>
                    </Button>
                    <Button size="sm" className="btn-transition" asChild>
                      <Link to={`/nurse/vitals?patientId=${patient.id}`}>
                        <Activity className="h-4 w-4 mr-1" />
                        Record Vitals
                      </Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No patients assigned</p>
                  <p className="text-sm mt-1">There are currently no admitted patients to display.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-card rounded-xl p-5 lg:p-6 shadow-card animate-slide-up stagger-1">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <Link to="/nurse/vitals">
                  <Activity className="h-4 w-4 mr-2" /> Record Vital Signs
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <Link to="/nurse/tasks">
                  <ClipboardCheck className="h-4 w-4 mr-2" /> View Tasks
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <Link to="/nurse/patients">
                  <Users className="h-4 w-4 mr-2" /> View All Patients
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent Vitals */}
          <div className="bg-card rounded-xl p-5 lg:p-6 shadow-card animate-slide-up stagger-2">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <ThermometerSun className="h-5 w-5 text-primary" />
              Recent Vitals
            </h3>
            <div className="space-y-4">
              {recentVitals.length > 0 ? recentVitals.slice(0, 3).map((vital) => (
                <div key={vital.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-card-foreground mb-2">{vital.patient_name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-destructive" />
                      <span className="text-muted-foreground">{vital.bp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThermometerSun className="h-3 w-3 text-warning" />
                      <span className="text-muted-foreground">{vital.temperature}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-primary" />
                      <span className="text-muted-foreground">{vital.pulse}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{vital.time_ago}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No vitals recorded yet</p>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild className="w-full mt-2">
              <Link to="/nurse/vitals">View History</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
