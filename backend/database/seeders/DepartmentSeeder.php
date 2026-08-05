<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Cardiology',
                'code' => 'CARD',
                'description' => 'Heart and cardiovascular system',
                'overview' => 'Our Cardiology department provides comprehensive cardiac care with state-of-the-art facilities and experienced cardiologists. We specialize in diagnosis, treatment, and prevention of heart diseases using the latest medical technology and evidence-based practices.',
                'services' => json_encode(['Angiography', 'Angioplasty', 'Pacemaker Implantation', 'ECG', 'Echocardiography', 'Stress Testing', 'Cardiac Rehabilitation', 'Heart Failure Management', 'Arrhythmia Treatment']),
                'facilities' => json_encode(['24/7 Emergency Cardiac Care', 'Advanced Cath Lab', 'Non-invasive Cardiology Lab', 'Cardiac ICU', 'Cardiac Rehabilitation Center']),
                'image_url' => 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Coronary Artery Disease', 'Heart Attack', 'Heart Failure', 'Arrhythmias', 'Valvular Heart Disease', 'Hypertension', 'Congenital Heart Defects']),
                'technologies' => json_encode(['Digital Angiography', '3D Echocardiography', 'Cardiac MRI', 'CT Angiography', 'Holter Monitoring', 'Treadmill Test']),
                'why_choose_us' => 'Our cardiology team comprises highly experienced interventional cardiologists with expertise in complex procedures. We offer 24/7 emergency cardiac care with rapid response times and state-of-the-art equipment for accurate diagnosis and treatment.'
            ],
            [
                'name' => 'Neurology',
                'code' => 'NEUR',
                'description' => 'Nervous system',
                'overview' => 'The Neurology department offers expert care for disorders of the brain, spinal cord, and nervous system. Our team uses advanced diagnostic tools and treatment methods to provide comprehensive neurological care.',
                'services' => json_encode(['Stroke Management', 'Epilepsy Treatment', 'Movement Disorder Care', 'Headache Clinic', 'EEG', 'EMG/NCV Studies', 'Neuroimaging', 'Memory Clinic', 'Neuro-rehabilitation']),
                'facilities' => json_encode(['Neuro ICU', 'Advanced MRI & CT', 'EEG Lab', 'Stroke Unit', 'Neuro-rehabilitation Center']),
                'image_url' => 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Stroke', 'Epilepsy', 'Parkinson\'s Disease', 'Multiple Sclerosis', 'Migraine', 'Alzheimer\'s Disease', 'Neuropathy', 'Brain Tumors']),
                'technologies' => json_encode(['3T MRI', 'CT Perfusion', 'Video EEG', 'Nerve Conduction Studies', 'Transcranial Doppler', 'Digital Subtraction Angiography']),
                'why_choose_us' => 'We have a dedicated stroke unit with thrombolysis facilities and round-the-clock neurologist availability. Our advanced neuroimaging and electrophysiology labs ensure accurate diagnosis and personalized treatment plans.'
            ],
            [
                'name' => 'Orthopedics',
                'code' => 'ORTH',
                'description' => 'Bones and muscles',
                'overview' => 'Our Orthopedics department provides comprehensive care for musculoskeletal conditions, from sports injuries to joint replacements. We combine surgical excellence with advanced rehabilitation services.',
                'services' => json_encode(['Joint Replacement Surgery', 'Arthroscopy', 'Spine Surgery', 'Sports Medicine', 'Trauma Care', 'Fracture Management', 'Physiotherapy', 'Pediatric Orthopedics', 'Hand Surgery']),
                'facilities' => json_encode(['Modern Operation Theaters', 'Digital X-ray', 'Physiotherapy Center', 'Sports Medicine Clinic', 'Arthroscopy Suite']),
                'image_url' => 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Arthritis', 'Sports Injuries', 'Fractures', 'Spinal Disorders', 'Joint Pain', 'Ligament Tears', 'Bone Tumors', 'Osteoporosis']),
                'technologies' => json_encode(['Computer-Assisted Surgery', 'Minimally Invasive Techniques', 'Arthroscopic Equipment', 'Digital Imaging', 'Bone Density Scanner']),
                'why_choose_us' => 'Our orthopedic surgeons are trained in the latest minimally invasive techniques and joint replacement procedures. We offer comprehensive rehabilitation programs to ensure optimal recovery and return to normal activities.'
            ],
            [
                'name' => 'Pediatrics',
                'code' => 'PED',
                'description' => 'Medical care of infants, children, and adolescents',
                'overview' => 'Our Pediatrics department provides specialized healthcare for children from birth through adolescence with compassionate and family-centered care. We focus on preventive care, early diagnosis, and comprehensive treatment.',
                'services' => json_encode(['Neonatal Care', 'Vaccination', 'Growth Monitoring', 'Pediatric Emergency', 'Child Development Assessment', 'Pediatric Surgery', 'Adolescent Medicine', 'Pediatric Nutrition']),
                'facilities' => json_encode(['NICU', 'Pediatric ICU', 'Vaccination Center', 'Child-friendly Environment', 'Play Therapy Room']),
                'image_url' => 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Childhood Infections', 'Asthma', 'Allergies', 'Growth Disorders', 'Developmental Delays', 'Childhood Obesity', 'Congenital Disorders']),
                'technologies' => json_encode(['Neonatal Ventilators', 'Phototherapy Units', 'Pediatric Monitors', 'Nebulizers', 'Growth Assessment Tools']),
                'why_choose_us' => 'Our pediatricians are specially trained in child healthcare with a child-friendly approach. We provide comprehensive care from newborn to adolescence with 24/7 pediatric emergency services and advanced NICU facilities.'
            ],
            [
                'name' => 'Gynecology',
                'code' => 'GYN',
                'description' => 'Female reproductive system',
                'overview' => 'The Gynecology department offers comprehensive women\'s health services including obstetrics, gynecological care, and fertility treatments. We provide personalized care throughout all stages of a woman\'s life.',
                'services' => json_encode(['Prenatal Care', 'High-Risk Pregnancy Management', 'Normal & C-Section Delivery', 'Infertility Treatment', 'Laparoscopic Surgery', 'Menopause Management', 'Gynecological Cancer Screening', 'Family Planning']),
                'facilities' => json_encode(['Modern Labor Rooms', 'NICU', 'Ultrasound', 'IVF Center', 'Well-equipped OT']),
                'image_url' => 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Pregnancy Complications', 'PCOS', 'Endometriosis', 'Fibroids', 'Infertility', 'Menstrual Disorders', 'Gynecological Cancers']),
                'technologies' => json_encode(['4D Ultrasound', 'Laparoscopic Equipment', 'Fetal Monitoring', 'IVF Technology', 'Colposcopy']),
                'why_choose_us' => 'We offer comprehensive maternity care with experienced obstetricians and modern labor facilities. Our IVF center has high success rates, and we provide personalized care for all gynecological conditions.'
            ],
            [
                'name' => 'Dermatology',
                'code' => 'DERM',
                'description' => 'Skin, hair, and nails',
                'overview' => 'Our Dermatology department provides expert care for all skin, hair, and nail conditions with both medical and cosmetic treatments. We use advanced technology for diagnosis and treatment.',
                'services' => json_encode(['Acne Treatment', 'Hair Loss Treatment', 'Skin Allergy Management', 'Cosmetic Procedures', 'Laser Treatments', 'Chemical Peels', 'Vitiligo Treatment', 'Psoriasis Care']),
                'facilities' => json_encode(['Dermatology OPD', 'Laser Center', 'Cosmetic Clinic', 'Skin Biopsy Lab', 'Phototherapy Unit']),
                'image_url' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Acne', 'Eczema', 'Psoriasis', 'Hair Loss', 'Vitiligo', 'Skin Cancer', 'Fungal Infections', 'Aging Skin']),
                'technologies' => json_encode(['CO2 Laser', 'Q-Switched Laser', 'Dermoscopy', 'Phototherapy', 'Cryotherapy', 'Microdermabrasion']),
                'why_choose_us' => 'Our dermatologists combine medical expertise with aesthetic skills to provide comprehensive skin care. We offer the latest laser treatments and cosmetic procedures with proven results.'
            ],
            [
                'name' => 'General Medicine',
                'code' => 'GENM',
                'description' => 'Adult diseases',
                'overview' => 'The General Medicine department provides comprehensive primary care and management of acute and chronic medical conditions. We focus on preventive care and holistic treatment approaches.',
                'services' => json_encode(['Diabetes Management', 'Hypertension Care', 'Infectious Disease Treatment', 'Preventive Health Check-ups', 'Chronic Disease Management', 'Thyroid Disorders', 'Respiratory Care']),
                'facilities' => json_encode(['General OPD', 'Medical ICU', 'Diagnostic Lab', 'Health Screening Center', 'Day Care Unit']),
                'image_url' => 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Diabetes', 'Hypertension', 'Thyroid Disorders', 'Respiratory Infections', 'Fever', 'Gastric Problems', 'Kidney Disease', 'Liver Disease']),
                'technologies' => json_encode(['Point-of-Care Testing', 'ECG', 'Spirometry', 'Blood Gas Analyzer', 'Continuous Glucose Monitoring']),
                'why_choose_us' => 'Our general physicians provide comprehensive care for all medical conditions with a patient-centered approach. We offer preventive health programs and chronic disease management with regular follow-ups.'
            ],
            [
                'name' => 'ENT',
                'code' => 'ENT',
                'description' => 'Ear, Nose, and Throat',
                'overview' => 'Our ENT department specializes in the diagnosis and treatment of disorders related to ear, nose, throat, head, and neck. We offer both medical and surgical treatments.',
                'services' => json_encode(['Hearing Tests', 'Endoscopic Sinus Surgery', 'Tonsillectomy', 'Voice Therapy', 'Sleep Apnea Treatment', 'Head & Neck Surgery', 'Cochlear Implants', 'Vertigo Management']),
                'facilities' => json_encode(['ENT OPD', 'Audiometry Lab', 'Endoscopy Suite', 'Minor OT', 'Speech Therapy Center']),
                'image_url' => 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Hearing Loss', 'Sinusitis', 'Tonsillitis', 'Voice Disorders', 'Sleep Apnea', 'Vertigo', 'Nasal Polyps', 'Throat Cancer']),
                'technologies' => json_encode(['Endoscopic Equipment', 'Audiometry', 'Tympanometry', 'Microscopic Surgery', 'Laser Surgery']),
                'why_choose_us' => 'We offer advanced endoscopic procedures for sinus and throat conditions with minimal invasiveness. Our audiometry lab provides comprehensive hearing assessments and hearing aid services.'
            ],
            [
                'name' => 'Opthalmology',
                'code' => 'OPHT',
                'description' => 'Eye disorders',
                'overview' => 'The Ophthalmology department offers comprehensive eye care services from routine check-ups to advanced surgical procedures. We use cutting-edge technology for diagnosis and treatment.',
                'services' => json_encode(['Cataract Surgery', 'LASIK', 'Retina Treatment', 'Glaucoma Management', 'Pediatric Eye Care', 'Corneal Transplant', 'Diabetic Retinopathy', 'Squint Correction']),
                'facilities' => json_encode(['Eye OPD', 'Operation Theater', 'Optical Shop', 'Vision Testing Center', 'Retina Clinic']),
                'image_url' => 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Cataract', 'Glaucoma', 'Retinal Disorders', 'Refractive Errors', 'Dry Eyes', 'Corneal Diseases', 'Diabetic Eye Disease']),
                'technologies' => json_encode(['Phacoemulsification', 'Excimer Laser', 'OCT', 'Fundus Camera', 'Auto Refractometer', 'Slit Lamp']),
                'why_choose_us' => 'We perform bladeless cataract surgeries with premium IOLs and offer LASIK with the latest technology. Our retina specialists handle complex cases with advanced imaging and treatment options.'
            ],
            [
                'name' => 'Psychiatry',
                'code' => 'PSY',
                'description' => 'Mental health',
                'overview' => 'Our Psychiatry department provides compassionate mental health care with a focus on diagnosis, treatment, and rehabilitation. We offer a holistic approach to mental wellness.',
                'services' => json_encode(['Depression Treatment', 'Anxiety Management', 'Addiction Counseling', 'Child Psychiatry', 'Psychotherapy', 'Psychiatric Evaluation', 'Stress Management', 'Couple Therapy']),
                'facilities' => json_encode(['Psychiatry OPD', 'Counseling Rooms', 'De-addiction Center', 'Psychiatric Ward', 'Group Therapy Rooms']),
                'image_url' => 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=1200&h=600&fit=crop',
                'conditions_treated' => json_encode(['Depression', 'Anxiety Disorders', 'Bipolar Disorder', 'Schizophrenia', 'OCD', 'PTSD', 'Addiction', 'Eating Disorders']),
                'technologies' => json_encode(['Psychological Testing', 'Biofeedback', 'TMS Therapy', 'ECT', 'Neurofeedback']),
                'why_choose_us' => 'Our psychiatrists and psychologists work together to provide comprehensive mental health care. We offer confidential counseling services and evidence-based treatments in a supportive environment.'
            ],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['code' => $dept['code']],
                [
                    'name' => $dept['name'],
                    'code' => $dept['code'],
                    'description' => $dept['description'],
                    'overview' => $dept['overview'],
                    'services' => $dept['services'],
                    'facilities' => $dept['facilities'],
                    'image_url' => $dept['image_url'],
                    'conditions_treated' => $dept['conditions_treated'],
                    'technologies' => $dept['technologies'],
                    'why_choose_us' => $dept['why_choose_us'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
