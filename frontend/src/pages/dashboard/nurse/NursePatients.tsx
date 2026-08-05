import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/dashboard/StatCard";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, Search, Activity, Bed, AlertCircle, Loader2, Plus, UserPlus } from "lucide-react";

interface NursePatient {
    id: string;
    patient_id: number;
    name: string;
    age: number | null;
    gender: string;
    ward: string;
    bed_number: string;
    condition: string;
    status: string;
    doctor: string;
    last_vitals: string;
    admission_date: string;
}

interface AdmissionOptions {
    doctors: Array<{ id: number; name: string; specialization: string }>;
    beds: Array<{ id: number; name: string; ward: string; type: string }>;
}

export default function NursePatients() {
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAdmitOpen, setIsAdmitOpen] = useState(false);
    const [admitType, setAdmitType] = useState<"existing" | "new">("existing");
    
    // Admission Form State
    const [formData, setFormData] = useState({
        patient_id: "", // For existing
        name: "", // For new
        phone: "",
        dob: "",
        gender: "",
        emergency_contact: "",
        emergency_phone: "",
        doctor_id: "",
        bed_id: "",
        diagnosis: "",
        deposit: "",
    });

    const { data: patients = [], isLoading } = useQuery<NursePatient[]>({
        queryKey: ["nurse-patients"],
        queryFn: async () => {
            const res = await api.get(`/nurse/patients`);
            return res.data;
        },
    });

    // Fetch admission options (doctors, beds)
    const { data: options } = useQuery<AdmissionOptions>({
        queryKey: ["admission-options"],
        queryFn: async () => {
            const res = await api.get("/nurse/admission-options");
            return res.data;
        },
        enabled: isAdmitOpen,
    });

    // Mock search for existing patients (In real app, this would be an API call)
    // For now, we'll just use a simple input for ID
    
    const admitMutation = useMutation({
        mutationFn: async (data: any) => {
             return api.post("/nurse/admit", {
                ...data,
                patient_type: admitType,
             });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Patient admitted successfully." });
            setIsAdmitOpen(false);
            setFormData({
                patient_id: "", name: "", phone: "", dob: "", gender: "",
                emergency_contact: "", emergency_phone: "", doctor_id: "",
                bed_id: "", diagnosis: "", deposit: ""
            });
            queryClient.invalidateQueries({ queryKey: ["nurse-patients"] });
        },
        onError: (err: any) => {
            toast({ 
                title: "Error", 
                description: err.response?.data?.message || "Failed to admit patient.", 
                variant: "destructive" 
            });
        }
    });

    const handleAdmit = () => {
        // Validation logic could go here
        admitMutation.mutate(formData);
    };

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const criticalPatients = patients.filter((p) => p.status === "critical").length;
    const stablePatients = patients.filter((p) => p.status === "stable").length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "stable":
                return "text-green-600 bg-green-50";
            case "critical":
                return "text-red-600 bg-red-50";
            case "recovering":
                return "text-blue-600 bg-blue-50";
            default:
                return "text-gray-600 bg-gray-50";
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
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="My Patients"
                description="Monitor and manage patients under your care"
            >
                <Dialog open={isAdmitOpen} onOpenChange={setIsAdmitOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Admit Patient
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Admit Patient</DialogTitle>
                            <DialogDescription>
                                Admit an existing patient or register a new one.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={admitType} onValueChange={(v) => setAdmitType(v as "existing" | "new")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="existing">Existing Patient</TabsTrigger>
                                <TabsTrigger value="new">New Patient</TabsTrigger>
                            </TabsList>
                            
                            <div className="py-4 space-y-4">
                                <TabsContent value="existing" className="space-y-4 mt-0">
                                    <div className="space-y-2">
                                        <Label>Patient ID / UHID</Label>
                                        <Input 
                                            placeholder="Enter Patient ID" 
                                            value={formData.patient_id}
                                            onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                                        />
                                        <p className="text-xs text-muted-foreground">Enter the database ID of the patient (e.g. 1, 2)</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="new" className="space-y-4 mt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input 
                                                placeholder="John Doe" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input 
                                                placeholder="+123..." 
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date of Birth</Label>
                                            <Input 
                                                type="date" 
                                                value={formData.dob}
                                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <Select 
                                                value={formData.gender} 
                                                onValueChange={(v) => setFormData({...formData, gender: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Emergency Contact Name</Label>
                                            <Input 
                                                placeholder="Guardian Name" 
                                                value={formData.emergency_contact}
                                                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Emergency Contact Phone</Label>
                                            <Input 
                                                placeholder="Guardian Phone" 
                                                value={formData.emergency_phone}
                                                onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <div className="border-t pt-4 space-y-4">
                                    <h4 className="font-medium">Admission Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Doctor</Label>
                                            <Select 
                                                value={formData.doctor_id} 
                                                onValueChange={(v) => setFormData({...formData, doctor_id: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Assign Doctor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options?.doctors.map((doc) => (
                                                        <SelectItem key={doc.id} value={doc.id.toString()}>
                                                            {doc.name} ({doc.specialization})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bed</Label>
                                            <Select 
                                                value={formData.bed_id} 
                                                onValueChange={(v) => setFormData({...formData, bed_id: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Assign Bed" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options?.beds.map((bed) => (
                                                        <SelectItem key={bed.id} value={bed.id.toString()}>
                                                            {bed.ward} - {bed.name} ({bed.type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Diagnosis / Reason</Label>
                                        <Input 
                                            placeholder="Reason for admission"
                                            value={formData.diagnosis}
                                            onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAdmitOpen(false)}>Cancel</Button>
                            <Button onClick={handleAdmit} disabled={admitMutation.isPending}>
                                {admitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Admit Patient
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Patients" value={patients.length} icon={Users} />
                <StatCard
                    title="Critical"
                    value={criticalPatients}
                    icon={AlertCircle}
                    description="Requires immediate attention"
                />
                <StatCard title="Stable" value={stablePatients} icon={Activity} />
                <StatCard title="Beds Occupied" value={patients.length} icon={Bed} />
            </div>

            {/* Search */}
            <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Patient Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="font-medium text-muted-foreground">No patients found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery
                                ? "Try a different search term"
                                : "There are currently no admitted patients"}
                        </p>
                    </div>
                ) : (
                    filteredPatients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                                        <CardDescription>
                                            {patient.age ? `${patient.age} years` : "Age N/A"} •{" "}
                                            {patient.gender}
                                        </CardDescription>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            patient.status
                                        )}`}
                                    >
                                        {patient.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Ward:</span>
                                        <span className="font-medium">{patient.ward}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Bed:</span>
                                        <span className="font-medium">{patient.bed_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Doctor:</span>
                                        <span className="font-medium">{patient.doctor}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Last Vitals:</span>
                                        <span className="font-medium">{patient.last_vitals}</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-sm font-medium text-card-foreground">
                                        Condition
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {patient.condition}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link to={`/nurse/patients/${patient.id}`}>View Chart</Link>
                                    </Button>
                                    <Button size="sm" className="flex-1" asChild>
                                        <Link to={`/nurse/vitals?patientId=${patient.id}`}>Record Vitals</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
