import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, Search, Calendar, Activity, Phone, Mail, Loader2, FileText, Clock, Pill, CheckCircle, AlertCircle } from "lucide-react";
import { useDoctorPatients } from "@/hooks/usePatientNotes";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { usePrescriptions, Prescription } from "@/hooks/usePrescriptions";
import { usePatientNotes } from "@/hooks/usePatientNotes";
import { Badge } from "@/components/ui/badge";

interface PatientData {
    id: string;
    name: string;
    email: string;
    patient?: {
        id: string;
        user_id: string;
        phone: string;
        gender: string;
        dob: string;
        address: string;
        blood_group: string;
    };
}

export default function DoctorPatients() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Fetch ALL patients from API (no search filter for stats)
    const { data: patientsData, isLoading } = useDoctorPatients();

    const allPatients = (patientsData?.data || []) as PatientData[];

    // Filter patients client-side based on search
    const filteredPatients = searchQuery
        ? allPatients.filter(patient =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allPatients;

    const activePatients = allPatients.length; // Total count always from all patients

    const handleViewHistory = (patient: PatientData) => {
        setSelectedPatient(patient);
        setIsHistoryOpen(true);
    };

    // Fetch patient-specific data when modal is open and patient is selected
    const { data: patientAppointments, isLoading: appointmentsLoading } = useAppointments(
        selectedPatient ? { patient_id: selectedPatient.id } : undefined
    );
    
    const { data: patientPrescriptions, isLoading: prescriptionsLoading } = usePrescriptions(
        selectedPatient?.id
    );
    
    const { data: patientNotes, isLoading: notesLoading } = usePatientNotes(
        selectedPatient?.id || ''
    );

    const appointments = (patientAppointments?.data || []) as Appointment[];
    const prescriptions = (patientPrescriptions?.data || []) as Prescription[];
    const notes = patientNotes?.data || [];

    const closeHistoryModal = () => {
        setIsHistoryOpen(false);
        setSelectedPatient(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 animate-fade-in">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="My Patients"
                description="Manage and view your patient list"
            >
                {/* <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add Patient
                </Button> */}
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Patients"
                    value={allPatients.length}
                    icon={Users}
                />
                <StatCard
                    title="Active Cases"
                    value={activePatients}
                    icon={Activity}
                    description="Currently under treatment"
                />
                <StatCard
                    title="This Month"
                    value={allPatients.filter(p => {
                        // improved check for new patients if created_at exists, assuming simplified for now
                        return false;
                    }).length}
                    icon={Calendar}
                    description="New patients"
                />
            </div>

            {/* Search */}
            <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="patient-search"
                        name="search"
                        placeholder="Search patients by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Patient Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No patients found
                    </div>
                ) : (
                    filteredPatients.map((patient) => {
                        const age = patient.patient?.dob
                            ? new Date().getFullYear() - new Date(patient.patient.dob).getFullYear()
                            : 'N/A';

                        return (
                            <Card key={patient.id} className="hover:shadow-lg transition-shadow bg-card text-card-foreground">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{patient.name}</CardTitle>
                                            <CardDescription>
                                                {age} years • {patient.patient?.gender || 'Unknown'}
                                            </CardDescription>
                                        </div>
                                        <span
                                            className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600"
                                        >
                                            Active
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{patient.patient?.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">{patient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Activity className="h-4 w-4" />
                                            <span>
                                                Blood Group: {patient.patient?.blood_group || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-border">
                                        <Button 
                                            variant="outline" 
                                            className="w-full btn-transition" 
                                            size="sm"
                                            onClick={() => handleViewHistory(patient)}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            View Medical History
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Medical History Modal */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Medical History - {selectedPatient?.name}</DialogTitle>
                        <DialogDescription>
                            Complete medical records and treatment history
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPatient && (
                        <div className="space-y-6 py-4">
                            {/* Patient Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Patient Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Name:</span> {selectedPatient.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {selectedPatient.email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Phone:</span> {selectedPatient.patient?.phone || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Gender:</span> {selectedPatient.patient?.gender || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Blood Group:</span> {selectedPatient.patient?.blood_group || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Date of Birth:</span> {
                                            selectedPatient.patient?.dob 
                                                ? new Date(selectedPatient.patient.dob).toLocaleDateString()
                                                : 'N/A'
                                        }
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Appointments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Recent Appointments ({appointments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {appointmentsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : appointments.length > 0 ? (
                                        <div className="space-y-3">
                                            {appointments.slice(0, 5).map((appointment) => (
                                                <div key={appointment.id} className="border rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium text-sm">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                                                            <p className="text-sm text-muted-foreground">{appointment.appointment_time}</p>
                                                        </div>
                                                        <Badge variant={appointment.status === 'completed' ? 'default' : 
                                                               appointment.status === 'confirmed' ? 'secondary' : 'outline'}>
                                                            {appointment.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm">{appointment.reason}</p>
                                                    {appointment.notes && (
                                                        <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                            {appointments.length > 5 && (
                                                <p className="text-sm text-muted-foreground text-center">+{appointments.length - 5} more appointments</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-medium">No appointments found</p>
                                            <p className="text-sm">Patient appointment history will appear here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Prescriptions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Pill className="h-5 w-5" />
                                        Recent Prescriptions ({prescriptions.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {prescriptionsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : prescriptions.length > 0 ? (
                                        <div className="space-y-3">
                                            {prescriptions.slice(0, 3).map((prescription) => {
                                                const medications = typeof prescription.medications === 'string' 
                                                    ? JSON.parse(prescription.medications) 
                                                    : prescription.medications;
                                                
                                                return (
                                                    <div key={prescription.id} className="border rounded-lg p-3">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-sm">{prescription.diagnosis}</p>
                                                                <p className="text-sm text-muted-foreground">{new Date(prescription.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {medications && Array.isArray(medications) && medications.slice(0, 3).map((med: any, idx: number) => (
                                                                <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                                    <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency}, {med.duration}
                                                                </div>
                                                            ))}
                                                            {medications && Array.isArray(medications) && medications.length > 3 && (
                                                                <p className="text-xs text-muted-foreground">+{medications.length - 3} more medications</p>
                                                            )}
                                                        </div>
                                                        {prescription.notes && (
                                                            <p className="text-xs text-muted-foreground mt-2">{prescription.notes}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {prescriptions.length > 3 && (
                                                <p className="text-sm text-muted-foreground text-center">+{prescriptions.length - 3} more prescriptions</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-medium">No prescriptions found</p>
                                            <p className="text-sm">Patient prescription history will appear here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Medical Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Medical Notes ({notes.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {notesLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : notes.length > 0 ? (
                                        <div className="space-y-3">
                                            {notes.slice(0, 5).map((note: any) => (
                                                <div key={note.id} className="border rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium text-sm">Visit: {new Date(note.visit_date).toLocaleDateString()}</p>
                                                            <p className="text-sm text-muted-foreground">Created: {new Date(note.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    {note.chief_complaint && (
                                                        <div className="mb-2">
                                                            <p className="text-xs font-medium text-muted-foreground">Chief Complaint:</p>
                                                            <p className="text-sm">{note.chief_complaint}</p>
                                                        </div>
                                                    )}
                                                    {note.diagnosis && (
                                                        <div className="mb-2">
                                                            <p className="text-xs font-medium text-muted-foreground">Diagnosis:</p>
                                                            <p className="text-sm">{note.diagnosis}</p>
                                                        </div>
                                                    )}
                                                    {note.treatment_plan && (
                                                        <div className="mb-2">
                                                            <p className="text-xs font-medium text-muted-foreground">Treatment Plan:</p>
                                                            <p className="text-sm">{note.treatment_plan}</p>
                                                        </div>
                                                    )}
                                                    {note.notes && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                                                            <p className="text-sm">{note.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {notes.length > 5 && (
                                                <p className="text-sm text-muted-foreground text-center">+{notes.length - 5} more notes</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-medium">No medical notes available</p>
                                            <p className="text-sm">Patient notes and observations will appear here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <Button variant="outline" onClick={closeHistoryModal}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


