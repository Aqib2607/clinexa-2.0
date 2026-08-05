import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import HomePage from "@/pages/public/HomePage";

/**
 * Protected Homepage Component
 * Redirects authenticated non-patient users to their dashboards
 * Allows patients and unauthenticated users to access the homepage
 */
export function ProtectedHomepage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { data: user, isLoading } = useUser();

    useEffect(() => {
        // Only check if authenticated and user data is loaded
        if (isAuthenticated && !isLoading && user) {
            const roleRedirects: Record<string, string> = {
                super_admin: '/admin',
                doctor: '/doctor',
                nurse: '/nurse',
            };

            // If user is not a patient, redirect to their dashboard
            const redirectPath = roleRedirects[user.role];
            if (redirectPath) {
                navigate(redirectPath, { replace: true });
            }
            // If user is a patient (or role not in redirects), allow access to homepage
        }
    }, [isAuthenticated, user, isLoading, navigate]);

    // Show homepage for:
    // 1. Unauthenticated users
    // 2. Patients
    // 3. While loading (to avoid flash)
    return <HomePage />;
}
