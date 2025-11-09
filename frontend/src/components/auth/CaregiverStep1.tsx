'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authApi, CaregiverType } from '@/services/authApi';

interface CaregiverStep1Props {
  onComplete: (data: any) => void;
}

export function CaregiverStep1({ onComplete }: CaregiverStep1Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [caregiverType, setCaregiverType] = useState<CaregiverType>(CaregiverType.INDIVIDUAL_DOCTOR);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.caregiverSignupStep1({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
        caregiver_type: caregiverType,
      });

      onComplete({
        email,
        fullName,
        phoneNumber,
        caregiverType,
        authResponse: response,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Create account</h2>
        <p className="text-gray-600">Get started with AIRA for caregivers</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>I am a</Label>
          <RadioGroup value={caregiverType} onValueChange={(v) => setCaregiverType(v as CaregiverType)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CaregiverType.INDIVIDUAL_DOCTOR} id="doctor" />
              <Label htmlFor="doctor" className="font-normal cursor-pointer">
                Individual Doctor
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CaregiverType.CLINIC} id="clinic" />
              <Label htmlFor="clinic" className="font-normal cursor-pointer">
                Clinic
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CaregiverType.HOSPITAL} id="hospital" />
              <Label htmlFor="hospital" className="font-normal cursor-pointer">
                Hospital
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {caregiverType === CaregiverType.INDIVIDUAL_DOCTOR 
                ? 'Full Name *' 
                : caregiverType === CaregiverType.CLINIC
                  ? 'Clinic Name *'
                  : 'Hospital Name *'}
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={caregiverType === CaregiverType.INDIVIDUAL_DOCTOR 
                ? 'Dr. John Smith' 
                : caregiverType === CaregiverType.CLINIC
                  ? 'City Medical Clinic'
                  : 'General Hospital'}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500">At least 8 characters</p>
        </div>
      </div>

      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Continue'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
