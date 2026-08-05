import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface Prescription {
    id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis: string;
    medications: Medication[] | string;
    notes?: string;
    follow_up_date?: string;
    created_at: string;
    patient?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreatePrescriptionData {
    patient_id: string;
    diagnosis: string;
    medications: Medication[];
    notes?: string;
    follow_up_date?: string;
}

/**
 * Hook to fetch doctor's prescriptions
 */
export function usePrescriptions(patientId?: string) {
    return useQuery({
        queryKey: ['doctor-prescriptions', patientId],
        queryFn: async () => {
            const params = patientId ? `?patient_id=${patientId}` : '';
            const response = await api.get(`/doctor/prescriptions${params}`);
            return response.data;
        },
    });
}

/**
 * Hook to create a new prescription
 */
export function useCreatePrescription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePrescriptionData) => {
            const response = await api.post('/doctor/prescriptions', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
        },
    });
}

/**
 * Hook to update a prescription
 */
export function useUpdatePrescription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePrescriptionData> }) => {
            const response = await api.put(`/doctor/prescriptions/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
        },
    });
}

/**
 * Hook to delete a prescription
 */
export function useDeletePrescription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/doctor/prescriptions/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });
        },
    });
}
