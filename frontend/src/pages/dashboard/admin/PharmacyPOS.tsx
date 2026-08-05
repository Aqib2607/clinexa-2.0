import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Search, ShoppingCart, Trash2, Plus, Receipt, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PharmacyItem, CartItem, PharmacyStock } from "@/types";

export default function PharmacyPOS() {
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState<PharmacyItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Checkout Form
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");

    useEffect(() => {
        loadItems();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadItems(searchTerm);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const loadItems = (search = "") => {
        setLoading(true);
        api.get(`/pharmacy/items?search=${search}`)
            .then(res => setItems(res.data.data)) // Pagination
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const addToCart = (item: PharmacyItem) => {
        const existing = cart.find(c => c.pharmacy_item_id === item.id);

        // Calculate available stock across batches
        const totalStock = item.stocks?.reduce((sum: number, stock: PharmacyStock) => sum + stock.quantity, 0) || 0;

        if (existing) {
            if (existing.quantity + 1 > totalStock) {
                toast.error("Not enough stock!");
                return;
            }
            setCart(cart.map(c => c.pharmacy_item_id === item.id ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unit_price } : c));
        } else {
            if (totalStock < 1) {
                toast.error("Out of stock!");
                return;
            }
            // Use generic price or specific batch price? 
            // Simplified: Use first batch price or item price if stored. 
            // PharmacyStock has sale_price.
            // Let's take the price from the first available batch for estimation.
            const price = item.stocks?.[0]?.sale_price || 0;

            setCart([...cart, {
                pharmacy_item_id: item.id,
                name: item.name,
                unit_price: price,
                quantity: 1,
                total: price
            }]);
        }
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(c => c.pharmacy_item_id !== id));
    };

    const updateQuantity = (id: number, qty: number) => {
        if (qty < 1) return;
        setCart(cart.map(c => c.pharmacy_item_id === id ? { ...c, quantity: qty, total: qty * c.unit_price } : c));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setCheckoutLoading(true);

        const payload = {
            customer_name: customerName || "Walk-in Customer",
            items: cart.map(item => ({
                pharmacy_item_id: item.pharmacy_item_id,
                quantity: item.quantity
            })),
            payment_method: paymentMethod,
            paid_amount: cartTotal // Assuming full payment for POS
        };

        api.post('/pharmacy/sales', payload)
            .then(res => {
                toast.success("Sale completed!");
                setCart([]);
                setCustomerName("");
                loadItems(); // Refresh stock
            })
            .catch(err => {
                toast.error(err.response?.data?.message || "Checkout failed");
            })
            .finally(() => setCheckoutLoading(false));
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6">
            <PageHeader title="Pharmacy POS" description="Point of Sale & Inventory" />

            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
                {/* Item List */}
                <div className="col-span-8 bg-card rounded-xl shadow-card flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search medicine (Generic / Brand)..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(item => {
                                const stock = item.stocks?.reduce((sum: number, s: PharmacyStock) => sum + s.quantity, 0) || 0;
                                const price = item.stocks?.[0]?.sale_price || 0;
                                return (
                                    <div key={item.id} className="p-4 border border-border rounded-lg hover:border-primary transition-colors bg-card">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium truncate" title={item.name}>{item.name}</h3>
                                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">${price}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">{item.generic_name}</p>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                                            </span>
                                            <Button size="sm" variant="outline" onClick={() => addToCart(item)} disabled={stock === 0}>
                                                <Plus className="h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Cart */}
                <div className="col-span-4 bg-card rounded-xl shadow-card flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/20">
                        <h3 className="font-semibold flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" /> Current Cart
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">Cart is empty</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.pharmacy_item_id} className="flex gap-4 items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">${item.unit_price} x {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">${item.total.toFixed(2)}</p>
                                        <div className="flex gap-2 items-center justify-end mt-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.pharmacy_item_id, item.quantity - 1)}>-</Button>
                                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.pharmacy_item_id, item.quantity + 1)}>+</Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.pharmacy_item_id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-muted/20 border-t border-border space-y-4">
                        <div className="space-y-2">
                            <Input placeholder="Customer Name (Optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={cart.length === 0 || checkoutLoading}>
                            {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Receipt className="h-4 w-4 mr-2" /> Checkout</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
