import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, UserPlus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { Employee } from "@/types";

export default function HrDashboard() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        setLoading(true);
        api.get('/hr/employees')
            .then(res => setEmployees(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const columns = [
        { key: "employee_code", header: "Code" },
        {
            key: "name",
            header: "Name",
            render: (row: Employee) => row.user?.name || '-'
        },
        { key: "designation", header: "Designation" },
        {
            key: "shift",
            header: "Shift",
            render: (row: Employee) => row.shift ? `${row.shift.name} (${row.shift.start_time}-${row.shift.end_time})` : 'Unassigned'
        },
        {
            key: "join_date",
            header: "Joining Date",
            render: (row: Employee) => new Date(row.join_date).toLocaleDateString()
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="HR Management" description="Employees, Shifts & Attendance">
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" /> Add Employee
                </Button>
            </PageHeader>

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={employees} />
                )}
            </div>
        </div>
    );
}
