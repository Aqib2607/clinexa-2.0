import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Plus, CreditCard, Search } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";

import { Visit, Bill, Service } from "@/types";

export default function BillingPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [bill, setBill] = useState<Bill | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [billLoading, setBillLoading] = useState(false);

    // Add Item State
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadVisits();
        loadServices();
    }, []);

    const loadVisits = () => {
        setLoading(true);
        // Fetch today's visits or recent ones
        api.get('/visits?date=' + new Date().toISOString().split('T')[0])
            .then(res => setVisits(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const loadServices = () => {
        api.get('/services').then(res => setServices(res.data));
    };

    const handleSelectVisit = (visit: Visit) => {
        setSelectedVisit(visit);
        loadBill(visit.id.toString());
    };

    const loadBill = (visitId: string) => {
        setBillLoading(true);
        // First try to find existing bill in the list (if endpoint supported filtering by visit_id which it likely doesn't directly return one object but a list)
        // Actually BillingController@index supports patient_id but not visit_id directly in my code?
        // Let's check BillingController@store logic: it checks if bill exists for visit.
        // So we can try to CREATE a bill to "get or create" it? 
        // Or better: Checking the code, BillingController@index filters by patient_id.
        // Strategy: Just try to create/fetch via store to ensure we have a draft.
        // Wait, that might spam drafts.
        // Let's assume for now we don't have a direct "get bill by visit" endpoint other than iterating.
        // Actually, VisitController@show includes 'bill'.
        api.get(`/visits/${visitId}`)
            .then(res => {
                if (res.data.bill) {
                    setBill(res.data.bill);
                } else {
                    setBill(null);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setBillLoading(false));
    };

    const createBill = () => {
        if (!selectedVisit) return;
        api.post('/bills', {
            visit_id: selectedVisit.id,
            patient_id: selectedVisit.patient_id
        }).then(res => {
            setBill(res.data);
            toast.success("Bill created");
        });
    };

    const addItem = () => {
        if (!bill) return;
        const service = services.find(s => s.id.toString() === selectedServiceId);
        if (!service) return;

        api.post(`/bills/${bill.id}/items`, {
            service_id: service.id,
            item_name: service.name,
            unit_price: service.price,
            quantity: quantity
        }).then(res => {
            toast.success("Item added");
            // Reload bill to get updated totals
            api.get(`/bills/${bill.id}`).then(res => setBill(res.data));
        }).catch(err => toast.error("Failed to add item"));
    };

    const finalizeBill = () => {
        if (!bill) return;
        api.post(`/bills/${bill.id}/finalize`)
            .then(res => {
                setBill(res.data);
                toast.success("Bill finalized");
            });
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6">
            <PageHeader title="Billing & Invoicing" description="Manage patient bills" />

            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
                {/* Visits List */}
                <div className="col-span-4 bg-card rounded-xl shadow-card flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h3 className="font-semibold mb-2">Today's Visits</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search patient..." className="pl-9" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4" />}
                        {visits.map(visit => (
                            <div
                                key={visit.id}
                                onClick={() => handleSelectVisit(visit)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedVisit?.id === visit.id ? 'bg-primary/10 border-primary border' : 'hover:bg-muted border border-transparent'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm">{visit.patient?.name}</span>
                                    <span className="text-xs text-muted-foreground">{format(new Date(visit.visit_date), 'h:mm a')}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-muted-foreground">{visit.doctor?.user?.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-muted`}>{visit.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bill Details */}
                <div className="col-span-8 bg-card rounded-xl shadow-card flex flex-col overflow-hidden">
                    {!selectedVisit ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select a visit to view or create bill
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold">{selectedVisit.patient?.name}</h2>
                                    <p className="text-sm text-muted-foreground">Visit: {format(new Date(selectedVisit.visit_date), 'PPP')}</p>
                                </div>
                                <div>
                                    {bill ? (
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Bill #{bill.bill_number}</p>
                                            <StatusBadge status={bill.status == 'draft' ? 'pending' : (bill.items?.length > 0 ? 'completed' : 'active')} />
                                        </div>
                                    ) : (
                                        <Button onClick={createBill} size="sm">Create Bill</Button>
                                    )}
                                </div>
                            </div>

                            {bill ? (
                                <>
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="p-3 text-left">Item</th>
                                                    <th className="p-3 text-right">Qty</th>
                                                    <th className="p-3 text-right">Price</th>
                                                    <th className="p-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {bill.items?.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="p-3">{item.item_name}</td>
                                                        <td className="p-3 text-right">{item.quantity}</td>
                                                        <td className="p-3 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                                        <td className="p-3 text-right">${Number(item.total_price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                {(!bill.items || bill.items.length === 0) && (
                                                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No items added</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-6 bg-muted/20 border-t border-border space-y-4">
                                        {/* Add Item Form (Only if Draft) */}
                                        {bill.status === 'draft' && (
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-xs font-medium">Add Service</span>
                                                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                                        <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                                                        <SelectContent>
                                                            {services.map(s => (
                                                                <SelectItem key={s.id} value={String(s.id)}>{s.name} (${s.price})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-20 space-y-1">
                                                    <span className="text-xs font-medium">Qty</span>
                                                    <Input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} />
                                                </div>
                                                <Button onClick={addItem}><Plus className="h-4 w-4" /></Button>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-4 border-t border-border">
                                            <div className="text-lg font-bold">Total: ${Number(bill.total_amount || 0).toFixed(2)}</div>
                                            <div className="flex gap-2">
                                                {bill.status === 'draft' && (
                                                    <Button variant="default" onClick={finalizeBill}>Finalize Bill</Button>
                                                )}
                                                {bill.status === 'finalized' && bill.due_amount > 0 && (
                                                    <Button variant="outline"><CreditCard className="h-4 w-4 mr-2" /> Pay Now</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                    No bill created for this visit.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
