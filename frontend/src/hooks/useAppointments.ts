import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: number;
    reason: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    patient?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
}

export interface CreateAppointmentData {
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    duration?: number;
    reason: string;
    notes?: string;
    status?: string;
}

/**
 * Hook to fetch doctor's appointments
 */
export function useAppointments(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    patient_id?: string;
}) {
    return useQuery({
        queryKey: ['doctor-appointments', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.date_from) params.append('date_from', filters.date_from);
            if (filters?.date_to) params.append('date_to', filters.date_to);
            if (filters?.patient_id) params.append('patient_id', filters.patient_id);

            const response = await api.get(`/doctor/appointments?${params.toString()}`);
            return response.data;
        },
    });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateAppointmentData) => {
            const response = await api.post('/doctor/appointments', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
        },
    });
}

/**
 * Hook to update an appointment
 */
export function useUpdateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAppointmentData> }) => {
            const response = await api.put(`/doctor/appointments/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
        },
    });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/doctor/appointments/${id}/cancel`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
        },
    });
}
