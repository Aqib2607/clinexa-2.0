import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Stethoscope, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Department", icon: Stethoscope },
  { id: 2, title: "Doctor", icon: User },
  { id: 3, title: "Schedule", icon: Calendar },
  { id: 4, title: "Details", icon: CheckCircle2 },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

import { Department, Doctor } from "@/types";

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctor');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    department_id: "" as string | number,
    department_name: "", // For UI display
    doctor_id: "" as string | number,
    doctor_name: "", // For UI display
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Fetch Departments on Load
  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error("Failed to load departments", err));
  }, []);

  // Handle preselected doctor
  useEffect(() => {
    if (preselectedDoctorId) {
      api.get(`/doctors/${preselectedDoctorId}`)
        .then(res => {
          const doctor = res.data;
          setFormData(prev => ({
            ...prev,
            doctor_id: doctor.id,
            doctor_name: doctor.user?.name || doctor.specialization,
            department_id: doctor.department_id,
            department_name: doctor.department?.name || ''
          }));
          setCurrentStep(3); // Skip to schedule step
        })
        .catch(err => console.error("Failed to load doctor", err));
    }
  }, [preselectedDoctorId]);

  // Fetch Doctors when Department Changes
  useEffect(() => {
    if (formData.department_id) {
      // Fetch doctors for this department
      // Using per_page=100 to get a reasonable list without pagination UI for now
      api.get(`/doctors?department_id=${formData.department_id}&per_page=100`)
        .then(res => setDoctors(res.data.data))
        .catch(err => console.error("Failed to load doctors", err));
    } else {
      setDoctors([]);
    }
  }, [formData.department_id]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine Date & Time
      // Assuming backend accepts 'appointment_date' as YYYY-MM-DD HH:mm:ss
      const appointmentDateTime = `${formData.date} ${formData.time}:00`;

      const payload = {
        patient_id: null, // Guest
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id,
        doctor_id: formData.doctor_id,
        appointment_date: appointmentDateTime,
        symptoms: formData.reason
      };

      const res = await api.post('/appointments', payload);
      console.log("Appointment Created:", res.data);
      setSubmitted(true);
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.error("Booking failed", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.department_id !== "";
      case 2: return formData.doctor_id !== "";
      case 3: return formData.date !== "" && formData.time !== "";
      case 4: return formData.name !== "" && formData.email !== "" && formData.phone !== "";
      default: return false;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-16 lg:py-24">
        <div className="container-narrow">
          <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-card text-center animate-scale-in">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground mb-4">
              Appointment Request Submitted!
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you for booking with Clinexa. We'll send you a confirmation email shortly with your appointment details.
            </p>
            <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left max-w-sm mx-auto">
              <h3 className="font-semibold mb-4">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Department:</span> {formData.department_name}</p>
                <p><span className="text-muted-foreground">Doctor:</span> {formData.doctor_name}</p>
                <p><span className="text-muted-foreground">Date:</span> {formData.date}</p>
                <p><span className="text-muted-foreground">Time:</span> {formData.time}</p>
              </div>
            </div>
            <Button asChild size="lg" className="btn-transition">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-clinexa-dark py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1600&q=80" 
            alt="Medical appointment" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container-wide relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <span className="text-primary font-medium">Schedule a Visit</span>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mt-2 mb-4">
              Book an Appointment
            </h1>
            <p className="text-clinexa-secondary/90">
              Schedule your appointment in a few simple steps. Our team will confirm your booking shortly.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Progress */}
      <section className="bg-card border-b border-border py-6">
        <div className="container-wide">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-xs mt-2 hidden sm:block",
                    currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-8 sm:w-16 lg:w-24 mx-2",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container-narrow">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 lg:p-10 shadow-card animate-fade-in">
            {/* Step 1: Department */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-2">Select Department</h2>
                  <p className="text-muted-foreground text-sm">Choose the medical department for your visit</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.length === 0 && <p>Loading departments...</p>}
                  {departments.map((dept: Department) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, department_id: dept.id, department_name: dept.name, doctor_id: "", doctor_name: "" })}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        formData.department_id === dept.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium">{dept.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Doctor */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-2">Select Doctor</h2>
                  <p className="text-muted-foreground text-sm">Choose your preferred doctor in {formData.department_name}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.length === 0 && <p className="text-muted-foreground">No doctors found for this department.</p>}
                  {doctors.map((doctor: Doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, doctor_id: doctor.id, doctor_name: doctor.user?.name || doctor.specialization })}
                      className={cn(
                        "p-6 rounded-xl border-2 text-left transition-all",
                        formData.doctor_id === doctor.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                        <span className="text-lg font-bold text-muted-foreground">
                          {(doctor.user?.name || 'D').split(' ').pop()?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium block">{doctor.user?.name || 'Unknown Doctor'}</span>
                      <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-2">Select Date & Time</h2>
                  <p className="text-muted-foreground text-sm">Choose your preferred appointment slot</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="focus-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                      <SelectTrigger className="bg-background">
                        <Clock className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-2">Your Details</h2>
                  <p className="text-muted-foreground text-sm">Please provide your contact information</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="focus-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="focus-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="focus-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Brief description of your symptoms or reason for appointment..."
                    rows={4}
                    className="focus-ring resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                className="btn-transition"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="btn-transition"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className="btn-transition"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Clock className="animate-spin h-4 w-4 mr-2" /> Processing...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm Appointment
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
