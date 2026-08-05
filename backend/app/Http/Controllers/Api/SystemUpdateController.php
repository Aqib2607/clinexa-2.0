<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\SystemUpdate;
use Illuminate\Http\Request;

class SystemUpdateController extends Controller
{
    /**
     * Display a listing of active system updates
     */
    public function index()
    {
        // Check if system updates are enabled
        if (!$this->isSystemUpdatesEnabled()) {
            return response()->json([]);
        }

        $updates = SystemUpdate::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($updates);
    }

    /**
     * Store a newly created system update
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:maintenance,feature,alert',
            'is_active' => 'boolean',
            'scheduled_at' => 'nullable|date'
        ]);

        $validated['created_by'] = $request->user()->id ?? null;

        $update = SystemUpdate::create($validated);

        return response()->json([
            'message' => 'System update created successfully',
            'update' => $update
        ], 201);
    }

    /**
     * Update the specified system update
     */
    public function update(Request $request, string $id)
    {
        $update = SystemUpdate::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'type' => 'sometimes|in:maintenance,feature,alert',
            'is_active' => 'sometimes|boolean',
            'scheduled_at' => 'nullable|date'
        ]);

        $update->update($validated);

        return response()->json([
            'message' => 'System update updated successfully',
            'update' => $update
        ]);
    }

    /**
     * Remove the specified system update
     */
    public function destroy(string $id)
    {
        $update = SystemUpdate::findOrFail($id);
        $update->delete();

        return response()->json([
            'message' => 'System update deleted successfully'
        ]);
    }

    /**
     * Check if system updates are enabled in settings
     */
    private function isSystemUpdatesEnabled(): bool
    {
        $setting = Setting::where('key', 'enable_system_updates')->first();
        return $setting && ($setting->value === '1' || $setting->value === true);
    }
}
