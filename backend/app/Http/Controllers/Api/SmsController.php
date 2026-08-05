<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmsLog;
use App\Models\SmsTemplate;
use Illuminate\Http\Request;

class SmsController extends Controller
{
    public function sendSms(Request $request)
    {
        $validated = $request->validate([
            'mobile_number' => 'required|string',
            'event_name' => 'required|exists:sms_templates,event_name',
            'variables' => 'nullable|array' // ['name' => 'John', 'link' => '...']
        ]);

        $template = SmsTemplate::where('event_name', $validated['event_name'])->first();
        $message = $template->template_body;

        if (!empty($validated['variables'])) {
            foreach ($validated['variables'] as $key => $value) {
                $message = str_replace("{{$key}}", $value, $message);
            }
        }

        // Simulate Sending
        // In real app: Twilio/AWS SNS call here.
        $status = 'sent'; // Simulating success

        $log = SmsLog::create([
            'mobile_number' => $validated['mobile_number'],
            'message_body' => $message,
            'event_name' => $validated['event_name'],
            'status' => $status,
            'provider_response' => 'Message queued successfully (SIMULATED)'
        ]);

        return response()->json(['message' => 'SMS Sent', 'log' => $log]);
    }

    public function getLogs()
    {
        return response()->json(SmsLog::latest()->limit(50)->get());
    }
}
