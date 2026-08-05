<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppointmentSlot;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AppointmentSlotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AppointmentSlot::query();

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('date', [$request->date_from, $request->date_to]);
        }

        return response()->json($query->orderBy('date')->orderBy('start_time')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Manual single slot creation
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'capacity' => 'integer|min:1',
        ]);

        $slot = AppointmentSlot::create($validated);
        return response()->json($slot, 201);
    }

    /**
     * Generate slots for a range of dates.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'duration_minutes' => 'required|integer|min:5|max:120',
            'break_start' => 'nullable|date_format:H:i',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $startTime = Carbon::createFromFormat('H:i', $validated['start_time']);
        $endTime = Carbon::createFromFormat('H:i', $validated['end_time']);
        $duration = $validated['duration_minutes'];

        $createdSlots = 0;

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            $currentSlotStart = $date->copy()->setTimeFrom($startTime);
            $dayEndTime = $date->copy()->setTimeFrom($endTime);

            while ($currentSlotStart->lt($dayEndTime)) {
                $currentSlotEnd = $currentSlotStart->copy()->addMinutes($duration);

                if ($currentSlotEnd->gt($dayEndTime)) {
                    break;
                }

                // Check for break
                if (isset($validated['break_start']) && isset($validated['break_end'])) {
                    $breakStart = $date->copy()->setTimeFrom(Carbon::createFromFormat('H:i', $validated['break_start']));
                    $breakEnd = $date->copy()->setTimeFrom(Carbon::createFromFormat('H:i', $validated['break_end']));

                    // If slot overlaps with break, skip
                    if ($currentSlotStart->lt($breakEnd) && $currentSlotEnd->gt($breakStart)) {
                        $currentSlotStart->addMinutes($duration);
                        continue;
                    }
                }

                // Check overlap with existing slots
                $exists = AppointmentSlot::where('doctor_id', $validated['doctor_id'])
                    ->where('date', $date->format('Y-m-d'))
                    ->where('start_time', $currentSlotStart->format('H:i:s'))
                    ->exists();

                if (!$exists) {
                    AppointmentSlot::create([
                        'doctor_id' => $validated['doctor_id'],
                        'date' => $date->format('Y-m-d'),
                        'day_of_week' => $date->format('l'),
                        'start_time' => $currentSlotStart->format('H:i:s'),
                        'end_time' => $currentSlotEnd->format('H:i:s'),
                        'status' => 'available',
                    ]);
                    $createdSlots++;
                }

                $currentSlotStart->addMinutes($duration);
            }
        }

        return response()->json(['message' => "$createdSlots slots generated successfully."]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(AppointmentSlot::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $slot = AppointmentSlot::findOrFail($id);
        $slot->update($request->all());
        return response()->json($slot);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        AppointmentSlot::destroy($id);
        return response()->json(['message' => 'Slot deleted successfully']);
    }
}
