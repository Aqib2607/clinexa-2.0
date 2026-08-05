import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { InventoryStock } from "@/types";

export default function InventoryDashboard() {
    const [stock, setStock] = useState<InventoryStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [openReq, setOpenReq] = useState(false);

    useEffect(() => {
        loadStock();
    }, []);

    const loadStock = () => {
        setLoading(true);
        api.get('/inventory/stock')
            .then(res => setStock(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const columns = [
        {
            key: "item",
            header: "Item Name",
            render: (row: InventoryStock) => row.item?.name || 'Unknown'
        },
        {
            key: "code",
            header: "Code",
            render: (row: InventoryStock) => row.item?.code || '-'
        },
        {
            key: "store",
            header: "Store",
            render: (row: InventoryStock) => row.store?.name || 'Main Store'
        },
        {
            key: "total_quantity",
            header: "Available Qty",
            render: (row: InventoryStock) => (
                <span className={row.total_quantity < 10 ? "text-red-500 font-bold" : ""}>
                    {row.total_quantity} {row.item?.unit}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Inventory Management" description="Real-time Stock Overview">
                <Button onClick={() => setOpenReq(true)}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> New Requisition
                </Button>
            </PageHeader>

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={stock} />
                )}
            </div>

            {/* Simple Requisition Placeholder */}
            {openReq && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create Requisition</h3>
                        <p className="text-sm text-muted-foreground mb-4">To be implemented: Select items and quantity to request from Main Store.</p>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setOpenReq(false)}>Close</Button>
                            <Button disabled>Submit</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
