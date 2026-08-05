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
        $admissions = Admission::all();
        $creatorId = User::first()?->id;

        if ($admissions->isEmpty()) {
            return;
        }

        $taskTitles = [
            'Medication round & documentation',
            'Check and record vital signs',
            'Change wound dressing & sterilize',
            'Check IV fluid rate & replace bag',
            'Patient hygiene & bed bath care',
            'Physiotherapy mobility assistance',
            'Post-op drainage tube check',
            'Blood glucose monitoring (RBS)',
            'Prepare patient for radiology scan',
            'Administer nebulizer therapy',
            'Catheter care & intake/output record',
            'ECG monitoring check',
            'Administer morning oral doses',
            'Dietary consultation feedback',
            'Night shift patient handoff review',
        ];

        $priorities = ['high', 'medium', 'low', 'high', 'medium'];
        $types = ['medication', 'vitals', 'dressing', 'notes', 'general'];

        for ($i = 0; $i < count($taskTitles); $i++) {
            $adm = $admissions[$i % $admissions->count()];
            NurseTask::create([
                'admission_id' => $adm->id,
                'title' => $taskTitles[$i],
                'description' => 'Clinical nursing task #' . ($i + 1) . ' for patient in bed.',
                'type' => $types[$i % count($types)],
                'priority' => $priorities[$i % count($priorities)],
                'due_at' => now()->addHours($i + 1),
                'created_by' => $creatorId,
            ]);
        }

        $this->command->info(count($taskTitles) . ' nurse tasks seeded successfully!');
    }
}
