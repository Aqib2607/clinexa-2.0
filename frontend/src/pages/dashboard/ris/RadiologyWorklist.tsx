import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { RadiologyStudy } from "@/types";

export default function RadiologyWorklist() {
    const [studies, setStudies] = useState<RadiologyStudy[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportingStudy, setReportingStudy] = useState<RadiologyStudy | null>(null);
    const [reportContent, setReportContent] = useState("");

    useEffect(() => {
        loadStudies();
    }, []);

    const loadStudies = () => {
        setLoading(true);
        api.get('/ris/studies?status=ordered') // or pending
            .then(res => setStudies(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleReport = (study: RadiologyStudy) => {
        setReportingStudy(study);
        setReportContent("");
    };

    const submitReport = () => {
        if (!reportingStudy) return;

        // RIS Controller storeResult logic might require more fields or file upload
        // Assuming simple text report or file link for now based on previous discussions (Text Report)
        api.post(`/ris/studies/${reportingStudy.id}/result`, {
            report_content: reportContent,
            parameters: {} // Placeholder if needed
        })
            .then(res => {
                toast.success("Report submitted");
                setReportingStudy(null);
                loadStudies();
            })
            .catch(err => toast.error("Failed to submit report"));
    };

    const columns = [
        {
            key: "patient",
            header: "Patient",
            render: (row: RadiologyStudy) => row.visit?.patient?.name || 'Unknown'
        },
        { key: "study_name", header: "Study Name" },
        { key: "status", header: "Status" },
        {
            key: "created_at",
            header: "Requested",
            render: (row: RadiologyStudy) => new Date(row.created_at).toLocaleDateString()
        },
        {
            key: "actions",
            header: "Actions",
            render: (row: RadiologyStudy) => (
                <Button size="sm" onClick={() => handleReport(row)}>
                    <FileText className="h-4 w-4 mr-2" /> Report
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Radiology Worklist" description="X-Ray, CT, MRI Requests" />

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={studies} />
                )}
            </div>

            {/* Simple Report Modal */}
            {reportingStudy && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">Report for {reportingStudy.study_name}</h3>
                        <div className="space-y-4">
                            <textarea
                                className="w-full min-h-[150px] p-2 border rounded-md bg-transparent"
                                placeholder="Enter findings and impression..."
                                value={reportContent}
                                onChange={e => setReportContent(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setReportingStudy(null)}>Cancel</Button>
                            <Button onClick={submitReport}>Submit Report</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
