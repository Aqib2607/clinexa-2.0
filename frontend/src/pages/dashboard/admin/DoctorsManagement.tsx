import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import api from "@/lib/api";
import { Loader2, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Doctor {
    id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    specialization: string;
    license_number: string;
    department_id: number;
    department?: {
        id: number;
        name: string;
    };
    qualification: string;
    consultation_fee: number;
    experience_years: number;
}

interface Department {
    id: number;
    name: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function DoctorsManagement() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        license_number: "",
        department_id: "",
        qualification: "",
        consultation_fee: "",
        experience_years: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [doctorsRes, deptsRes] = await Promise.all([
                api.get('/doctors'),
                api.get('/departments')
            ]);
            setDoctors(doctorsRes.data.data || []);
            setDepartments(deptsRes.data || []);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load doctors data");
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
        setCurrentDoctor(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            specialization: "",
            license_number: "",
            department_id: "",
            qualification: "",
            consultation_fee: "",
            experience_years: ""
        });
        setIsModalOpen(true);
    };

    const openEditModal = (doctor: Doctor) => {
        setCurrentDoctor(doctor);
        setFormData({
            name: doctor.user?.name || '',
            email: doctor.user?.email || '',
            phone: doctor.user?.phone || "",
            specialization: doctor.specialization,
            license_number: doctor.license_number || "",
            department_id: doctor.department_id.toString(),
            qualification: doctor.qualification || "",
            consultation_fee: doctor.consultation_fee.toString(),
            experience_years: doctor.experience_years.toString()
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (currentDoctor) {
                // Update
                const payload = {
                    ...formData,
                    department_id: parseInt(formData.department_id),
                    consultation_fee: parseFloat(formData.consultation_fee),
                    experience_years: parseInt(formData.experience_years)
                };
                await api.put(`/doctors/${currentDoctor.id}`, payload);
                toast.success("Doctor updated successfully");
            } else {
                // Create
                const payload = {
                    ...formData,
                    password: "password123", // Default password for now
                    department_id: parseInt(formData.department_id),
                    consultation_fee: parseFloat(formData.consultation_fee),
                    experience_years: parseInt(formData.experience_years)
                };
                await api.post('/doctors', payload);
                toast.success("Doctor added successfully");
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error("Operation failed", error);
            const apiError = error as ApiError;
            const msg = apiError.response?.data?.message || "Operation failed";
            toast.error(msg);
        }
    };

    const handleDelete = async () => {
        if (!currentDoctor) return;
        try {
            await api.delete(`/doctors/${currentDoctor.id}`);
            toast.success("Doctor deleted successfully");
            setIsDeleteOpen(false);
            loadData();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete doctor");
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        (doc.user?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialization ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.department?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: "name",
            header: "Name",
            render: (row: Doctor) => (
                <div>
                    <p className="font-medium">{row.user?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{row.user?.email || 'N/A'}</p>
                </div>
            )
        },
        { key: "specialization", header: "Specialization" },
        {
            key: "department",
            header: "Department",
            render: (row: Doctor) => row.department?.name || '-'
        },
        {
            key: "contact",
            header: "Contact",
            render: (row: Doctor) => row.user?.phone || 'N/A'
        },
        {
            key: "actions",
            header: "",
            render: (row: Doctor) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(row)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setCurrentDoctor(row); setIsDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Doctors Management" description="Manage hospital doctors and specialists">
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                </Button>
            </PageHeader>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-doctors"
                        name="search-doctors"
                        autoComplete="off"
                        placeholder="Search doctors..."
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
                    <DataTable columns={columns} data={filteredDoctors} />
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{currentDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                        <DialogDescription>
                            {currentDoctor ? 'Modify doctor details below.' : 'Fill in the details to register a new doctor.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Dr. John Doe" autoComplete="name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="doctor@clinexa.com" autoComplete="email" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1234567890" autoComplete="tel" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department_id">Department</Label>
                            <Select value={formData.department_id} onValueChange={(val) => handleSelectChange("department_id", val)}>
                                <SelectTrigger id="department_id">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Cardiology" autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="license_number">License Number</Label>
                            <Input id="license_number" name="license_number" value={formData.license_number} onChange={handleInputChange} placeholder="MD12345" autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="qualification">Qualification</Label>
                            <Input id="qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="MBBS, MD" autoComplete="off" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience_years">Experience (Years)</Label>
                            <Input id="experience_years" name="experience_years" type="number" value={formData.experience_years} onChange={handleInputChange} placeholder="5" autoComplete="off" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="consultation_fee">Consultation Fee</Label>
                            <Input id="consultation_fee" name="consultation_fee" type="number" value={formData.consultation_fee} onChange={handleInputChange} placeholder="50.00" autoComplete="off" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{currentDoctor ? 'Update Doctor' : 'Create Doctor'}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the doctor's account and remove their data from our servers.
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
