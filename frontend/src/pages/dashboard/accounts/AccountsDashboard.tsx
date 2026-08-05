import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, Receipt, FileText } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { TrialBalanceItem } from "@/types";

export default function AccountsDashboard() {
    const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showVoucherForm, setShowVoucherForm] = useState(false);

    useEffect(() => {
        loadTrialBalance();
    }, []);

    const loadTrialBalance = () => {
        setLoading(true);
        api.get('/accounts/trial-balance')
            .then(res => setTrialBalance(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const columns = [
        { key: "code", header: "Code" },
        { key: "name", header: "Account" },
        { key: "type", header: "Type" },
        {
            key: "debit",
            header: "Debit",
            render: (row: TrialBalanceItem) => row.debit > 0 ? row.debit.toLocaleString() : '-'
        },
        {
            key: "credit",
            header: "Credit",
            render: (row: TrialBalanceItem) => row.credit > 0 ? row.credit.toLocaleString() : '-'
        },
        {
            key: "balance",
            header: "Balance",
            render: (row: TrialBalanceItem) => <span className="font-bold">{row.balance.toLocaleString()}</span>
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Accounts & Finance" description="Trial Balance & Vouchers">
                <Button onClick={() => setShowVoucherForm(true)}>
                    <Receipt className="h-4 w-4 mr-2" /> New Voucher
                </Button>
            </PageHeader>

            <div className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-semibold mb-4">Trial Balance</h3>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={trialBalance} />
                )}
            </div>

            {showVoucherForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">New Journal Voucher</h3>
                        <div className="space-y-4">
                            <Input type="date" />
                            <Input placeholder="Narration" />
                            {/* Simplified Entry Rows */}
                            <div className="p-4 border rounded bg-muted/20 text-center text-sm text-muted-foreground">
                                Detailed voucher entry form with dynamic rows (Debit/Credit) to be implemented.
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowVoucherForm(false)}>Cancel</Button>
                            <Button disabled>Post Voucher</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
