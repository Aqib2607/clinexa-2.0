import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table"; // Assuming this exists
import { StatusBadge } from "@/components/ui/status-badge"; // Assuming this exists
import { PageHeader } from "@/components/ui/page-header"; // Assuming this exists
import api from "@/lib/api";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { Appointment } from "@/types";

export default function AppointmentList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = () => {
        setLoading(true);
        api.get('/appointments')
            .then(res => {
                // Backend returns { data: [...], ... } for pagination
                setAppointments(res.data.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const columns = [
        { key: "appointment_number", header: "ID" },
        {
            key: "patient",
            header: "Patient",
            render: (row: Appointment) => row.patient?.name || 'Guest'
        },
        {
            key: "doctor",
            header: "Doctor",
            render: (row: Appointment) => row.doctor?.user?.name || 'Unknown'
        },
        {
            key: "appointment_date",
            header: "Date & Time",
            render: (row: Appointment) => format(new Date(row.appointment_date), 'MMM dd, yyyy h:mm a')
        },
        {
            key: "status",
            header: "Status",
            render: (row: Appointment) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Appointments" description="Manage patient appointments" />

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={appointments} />
                )}
            </div>
        </div>
    );
}
