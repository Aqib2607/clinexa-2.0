import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import api from "@/lib/api";

const userRoles = [
  { value: "super_admin", label: "Admin", redirect: "/admin" },
  { value: "doctor", label: "Doctor", redirect: "/doctor" },
  { value: "nurse", label: "Nurse", redirect: "/nurse" },
  { value: "patient", label: "Patient", redirect: "/patient" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const data = response.data;

      // Sync with zustand auth store (also sets localStorage)
      authLogin(data.user, data.access_token);

      // Navigate to the appropriate dashboard based on user's actual role
      const roleRedirects: Record<string, string> = {
        super_admin: '/admin',
        doctor: '/doctor',
        nurse: '/nurse',
        patient: '/patient',
      };
      navigate(roleRedirects[data.user.role] || '/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-clinexa-dark relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80"
              alt="Hospital interior"
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
              Hospital Management
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="text-lg text-clinexa-secondary/90 max-w-md">
              Streamline your healthcare operations with our comprehensive hospital management system. Secure, efficient, and designed for modern healthcare.
            </p>
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <span className="text-clinexa-secondary">HIPAA Compliant Security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <span className="text-clinexa-secondary">Real-time Data Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
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
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <Select
                  name="role"
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
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

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="pl-10 focus-ring"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 pr-10 focus-ring"
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

              <Button
                type="submit"
                className="w-full btn-transition"
                size="lg"
                disabled={isLoading || !formData.role}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Need help accessing your account?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register Now
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
