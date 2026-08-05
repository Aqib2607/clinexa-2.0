import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Loader2, Activity, FileText, Heart, Thermometer, Wind } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Admission } from "@/types";

export default function NursingStation() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
    const [mode, setMode] = useState<'vitals' | 'notes' | null>(null);

    // Vitals Form
    const [vitals, setVitals] = useState({
        bp_systolic: '',
        bp_diastolic: '',
        pulse: '',
        temperature: '',
        spo2: '',
        respiratory_rate: ''
    });

    // Notes Form
    const [note, setNote] = useState("");

    useEffect(() => {
        loadWorklist();
    }, []);

    const loadWorklist = () => {
        setLoading(true);
        api.get('/nursing/worklist')
            .then(res => setAdmissions(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleSaveVitals = () => {
        if (!selectedAdmission) return;
        api.post(`/nursing/admissions/${selectedAdmission.id}/vitals`, vitals)
            .then(() => {
                toast.success("Vitals recorded");
                setMode(null);
                setVitals({ bp_systolic: '', bp_diastolic: '', pulse: '', temperature: '', spo2: '', respiratory_rate: '' });
                loadWorklist(); // Refresh to show latest?
            })
            .catch(err => toast.error("Failed to save vitals"));
    };

    const handleSaveNote = () => {
        if (!selectedAdmission || !note) return;
        api.post(`/nursing/admissions/${selectedAdmission.id}/notes`, { note })
            .then(() => {
                toast.success("Note added");
                setMode(null);
                setNote("");
            })
            .catch(err => toast.error("Failed to save note"));
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Nursing Station" description="Patient Monitoring & Vitals" />

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {admissions.map((adm) => (
                            <div key={adm.id} className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold">{adm.patient?.name}</h3>
                                    <span className="text-xs bg-muted px-2 py-1 rounded-full">{adm.bed?.bed_number}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Doc: {adm.doctor?.user?.name}</p>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedAdmission(adm); setMode('vitals'); }}>
                                        <Activity className="h-4 w-4 mr-2" /> Vitals
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedAdmission(adm); setMode('notes'); }}>
                                        <FileText className="h-4 w-4 mr-2" /> Note
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {admissions.length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">No active admissions</div>}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {mode && selectedAdmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">
                            {mode === 'vitals' ? 'Record Vitals' : 'Add Nursing Note'} - {selectedAdmission.patient?.name}
                        </h3>

                        {mode === 'vitals' ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium">BP Systolic</label>
                                        <Input type="number" value={vitals.bp_systolic} onChange={e => setVitals({ ...vitals, bp_systolic: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">BP Diastolic</label>
                                        <Input type="number" value={vitals.bp_diastolic} onChange={e => setVitals({ ...vitals, bp_diastolic: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium flex gap-1"><Heart className="h-3 w-3" /> Pulse</label>
                                        <Input type="number" value={vitals.pulse} onChange={e => setVitals({ ...vitals, pulse: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium flex gap-1"><Thermometer className="h-3 w-3" /> Temp (C)</label>
                                        <Input type="number" value={vitals.temperature} onChange={e => setVitals({ ...vitals, temperature: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium flex gap-1"><Wind className="h-3 w-3" /> SpO2 (%)</label>
                                        <Input type="number" value={vitals.spo2} onChange={e => setVitals({ ...vitals, spo2: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">Resp. Rate</label>
                                        <Input type="number" value={vitals.respiratory_rate} onChange={e => setVitals({ ...vitals, respiratory_rate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Enter nursing notes/observations..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="min-h-[150px]"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setMode(null)}>Cancel</Button>
                            <Button onClick={mode === 'vitals' ? handleSaveVitals : handleSaveNote}>Save</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
