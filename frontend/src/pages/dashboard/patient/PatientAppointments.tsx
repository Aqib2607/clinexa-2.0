import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Loader2, CalendarX } from "lucide-react";
import { Link } from "react-router-dom";

interface Appointment {
    id: number;
    appointment_number: string | null;
    doctor_name: string;
    department: string;
    specialization: string;
    appointment_date: string;
    status: string;
    symptoms: string | null;
    can_cancel: boolean;
}

interface PaginatedResponse {
    data: Appointment[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function PatientAppointments() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: response, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ["patient-appointments", statusFilter],
        queryFn: async () => {
            const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
            const res = await api.get(`/patient/appointments${params}`);
            return res.data;
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (id: number) => {
            return api.post(`/patient/appointments/${id}/cancel`);
        },
        onSuccess: () => {
            toast({ title: "Cancelled", description: "Appointment cancelled successfully." });
            queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
        },
        onError: (err: unknown) => {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || "Failed to cancel appointment.";
            toast({ title: "Error", description: message, variant: "destructive" });
        },
    });

    const appointments = response?.data ?? [];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "confirmed":
                return "default" as const;
            case "pending":
                return "secondary" as const;
            case "cancelled":
                return "destructive" as const;
            case "completed":
                return "outline" as const;
            default:
                return "secondary" as const;
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
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
                    <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
                    <p className="text-muted-foreground">
                        Manage your upcoming and past appointments
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild>
                        <Link to="/appointments">Book Appointment</Link>
                    </Button>
                </div>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center py-16">
                    <CalendarX className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-medium text-muted-foreground">No appointments found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {statusFilter !== "all"
                            ? "Try changing the filter"
                            : "Book your first appointment to get started"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((appt) => (
                        <Card key={appt.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {appt.symptoms || "Consultation"}
                                </CardTitle>
                                <Badge variant={getStatusVariant(appt.status)}>
                                    {appt.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{appt.doctor_name}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <User className="h-3 w-3" /> {appt.department}
                                </p>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {formatDate(appt.appointment_date)}
                                    </div>
                                    {appt.appointment_number && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            #{appt.appointment_number}
                                        </div>
                                    )}
                                </div>
                                {appt.can_cancel && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full mt-4"
                                        onClick={() => cancelMutation.mutate(appt.id)}
                                        disabled={cancelMutation.isPending}
                                    >
                                        {cancelMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : null}
                                        Cancel Appointment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
