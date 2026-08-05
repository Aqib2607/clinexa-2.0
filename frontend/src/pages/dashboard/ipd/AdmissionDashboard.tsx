import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Loader2, Bed as BedIcon, UserPlus, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

import { Bed, Admission } from "@/types";

export default function AdmissionDashboard() {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState(true);
    const [admittingBed, setAdmittingBed] = useState<Bed | null>(null);
    const [dischargingAdmission, setDischargingAdmission] = useState<Admission | null>(null);

    // Admission Form State
    const [patientId, setPatientId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [deposit, setDeposit] = useState("");

    useEffect(() => {
        loadBeds();
    }, []);

    const loadBeds = () => {
        setLoading(true);
        api.get('/ipd/beds')
            .then(res => setBeds(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleAdmit = () => {
        if (!admittingBed || !patientId || !doctorId) return;

        api.post('/ipd/admissions', {
            bed_id: admittingBed.id,
            patient_id: patientId, // Simplified: ID input. Ideally search.
            doctor_id: doctorId,   // Simplified: ID input. Ideally select.
            initial_deposit: deposit
        })
            .then(() => {
                toast.success("Patient admitted successfully");
                setAdmittingBed(null);
                loadBeds();
            })
            .catch(err => toast.error("Admission failed: " + (err.response?.data?.message || "")));
    };

    const handleDischarge = () => {
        if (!dischargingAdmission) return;

        api.post(`/ipd/admissions/${dischargingAdmission.id}/discharge`, {
            type: 'regular',
            summary: 'Discharged via Dashboard'
        })
            .then(() => {
                toast.success("Patient discharged");
                setDischargingAdmission(null);
                loadBeds();
            })
            .catch(err => toast.error("Discharge failed: " + (err.response?.data?.message || "")));
    };

    return (
        <div className="space-y-6">
            <PageHeader title="IPD Admission" description="Bed Management & Admissions" />

            <div className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-semibold mb-4">Bed Status</h3>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {beds.map(bed => (
                            <div
                                key={bed.id}
                                className={`p-4 rounded-lg border text-center cursor-pointer transition-all ${bed.status === 'available'
                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                                    }`}
                                onClick={() => {
                                    if (bed.status === 'available') {
                                        setAdmittingBed(bed);
                                    } else {
                                        // If occupied, maybe show details or offer discharge
                                        if (bed.current_admission) {
                                            setDischargingAdmission(bed.current_admission);
                                        }
                                    }
                                }}
                            >
                                <BedIcon className={`h-8 w-8 mx-auto mb-2 ${bed.status === 'available' ? 'text-green-600' : 'text-red-600'}`} />
                                <div className="font-bold text-lg">{bed.bed_number}</div>
                                <div className="text-xs text-muted-foreground">{bed.ward?.name}</div>
                                {bed.current_admission && (
                                    <div className="mt-2 text-xs font-medium text-red-800 truncate">
                                        {bed.current_admission.patient?.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Admission Dialog */}
            {admittingBed && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Admit to Bed {admittingBed.bed_number}</h3>
                        <div className="space-y-4">
                            <Input placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
                            <Input placeholder="Doctor ID" value={doctorId} onChange={e => setDoctorId(e.target.value)} />
                            <Input placeholder="Initial Deposit" type="number" value={deposit} onChange={e => setDeposit(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setAdmittingBed(null)}>Cancel</Button>
                            <Button onClick={handleAdmit}>Admit Patient</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discharge Dialog */}
            {dischargingAdmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Discharge {dischargingAdmission.patient?.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Are you sure you want to discharge this patient? Ensure all dues are cleared.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setDischargingAdmission(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDischarge}>Confirm Discharge</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
