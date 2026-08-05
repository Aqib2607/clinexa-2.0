import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Activity, 
    User, 
    Calendar, 
    Heart, 
    Thermometer, 
    Wind, 
    Droplets, 
    ArrowLeft,
    Loader2
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface VitalsHistory {
    id: string;
    bp: string;
    temperature: number;
    pulse: number;
    spo2: number;
    respiratory_rate: number;
    recorded_at: string;
    recorded_by_name: string;
}

interface PatientDetails {
    id: string;
    patient_id: number;
    name: string;
    uhid: string;
    age: number | null;
    gender: string;
    blood_group: string;
    ward: string;
    bed_number: string;
    condition: string;
    status: string;
    doctor: string;
    admission_date: string;
    vitals_history: VitalsHistory[];
}

export default function NursePatientChart() {
    const { id } = useParams<{ id: string }>();

    const { data: patient, isLoading } = useQuery<PatientDetails>({
        queryKey: ["nurse-patient-details", id],
        queryFn: async () => {
            const res = await api.get(`/nurse/patients/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-muted-foreground">Patient not found</p>
                <Button variant="outline" asChild>
                    <Link to="/nurse/patients">Back to Patients</Link>
                </Button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/nurse/patients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <PageHeader
                    title={patient.name}
                    description={`UHID: ${patient.uhid} • ${patient.age ? `${patient.age} years` : 'Age N/A'} • ${patient.gender}`}
                />
                <Button className="ml-auto" asChild>
                    <Link to={`/nurse/vitals?patientId=${id}`}>
                        <Activity className="mr-2 h-4 w-4" />
                        Record Vitals
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient Info Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Patient Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                patient.status === 'critical' ? 'bg-red-100 text-red-800' : 
                                patient.status === 'stable' ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {patient.status.toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Ward / Bed</p>
                                <p className="text-sm">{patient.ward} / {patient.bed_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                                <p className="text-sm">{patient.blood_group}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                            <p className="text-sm">{patient.condition}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Doctor In-Charge</p>
                            <p className="text-sm">{patient.doctor}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(patient.admission_date).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vitals History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Vitals History
                        </CardTitle>
                        <CardDescription>
                            Recent vital signs recorded for this patient
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {patient.vitals_history.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date/Time</TableHead>
                                            <TableHead>BP (mmHg)</TableHead>
                                            <TableHead>Pulse (bpm)</TableHead>
                                            <TableHead>Temp (°F)</TableHead>
                                            <TableHead>SpO2 (%)</TableHead>
                                            <TableHead>Recorded By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patient.vitals_history.map((vital) => (
                                            <TableRow key={vital.id}>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {formatDate(vital.recorded_at)}
                                                </TableCell>
                                                <TableCell className="font-medium">{vital.bp}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3 text-red-500" />
                                                        {vital.pulse}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Thermometer className="h-3 w-3 text-orange-500" />
                                                        {vital.temperature}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Wind className="h-3 w-3 text-blue-500" />
                                                        {vital.spo2}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {vital.recorded_by_name}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No records found
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
