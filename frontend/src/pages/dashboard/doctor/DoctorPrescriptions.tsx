import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Search, Plus, FileText, Loader2, Printer } from "lucide-react";
import { usePrescriptions, Prescription, Medication, useCreatePrescription } from "@/hooks/usePrescriptions";
import { useDoctorPatients } from "@/hooks/usePatientNotes";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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


export default function DoctorPrescriptions() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const { toast } = useToast();

    // Form state
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [medicationsText, setMedicationsText] = useState(""); // Simplified for now, or use a dynamic form
    const [notes, setNotes] = useState("");

    const { data: prescriptionsData, isLoading } = usePrescriptions();
    const { data: patientsData } = useDoctorPatients();
    const createPrescription = useCreatePrescription();

    const prescriptions = (prescriptionsData?.data || []) as Prescription[];
    const patients = (patientsData?.data || []) as PatientData[];

    const handleCreatePrescription = async () => {
        if (!selectedPatientId || !diagnosis || !medicationsText) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Parse medications from text (simple implementation)
        // Expected format: Name - Dosage - Frequency - Duration (one per line)
        const medications: Medication[] = medicationsText.split('\n').filter(line => line.trim()).map(line => {
            const parts = line.split('-').map(p => p.trim());
            return {
                name: parts[0] || "",
                dosage: parts[1] || "",
                frequency: parts[2] || "",
                duration: parts[3] || ""
            };
        });

        // Validate medications format
        const hasInvalidMedication = medications.some(med => 
            !med.name || !med.dosage || !med.frequency || !med.duration
        );
        
        if (hasInvalidMedication) {
            toast({
                title: "Invalid Medication Format",
                description: "Please use the format: Name - Dosage - Frequency - Duration",
                variant: "destructive",
            });
            return;
        }

        try {
            await createPrescription.mutateAsync({
                patient_id: selectedPatientId,
                diagnosis,
                medications,
                notes
            });

            toast({
                title: "Success",
                description: "Prescription created successfully",
            });
            setIsDialogOpen(false);
            // Reset form
            setSelectedPatientId("");
            setDiagnosis("");
            setMedicationsText("");
            setNotes("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create prescription",
                variant: "destructive",
            });
        }
    };

    const handleViewPrescription = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setIsViewOpen(true);
    };

    const handlePrintPrescription = (prescription: Prescription) => {
        const meds: Medication[] = typeof prescription.medications === 'string'
            ? JSON.parse(prescription.medications || '[]')
            : (prescription.medications || []);

        const printContent = `
            <html>
            <head>
                <title>Prescription - ${prescription.patient?.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .section { margin: 20px 0; }
                    .medications { list-style: none; padding: 0; }
                    .medications li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Medical Prescription</h1>
                    <p><strong>Date:</strong> ${new Date(prescription.created_at).toLocaleDateString()}</p>
                </div>
                <div class="section">
                    <p><strong>Patient Name:</strong> ${prescription.patient?.name || 'Unknown'}</p>
                    <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
                </div>
                <div class="section">
                    <h3>Medications:</h3>
                    <ul class="medications">
                        ${meds.map(med => `
                            <li>
                                <strong>${med.name}</strong> - ${med.dosage}<br/>
                                ${med.frequency} for ${med.duration}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ${prescription.notes ? `<div class="section"><p><strong>Notes:</strong> ${prescription.notes}</p></div>` : ''}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const filteredPrescriptions = prescriptions.filter((rx) =>
        (rx.patient?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                title="Prescriptions"
                description="Manage patient prescriptions"
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Prescription
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Prescription</DialogTitle>
                            <DialogDescription>
                                Fill in the prescription details for your patient
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="patient">Patient Name</Label>
                                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                    <SelectTrigger id="patient">
                                        <SelectValue placeholder="Select patient..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient: PatientData) => (
                                            <SelectItem key={patient.id} value={patient.id}>
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Input
                                    id="diagnosis"
                                    placeholder="Enter diagnosis..."
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="medications">Medications</Label>
                                <div className="text-xs text-muted-foreground mb-1">
                                    Format: Name - Dosage - Frequency - Duration (one per line)
                                </div>
                                <Textarea
                                    id="medications"
                                    placeholder="E.g. Amoxicillin - 500mg - Twice daily - 7 days"
                                    rows={4}
                                    value={medicationsText}
                                    onChange={(e) => setMedicationsText(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional instructions or notes..."
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreatePrescription} disabled={createPrescription.isPending}>
                                    {createPrescription.isPending ? "Creating..." : "Create Prescription"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Search */}
            <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="prescription-search"
                        name="search"
                        placeholder="Search by patient name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Prescriptions Table */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Diagnosis</TableHead>
                            <TableHead>Medications</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPrescriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No prescriptions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPrescriptions.map((prescription) => {
                                // Parse medications if it's a string (though it should be casted in model preferably)
                                const meds: Medication[] = typeof prescription.medications === 'string'
                                    ? JSON.parse(prescription.medications || '[]')
                                    : (prescription.medications || []);

                                return (
                                    <TableRow key={prescription.id}>
                                        <TableCell className="font-medium">
                                            {prescription.patient?.name || "Unknown"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(prescription.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>{prescription.diagnosis}</TableCell>
                                        <TableCell className="max-w-md">
                                            <ul className="text-sm space-y-1">
                                                {meds.map((med, idx) => (
                                                    <li key={idx} className="text-muted-foreground text-xs">
                                                        • {med.name} ({med.dosage})
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewPrescription(prescription)}>
                                                <FileText className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handlePrintPrescription(prescription)}>
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Prescription Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                            View complete prescription information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPrescription && (() => {
                        const meds: Medication[] = typeof selectedPrescription.medications === 'string'
                            ? JSON.parse(selectedPrescription.medications || '[]')
                            : (selectedPrescription.medications || []);
                        
                        return (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Patient</label>
                                        <p className="text-base font-medium">{selectedPrescription.patient?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                                        <p className="text-base">{new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                                    <p className="text-base mt-1">{selectedPrescription.diagnosis}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Medications</label>
                                    <div className="mt-2 space-y-3">
                                        {meds.map((med, idx) => (
                                            <div key={idx} className="p-3 bg-muted rounded-lg">
                                                <p className="font-medium">{med.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Dosage:</strong> {med.dosage} | <strong>Frequency:</strong> {med.frequency} | <strong>Duration:</strong> {med.duration}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {selectedPrescription.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                        <p className="text-base mt-1 text-muted-foreground">{selectedPrescription.notes}</p>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                                        Close
                                    </Button>
                                    <Button onClick={() => handlePrintPrescription(selectedPrescription)}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}


