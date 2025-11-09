'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle2, Stethoscope, Video, Home, Building2 } from 'lucide-react';
import { authApi } from '@/services/authApi';

interface CaregiverStep3Props {
  onComplete: () => void;
  onBack: () => void;
}

const SPECIALIZATIONS = [
  'General Practice',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Psychiatry',
  'Oncology',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology',
];

const CONSULTATION_MODES = [
  { value: 'In-person', label: 'In-person Consultation', icon: Building2 },
  { value: 'Telemedicine', label: 'Telemedicine / Online', icon: Video },
  { value: 'Home visits', label: 'Home Visits', icon: Home },
];

export function CaregiverStep3({ onComplete, onBack }: CaregiverStep3Props) {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [consultationModes, setConsultationModes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleSpecialization = (spec: string) => {
    setSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const toggleConsultationMode = (mode: string) => {
    setConsultationModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (specializations.length === 0) {
      setError('Please select at least one specialization');
      return;
    }

    if (consultationModes.length === 0) {
      setError('Please select at least one consultation mode');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.caregiverOnboardingStep3({
        specializations,
        consultation_modes: consultationModes,
      });

      // Show success alert and complete
      alert('Onboarding completed successfully! Redirecting to dashboard...');
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save services.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Services Offered</h2>
        </div>
        <p className="text-gray-600">What services do you provide?</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Specializations */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Type of Diagnosis / Specialization *</Label>
          <p className="text-sm text-gray-500">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {SPECIALIZATIONS.map((spec) => (
              <div
                key={spec}
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                  specializations.includes(spec)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSpecialization(spec)}
              >
                <Checkbox
                  id={spec}
                  checked={specializations.includes(spec)}
                  onCheckedChange={() => toggleSpecialization(spec)}
                />
                <Label htmlFor={spec} className="font-normal cursor-pointer flex-1">
                  {spec}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Modes */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Consultation Modes *</Label>
          <p className="text-sm text-gray-500">How do you provide consultations?</p>
          <div className="grid grid-cols-1 gap-3">
            {CONSULTATION_MODES.map((mode) => (
              <div
                key={mode.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  consultationModes.includes(mode.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleConsultationMode(mode.value)}
              >
                <mode.icon className="w-5 h-5 text-gray-600" />
                <Checkbox
                  id={mode.value}
                  checked={consultationModes.includes(mode.value)}
                  onCheckedChange={() => toggleConsultationMode(mode.value)}
                />
                <Label htmlFor={mode.value} className="font-normal cursor-pointer flex-1">
                  {mode.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Completing...' : 'Complete Onboarding'}
          <CheckCircle2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
