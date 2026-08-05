import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ReportsData {
    demographics: {
        total: number;
        gender: Record<string, number>;
    };
    financials: {
        revenue: number;
        outstanding: number;
    };
    appointments: Record<string, number>;
    inventory: {
        total_value: number;
        items_count: number;
    };
}

export default function AdminReports() {
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("this_month");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get(`/admin/reports?period=${period}`);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [period]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
    };

    const handleDetailExport = (type: string) => {
        const link = document.createElement("a");
        link.href = `${api.defaults.baseURL}/admin/reports/export/${type}?period=${period}`;
        link.setAttribute("download", `report_${type}_${period}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const reportTypes = [
        {
            id: 'demographics',
            title: "Patient Demographics",
            description: `Total Patients: ${data?.demographics.total}`,
            icon: FileText,
            content: (
                <div className="space-y-2">
                    {Object.entries(data?.demographics.gender || {}).map(([gender, count]) => (
                        <div key={gender} className="flex justify-between text-sm">
                            <span className="capitalize">{gender || 'Unknown'}</span>
                            <span className="font-medium">{count}</span>
                        </div>
                    ))}
                    {Object.keys(data?.demographics.gender || {}).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">No gender data available</p>
                    )}
                </div>
            )
        },
        {
            id: 'financials',
            title: "Financial Summary",
            description: "Revenue & Outstanding",
            icon: TrendingUp,
            content: (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Total Revenue</span>
                        <span className="font-medium text-success">{formatCurrency(data?.financials.revenue || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Outstanding</span>
                        <span className="font-medium text-destructive">{formatCurrency(data?.financials.outstanding || 0)}</span>
                    </div>
                </div>
            )
        },
        {
            id: 'appointments',
            title: "Appointment Statistics",
            description: "Breakdown by Status",
            icon: Calendar,
            content: (
                <div className="space-y-2">
                    {Object.entries(data?.appointments || {}).map(([status, count]) => (
                        <div key={status} className="flex justify-between text-sm">
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                            <span className="font-medium">{count}</span>
                        </div>
                    ))}
                    {Object.keys(data?.appointments || {}).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">No appointment data</p>
                    )}
                </div>
            )
        },
        {
            id: 'inventory',
            title: "Inventory Usage",
            description: "Stock Overview",
            icon: FileText,
            content: (
                <div className="space-y-2">
                    {Object.entries(data?.demographics.gender || {}).map(([gender, count]) => (
                        <div key={gender} className="hidden"></div>
                    ))}
                    <div className="flex justify-between text-sm">
                        <span>Total Items in Stock</span>
                        <span className="font-medium">{data?.inventory.items_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Total Inventory Value</span>
                        <span className="font-medium">{formatCurrency(data?.inventory.total_value || 0)}</span>
                    </div>
                </div>
            )
        },
    ];

    const handleExport = () => {
        if (!data) return;

        const csvContent = [
            ["Report", "Metric", "Value"],
            ["Period", period.replace('_', ' '), ""],
            ["Patient Demographics", "Total Patients", data.demographics.total],
            ...Object.entries(data.demographics.gender).map(([gender, count]) => ["Patient Demographics", `Gender: ${gender}`, count]),
            ["Financial Summary", "Revenue", data.financials.revenue],
            ["Financial Summary", "Outstanding", data.financials.outstanding],
            ...Object.entries(data.appointments).map(([status, count]) => ["Appointment Statistics", status, count]),
            ["Inventory Usage", "Total Items", data.inventory.items_count],
            ["Inventory Usage", "Total Value", data.inventory.total_value],
        ]
            .map(e => e.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `admin_reports_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Reports & Analytics" description="Generate and export system reports">
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="this_week">This Week</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExport} disabled={!data}>
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                </div>
            </PageHeader>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {reportTypes.map((report, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <report.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">{report.title}</CardTitle>
                                    <CardDescription className="text-xs mt-1">{report.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-border min-h-[128px] flex flex-col justify-center">
                                {report.content}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                className="w-full justify-between group"
                                onClick={() => handleDetailExport(report.id)}
                            >
                                View Detailed Report
                                <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
