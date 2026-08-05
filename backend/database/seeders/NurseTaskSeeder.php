<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admission;
use App\Models\NurseTask;
use App\Models\User;

class NurseTaskSeeder extends Seeder
{
    public function run(): void
    {
        $admissions = Admission::with(['patient', 'bed.ward'])->where('status', 'admitted')->get();
        $creatorId = User::first()?->id; // fallback to first user

        foreach ($admissions as $admission) {
            NurseTask::firstOrCreate(
                [
                    'admission_id' => $admission->id,
                    'title' => 'Check nursing notes',
                ],
                [
                    'description' => 'Review and update nursing notes for ' . ($admission->patient?->name ?? 'patient'),
                    'type' => 'notes',
                    'priority' => 'medium',
                    'due_at' => now()->addHours(2),
                    'created_by' => $creatorId,
                ]
            );

            NurseTask::firstOrCreate(
                [
                    'admission_id' => $admission->id,
                    'title' => 'Medication round',
                ],
                [
                    'description' => 'Administer scheduled meds and document.',
                    'type' => 'medication',
                    'priority' => 'high',
                    'due_at' => now()->addHour(),
                    'created_by' => $creatorId,
                ]
            );
        }
    }
}
