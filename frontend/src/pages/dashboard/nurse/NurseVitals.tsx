import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Activity, Heart, Thermometer, Wind, Droplets, Save, Loader2 } from "lucide-react";

interface VitalRecord {
    id: string;
    admission_id: string;
    patient_name: string;
    ward: string;
    bed_number: string;
    blood_pressure: string | null;
    heart_rate: number | null;
    temperature: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: number | null;
    recorded_at: string;
    time_ago: string | null;
}

interface AdmittedPatient {
    id: string;
    name: string;
    bed_number: string;
    ward: string;
}

export default function NurseVitals() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [selectedPatient, setSelectedPatient] = useState(searchParams.get("patientId") || "");
    const [formData, setFormData] = useState({
        systolic: "",
        diastolic: "",
        heartRate: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
    });

    // Fetch admitted patients for the dropdown
    const { data: patients = [] } = useQuery<AdmittedPatient[]>({
        queryKey: ["nurse-patients-list"],
        queryFn: async () => {
            const res = await api.get("/nurse/patients");
            return res.data.map((p: Record<string, unknown>) => ({
                id: p.id,
                name: p.name,
                bed_number: p.bed_number,
                ward: p.ward,
            }));
        },
    });

    // Fetch recent vitals
    const { data: vitalsResponse, isLoading } = useQuery<{ data: VitalRecord[] }>({
        queryKey: ["nurse-vitals"],
        queryFn: async () => {
            const res = await api.get("/nurse/vitals");
            return res.data;
        },
    });

    const recentVitals = vitalsResponse?.data ?? [];

    // Save vitals mutation
    const saveVitalsMutation = useMutation({
        mutationFn: async (admissionId: string) => {
            return api.post(`/nurse/vitals/${admissionId}`, {
                bp_systolic: formData.systolic ? Number(formData.systolic) : null,
                bp_diastolic: formData.diastolic ? Number(formData.diastolic) : null,
                pulse: formData.heartRate ? Number(formData.heartRate) : null,
                temperature: formData.temperature ? Number(formData.temperature) : null,
                respiratory_rate: formData.respiratoryRate ? Number(formData.respiratoryRate) : null,
                spo2: formData.oxygenSaturation ? Number(formData.oxygenSaturation) : null,
            });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Vital signs saved successfully." });
            queryClient.invalidateQueries({ queryKey: ["nurse-vitals"] });
            queryClient.invalidateQueries({ queryKey: ["nurse-patients"] });
            setSelectedPatient("");
            setFormData({
                systolic: "",
                diastolic: "",
                heartRate: "",
                temperature: "",
                respiratoryRate: "",
                oxygenSaturation: "",
            });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save vital signs.", variant: "destructive" });
        },
    });

    const handleSave = () => {
        if (!selectedPatient) {
            toast({ title: "Error", description: "Please select a patient first.", variant: "destructive" });
            return;
        }
        saveVitalsMutation.mutate(selectedPatient);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Vital Signs"
                description="Record and monitor patient vital signs"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Record New Vitals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Record Vital Signs</CardTitle>
                        <CardDescription>
                            Enter patient vital signs measurements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="patient">Select Patient</Label>
                            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                <SelectTrigger id="patient">
                                    <SelectValue placeholder="Choose a patient..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.length === 0 ? (
                                        <SelectItem value="_none" disabled>
                                            No admitted patients
                                        </SelectItem>
                                    ) : (
                                        patients.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} - {p.bed_number}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="systolic">Blood Pressure (Systolic)</Label>
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="systolic"
                                        type="number"
                                        placeholder="120"
                                        value={formData.systolic}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, systolic: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diastolic">Blood Pressure (Diastolic)</Label>
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="diastolic"
                                        type="number"
                                        placeholder="80"
                                        value={formData.diastolic}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, diastolic: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="heartRate"
                                    type="number"
                                    placeholder="72"
                                    value={formData.heartRate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, heartRate: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature (°F)</Label>
                            <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="temperature"
                                    type="number"
                                    step="0.1"
                                    placeholder="98.6"
                                    value={formData.temperature}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, temperature: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
                            <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="respiratoryRate"
                                    type="number"
                                    placeholder="16"
                                    value={formData.respiratoryRate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            respiratoryRate: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                            <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="oxygenSaturation"
                                    type="number"
                                    placeholder="98"
                                    value={formData.oxygenSaturation}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            oxygenSaturation: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleSave}
                            disabled={saveVitalsMutation.isPending || !selectedPatient}
                        >
                            {saveVitalsMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Vital Signs
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Vitals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Recordings</CardTitle>
                        <CardDescription>Latest vital signs recorded</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : recentVitals.length === 0 ? (
                            <div className="text-center py-8">
                                <Activity className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-30" />
                                <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
                            </div>
                        ) : (
                            recentVitals.map((record) => (
                                <div
                                    key={record.id}
                                    className="p-4 rounded-lg border bg-muted/50 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{record.patient_name}</h4>
                                        <span className="text-xs text-muted-foreground">
                                            {record.time_ago ?? record.recorded_at}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">BP</p>
                                                <p className="font-medium">
                                                    {record.blood_pressure ?? "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">HR</p>
                                                <p className="font-medium">
                                                    {record.heart_rate ? `${record.heart_rate} bpm` : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-4 w-4 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Temp</p>
                                                <p className="font-medium">
                                                    {record.temperature ? `${record.temperature}°F` : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Wind className="h-4 w-4 text-cyan-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">RR</p>
                                                <p className="font-medium">
                                                    {record.respiratory_rate
                                                        ? `${record.respiratory_rate}/min`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Droplets className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">SpO2</p>
                                                <p className="font-medium">
                                                    {record.oxygen_saturation
                                                        ? `${record.oxygen_saturation}%`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
