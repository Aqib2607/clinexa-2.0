import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PatientNote {
    id: string;
    patient_id: string;
    doctor_id: string;
    visit_date: string;
    chief_complaint?: string;
    symptoms?: string;
    diagnosis?: string;
    treatment_plan?: string;
    notes?: string;
    follow_up_instructions?: string;
    next_visit_date?: string;
    created_at: string;
}

export interface CreatePatientNoteData {
    visit_date: string;
    chief_complaint?: string;
    symptoms?: string;
    diagnosis?: string;
    treatment_plan?: string;
    notes?: string;
    follow_up_instructions?: string;
    next_visit_date?: string;
}

/**
 * Hook to fetch patient notes
 */
export function usePatientNotes(patientId: string) {
    return useQuery({
        queryKey: ['patient-notes', patientId],
        queryFn: async () => {
            const response = await api.get(`/doctor/patients/${patientId}/notes`);
            return response.data;
        },
        enabled: !!patientId,
    });
}

/**
 * Hook to create a patient note
 */
export function useCreatePatientNote(patientId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePatientNoteData) => {
            const response = await api.post(`/doctor/patients/${patientId}/notes`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
        },
    });
}

/**
 * Hook to update a patient note
 */
export function useUpdatePatientNote(patientId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, data }: { noteId: string; data: Partial<CreatePatientNoteData> }) => {
            const response = await api.put(`/doctor/patients/${patientId}/notes/${noteId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
        },
    });
}

/**
 * Hook to fetch doctor's patients
 */
export function useDoctorPatients(search?: string) {
    return useQuery({
        queryKey: ['doctor-patients', search],
        queryFn: async () => {
            const params = search ? `?search=${search}` : '';
            const response = await api.get(`/doctor/patients${params}`);
            return response.data;
        },
    });
}
