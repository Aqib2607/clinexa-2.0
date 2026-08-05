import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SystemUpdates } from "@/components/SystemUpdates";
import api from "@/lib/api";
import { Loader2, Calendar, FileText, ClipboardList, User, Phone, Mail, MapPin, Download, Plus } from "lucide-react";
import { Patient, Appointment, Prescription, LabResult } from "@/types";
import { useAuthStore } from "@/hooks/useAuth";

interface DashboardData {
  patient: Patient;
  appointments: Appointment[];
  reports: LabResult[];
  prescriptions: Prescription[];
}

import { useUser } from "@/hooks/useUser";

export default function PatientDashboard() {
  const { data: user } = useUser();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/patient/login');
      return;
    }

    api.get('/patient/dashboard-data')
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error(err);
        if (err?.response?.status === 401) navigate('/patient/login');
      })
      .finally(() => setLoading(false));
  }, [navigate, isAuthenticated]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!data) return null;

  const { patient, appointments, reports, prescriptions } = data;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome, ${user?.name || patient.name}`}
        description="Manage your health records and appointments"
      >
        <Button className="btn-transition" asChild>
          <Link to="/appointment">
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </PageHeader>

      {/* System Updates */}
      <SystemUpdates />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Appointments */}
          <div className="bg-card rounded-xl shadow-card">
            <div className="p-4 lg:p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Upcoming Appointments
              </h2>
              <Button variant="ghost" size="sm" asChild><Link to="/patient/appointments">View All</Link></Button>
            </div>
            <div className="divide-y divide-border">
              {appointments.length > 0 ? appointments.map((appt) => (
                <div key={appt.id} className="p-4 flex justify-between items-center hover:bg-muted/30">
                  <div>
                    <p className="font-medium">{appt.doctor?.user?.name || 'Doctor'}</p>
                    <p className="text-sm text-muted-foreground">{appt.department?.name} · {new Date(appt.appointment_date).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              )) : <div className="p-4 text-muted-foreground text-center">No upcoming appointments</div>}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-card rounded-xl shadow-card">
            <div className="p-4 lg:p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Recent Reports
              </h2>
              <Button variant="ghost" size="sm" asChild><Link to="/patient/records">View All</Link></Button>
            </div>
            <div className="divide-y divide-border">
              {reports.map((report, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-muted/30">
                  <div>
                    <p className="font-medium">{report.description}</p>
                    <p className="text-sm text-muted-foreground">{report.type} · {report.doctor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{report.date}</span>
                    <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-card rounded-xl shadow-card">
            <div className="p-4 lg:p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Active Prescriptions
              </h2>
              <Button variant="ghost" size="sm" asChild><Link to="/patient/prescriptions">View All</Link></Button>
            </div>
            <div className="divide-y divide-border">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 flex justify-between items-center hover:bg-muted/30">
                  <div>
                    <p className="font-medium">{rx.medications?.[0]?.medicine_name || 'Medication'}</p>
                    <p className="text-sm text-muted-foreground">{rx.doctor?.user?.name}</p>
                  </div>
                  <StatusBadge status="active" /> // Assuming status is active for now as per controller mock
                </div>
              ))}
              {prescriptions.length === 0 && <div className="p-4 text-muted-foreground text-center">No active prescriptions</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">DOB: {patient.dob}</p>
                <p className="text-sm text-primary font-medium">Blood: {patient.blood_type}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" /> <span>{patient.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" /> <span>{patient.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" /> <span>{patient.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
