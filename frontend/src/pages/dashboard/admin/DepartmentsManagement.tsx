import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, Plus, Search, Building2, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Department {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function DepartmentsManagement() {
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        is_active: true
    });

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/departments');
            setDepartments(response.data || []);
        } catch (error) {
            console.error("Failed to load departments", error);
            toast.error("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setCurrentDepartment(null);
        setFormData({
            name: "",
            code: "",
            description: "",
            is_active: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (dept: Department) => {
        setCurrentDepartment(dept);
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || "",
            is_active: dept.is_active
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (currentDepartment) {
                // Update
                await api.put(`/departments/${currentDepartment.id}`, formData);
                toast.success("Department updated successfully");
            } else {
                // Create
                await api.post('/departments', formData);
                toast.success("Department added successfully");
            }
            setIsModalOpen(false);
            loadDepartments();
        } catch (error) {
            console.error("Operation failed", error);
            const apiError = error as ApiError;
            const msg = apiError.response?.data?.message || "Operation failed";
            toast.error(msg);
        }
    };

    const handleDelete = async () => {
        if (!currentDepartment) return;
        try {
            await api.delete(`/departments/${currentDepartment.id}`);
            toast.success("Department deleted successfully");
            setIsDeleteOpen(false);
            loadDepartments();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete department");
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: "name",
            header: "Department Name",
            render: (row: Department) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.code}</p>
                    </div>
                </div>
            )
        },
        { key: "description", header: "Description" },
        {
            key: "status",
            header: "Status",
            render: (row: Department) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: "actions",
            header: "",
            render: (row: Department) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(row)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setCurrentDepartment(row); setIsDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Departments" description="Manage hospital departments and units">
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                </Button>
            </PageHeader>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-departments"
                        name="search-departments"
                        autoComplete="off"
                        placeholder="Search departments..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredDepartments} />
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                        <DialogDescription>
                            {currentDepartment ? 'Modify department details below.' : 'Enter details to create a new department.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Department Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Cardiology" autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. CARD" autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief description of the department" autoComplete="off" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="is_active">Active Status</Label>
                            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>{currentDepartment ? 'Update Department' : 'Create Department'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the department and may affect related data.
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
