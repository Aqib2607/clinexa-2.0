<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class DoctorAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->role === 'doctor';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // For updates (PUT/PATCH), make fields optional
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'patient_id' => $isUpdate ? 'sometimes|exists:users,id' : 'required|exists:users,id',
            'appointment_date' => $isUpdate ? 'sometimes|date|after_or_equal:today' : 'required|date|after_or_equal:today',
            'appointment_time' => $isUpdate ? 'sometimes|date_format:H:i' : 'required|date_format:H:i',
            'duration' => 'nullable|integer|min:15|max:120',
            'reason' => $isUpdate ? 'sometimes|string|max:500' : 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:pending,confirmed,completed,cancelled,no_show',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'patient_id.required' => 'Please select a patient.',
            'patient_id.exists' => 'The selected patient does not exist.',
            'appointment_date.required' => 'Appointment date is required.',
            'appointment_date.after_or_equal' => 'Appointment date must be today or in the future.',
            'appointment_time.required' => 'Appointment time is required.',
            'reason.required' => 'Please provide a reason for the appointment.',
        ];
    }
}
