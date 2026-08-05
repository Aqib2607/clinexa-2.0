
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from './useAuth';
import api from '@/lib/api';

export function useUser() {
    const { token, login, logout, isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            if (!token) throw new Error('No token found');

            try {
                const response = await api.get('/user');
                const user = response.data;
                // Update global store with fresh user data
                login(user, token);
                return user;
            } catch (error: any) {
                // If 401 Unauthorized, clear invalid token
                if (error?.response?.status === 401) {
                    await logout();
                    throw new Error('Session expired. Please log in again.');
                }
                throw error;
            }
        },
        enabled: !!token && isAuthenticated,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
