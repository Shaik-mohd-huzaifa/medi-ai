'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaregiverStep1 } from '@/components/auth/CaregiverStep1';
import { CaregiverStep2 } from '@/components/auth/CaregiverStep2';
import { CaregiverStep3 } from '@/components/auth/CaregiverStep3';
import { CaregiverStep4 } from '@/components/auth/CaregiverStep4';
import { CaregiverStep5 } from '@/components/auth/CaregiverStep5';
import { CaregiverStep6 } from '@/components/auth/CaregiverStep6';
import { CaregiverStep7 } from '@/components/auth/CaregiverStep7';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function CaregiverOnboarding() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [formData, setFormData] = useState<any>({});

  const steps = [
    { number: 1, label: 'Create account', completed: currentStep > 1 },
    { number: 2, label: 'Business overview', completed: currentStep > 2 },
    { number: 3, label: 'Build profile', completed: currentStep > 3 },
    { number: 4, label: 'Bank details', completed: currentStep > 4 },
    { number: 5, label: 'Tax information', completed: currentStep > 5 },
    { number: 6, label: 'Two-factor authentication', completed: currentStep > 6 },
    { number: 7, label: 'Confirm details', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-8">
              {/* Left Sidebar */}
              <div className="w-64 flex-shrink-0">
                <button
                  onClick={() => router.push('/auth')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to dashboard
                </button>

                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.number} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : step.number === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-medium ${
                          step.number === currentStep ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1">
                {currentStep === 1 && (
                  <CaregiverStep1
                    onComplete={(data) => {
                      setFormData({ ...formData, ...data });
                      setAuthData(data.authResponse);
                      setCurrentStep(2);
                    }}
                  />
                )}
                {currentStep === 2 && (
                  <CaregiverStep2
                    onComplete={(data) => {
                      setFormData({ ...formData, ...data });
                      setCurrentStep(3);
                    }}
                    onBack={() => setCurrentStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <CaregiverStep3
                    onComplete={(data) => {
                      setFormData({ ...formData, ...data });
                      setCurrentStep(4);
                    }}
                    onBack={() => setCurrentStep(2)}
                  />
                )}
                {currentStep === 4 && (
                  <CaregiverStep4
                    onComplete={(data) => {
                      setFormData({ ...formData, ...data });
                      setCurrentStep(5);
                    }}
                    onBack={() => setCurrentStep(3)}
                  />
                )}
                {currentStep === 5 && (
                  <CaregiverStep5
                    onComplete={(data) => {
                      setFormData({ ...formData, ...data });
                      setCurrentStep(6);
                    }}
                    onBack={() => setCurrentStep(4)}
                  />
                )}
                {currentStep === 6 && (
                  <CaregiverStep6
                    onComplete={() => setCurrentStep(7)}
                    onBack={() => setCurrentStep(5)}
                  />
                )}
                {currentStep === 7 && (
                  <CaregiverStep7
                    formData={formData}
                    onComplete={() => router.push('/dashboard')}
                    onBack={() => setCurrentStep(6)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
