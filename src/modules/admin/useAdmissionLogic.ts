
import { useState, useEffect } from 'react';
import { Student, BillingLog, ProgramType, CompanyCode } from '../../types/schema';
import { SheetService } from '../../services/sheetService';
import { StorageService } from '../../services/storageService';

// --- MOCK DATA FOR CASCADING DROPDOWNS ---
const ACADEMIC_DATA = {
    [ProgramType.REGULER]: {
        campuses: ['Kampus A (Pusat)', 'Kampus B (Timur)'],
        majors: ['S1 - Manajemen', 'S1 - Akuntansi', 'S1 - Ilmu Komunikasi']
    },
    [ProgramType.KARYAWAN]: {
        campuses: ['Kampus A (Pusat)', 'Kampus C (Online Hub)'],
        majors: ['S1 - Manajemen (Malam)', 'S1 - Teknik Informatika (Weekend)', 'S1 - Hukum']
    },
    [ProgramType.REKOGNISI]: {
        campuses: ['Kampus A (Pusat)'],
        majors: ['S1 - Manajemen (RPL)', 'S1 - Teknik Sipil (RPL)']
    },
    [ProgramType.ONLINE]: {
        campuses: ['Cyber Campus'],
        majors: ['S1 - Sistem Informasi', 'S1 - Bisnis Digital']
    }
};

const TUITION_FEES = {
    [ProgramType.REGULER]: 3500000,
    [ProgramType.KARYAWAN]: 4500000,
    [ProgramType.REKOGNISI]: 5500000, // Higher due to conversion handling
    [ProgramType.ONLINE]: 3000000
};

export const useAdmissionLogic = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Student>>({
        full_name: '',
        nik: '',
        email: '',
        phone: '',
        address: '',
        program_type: undefined,
        university_target: '', // Acts as Campus selection
        major_target: '',
        mother_name: '',
        blanko_number: '',
        resi_number: '',
        status: 'REGISTERED'
    });

    // Verification Checklist State
    const [verification, setVerification] = useState({
        ktpValid: false,
        kkValid: false,
        ijazahValid: false,
        transkripValid: false
    });

    // Billing State (Auto-generated)
    const [billing, setBilling] = useState<Partial<BillingLog>>({
        total_bill: 0,
        amount_paid: 0,
        remaining_balance: 0,
        invoice_number: `INV-${Date.now()}`
    });

    // --- LOGIC: AUTO BILLING ---
    useEffect(() => {
        if (formData.program_type) {
            const basePrice = TUITION_FEES[formData.program_type] || 0;
            const adminFee = 250000; // Registration fee
            const total = basePrice + adminFee;
            
            setBilling(prev => ({
                ...prev,
                total_bill: total,
                remaining_balance: total - (prev.amount_paid || 0)
            }));
        }
    }, [formData.program_type]);

    // --- ACTIONS ---

    const handleInputChange = (field: keyof Student, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Reset dependent fields if parent changes
        if (field === 'program_type') {
            setFormData(prev => ({ 
                ...prev, 
                program_type: value, 
                university_target: '', 
                major_target: '' 
            }));
        }
    };

    const handleVerificationToggle = (key: keyof typeof verification) => {
        setVerification(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // AI SIMULATION: SCAN KTP
    const simulateScanKTP = async () => {
        setIsScanning(true);
        // Simulate network delay / processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock extracted data
        const mockResult = {
            nik: '3201234567890001',
            full_name: 'RAHMAT HIDAYAT',
            address: 'JL. MERDEKA NO. 45, JAKARTA SELATAN',
            mother_name: 'SITI AMINAH' // Sometimes KTP data links to family card
        };

        setFormData(prev => ({ ...prev, ...mockResult }));
        setIsScanning(false);
        return true;
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.full_name || !formData.program_type) return alert("Harap lengkapi data wajib.");
        }
        if (step === 2) {
            const allChecked = Object.values(verification).every(v => v === true);
            if (!allChecked) return alert("Semua dokumen wajib diverifikasi sebelum lanjut.");
        }
        setStep(prev => (prev + 1) as 1|2|3);
    };

    const prevStep = () => setStep(prev => (prev - 1) as 1|2|3);

    const submitAdmission = async () => {
        setIsLoading(true);
        
        // 1. Simulate API Latency
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Sync to "Google Sheet" (Mock Service)
        const result = await SheetService.syncStudentToSheet(formData);
        
        setIsLoading(false);
        
        if (result.success) {
            StorageService.logActivity('Admission', `Registered New Student: ${formData.full_name}`);
            return { success: true };
        } else {
            alert("Gagal sinkronisasi ke database pusat. Data tersimpan lokal.");
            return { success: false };
        }
    };

    // Derived Data for Dropdowns
    const availableCampuses = formData.program_type ? ACADEMIC_DATA[formData.program_type].campuses : [];
    const availableMajors = formData.program_type ? ACADEMIC_DATA[formData.program_type].majors : [];

    return {
        step,
        formData,
        billing,
        verification,
        isLoading,
        isScanning,
        availableCampuses,
        availableMajors,
        handleInputChange,
        handleVerificationToggle,
        simulateScanKTP,
        nextStep,
        prevStep,
        submitAdmission
    };
};
