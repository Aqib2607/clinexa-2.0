import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AppointmentSlot {
    id: string;
    doctor_id: string;
    date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    capacity: number;
    booked_count: number;
    status: 'available' | 'booked' | 'blocked';
}

export interface FetchSlotsParams {
    doctor_id: string;
    date_from?: string;
    date_to?: string;
    date?: string;
}

export interface GenerateSlotsData {
    doctor_id: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    break_start?: string;
    break_end?: string;
}

export interface ReplaceScheduleData {
    schedules: {
        day_of_week: string;
        start_time: string;
        end_time: string;
        is_available: boolean;
        slot_duration: number;
    }[];
    week_start: string;  // YYYY-MM-DD format
    week_end: string;    // YYYY-MM-DD format
}

/**
 * Hook to fetch appointment slots with filters
 */
export function useAppointmentSlots(params: FetchSlotsParams, enabled = true) {
    return useQuery({
        queryKey: ['appointment-slots', params],
        queryFn: async () => {
            const response = await api.get('/slots', { params });
            return response.data as AppointmentSlot[];
        },
        enabled,
    });
}

/**
 * Hook to generate appointment slots
 */
export function useGenerateSlots() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: GenerateSlotsData) => {
            const response = await api.post('/slots/generate', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointment-slots'] });
        },
    });
}

/**
 * Hook to delete a slot (only available slots can be deleted)
 */
export function useDeleteSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slotId: string) => {
            const response = await api.delete(`/doctor/slots/${slotId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointment-slots'] });
        },
    });
}

/**
 * Hook to replace doctor's entire schedule and regenerate slots
 */
export function useReplaceSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ReplaceScheduleData) => {
            const response = await api.post('/doctor/schedule/replace-slots', data);
            return response.data;
        },
        onSuccess: async () => {
            // Invalidate and refetch to ensure UI is updated with new slots
            await queryClient.invalidateQueries({ queryKey: ['appointment-slots'] });
            await queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
        },
    });
}
