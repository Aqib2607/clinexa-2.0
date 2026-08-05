import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DoctorScheduleRule {
    id: string;
    doctor_id: string;
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    start_time: string;
    end_time: string;
    is_available: boolean;
    slot_duration: number; // minutes
    notes?: string;
}

export interface CreateScheduleData {
    schedules: {
        day_of_week: string;
        start_time: string;
        end_time: string;
        is_available?: boolean;
        slot_duration?: number;
        notes?: string;
    }[];
}

export interface BlockSlotData {
    day_of_week: string;
    start_time: string;
    end_time: string;
    notes?: string;
}

/**
 * Hook to fetch doctor's schedule rules
 */
export function useDoctorSchedule() {
    return useQuery({
        queryKey: ['doctor-schedule'],
        queryFn: async () => {
            const response = await api.get('/doctor/schedule');
            return response.data;
        },
    });
}

/**
 * Hook to update doctor's schedule (replace all)
 */
export function useUpdateDoctorSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateScheduleData) => {
            const response = await api.post('/doctor/schedule', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
        },
    });
}

/**
 * Hook to block a time slot (create a recurring block)
 */
export function useBlockTimeSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: BlockSlotData) => {
            const response = await api.post('/doctor/schedule/block', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
        },
    });
}
