<?php

namespace App\Services;

use App\Mail\DailySummaryMail;
use App\Models\EmailLog;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailNotificationService
{
    /**
     * Send a daily summary email
     */
    public function sendDailySummary(string $recipientEmail, array $data): bool
    {
        // Check if email alerts are enabled
        if (!$this->isEmailAlertsEnabled()) {
            return false;
        }

        try {
            // Add recipient to data for template
            $data['recipient_email'] = $recipientEmail;

            // Create email log entry
            $log = EmailLog::create([
                'recipient_email' => $recipientEmail,
                'subject' => 'Daily Hospital Summary - ' . now()->format('M d, Y'),
                'body' => json_encode($data),
                'event_name' => 'daily_summary',
                'status' => 'pending'
            ]);

            // Send the email
            Mail::to($recipientEmail)->send(new DailySummaryMail($data));

            // Update log status
            $log->update([
                'status' => 'sent',
                'sent_at' => now()
            ]);

            return true;
        } catch (\Exception $e) {
            // Update log with error
            if (isset($log)) {
                $log->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()
                ]);
            }

            Log::error('Failed to send daily summary email', [
                'recipient' => $recipientEmail,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Check if email alerts are enabled in settings
     */
    private function isEmailAlertsEnabled(): bool
    {
        $setting = Setting::where('key', 'enable_email_alerts')->first();
        return $setting && ($setting->value === '1' || $setting->value === true);
    }
}
