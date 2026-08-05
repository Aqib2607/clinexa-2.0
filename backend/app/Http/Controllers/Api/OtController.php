<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OtBooking;
use Illuminate\Http\Request;

class OtController extends Controller
{
    public function indexBookings(Request $request)
    {
        $query = OtBooking::with(['admission.patient', 'surgeon', 'anesthesiologist']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('scheduled_at', $request->date);
        }

        return response()->json($query->get());
    }

    public function storeBooking(Request $request)
    {
        $validated = $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'ot_room' => 'required|string',
            'surgeon_id' => 'required|exists:users,id', // Assuming doctors are users
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'scheduled_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $booking = OtBooking::create($validated);

        return response()->json($booking);
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = OtBooking::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:scheduled,in-progress,completed,cancelled',
        ]);

        $booking->update(['status' => $validated['status']]);

        return response()->json($booking);
    }
}
