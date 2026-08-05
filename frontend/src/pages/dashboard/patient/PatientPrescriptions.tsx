import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Calendar, User, Loader2 } from "lucide-react";

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
}

interface Prescription {
    id: number;
    doctor_name: string;
    diagnosis: string | null;
    medications: Medication[] | null;
    notes: string | null;
    follow_up_date: string | null;
    created_at: string;
}

interface PaginatedResponse {
    data: Prescription[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function PatientPrescriptions() {
    const { data: response, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ["patient-prescriptions"],
        queryFn: async () => {
            const res = await api.get("/patient/prescriptions");
            return res.data;
        },
    });

    const prescriptions = response?.data ?? [];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Prescriptions</h2>
                    <p className="text-muted-foreground">
                        Manage your current and past prescriptions
                    </p>
                </div>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center py-16">
                    <Pill className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-medium text-muted-foreground">No prescriptions found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Your prescriptions from doctors will appear here
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {prescriptions.map((rx) => {
                        const meds = Array.isArray(rx.medications) ? rx.medications : [];
                        return (
                            <Card key={rx.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {rx.diagnosis || "Prescription"}
                                    </CardTitle>
                                    <Badge>
                                        {meds.length} medication{meds.length !== 1 ? "s" : ""}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    {meds.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {meds.map((med, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Pill className="h-4 w-4 mt-0.5 text-primary" />
                                                    <div>
                                                        <span className="font-medium">
                                                            {med.name}
                                                        </span>
                                                        {med.dosage && (
                                                            <span className="text-muted-foreground">
                                                                {" "}
                                                                — {med.dosage}
                                                            </span>
                                                        )}
                                                        {med.frequency && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {med.frequency}
                                                                {med.duration
                                                                    ? ` for ${med.duration}`
                                                                    : ""}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {rx.notes && (
                                        <p className="text-sm text-muted-foreground mb-3 italic">
                                            {rx.notes}
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Prescribed: {formatDate(rx.created_at)}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <User className="mr-2 h-4 w-4" />
                                            {rx.doctor_name}
                                        </div>
                                        {rx.follow_up_date && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Follow-up: {formatDate(rx.follow_up_date)}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


