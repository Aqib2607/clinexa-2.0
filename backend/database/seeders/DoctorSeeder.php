<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();
        
        $doctorsByDept = [
            'Cardiology' => [
                ['name' => 'Dr. Rajesh Kumar', 'specialization' => 'Interventional Cardiology', 'qualification' => 'MD, DM (Cardiology)', 'experience' => 15, 'fee' => 1500],
                ['name' => 'Dr. Priya Sharma', 'specialization' => 'Pediatric Cardiology', 'qualification' => 'MD, DM (Cardiology)', 'experience' => 12, 'fee' => 1200],
                ['name' => 'Dr. Amit Patel', 'specialization' => 'Cardiac Electrophysiology', 'qualification' => 'MD, DM (Cardiology)', 'experience' => 18, 'fee' => 1800],
                ['name' => 'Dr. Sneha Reddy', 'specialization' => 'Heart Failure Specialist', 'qualification' => 'MD, DM (Cardiology)', 'experience' => 10, 'fee' => 1000],
                ['name' => 'Dr. Vikram Singh', 'specialization' => 'Preventive Cardiology', 'qualification' => 'MD, DM (Cardiology)', 'experience' => 14, 'fee' => 1300],
            ],
            'Neurology' => [
                ['name' => 'Dr. Anita Desai', 'specialization' => 'Stroke Specialist', 'qualification' => 'MD, DM (Neurology)', 'experience' => 16, 'fee' => 1400],
                ['name' => 'Dr. Suresh Menon', 'specialization' => 'Epilepsy Specialist', 'qualification' => 'MD, DM (Neurology)', 'experience' => 13, 'fee' => 1200],
                ['name' => 'Dr. Kavita Joshi', 'specialization' => 'Movement Disorders', 'qualification' => 'MD, DM (Neurology)', 'experience' => 11, 'fee' => 1100],
                ['name' => 'Dr. Ramesh Iyer', 'specialization' => 'Headache Specialist', 'qualification' => 'MD, DM (Neurology)', 'experience' => 9, 'fee' => 900],
                ['name' => 'Dr. Meera Nair', 'specialization' => 'Neuromuscular Disorders', 'qualification' => 'MD, DM (Neurology)', 'experience' => 17, 'fee' => 1500],
            ],
            'Orthopedics' => [
                ['name' => 'Dr. Arun Verma', 'specialization' => 'Joint Replacement', 'qualification' => 'MS (Ortho), MCh', 'experience' => 20, 'fee' => 1600],
                ['name' => 'Dr. Pooja Gupta', 'specialization' => 'Sports Medicine', 'qualification' => 'MS (Ortho)', 'experience' => 8, 'fee' => 800],
                ['name' => 'Dr. Karthik Rao', 'specialization' => 'Spine Surgery', 'qualification' => 'MS (Ortho), MCh', 'experience' => 15, 'fee' => 1400],
                ['name' => 'Dr. Deepa Pillai', 'specialization' => 'Pediatric Orthopedics', 'qualification' => 'MS (Ortho)', 'experience' => 12, 'fee' => 1100],
                ['name' => 'Dr. Sanjay Malhotra', 'specialization' => 'Trauma Surgery', 'qualification' => 'MS (Ortho)', 'experience' => 14, 'fee' => 1200],
            ],
            'Pediatrics' => [
                ['name' => 'Dr. Lakshmi Krishnan', 'specialization' => 'Neonatology', 'qualification' => 'MD (Pediatrics), DM', 'experience' => 18, 'fee' => 1300],
                ['name' => 'Dr. Arjun Mehta', 'specialization' => 'Pediatric Cardiology', 'qualification' => 'MD (Pediatrics), DM', 'experience' => 14, 'fee' => 1200],
                ['name' => 'Dr. Ritu Kapoor', 'specialization' => 'Pediatric Neurology', 'qualification' => 'MD (Pediatrics), DM', 'experience' => 11, 'fee' => 1000],
                ['name' => 'Dr. Nitin Agarwal', 'specialization' => 'General Pediatrics', 'qualification' => 'MD (Pediatrics)', 'experience' => 10, 'fee' => 800],
                ['name' => 'Dr. Swati Bansal', 'specialization' => 'Pediatric Gastroenterology', 'qualification' => 'MD (Pediatrics), DM', 'experience' => 13, 'fee' => 1100],
            ],
            'Gynecology' => [
                ['name' => 'Dr. Sunita Rao', 'specialization' => 'High Risk Pregnancy', 'qualification' => 'MD, DGO', 'experience' => 16, 'fee' => 1200],
                ['name' => 'Dr. Anjali Saxena', 'specialization' => 'Infertility Specialist', 'qualification' => 'MD, DGO', 'experience' => 12, 'fee' => 1400],
                ['name' => 'Dr. Madhuri Dixit', 'specialization' => 'Gynecologic Oncology', 'qualification' => 'MD, DGO, MCh', 'experience' => 15, 'fee' => 1500],
                ['name' => 'Dr. Rekha Sharma', 'specialization' => 'Laparoscopic Surgery', 'qualification' => 'MD, DGO', 'experience' => 10, 'fee' => 1000],
                ['name' => 'Dr. Nisha Patel', 'specialization' => 'General Gynecology', 'qualification' => 'MD, DGO', 'experience' => 9, 'fee' => 900],
            ],
            'Dermatology' => [
                ['name' => 'Dr. Rohit Khanna', 'specialization' => 'Cosmetic Dermatology', 'qualification' => 'MD (Dermatology)', 'experience' => 11, 'fee' => 1200],
                ['name' => 'Dr. Neha Chopra', 'specialization' => 'Pediatric Dermatology', 'qualification' => 'MD (Dermatology)', 'experience' => 8, 'fee' => 900],
                ['name' => 'Dr. Manish Jain', 'specialization' => 'Hair Transplant', 'qualification' => 'MD (Dermatology)', 'experience' => 13, 'fee' => 1500],
                ['name' => 'Dr. Shruti Agarwal', 'specialization' => 'Dermatosurgery', 'qualification' => 'MD (Dermatology)', 'experience' => 10, 'fee' => 1000],
                ['name' => 'Dr. Varun Sethi', 'specialization' => 'Clinical Dermatology', 'qualification' => 'MD (Dermatology)', 'experience' => 12, 'fee' => 1100],
            ],
            'General Medicine' => [
                ['name' => 'Dr. Ashok Kumar', 'specialization' => 'Internal Medicine', 'qualification' => 'MD (Medicine)', 'experience' => 20, 'fee' => 800],
                ['name' => 'Dr. Geeta Rao', 'specialization' => 'Diabetes Specialist', 'qualification' => 'MD (Medicine), DM', 'experience' => 15, 'fee' => 1000],
                ['name' => 'Dr. Prakash Reddy', 'specialization' => 'Hypertension Specialist', 'qualification' => 'MD (Medicine)', 'experience' => 12, 'fee' => 900],
                ['name' => 'Dr. Shilpa Nair', 'specialization' => 'Geriatric Medicine', 'qualification' => 'MD (Medicine)', 'experience' => 10, 'fee' => 800],
                ['name' => 'Dr. Manoj Tiwari', 'specialization' => 'General Physician', 'qualification' => 'MD (Medicine)', 'experience' => 18, 'fee' => 700],
            ],
            'ENT' => [
                ['name' => 'Dr. Ravi Shankar', 'specialization' => 'Otology', 'qualification' => 'MS (ENT)', 'experience' => 14, 'fee' => 1000],
                ['name' => 'Dr. Priyanka Joshi', 'specialization' => 'Rhinology', 'qualification' => 'MS (ENT)', 'experience' => 9, 'fee' => 900],
                ['name' => 'Dr. Siddharth Malhotra', 'specialization' => 'Head & Neck Surgery', 'qualification' => 'MS (ENT), MCh', 'experience' => 16, 'fee' => 1300],
                ['name' => 'Dr. Ananya Iyer', 'specialization' => 'Pediatric ENT', 'qualification' => 'MS (ENT)', 'experience' => 11, 'fee' => 1000],
                ['name' => 'Dr. Vivek Sharma', 'specialization' => 'Voice & Laryngology', 'qualification' => 'MS (ENT)', 'experience' => 13, 'fee' => 1100],
            ],
            'Opthalmology' => [
                ['name' => 'Dr. Sunil Gupta', 'specialization' => 'Cataract Surgery', 'qualification' => 'MS (Ophth)', 'experience' => 17, 'fee' => 1200],
                ['name' => 'Dr. Divya Menon', 'specialization' => 'Retina Specialist', 'qualification' => 'MS (Ophth), FRCS', 'experience' => 14, 'fee' => 1500],
                ['name' => 'Dr. Rajiv Kapoor', 'specialization' => 'Glaucoma Specialist', 'qualification' => 'MS (Ophth)', 'experience' => 12, 'fee' => 1100],
                ['name' => 'Dr. Meena Patel', 'specialization' => 'Pediatric Ophthalmology', 'qualification' => 'MS (Ophth)', 'experience' => 10, 'fee' => 1000],
                ['name' => 'Dr. Anil Kumar', 'specialization' => 'Cornea Specialist', 'qualification' => 'MS (Ophth)', 'experience' => 15, 'fee' => 1300],
            ],
            'Psychiatry' => [
                ['name' => 'Dr. Sanjana Reddy', 'specialization' => 'Child Psychiatry', 'qualification' => 'MD (Psychiatry)', 'experience' => 11, 'fee' => 1200],
                ['name' => 'Dr. Rahul Verma', 'specialization' => 'Addiction Psychiatry', 'qualification' => 'MD (Psychiatry)', 'experience' => 13, 'fee' => 1300],
                ['name' => 'Dr. Kavita Singh', 'specialization' => 'Geriatric Psychiatry', 'qualification' => 'MD (Psychiatry)', 'experience' => 15, 'fee' => 1400],
                ['name' => 'Dr. Arjun Nair', 'specialization' => 'Mood Disorders', 'qualification' => 'MD (Psychiatry)', 'experience' => 9, 'fee' => 1000],
                ['name' => 'Dr. Preeti Agarwal', 'specialization' => 'Clinical Psychiatry', 'qualification' => 'MD (Psychiatry)', 'experience' => 12, 'fee' => 1100],
            ],
        ];

        foreach ($departments as $dept) {
            if (isset($doctorsByDept[$dept->name])) {
                foreach ($doctorsByDept[$dept->name] as $index => $doctor) {
                    $email = strtolower(str_replace(['Dr. ', ' '], ['', '.'], $doctor['name'])) . '@hospital.com';
                    
                    $user = User::create([
                        'name' => $doctor['name'],
                        'email' => $email,
                        'password' => Hash::make('password123'),
                        'phone' => '+91-' . rand(7000000000, 9999999999),
                        'role' => 'doctor',
                        'email_verified_at' => now(),
                    ]);

                    $photoUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces&q=80&sig=" . ($dept->id * 10 + $index);

                    DB::table('doctors')->insert([
                        'user_id' => $user->id,
                        'department_id' => $dept->id,
                        'specialization' => $doctor['specialization'],
                        'qualification' => $doctor['qualification'],
                        'experience_years' => $doctor['experience'],
                        'consultation_fee' => $doctor['fee'],
                        'license_number' => 'MCI' . rand(100000, 999999),
                        'photo_url' => $photoUrl,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
