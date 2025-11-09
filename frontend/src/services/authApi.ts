import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export enum UserRole {
  PATIENT = 'patient',
  CAREGIVER = 'caregiver',
  ADMIN = 'admin',
}

export enum CaregiverType {
  INDIVIDUAL_DOCTOR = 'individual_doctor',
  CLINIC = 'clinic',
  HOSPITAL = 'hospital',
}

export enum CompanyType {
  LLC_PARTNERSHIP = 'llc_partnership',
  C_S_CORPORATION = 'c_s_corporation',
  B_CORPORATION = 'b_corporation',
}

export enum EmployeeCount {
  SMALL = '1-10',
  MEDIUM = '21-49',
  LARGE = '50+',
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Patient Signup
export interface PatientSignupData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
}

// Caregiver Signup Step 1
export interface CaregiverSignupStep1Data {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  caregiver_type: CaregiverType;
}

// Caregiver Step 2 - Business Overview
export interface CaregiverBusinessOverviewData {
  business_name: string;
  business_description?: string;
  company_type?: CompanyType;
  employee_count?: EmployeeCount;
  business_address_line1?: string;
  business_address_line2?: string;
  business_city?: string;
  business_state?: string;
  business_zipcode?: string;
  billing_same_as_business?: boolean;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zipcode?: string;
}

// Caregiver Step 3 - Build Profile
export interface CaregiverProfileBuildData {
  license_number?: string;
  specialization?: string;
  years_of_experience?: number;
}

// Caregiver Step 4 - Banking
export interface CaregiverBankingData {
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  routing_number?: string;
}

// Caregiver Step 5 - Tax
export interface CaregiverTaxData {
  tax_id?: string;
  tax_classification?: string;
}

export const authApi = {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await authClient.post('/api/v1/auth/login', { email, password });
    return response.data;
  },

  // Patient Signup
  async patientSignup(data: PatientSignupData): Promise<LoginResponse> {
    const response = await authClient.post('/api/v1/auth/patient/signup', data);
    return response.data;
  },

  // Caregiver Signup - Step 1
  async caregiverSignupStep1(data: CaregiverSignupStep1Data): Promise<LoginResponse> {
    const response = await authClient.post('/api/v1/auth/caregiver/signup/step1', data);
    return response.data;
  },

  // Caregiver Onboarding - Step 2
  async caregiverOnboardingStep2(data: CaregiverBusinessOverviewData): Promise<{ message: string; next_step: number }> {
    const response = await authClient.put('/api/v1/auth/caregiver/onboarding/step2', data);
    return response.data;
  },

  // Caregiver Onboarding - Step 3
  async caregiverOnboardingStep3(data: CaregiverProfileBuildData): Promise<{ message: string; next_step: number }> {
    const response = await authClient.put('/api/v1/auth/caregiver/onboarding/step3', data);
    return response.data;
  },

  // Caregiver Onboarding - Step 4
  async caregiverOnboardingStep4(data: CaregiverBankingData): Promise<{ message: string; next_step: number }> {
    const response = await authClient.put('/api/v1/auth/caregiver/onboarding/step4', data);
    return response.data;
  },

  // Caregiver Onboarding - Step 5
  async caregiverOnboardingStep5(data: CaregiverTaxData): Promise<{ message: string; next_step: number }> {
    const response = await authClient.put('/api/v1/auth/caregiver/onboarding/step5', data);
    return response.data;
  },

  // Complete Onboarding
  async caregiverCompleteOnboarding(): Promise<{ message: string }> {
    const response = await authClient.put('/api/v1/auth/caregiver/onboarding/complete');
    return response.data;
  },

  // Get Current User
  async getCurrentUser(): Promise<User> {
    const response = await authClient.get('/api/v1/auth/me');
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
