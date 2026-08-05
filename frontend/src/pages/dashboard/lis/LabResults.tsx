import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming exist
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, FileText, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"; // Assuming shadcn dialog exists or similar

import { LabResult, LabResultItem } from "@/types";

export default function LabResults() {
    const [results, setResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingResult, setEditingResult] = useState<LabResult | null>(null);
    const [resultItems, setResultItems] = useState<LabResultItem[]>([]);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = () => {
        setLoading(true);
        api.get('/lis/results?status=pending') // or 'received' depending on controller logic. Controller creates 'pending' LabResult on receive.
            .then(res => setResults(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleEnterResult = (result: LabResult) => {
        setEditingResult(result);
        // Initialize items if empty, or load existing
        if (result.items && result.items.length > 0) {
            setResultItems(result.items);
        } else {
            // Default loose components for now, ideally fetched from Test definition
            setResultItems([
                { component_name: "Result", value: "", unit: "", reference_range: "" }
            ]);
        }
    };

    const saveResult = () => {
        if (!editingResult) return;

        api.post(`/lis/results/${editingResult.id}`, {
            items: resultItems
        })
            .then(res => {
                toast.success("Result saved successfully");
                setEditingResult(null);
                loadResults();
            })
            .catch(err => toast.error("Failed to save result"));
    };

    const verifyResult = (id: string) => {
        api.post(`/lis/results/${id}/verify`)
            .then(res => {
                toast.success("Result verified");
                loadResults();
            })
            .catch(err => toast.error("Failed to verify"));
    };

    const columns = [
        {
            key: "patient",
            header: "Patient",
            render: (row: LabResult) => row.visit?.patient?.name || 'Unknown'
        },
        {
            key: "test",
            header: "Test",
            render: (row: LabResult) => row.test?.name || 'Unknown'
        },
        { key: "status", header: "Status" },
        {
            key: "actions",
            header: "Actions",
            render: (row: LabResult) => (
                <div className="flex gap-2">
                    {row.status === 'pending' || row.status === 'entered' ? (
                        <Button size="sm" variant="outline" onClick={() => handleEnterResult(row)}>
                            <FileText className="h-4 w-4 mr-2" /> {row.status === 'entered' ? 'Edit' : 'Enter'}
                        </Button>
                    ) : null}
                    {row.status === 'entered' && (
                        <Button size="sm" variant="default" onClick={() => verifyResult(row.id.toString())}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Verify
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Lab Results" description="Enter and Verify Test Results" />

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={results} />
                )}
            </div>

            {/* Result Entry Dialog/Modal - Simplified inline for now or needs Dialog component */}
            {editingResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Enter Results for {editingResult.test?.name}</h3>
                        <div className="space-y-4">
                            {resultItems.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-2 items-end border-b pb-4">
                                    <div>
                                        <label className="text-xs">Component</label>
                                        <Input value={item.component_name} onChange={e => {
                                            const newItems = [...resultItems];
                                            newItems[idx].component_name = e.target.value;
                                            setResultItems(newItems);
                                        }} />
                                    </div>
                                    <div>
                                        <label className="text-xs">Value</label>
                                        <Input value={item.value} onChange={e => {
                                            const newItems = [...resultItems];
                                            newItems[idx].value = e.target.value;
                                            setResultItems(newItems);
                                        }} />
                                    </div>
                                    <div>
                                        <label className="text-xs">Unit</label>
                                        <Input value={item.unit} onChange={e => {
                                            const newItems = [...resultItems];
                                            newItems[idx].unit = e.target.value;
                                            setResultItems(newItems);
                                        }} />
                                    </div>
                                    <div>
                                        <label className="text-xs">Ref Range</label>
                                        <Input value={item.reference_range} onChange={e => {
                                            const newItems = [...resultItems];
                                            newItems[idx].reference_range = e.target.value;
                                            setResultItems(newItems);
                                        }} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" onClick={() => setResultItems([...resultItems, { component_name: "", value: "", unit: "", reference_range: "" }])}>
                                + Add Component
                            </Button>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setEditingResult(null)}>Cancel</Button>
                            <Button onClick={saveResult}><Save className="h-4 w-4 mr-2" /> Save Results</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
