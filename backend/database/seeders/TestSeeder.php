<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Test;
use App\Models\TestPanel;
use App\Models\SpecimenSample;
use App\Models\RadiologyTemplate;
use Illuminate\Support\Facades\Schema;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Test::truncate();
        TestPanel::truncate();
        SpecimenSample::truncate();
        RadiologyTemplate::truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Test Panels (10 panels)
        $panels = [
            ['name' => 'Complete Hematology Panel', 'code' => 'PNL-HEM'],
            ['name' => 'Routine Biochemistry Panel', 'code' => 'PNL-BIO'],
            ['name' => 'Liver & Biliary Panel', 'code' => 'PNL-LIVER'],
            ['name' => 'Renal Function Panel', 'code' => 'PNL-RENAL'],
            ['name' => 'Comprehensive Lipid Panel', 'code' => 'PNL-LIPID'],
            ['name' => 'Thyroid Hormone Profile', 'code' => 'PNL-THYROID'],
            ['name' => 'Cardiac Marker Panel', 'code' => 'PNL-CARDIAC'],
            ['name' => 'Electrolyte & Mineral Panel', 'code' => 'PNL-ELEC'],
            ['name' => 'Diabetes Screening Panel', 'code' => 'PNL-DIAB'],
            ['name' => 'Urine Complete Examination Panel', 'code' => 'PNL-URINE'],
        ];

        $panelIds = [];
        foreach ($panels as $p) {
            $panel = TestPanel::create([
                'name' => $p['name'],
                'code' => $p['code'],
                'description' => 'Comprehensive clinical test panel',
            ]);
            $panelIds[] = $panel->id;
        }

        // 2. Specimen Samples (10 specimen samples)
        $samples = [
            ['name' => 'Whole Blood (EDTA)', 'code' => 'SMP-EDTA'],
            ['name' => 'Serum (SST Tube)', 'code' => 'SMP-SERUM'],
            ['name' => 'Plasma (Sodium Heparin)', 'code' => 'SMP-HEP'],
            ['name' => 'Midstream Urine', 'code' => 'SMP-URINE'],
            ['name' => 'Cerebrospinal Fluid (CSF)', 'code' => 'SMP-CSF'],
            ['name' => 'Pleural Fluid', 'code' => 'SMP-PLEU'],
            ['name' => 'Sputum Specimen', 'code' => 'SMP-SPUT'],
            ['name' => 'Stool Specimen', 'code' => 'SMP-STOOL'],
            ['name' => 'Nasopharyngeal Swab', 'code' => 'SMP-SWAB'],
            ['name' => 'Synovial Joint Fluid', 'code' => 'SMP-SYNO'],
        ];

        foreach ($samples as $s) {
            SpecimenSample::create([
                'name' => $s['name'],
                'description' => 'Specimen collection type: ' . $s['code'],
            ]);
        }

        // 3. Tests (15 tests)
        $tests = [
            ['code' => 'CBC', 'name' => 'Complete Blood Count (CBC)', 'method' => 'Automated Counter', 'price' => 350.00],
            ['code' => 'FBS', 'name' => 'Fasting Blood Sugar', 'method' => 'Hexokinase', 'price' => 150.00],
            ['code' => 'PPBS', 'name' => 'Post Prandial Blood Sugar', 'method' => 'Hexokinase', 'price' => 150.00],
            ['code' => 'HBA1C', 'name' => 'Glycated Hemoglobin (HbA1c)', 'method' => 'HPLC', 'price' => 550.00],
            ['code' => 'LIPID', 'name' => 'Lipid Profile Panel', 'method' => 'Enzymatic', 'price' => 600.00],
            ['code' => 'TFT', 'name' => 'Thyroid Function Test (T3/T4/TSH)', 'method' => 'CLIA', 'price' => 700.00],
            ['code' => 'LFT', 'name' => 'Liver Function Test', 'method' => 'Spectrophotometry', 'price' => 750.00],
            ['code' => 'KFT', 'name' => 'Kidney Function Test', 'method' => 'Enzymatic', 'price' => 700.00],
            ['code' => 'TROP-I', 'name' => 'Troponin I Quantitative', 'method' => 'ECLIA', 'price' => 950.00],
            ['code' => 'ELECS', 'name' => 'Serum Electrolytes (Na/K/Cl)', 'method' => 'ISE', 'price' => 450.00],
            ['code' => 'URINE-RE', 'name' => 'Urine Routine & Microscopy', 'method' => 'Strip & Microscopy', 'price' => 200.00],
            ['code' => 'CRP', 'name' => 'C-Reactive Protein (CRP)', 'method' => 'Turbidimetry', 'price' => 400.00],
            ['code' => 'ESR', 'name' => 'Erythrocyte Sedimentation Rate', 'method' => 'Westergren', 'price' => 120.00],
            ['code' => 'VIT-D', 'name' => 'Vitamin D (25-OH)', 'method' => 'CLIA', 'price' => 1200.00],
            ['code' => 'VIT-B12', 'name' => 'Vitamin B12 Assay', 'method' => 'CLIA', 'price' => 900.00],
        ];

        foreach ($tests as $idx => $tData) {
            $price = $tData['price'];
            unset($tData['price']);
            $tData['price'] = $price;
            $tData['is_active'] = true;
            $tData['test_panel_id'] = $panelIds[$idx % count($panelIds)];

            Test::create($tData);
        }

        // 4. Radiology Templates (10 radiology templates)
        $radTemplates = [
            ['title' => 'Chest X-Ray PA View Normal Template', 'body' => 'Lungs are clear bilaterally. Heart size normal. Costophrenic angles clear.'],
            ['title' => 'Abdomen Ultrasound Normal Template', 'body' => 'Liver is normal size and echotexture. Gallbladder normal without calculus.'],
            ['title' => 'Brain CT Scan Normal Template', 'body' => 'No acute intracranial hemorrhage or territorial infarction. Ventricles normal.'],
            ['title' => 'Lumbar Spine MRI Template', 'body' => 'Vertebral body height and alignment preserved. Intervertebral discs intact.'],
            ['title' => 'Knee Joint X-Ray Template', 'body' => 'Joint space preserved. No cortical fracture or dislocation identified.'],
            ['title' => 'Pelvis & Hip X-Ray Template', 'body' => 'Bony pelvis unremarkable. Both hip joints appear normal.'],
            ['title' => 'Renal Ultrasound Template', 'body' => 'Both kidneys normal in size, shape and echogenicity. No hydronephrosis.'],
            ['title' => 'Thyroid Ultrasound Template', 'body' => 'Thyroid gland normal volume. No focal nodular lesions or calcifications.'],
            ['title' => 'Echocardiogram 2D Normal Template', 'body' => 'Normal LV systolic function. LVEF 60-65%. No valvular regurgitation.'],
            ['title' => 'Mammogram Screening Normal Template', 'body' => 'BI-RADS Category 1: Negative. No suspicious masses or microcalcifications.'],
        ];

        foreach ($radTemplates as $rt) {
            RadiologyTemplate::create([
                'name' => $rt['title'],
                'content' => $rt['body'],
                'modality' => 'X-Ray',
                'is_active' => true,
            ]);
        }

        $this->command->info('Tests, panels, specimen samples, and radiology templates seeded successfully!');
    }
}
