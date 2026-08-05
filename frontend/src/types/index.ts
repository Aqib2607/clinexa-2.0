export interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'doctor' | 'nurse' | 'patient';
}

export interface Patient {
    id: number;
    name: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    blood_type?: string;
}

export interface Doctor {
    id: number;
    user_id: number;
    user?: User;
    department_id?: number;
    department?: Department;
    specialization: string;
    license_number: string;
}

export interface Department {
    id: number;
    name: string;
}

export interface Appointment {
    id: number;
    appointment_number?: string;
    patient_id: number;
    patient?: Patient;
    doctor_id: number;
    doctor?: Doctor;
    department?: Department;
    appointment_date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    symptoms?: string;
}

export interface Prescription {
    id: number;
    doctor?: Doctor;
    medications: Array<{
        medicine_name: string;
        dosage: string;
        frequency: string;
        duration: string;
    }>;
    notes?: string;
    created_at: string;
}

export interface LabResultItem {
    id?: number;
    lab_result_id?: number;
    component_name: string;
    value: string;
    unit: string;
    reference_range: string;
}

export interface LabResult {
    id: number;
    visit_id: number;
    test_id: number;
    status: 'pending' | 'entered' | 'verified' | 'cancelled';
    visit?: {
        patient?: Patient;
    };
    test?: {
        name: string;
    };
    description?: string; // Added for PatientDashboard compatibility
    type?: string;        // Added for PatientDashboard compatibility
    doctor?: string;      // Added for PatientDashboard compatibility
    date?: string;        // Added for PatientDashboard compatibility
    items?: LabResultItem[];
    created_at: string;
}

export interface Visit {
    id: number;
    patient_id: number;
    patient?: Patient;
    doctor_id: number;
    doctor?: Doctor;
    visit_date: string;
    type: 'OPD' | 'IPD' | 'Emergency';
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    bill?: Bill;
}

export interface Service {
    id: number;
    name: string;
    description?: string;
    price: number;
    category?: string;
}

export interface BillItem {
    id: number;
    bill_id: number;
    service_id?: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface Bill {
    id: number;
    visit_id: number;
    patient_id: number;
    bill_number: string;
    total_amount: number;
    discount: number;
    paid_amount: number;
    due_amount: number;
    status: 'draft' | 'finalized' | 'partial' | 'paid';
    items?: BillItem[];
}

export interface Employee {
    id: number;
    user_id: number;
    user?: User;
    employee_code: string;
    designation: string;
    department_id: number;
    department?: Department;
    basic_salary: number;
    status: 'active' | 'inactive';
    shift?: {
        name: string;
        start_time: string;
        end_time: string;
    };
    join_date: string;
}

export interface InventoryStock {
    id: number;
    item_id: number;
    store_id: number;
    total_quantity: number;
    item?: {
        name: string;
        code: string;
        unit: string;
    };
    store?: {
        name: string;
    };
}

export interface TrialBalanceItem {
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    balance: number;
}

export interface LabSample {
    id: number;
    visit_id: number;
    test_id: number;
    barcode: string;
    status: 'pending' | 'collected' | 'received' | 'rejected';
    specimen?: string | { type: string };
    visit?: {
        patient?: Patient;
    };
    test?: {
        name: string;
    };
    created_at: string;
    collected_at?: string;
}

export interface RadiologyStudy {
    id: number;
    visit_id: number;
    study_name: string;
    status: 'ordered' | 'pending' | 'reported' | 'cancelled';
    visit?: {
        patient?: Patient;
    };
    created_at: string;
}

export interface Bed {
    id: number;
    bed_number: string;
    bed_type: string;
    status: 'available' | 'occupied' | 'maintenance';
    ward?: { name: string };
    current_admission?: Admission;
}

export interface Admission {
    id: number;
    patient_id: number;
    patient?: Patient;
    doctor_id: number;
    doctor?: Doctor;
    bed_id?: number;
    bed?: Bed;
    admission_date: string;
    discharge_date?: string;
    status: 'admitted' | 'discharged' | 'transferred';
}
export interface PharmacyStock {
    id: number;
    pharmacy_item_id: number;
    batch_number: string;
    expiry_date: string;
    quantity: number;
    sale_price: number;
    purchase_price: number;
}

export interface PharmacyItem {
    id: number;
    name: string;
    generic_name: string;
    code: string;
    description?: string;
    unit: string;
    stocks?: PharmacyStock[];
}

export interface CartItem {
    pharmacy_item_id: number;
    name: string;
    unit_price: number;
    quantity: number;
    total: number;
}
