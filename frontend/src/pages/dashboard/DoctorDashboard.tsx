import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SystemUpdates } from "@/components/SystemUpdates";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { usePrescriptions, Prescription } from "@/hooks/usePrescriptions";
import { useDoctorPatients } from "@/hooks/usePatientNotes";
import { useUser } from "@/hooks/useUser";
import {
  Users,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  AlertCircle,
  ChevronRight,
  Stethoscope,
  Plus,
  Loader2,
} from "lucide-react";
import { useMemo } from "react";

export default function DoctorDashboard() {
  // Fetch today's appointments
  const today = new Date().toISOString().split('T')[0];
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({
    date_from: today,
    date_to: today,
  });

  // Fetch all patients
  const { data: patientsData, isLoading: patientsLoading } = useDoctorPatients();

  // Fetch current user
  const { data: user } = useUser();
  const doctorName = user?.name ? `Dr. ${user.name}` : 'Doctor';

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = usePrescriptions();

  // Calculate stats from real data
  const stats = useMemo(() => {
    const appointments = (appointmentsData?.data || []) as Appointment[];
    const patients = patientsData?.data || [];
    const prescriptions = (prescriptionsData?.data || []) as Prescription[];

    const completedToday = appointments.filter((a) => a.status === 'completed').length;
    const pendingPrescriptions = prescriptions.filter((p) => !p.follow_up_date || new Date(p.follow_up_date) > new Date()).length;

    // Find next appointment
    const upcomingAppointments = appointments
      .filter((a) => a.status === 'scheduled' || a.status === 'rescheduled')
      .sort((a, b) => {
        const timeA = new Date(`${a.appointment_date} ${a.appointment_time}`).getTime();
        const timeB = new Date(`${b.appointment_date} ${b.appointment_time}`).getTime();
        return timeA - timeB;
      });

    const nextAppointment = upcomingAppointments[0];

    return [
      {
        title: "Today's Appointments",
        value: appointments.length,
        icon: Calendar,
        description: `${completedToday} completed`
      },
      {
        title: "Assigned Patients",
        value: patients.length,
        icon: Users
      },
      {
        title: "Pending Prescriptions",
        value: pendingPrescriptions,
        icon: ClipboardList
      },
      {
        title: "Next Appointment",
        value: nextAppointment ? nextAppointment.appointment_time : "None",
        icon: Clock,
        description: nextAppointment?.patient?.name || "No upcoming appointments"
      },
    ];
  }, [appointmentsData, patientsData, prescriptionsData]);

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    const appointments = (appointmentsData?.data || []) as Appointment[];
    return appointments.slice(0, 6); // Show first 6 appointments
  }, [appointmentsData]);

  // Get recent patients (patients with recent appointments)
  const recentPatients = useMemo(() => {
    const patients = patientsData?.data || [];
    return patients.slice(0, 4); // Show first 4 patients
  }, [patientsData]);

  const isLoading = appointmentsLoading || patientsLoading || prescriptionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome, ${doctorName}`}
        description="Here's your schedule for today"
      >
        <Button className="btn-transition">
          <Plus className="h-4 w-4 mr-2" />
          Quick Note
        </Button>
      </PageHeader>

      {/* System Updates */}
      <SystemUpdates />

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-card animate-slide-up">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">Today's Schedule</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/doctor/appointments">Full Schedule</Link>
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {todaySchedule.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                todaySchedule.map((appointment, index) => (
                  <div
                    key={appointment.id || index}
                    className="p-4 lg:px-6 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-20 shrink-0">
                      <p className="text-sm font-medium text-card-foreground">{appointment.appointment_time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {appointment.patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.reason || 'No reason provided'}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="btn-transition" asChild>
                        <Link to={`/doctor/appointments`}>View</Link>
                      </Button>
                      {(appointment.status === "scheduled" || appointment.status === "rescheduled") && (
                        <Button size="sm" className="btn-transition" asChild>
                          <Link to="/doctor/prescriptions">
                            <FileText className="h-4 w-4 mr-1" />
                            Prescribe
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-card rounded-xl shadow-card animate-slide-up stagger-1">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">Recent Patients</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/doctor/patients">View All</Link>
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recentPatients.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No patients found</p>
                </div>
              ) : (
                recentPatients.map((patient, index) => (
                  <div
                    key={patient.id || index}
                    className="p-4 lg:px-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {patient.name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{patient.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.patient?.dob ? `Age ${new Date().getFullYear() - new Date(patient.patient.dob).getFullYear()}` : 'Age N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-card rounded-xl p-5 lg:p-6 shadow-card animate-slide-up stagger-2">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Alerts & Notifications
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-muted/50 border-border">
                <p className="text-sm text-card-foreground">
                  Connect to notification system to see alerts
                </p>
                <p className="text-xs text-muted-foreground mt-1">Real-time updates coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl p-5 lg:p-6 shadow-card animate-slide-up stagger-3">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between btn-transition" asChild>
                <Link to="/doctor/prescriptions">
                  Write Prescription
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between btn-transition" asChild>
                <Link to="/doctor/patients">
                  Search Patient
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between btn-transition" asChild>
                <Link to="/doctor/schedule">
                  Update Availability
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
