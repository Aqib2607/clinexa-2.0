import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import { ProtectedHomepage } from "@/components/ProtectedHomepage";
import AboutPage from "@/pages/public/AboutPage";
import DepartmentsPage from "@/pages/public/DepartmentsPage";
import DepartmentDetailPage from "@/pages/public/DepartmentDetailPage";
import DoctorsPage from "@/pages/public/DoctorsPage";
import AppointmentPage from "@/pages/public/AppointmentPage";
import ContactPage from "@/pages/public/ContactPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import TermsPage from "@/pages/public/TermsPage";
import ConsentPage from "@/pages/public/ConsentPage";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import PatientLogin from "@/pages/auth/PatientLogin";
import RegisterPage from "@/pages/auth/RegisterPage";

// Dashboards
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import DoctorDashboard from "@/pages/dashboard/DoctorDashboard";
import NurseDashboard from "@/pages/dashboard/NurseDashboard";
import PatientDashboard from "@/pages/dashboard/PatientDashboard";

// Patient Pages
import PatientAppointments from "@/pages/dashboard/patient/PatientAppointments";
import PatientRecords from "@/pages/dashboard/patient/PatientRecords";
import PatientPrescriptions from "@/pages/dashboard/patient/PatientPrescriptions";
import PatientSettings from "@/pages/dashboard/patient/PatientSettings";

// Doctor Pages
import DoctorAppointments from "@/pages/dashboard/doctor/DoctorAppointments";
import DoctorPatients from "@/pages/dashboard/doctor/DoctorPatients";
import DoctorPrescriptions from "@/pages/dashboard/doctor/DoctorPrescriptions";
import DoctorSchedule from "@/pages/dashboard/doctor/DoctorSchedule";
import DoctorSettings from "@/pages/dashboard/doctor/DoctorSettings";

// Nurse Pages
import NursePatients from "@/pages/dashboard/nurse/NursePatients";
import NursePatientChart from "@/pages/dashboard/nurse/NursePatientChart";
import NurseVitals from "@/pages/dashboard/nurse/NurseVitals";
import NurseTasks from "@/pages/dashboard/nurse/NurseTasks";
import NurseSettings from "@/pages/dashboard/nurse/NurseSettings";

// Admin Pages
import { ScrollToTop } from "@/components/ScrollToTop";
import AppointmentList from "@/pages/dashboard/admin/AppointmentList";
import BillingPage from "@/pages/dashboard/admin/BillingPage";
import PharmacyPOS from "@/pages/dashboard/admin/PharmacyPOS";
import SampleCollection from "@/pages/dashboard/lis/SampleCollection";
import LabResults from "@/pages/dashboard/lis/LabResults";
import RadiologyWorklist from "@/pages/dashboard/ris/RadiologyWorklist";
import AdmissionDashboard from "@/pages/dashboard/ipd/AdmissionDashboard";
import NursingStation from "@/pages/dashboard/nursing/NursingStation";
import InventoryDashboard from "@/pages/dashboard/inventory/InventoryDashboard";
import HrDashboard from "@/pages/dashboard/hr/HrDashboard";
import AccountsDashboard from "@/pages/dashboard/accounts/AccountsDashboard";
import DoctorsManagement from "@/pages/dashboard/admin/DoctorsManagement";
import DepartmentsManagement from "@/pages/dashboard/admin/DepartmentsManagement";
import StaffManagement from "@/pages/dashboard/admin/StaffManagement";
import AdminReports from "@/pages/dashboard/admin/AdminReports";
import AdminSettings from "@/pages/dashboard/admin/AdminSettings";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<ProtectedHomepage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/departments/:slug" element={<DepartmentDetailPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/consent" element={<ConsentPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/patient/login" element={<PatientLogin />} />

          {/* Admin Dashboard */}
          <Route element={<DashboardLayout role="super_admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<DoctorsManagement />} />
            <Route path="/admin/appointments" element={<AppointmentList />} />
            <Route path="/admin/departments" element={<DepartmentsManagement />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/billing" element={<BillingPage />} />
            <Route path="/admin/pharmacy" element={<PharmacyPOS />} />
            <Route path="/admin/lis/samples" element={<SampleCollection />} />
            <Route path="/admin/lis/results" element={<LabResults />} />
            <Route path="/admin/ris/worklist" element={<RadiologyWorklist />} />
            <Route path="/admin/ipd/admission" element={<AdmissionDashboard />} />
            <Route path="/admin/inventory" element={<InventoryDashboard />} />
            <Route path="/admin/hr" element={<HrDashboard />} />
            <Route path="/admin/accounts" element={<AccountsDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* Doctor Dashboard */}
          <Route element={<DashboardLayout role="doctor" />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} />
            <Route path="/doctor/*" element={<DoctorDashboard />} />
          </Route>

          {/* Nurse Dashboard */}
          <Route element={<DashboardLayout role="nurse" />}>
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/patients" element={<NursePatients />} />
            <Route path="/nurse/patients/:id" element={<NursePatientChart />} />
            <Route path="/nurse/vitals" element={<NurseVitals />} />
            <Route path="/nurse/tasks" element={<NurseTasks />} />
            <Route path="/nurse/settings" element={<NurseSettings />} />
            <Route path="/nurse/station" element={<NursingStation />} />
            <Route path="/nurse/*" element={<NurseDashboard />} />
          </Route>

          {/* Patient Dashboard */}
          <Route element={<DashboardLayout role="patient" />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/records" element={<PatientRecords />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/settings" element={<PatientSettings />} />
            <Route path="/patient/*" element={<PatientDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ScrollToTop />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
