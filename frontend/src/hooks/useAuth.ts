
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'doctor' | 'nurse' | 'patient';
    phone?: string;
    avatar?: string;
}

type RoleKey = 'super_admin' | 'doctor' | 'nurse' | 'patient';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
    hasRole: (role: RoleKey | RoleKey[]) => boolean;
    canAccess: (resource: string, action: string) => boolean;
}

// Role-based permission matrix aligned with MASTER JSON PROMPT
const ROLE_PERMISSIONS: Record<RoleKey, Record<string, string[]>> = {
    super_admin: {
        '*': ['create', 'read', 'update', 'delete'], // Full access
    },
    doctor: {
        appointments: ['read', 'create', 'update', 'cancel'],
        prescriptions: ['read', 'create', 'update'],
        patients: ['read'], // Only assigned patients
        visits: ['read', 'create', 'update'],
        lab_results: ['read'],
        radiology_results: ['read'],
        profile: ['read', 'update'],
        schedule: ['read', 'create', 'update', 'delete'],
    },
    nurse: {
        admissions: ['read'],
        beds: ['read', 'update'],
        vital_signs: ['read', 'create', 'update'],
        nursing_notes: ['read', 'create'],
        ot_bookings: ['read'],
        profile: ['read', 'update'],
    },
    patient: {
        profile: ['read', 'update'],
        appointments: ['read', 'create', 'cancel'],
        prescriptions: ['read'],
        bills: ['read'],
        payments: ['read'],
        lab_results: ['read'],
        radiology_results: ['read'],
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                localStorage.setItem('auth_token', token);
                set({ user, token, isAuthenticated: true });
            },
            logout: async () => {
                try {
                    const { token } = get();
                    if (token) {
                        await api.post('/auth/logout').catch(() => {});
                    }
                } finally {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('patient_token');
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },
            hasRole: (role) => {
                const { user } = get();
                if (!user) return false;
                if (Array.isArray(role)) return role.includes(user.role);
                return user.role === role;
            },
            canAccess: (resource, action) => {
                const { user } = get();
                if (!user) return false;
                const perms = ROLE_PERMISSIONS[user.role];
                if (!perms) return false;
                // Super admin has wildcard access
                if (perms['*']) return perms['*'].includes(action) || perms['*'].includes('*');
                const resourcePerms = perms[resource];
                if (!resourcePerms) return false;
                return resourcePerms.includes(action);
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                // Sync token to localStorage on rehydrate for axios interceptor
                if (state?.token) {
                    localStorage.setItem('auth_token', state.token);
                }
            },
        }
    )
);
