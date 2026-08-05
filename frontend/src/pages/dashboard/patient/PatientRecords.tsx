import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Loader2, FolderOpen, X } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface MedicalRecord {
    id: number;
    date: string;
    name: string;
    type: string;
    doctor: string;
    status: string;
    resource_type: string;
}

export default function PatientRecords() {
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [recordData, setRecordData] = useState<Record<string, unknown> | null>(null);

    const { data: records = [], isLoading } = useQuery<MedicalRecord[]>({
        queryKey: ["patient-records"],
        queryFn: async () => {
            const res = await api.get("/patient/records");
            return res.data;
        },
    });

    const handleView = async (record: MedicalRecord) => {
        try {
            const res = await api.get(
                `/patient/download/${record.resource_type}-${record.id}`
            );
            setRecordData(res.data);
            setSelectedRecord(record);
        } catch {
            alert('Unable to view this record at the moment.');
        }
    };

    const handleDownload = async (record: MedicalRecord) => {
        try {
            const res = await api.get(
                `/patient/download/${record.resource_type}-${record.id}`
            );
            if (res.data) {
                // Create a blob and download
                const dataStr = JSON.stringify(res.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${record.name.replace(/\s+/g, '_')}_${record.date}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            alert('Unable to download this record at the moment.');
        }
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
                    <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
                    <p className="text-muted-foreground">
                        View and download your medical history
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                            <p className="font-medium text-muted-foreground">
                                No medical records found
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your finalized lab and radiology results will appear here
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Document Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={`${record.resource_type}-${record.id}`}>
                                        <TableCell>
                                            {new Date(record.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {record.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{record.type}</Badge>
                                        </TableCell>
                                        <TableCell>{record.doctor}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    title="View"
                                                    onClick={() => handleView(record)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Download"
                                                    onClick={() => handleDownload(record)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedRecord?.name}</DialogTitle>
                        <DialogDescription>
                            View detailed information about this medical record
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Date:</span> {selectedRecord?.date}
                            </div>
                            <div>
                                <span className="font-semibold">Type:</span> {selectedRecord?.type}
                            </div>
                            <div>
                                <span className="font-semibold">Doctor:</span> {selectedRecord?.doctor}
                            </div>
                            <div>
                                <span className="font-semibold">Status:</span> {selectedRecord?.status}
                            </div>
                        </div>
                        {recordData && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Details:</h4>
                                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                                    {JSON.stringify(recordData, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
