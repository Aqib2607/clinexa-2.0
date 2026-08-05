import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, Plus, Search, User, Filter, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

interface Staff {
    id: number;
    employee_code: string;
    designation: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    join_date: string;
    basic_salary: number;
    is_active: boolean;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        employee_code: "",
        designation: "",
        join_date: "",
        basic_salary: "",
        is_active: true
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const response = await api.get('/hr/employees');
            setStaff(response.data.data || []);
        } catch (error) {
            console.error("Failed to load staff", error);
            toast.error("Failed to load staff list");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setCurrentStaff(null);
        setFormData({
            name: "",
            email: "",
            employee_code: "",
            designation: "",
            join_date: new Date().toISOString().split('T')[0],
            basic_salary: "",
            is_active: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (member: Staff) => {
        setCurrentStaff(member);
        setFormData({
            name: member.user?.name || '',
            email: member.user?.email || '',
            employee_code: member.employee_code,
            designation: member.designation,
            join_date: member.join_date.split('T')[0], // existing format might vary
            basic_salary: member.basic_salary.toString(),
            is_active: member.is_active
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                basic_salary: parseFloat(formData.basic_salary)
            };

            if (currentStaff) {
                // Update
                await api.put(`/hr/employees/${currentStaff.id}`, payload);
                toast.success("Staff member updated successfully");
            } else {
                // Create
                await api.post('/hr/employees', payload);
                toast.success("Staff member registered successfully");
            }
            setIsModalOpen(false);
            loadStaff();
        } catch (error) {
            console.error("Operation failed", error);
            const apiError = error as ApiError;
            const msg = apiError.response?.data?.message || "Operation failed";
            toast.error(msg);
        }
    };

    const handleDelete = async () => {
        if (!currentStaff) return;
        try {
            await api.delete(`/hr/employees/${currentStaff.id}`);
            toast.success("Staff member deleted successfully");
            setIsDeleteOpen(false);
            loadStaff();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete staff member");
        }
    };

    const filteredStaff = staff.filter(member =>
        (member.user?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.designation ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.employee_code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: "code",
            header: "ID",
            render: (row: Staff) => <span className="font-mono text-xs">{row.employee_code}</span>
        },
        {
            key: "name",
            header: "Name",
            render: (row: Staff) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">{row.user?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{row.user?.email || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        { key: "designation", header: "Designation" },
        {
            key: "joined",
            header: "Joined",
            render: (row: Staff) => new Date(row.join_date).toLocaleDateString()
        },
        {
            key: "status",
            header: "Status",
            render: (row: Staff) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: "actions",
            header: "",
            render: (row: Staff) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(row)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setCurrentStaff(row); setIsDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Staff Directory" description="Manage nurses, administrative, and support staff">
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                </Button>
            </PageHeader>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-staff"
                        name="search-staff"
                        autoComplete="off"
                        placeholder="Search by name, ID, or role..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredStaff} />
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentStaff ? 'Edit Staff Member' : 'Register New Staff Member'}</DialogTitle>
                        <DialogDescription>
                            {currentStaff ? 'Update staff member information.' : 'Enter details to register a new staff member.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" autoComplete="name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="staff@clinexa.com" autoComplete="email" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employee_code">Employee Code</Label>
                            <Input id="employee_code" name="employee_code" value={formData.employee_code} onChange={handleInputChange} placeholder="EMP001" autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input id="designation" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Sr. Nurse" autoComplete="organization-title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="join_date">Join Date</Label>
                            <Input id="join_date" name="join_date" type="date" value={formData.join_date} onChange={handleInputChange} autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="basic_salary">Basic Salary</Label>
                            <Input id="basic_salary" name="basic_salary" type="number" value={formData.basic_salary} onChange={handleInputChange} placeholder="50000" autoComplete="off" />
                        </div>
                        <div className="flex items-center justify-between col-span-2">
                            <Label htmlFor="is_active">Active Status</Label>
                            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{currentStaff ? 'Update Staff' : 'Register Staff'}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the staff member and their access.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
