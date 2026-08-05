import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import api from "@/lib/api";
import { format } from "date-fns";
import { Loader2, TestTube, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { LabSample } from "@/types";

export default function SampleCollection() {
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSamples();
    }, []);

    const loadSamples = () => {
        setLoading(true);
        api.get('/lis/samples?status=pending')
            .then(res => setSamples(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleCollect = (id: number) => {
        api.post(`/lis/samples/${id}/collect`, {
            collected_at: new Date().toISOString()
        })
            .then(() => {
                toast.success("Sample collected successfully");
                loadSamples();
            })
            .catch(err => toast.error("Failed to collect sample"));
    };

    const columns = [
        { key: "barcode", header: "Barcode" },
        {
            key: "patient",
            header: "Patient",
            render: (row: LabSample) => row.visit?.patient?.name || 'Unknown'
        },
        {
            key: "test",
            header: "Test",
            render: (row: LabSample) => row.test?.name || 'Unknown'
        },
        {
            key: "specimen",
            header: "Specimen",
            render: (row: LabSample) => {
                const specimen = row.specimen;
                if (typeof specimen === 'object' && specimen !== null) {
                    return specimen.type as string;
                }
                return (specimen as string) || 'N/A';
            }
        },
        {
            key: "created_at",
            header: "Ordered At",
            render: (row: LabSample) => format(new Date(row.created_at), 'MMM dd, h:mm a')
        },
        {
            key: "actions",
            header: "Actions",
            render: (row: LabSample) => (
                <Button size="sm" onClick={() => handleCollect(row.id)}>
                    <TestTube className="h-4 w-4 mr-2" /> Collect
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Sample Collection" description="Pending Lab Samples Queue" />

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={samples} />
                )}
            </div>
        </div>
    );
}
