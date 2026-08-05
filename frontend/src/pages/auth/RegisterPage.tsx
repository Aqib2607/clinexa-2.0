import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Lock, Mail, User, Phone, Calendar, ArrowRight, Briefcase, FileText } from "lucide-react";
import { toast } from "sonner";
import { PublicHeader } from "@/components/layout/PublicHeader";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";

const userRoles = [
    { value: "patient", label: "Patient" },
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "super_admin", label: "Admin" },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login: authLogin } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: "",
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        password: "",
        confirmPassword: "",
        // Doctor-specific
        specialization: "",
        licenseNumber: "",
        departmentId: "",
        // Employee-specific (Nurse/Admin)
        employeeCode: "",
        designation: "",
    });

    const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);

    useEffect(() => {
        if (formData.role === 'doctor') {
            const fetchDepartments = async () => {
                try {
                    const response = await api.get('/departments');
                    setDepartments(response.data);
                } catch (error) {
                    console.error("Failed to fetch departments", error);
                    toast.error("Failed to load departments");
                }
            };
            fetchDepartments();
        }
    }, [formData.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role) {
            toast.error("Please select a role");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const payload: Record<string, unknown> = {
                role: formData.role,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            };

            // Add role-specific fields
            if (formData.role === "patient") {
                payload.dob = formData.dob;
                payload.gender = formData.gender;
                payload.address = formData.address;
            } else if (formData.role === "doctor") {
                payload.specialization = formData.specialization;
                payload.license_number = formData.licenseNumber;
                payload.department_id = formData.departmentId;
            } else if (formData.role === "nurse") {
                payload.employee_code = formData.employeeCode;
                payload.designation = formData.designation;
            }

            const response = await api.post('/auth/register', payload);

            toast.success("Registration successful! Please check your email/phone for verification.");

            // Navigate based on role
            if (formData.role === "patient") {
                // Sync with centralized auth store
                if (response.data.access_token) {
                    authLogin(response.data.user, response.data.access_token);
                }
                navigate('/patient');
            } else {
                navigate('/login');
            }
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response?: { data?: { message?: string, errors?: Record<string, string[]> } } };
                const errors = err.response?.data?.errors;
                const message = err.response?.data?.message;

                if (errors) {
                    // Join all errors or just show the first one
                    const firstErrorKey = Object.keys(errors)[0];
                    const firstErrorMessage = errors[firstErrorKey]?.[0];
                    toast.error(firstErrorMessage || message || "Validation failed.");
                } else {
                    toast.error(message || "Registration failed. Please try again.");
                }
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = (value: string) => {
        setFormData({
            ...formData,
            role: value,
            // Reset role-specific fields
            specialization: "",
            licenseNumber: "",
            departmentId: "",
            employeeCode: "",
            designation: "",
        });
    };

    return (
        <>
            <PublicHeader />
            <div className="min-h-screen flex">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-clinexa-dark relative overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80"
                            alt="Medical team"
                            className="w-full h-full object-cover opacity-20"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                        <Link to="/" className="flex items-center gap-3 mb-12">
                            <img
                                src="/favicon.svg"
                                alt="Clinexa Logo"
                                className="h-12 w-12"
                            />
                            <span className="text-2xl font-bold text-white">Clinexa</span>
                        </Link>
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                            Join Our
                            <span className="text-primary block">Healthcare Community</span>
                        </h1>
                        <p className="text-lg text-clinexa-secondary/90 max-w-md">
                            Register now to access the healthcare management system based on your role.
                        </p>
                        <div className="mt-12 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-clinexa-secondary">Secure Data Protection</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <ArrowRight className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-clinexa-secondary">Role-Based Access Control</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Registration Form */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
                    <div className="w-full max-w-md animate-fade-in">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-3">
                                <img
                                    src="/favicon.svg"
                                    alt="Clinexa Logo"
                                    className="h-10 w-10"
                                />
                                <span className="text-xl font-bold text-foreground">Clinexa</span>
                            </Link>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Create Your Account</h2>
                            <p className="text-muted-foreground mt-2">Select your role and register</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Register As</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={handleRoleChange}
                                >
                                    <SelectTrigger id="role" className="bg-card focus-ring">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card z-50">
                                        {userRoles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Common Fields */}
                            {formData.role && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="pl-10 focus-ring"
                                                autoComplete="name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="you@example.com"
                                                className="pl-10 focus-ring"
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="pl-10 focus-ring"
                                                autoComplete="tel"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Patient-Specific Fields */}
                                    {formData.role === "patient" && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="dob">Date of Birth</Label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            id="dob"
                                                            type="date"
                                                            value={formData.dob}
                                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                            className="pl-10 focus-ring"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="gender">Gender</Label>
                                                    <Select
                                                        value={formData.gender}
                                                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                                    >
                                                        <SelectTrigger id="gender" className="bg-card focus-ring">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-card z-50">
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">Address</Label>
                                                <Input
                                                    id="address"
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="123 Main St, City, State"
                                                    className="focus-ring"
                                                    autoComplete="street-address"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Doctor-Specific Fields */}
                                    {formData.role === "doctor" && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="specialization">Specialization</Label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        id="specialization"
                                                        type="text"
                                                        value={formData.specialization}
                                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                        placeholder="e.g., Cardiology"
                                                        className="pl-10 focus-ring"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="licenseNumber">Medical License Number</Label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        id="licenseNumber"
                                                        type="text"
                                                        value={formData.licenseNumber}
                                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                                        placeholder="License Number"
                                                        className="pl-10 focus-ring"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="departmentId">Department</Label>
                                                <Select
                                                    value={formData.departmentId}
                                                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                                                >
                                                    <SelectTrigger id="departmentId" className="bg-card focus-ring">
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card z-50">
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}

                                    {/* Nurse-Specific Fields */}
                                    {formData.role === "nurse" && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="employeeCode">Employee Code</Label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        id="employeeCode"
                                                        type="text"
                                                        value={formData.employeeCode}
                                                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                                                        placeholder="Employee Code"
                                                        className="pl-10 focus-ring"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="designation">Designation</Label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        id="designation"
                                                        type="text"
                                                        value={formData.designation}
                                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                        placeholder={formData.role === "nurse" ? "e.g., Staff Nurse" : "e.g., Admin Manager"}
                                                        className="pl-10 focus-ring"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Password Fields */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 focus-ring"
                                                autoComplete="new-password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 focus-ring"
                                                autoComplete="new-password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full btn-transition"
                                        size="lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </>
                            )}
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>

                        <div className="mt-8 pt-8 border-t border-border text-center">
                            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                ← Return to Hospital Website
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
