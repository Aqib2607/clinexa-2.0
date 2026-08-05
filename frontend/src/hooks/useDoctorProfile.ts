import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export interface DoctorProfile {
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: string;
    };
    doctor: {
        id: number;
        specialization: string;
        license_number: string;
        bio: string | null;
        experience_years: number;
        consultation_fee: string;
    };
}

export interface UpdateProfileData {
    first_name: string;
    last_name: string;
    phone: string;
    specialization: string;
    license_number: string;
    bio: string;
}

export function useDoctorProfile() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['doctor-profile'],
        queryFn: async () => {
            const response = await api.get('/doctor/profile');
            return response.data as DoctorProfile;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            const response = await api.post('/doctor/profile', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast({
                title: "Profile updated",
                description: "Your changes have been saved successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        ...query,
        updateMutation,
    };
}
