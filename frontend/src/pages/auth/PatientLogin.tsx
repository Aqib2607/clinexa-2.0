import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Lock, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";

export default function PatientLogin() {
    const navigate = useNavigate();
    const { login: authLogin } = useAuthStore();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/patient/otp/request', { mobile_number: phone });
            toast.success(res.data.message);
            if (res.data.dev_hint) toast.info(`Dev Hint: OTP is ${res.data.dev_hint}`);
            setStep('otp');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to send OTP. Ensure phone exists.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/patient/otp/verify', { mobile_number: phone, otp });
            toast.success("Login Successful");
            // Sync with centralized auth store
            authLogin(res.data.user, res.data.token);
            navigate('/patient');
        } catch (err: unknown) {
            toast.error("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-foreground font-bold text-2xl">C</span>
                    </div>
                    <h2 className="text-2xl font-bold">Patient Portal</h2>
                    <p className="text-muted-foreground">Secure access to your health records</p>
                </div>

                {step === 'phone' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Mobile Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    placeholder="Enter registered mobile number"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-primary hover:underline">
                                Staff Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-slide-up">
                        <div className="space-y-2">
                            <Label>Enter OTP</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    placeholder="6-digit OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Verifying..." : "Verify & Login"}
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setStep('phone')} type="button">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
