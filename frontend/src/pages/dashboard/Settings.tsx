import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, User } from "lucide-react";

export default function Settings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const role = user?.role;

    const { data: profile, isLoading } = useQuery({
        queryKey: [`${role}-profile`],
        queryFn: async () => {
            const res = await api.get(`/${role}/profile`);
            return res.data;
        },
        enabled: !!role,
    });

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            if (role === "patient") {
                setFormData({
                    name: profile.patient?.name || "",
                    dob: profile.patient?.dob ? profile.patient.dob.split('T')[0] : "",
                    gender: profile.patient?.gender || "",
                    phone: profile.patient?.phone || "",
                    address: profile.patient?.address || "",
                    blood_group: profile.patient?.blood_group || "",
                    guardian_name: profile.patient?.guardian_name || "",
                    guardian_phone: profile.patient?.guardian_phone || "",
                });
            } else if (role === "doctor") {
                setFormData({
                    name: profile.user?.name || "",
                    phone: profile.user?.phone || "",
                    specialization: profile.doctor?.specialization || "",
                    license_number: profile.doctor?.license_number || "",
                    qualification: profile.doctor?.qualification || "",
                    consultation_fee: profile.doctor?.consultation_fee || "",
                    experience_years: profile.doctor?.experience_years || "",
                    bio: profile.doctor?.bio || "",
                });
            } else if (role === "nurse") {
                setFormData({
                    name: profile.user?.name || "",
                    phone: profile.user?.phone || "",
                    designation: profile.employee?.designation || "",
                    dob: profile.employee?.dob ? profile.employee.dob.split('T')[0] : "",
                    gender: profile.employee?.gender || "",
                    address: profile.employee?.address || "",
                });
            }
        }
    }, [profile, role]);

    const updateProfileMutation = useMutation({
        mutationFn: async () => {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) {
                    data.append(key, value);
                }
            });
            if (imageFile) {
                data.append('photo', imageFile);
            }
            return api.post(`/${role}/profile`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Profile updated successfully." });
            queryClient.invalidateQueries({ queryKey: [`${role}-profile`] });
            setImageFile(null);
            // Don't clear imagePreview immediately - wait for refetch to complete
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/${role}/profile`, {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Password updated successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (err: unknown) => {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update password.";
            toast({ title: "Error", description: message, variant: "destructive" });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {role === "patient" && (
                                <>
                                    <div className="flex items-center gap-6 pb-4 border-b">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                {imagePreview || getImageUrl(profile?.patient?.photo_url) ? (
                                                    <img src={imagePreview || getImageUrl(profile?.patient?.photo_url) || ""} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-12 h-12 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-photo">Profile Photo</Label>
                                            <input
                                                id="profile-photo"
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setImageFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Photo
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="uhid">UHID</Label>
                                        <Input id="uhid" value={profile?.patient?.uhid || "N/A"} disabled autoComplete="off" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth</Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={formData.dob || ""}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Input
                                                id="gender"
                                                value={formData.gender || ""}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone || ""}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                autoComplete="tel"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={profile?.patient?.email || ""} disabled autoComplete="email" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={formData.address || ""}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={2}
                                            autoComplete="street-address"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="blood_group">Blood Group</Label>
                                        <Input
                                            id="blood_group"
                                            value={formData.blood_group || ""}
                                            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guardian_name">Guardian Name</Label>
                                            <Input
                                                id="guardian_name"
                                                value={formData.guardian_name || ""}
                                                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="guardian_phone">Guardian Phone</Label>
                                            <Input
                                                id="guardian_phone"
                                                value={formData.guardian_phone || ""}
                                                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {role === "doctor" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={profile?.user?.email || ""} disabled autoComplete="email" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone || ""}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input id="department" value={profile?.doctor?.department?.name || "N/A"} disabled autoComplete="off" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="specialization">Specialization</Label>
                                            <Input
                                                id="specialization"
                                                value={formData.specialization || ""}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="license_number">License Number</Label>
                                            <Input
                                                id="license_number"
                                                value={formData.license_number || ""}
                                                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="qualification">Qualification</Label>
                                            <Input
                                                id="qualification"
                                                value={formData.qualification || ""}
                                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="experience_years">Experience (Years)</Label>
                                            <Input
                                                id="experience_years"
                                                type="number"
                                                value={formData.experience_years || ""}
                                                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="consultation_fee">Consultation Fee</Label>
                                        <Input
                                            id="consultation_fee"
                                            type="number"
                                            value={formData.consultation_fee || ""}
                                            onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.bio || ""}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            rows={3}
                                            autoComplete="off"
                                        />
                                    </div>
                                </>
                            )}

                            {role === "nurse" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Employee Code</Label>
                                            <Input value={profile?.employee?.employee_code || "N/A"} disabled autoComplete="off" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Join Date</Label>
                                            <Input value={profile?.employee?.join_date || "N/A"} disabled autoComplete="off" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={profile?.user?.email || ""} disabled autoComplete="email" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone || ""}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="designation">Designation</Label>
                                            <Input
                                                id="designation"
                                                value={formData.designation || ""}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                autoComplete="organization-title"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Department</Label>
                                            <Input value={profile?.employee?.department?.name || "N/A"} disabled autoComplete="off" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth</Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={formData.dob || ""}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Input
                                                id="gender"
                                                value={formData.gender || ""}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={formData.address || ""}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={2}
                                            autoComplete="street-address"
                                        />
                                    </div>
                                    {profile?.employee?.shift && (
                                        <div className="space-y-2">
                                            <Label>Current Shift</Label>
                                            <Input
                                                value={`${profile.employee.shift.name} (${profile.employee.shift.start_time} - ${profile.employee.shift.end_time})`}
                                                disabled
                                                autoComplete="off"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => updateProfileMutation.mutate()}
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-sm text-destructive">Passwords do not match</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => changePasswordMutation.mutate()}
                                disabled={
                                    changePasswordMutation.isPending ||
                                    !currentPassword ||
                                    !newPassword ||
                                    newPassword !== confirmPassword
                                }
                            >
                                {changePasswordMutation.isPending && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
