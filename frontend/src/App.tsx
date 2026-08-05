import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// ── Public Pages: eagerly loaded (above the fold, needed immediately) ──
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
import NotFound from "@/pages/NotFound";

// ── Auth Pages: lazy loaded ──
const LoginPage        = lazy(() => import("@/pages/auth/LoginPage"));
const PatientLogin     = lazy(() => import("@/pages/auth/PatientLogin"));
const RegisterPage     = lazy(() => import("@/pages/auth/RegisterPage"));

// ── Admin Dashboard Pages: lazy loaded ──
const AdminDashboard       = lazy(() => import("@/pages/dashboard/AdminDashboard"));
const DoctorsManagement    = lazy(() => import("@/pages/dashboard/admin/DoctorsManagement"));
const AppointmentList      = lazy(() => import("@/pages/dashboard/admin/AppointmentList"));
const DepartmentsManagement = lazy(() => import("@/pages/dashboard/admin/DepartmentsManagement"));
const StaffManagement      = lazy(() => import("@/pages/dashboard/admin/StaffManagement"));
const AdminReports         = lazy(() => import("@/pages/dashboard/admin/AdminReports"));
const AdminSettings        = lazy(() => import("@/pages/dashboard/admin/AdminSettings"));
const BillingPage          = lazy(() => import("@/pages/dashboard/admin/BillingPage"));
const PharmacyPOS          = lazy(() => import("@/pages/dashboard/admin/PharmacyPOS"));
const SampleCollection     = lazy(() => import("@/pages/dashboard/lis/SampleCollection"));
const LabResults           = lazy(() => import("@/pages/dashboard/lis/LabResults"));
const RadiologyWorklist    = lazy(() => import("@/pages/dashboard/ris/RadiologyWorklist"));
const AdmissionDashboard   = lazy(() => import("@/pages/dashboard/ipd/AdmissionDashboard"));
const NursingStation       = lazy(() => import("@/pages/dashboard/nursing/NursingStation"));
const InventoryDashboard   = lazy(() => import("@/pages/dashboard/inventory/InventoryDashboard"));
const HrDashboard          = lazy(() => import("@/pages/dashboard/hr/HrDashboard"));
const AccountsDashboard    = lazy(() => import("@/pages/dashboard/accounts/AccountsDashboard"));

// ── Doctor Dashboard Pages: lazy loaded ──
const DoctorDashboard      = lazy(() => import("@/pages/dashboard/DoctorDashboard"));
const DoctorAppointments   = lazy(() => import("@/pages/dashboard/doctor/DoctorAppointments"));
const DoctorPatients       = lazy(() => import("@/pages/dashboard/doctor/DoctorPatients"));
const DoctorPrescriptions  = lazy(() => import("@/pages/dashboard/doctor/DoctorPrescriptions"));
const DoctorSchedule       = lazy(() => import("@/pages/dashboard/doctor/DoctorSchedule"));
const DoctorSettings       = lazy(() => import("@/pages/dashboard/doctor/DoctorSettings"));

// ── Nurse Dashboard Pages: lazy loaded ──
const NurseDashboard       = lazy(() => import("@/pages/dashboard/NurseDashboard"));
const NursePatients        = lazy(() => import("@/pages/dashboard/nurse/NursePatients"));
const NursePatientChart    = lazy(() => import("@/pages/dashboard/nurse/NursePatientChart"));
const NurseVitals          = lazy(() => import("@/pages/dashboard/nurse/NurseVitals"));
const NurseTasks           = lazy(() => import("@/pages/dashboard/nurse/NurseTasks"));
const NurseSettings        = lazy(() => import("@/pages/dashboard/nurse/NurseSettings"));

// ── Patient Dashboard Pages: lazy loaded ──
const PatientDashboard     = lazy(() => import("@/pages/dashboard/PatientDashboard"));
const PatientAppointments  = lazy(() => import("@/pages/dashboard/patient/PatientAppointments"));
const PatientRecords       = lazy(() => import("@/pages/dashboard/patient/PatientRecords"));
const PatientPrescriptions = lazy(() => import("@/pages/dashboard/patient/PatientPrescriptions"));
const PatientSettings      = lazy(() => import("@/pages/dashboard/patient/PatientSettings"));

// Shared: always needed
import { ScrollToTop } from "@/components/ScrollToTop";

// Loading fallback shown while lazy chunks are being fetched
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
