<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SmsTemplate;

class SmsTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            ['event_name' => 'appointment_reminder', 'template_body' => 'Dear {name}, your appointment is scheduled for {date} at {time}. Please arrive 15 mins early.', 'variables' => json_encode(['name', 'date', 'time'])],
            ['event_name' => 'report_ready', 'template_body' => 'Dear {name}, your diagnostic lab report is ready. Download link: {link}', 'variables' => json_encode(['name', 'link'])],
            ['event_name' => 'bill_due', 'template_body' => 'Dear {name}, your hospital bill of ${amount} is due for payment. Pay online: {link}', 'variables' => json_encode(['name', 'amount', 'link'])],
            ['event_name' => 'appointment_confirmed', 'template_body' => 'Your appointment with Dr. {doctor} on {date} at {time} has been confirmed.', 'variables' => json_encode(['doctor', 'date', 'time'])],
            ['event_name' => 'prescription_ready', 'template_body' => 'Your prescription is ready for pickup at the main pharmacy.', 'variables' => json_encode([])],
            ['event_name' => 'admission_confirmation', 'template_body' => 'Patient {name} has been admitted to Ward {ward}, Bed {bed}.', 'variables' => json_encode(['name', 'ward', 'bed'])],
            ['event_name' => 'discharge_summary_ready', 'template_body' => 'Discharge summary for {name} is finalized. Please collect from reception.', 'variables' => json_encode(['name'])],
            ['event_name' => 'ot_booking_alert', 'template_body' => 'Operation procedure for {name} scheduled on {date} at {time} in {ot_room}.', 'variables' => json_encode(['name', 'date', 'time', 'ot_room'])],
            ['event_name' => 'payment_received', 'template_body' => 'Payment receipt #{receipt_no} of ${amount} received with thanks.', 'variables' => json_encode(['receipt_no', 'amount'])],
            ['event_name' => 'critical_lab_result_alert', 'template_body' => 'URGENT: Critical lab result recorded for patient {name}. Please check portal immediately.', 'variables' => json_encode(['name'])],
        ];

        foreach ($templates as $template) {
            $template['is_active'] = true;
            SmsTemplate::updateOrCreate(
                ['event_name' => $template['event_name']],
                $template
            );
        }

        $this->command->info(count($templates) . ' SMS templates seeded successfully!');
    }
}
