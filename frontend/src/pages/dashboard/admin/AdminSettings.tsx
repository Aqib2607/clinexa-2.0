import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        hospital_name: "Clinexa Hospital",
        contact_email: "info@clinexa.com",
        phone_number: "+1 (800) 123-4567",
        website: "https://clinexa.com",
        address: "123 Medical Center Drive, Healthcare City, HC 12345",
        enable_email_alerts: true,
        enable_sms_notifications: true,
        enable_system_updates: false,
        enforce_2fa: false,
        session_timeout: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            // Merge defaults with fetched settings
            setSettings(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error("Failed to load settings", error);
            // Don't show error toast on load to avoid spam if settings are empty
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert boolean values to strings/integers if backend requires, 
            // but our SettingsController accepts strings. 
            // We'll send the whole object, mapped as needed.
            // Actually our controller expects 'settings' array.

            // We need to cast booleans to strings for storage if we want them to persist as "1"/"0" or "true"/"false"
            // Or rely on frontend to parse them back. Let's store as "1"/"0" for consistency with typical PHP app.

            const payload = {
                settings: Object.entries(settings).reduce((acc, [key, value]) => {
                    acc[key] = typeof value === 'boolean' ? (value ? '1' : '0') : value;
                    return acc;
                }, {} as Record<string, string>)
            };

            await api.post('/settings', payload);
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8 animate-fade-in">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Helper to safer access boolean
    const getBool = (key: keyof typeof settings) => {
        const val = settings[key];
        return val === true || val === '1';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="System Settings" description="Configure hospital preferences and defaults">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </PageHeader>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    <TabsContent value="general" className="space-y-6">
                        <form className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-4">Hospital Information</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="hospital_name">Hospital Name</Label>
                                    <Input id="hospital_name" name="hospital_name" value={settings.hospital_name} onChange={handleInputChange} autoComplete="organization" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Contact Email</Label>
                                    <Input id="contact_email" name="contact_email" value={settings.contact_email} onChange={handleInputChange} autoComplete="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input id="phone_number" name="phone_number" value={settings.phone_number} onChange={handleInputChange} autoComplete="tel" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" name="website" value={settings.website} onChange={handleInputChange} autoComplete="url" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" value={settings.address} onChange={handleInputChange} autoComplete="street-address" />
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Alerts</Label>
                                        <p className="text-sm text-muted-foreground">Receive daily summary emails</p>
                                    </div>
                                    <Switch checked={getBool('enable_email_alerts')} onCheckedChange={(c) => handleSwitchChange('enable_email_alerts', c)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">SMS Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Send SMS for critical alerts</p>
                                    </div>
                                    <Switch checked={getBool('enable_sms_notifications')} onCheckedChange={(c) => handleSwitchChange('enable_sms_notifications', c)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">System Updates</Label>
                                        <p className="text-sm text-muted-foreground">Notify users about system maintenance</p>
                                    </div>
                                    <Switch checked={getBool('enable_system_updates')} onCheckedChange={(c) => handleSwitchChange('enable_system_updates', c)} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-4">Security Policies</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">Enforce 2FA for all staff accounts</p>
                                    </div>
                                    <Switch checked={getBool('enforce_2fa')} onCheckedChange={(c) => handleSwitchChange('enforce_2fa', c)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Session Timeout</Label>
                                        <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
                                    </div>
                                    <Switch checked={getBool('session_timeout')} onCheckedChange={(c) => handleSwitchChange('session_timeout', c)} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
