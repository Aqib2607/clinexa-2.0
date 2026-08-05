<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SmsTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'event_name' => 'appointment_reminder',
                'template_body' => 'Dear {name}, your appointment is scheduled for {date} at {time}. Please arrive 15 minutes early.',
                'variables' => json_encode(['name', 'date', 'time']),
                'is_active' => true
            ],
            [
                'event_name' => 'report_ready',
                'template_body' => 'Your lab report is ready. Download it here: {link}',
                'variables' => json_encode(['link']),
                'is_active' => true
            ],
            [
                'event_name' => 'bill_due',
                'template_body' => 'Your bill of ${amount} is due. Pay now: {link}',
                'variables' => json_encode(['amount', 'link']),
                'is_active' => true
            ],
            [
                'event_name' => 'appointment_confirmed',
                'template_body' => 'Your appointment with Dr. {doctor} on {date} at {time} has been confirmed.',
                'variables' => json_encode(['doctor', 'date', 'time']),
                'is_active' => true
            ],
            [
                'event_name' => 'prescription_ready',
                'template_body' => 'Your prescription is ready for pickup at the pharmacy.',
                'variables' => json_encode([]),
                'is_active' => true
            ]
        ];

        foreach ($templates as $template) {
            \App\Models\SmsTemplate::updateOrCreate(
                ['event_name' => $template['event_name']],
                $template
            );
        }
    }
}
