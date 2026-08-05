<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Doctor::with('department', 'user');

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('specialization')) {
            $query->where('specialization', 'like', '%' . $request->specialization . '%');
        }

        $perPage = $request->get('per_page', 15);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'specialization' => 'required|string|max:255',
            'license_number' => 'nullable|string|max:50|unique:doctors',
            'qualification' => 'nullable|string',
            'consultation_fee' => 'required|numeric|min:0',
            'experience_years' => 'integer|min:0',
        ]);

        $doctor = Doctor::create($validated);
        return response()->json($doctor, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $doctor = Doctor::with('department', 'user', 'appointmentSlots')->findOrFail($id);
        return response()->json($doctor);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $doctor = Doctor::findOrFail($id);

        $validated = $request->validate([
            'department_id' => 'exists:departments,id',
            'specialization' => 'string|max:255',
            'license_number' => ['nullable', 'string', 'max:50', Rule::unique('doctors')->ignore($doctor->id)],
            'qualification' => 'nullable|string',
            'consultation_fee' => 'numeric|min:0',
            'experience_years' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $doctor->update($validated);
        return response()->json($doctor);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->delete();
        return response()->json(['message' => 'Doctor deleted successfully']);
    }
}
