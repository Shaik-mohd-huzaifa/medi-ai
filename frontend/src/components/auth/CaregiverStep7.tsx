'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/authApi';

interface CaregiverStep7Props {
  formData: any;
  onComplete: () => void;
  onBack: () => void;
}

export function CaregiverStep7({ formData, onComplete, onBack }: CaregiverStep7Props) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setError('');
    setIsLoading(true);

    try {
      await authApi.caregiverCompleteOnboarding();
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Confirm details</h2>
        <p className="text-gray-600">Review your information before finishing</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Account Information */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Account Information</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {formData.email || 'Not provided'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Name:</span> {formData.fullName || 'Not provided'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Type:</span>{' '}
              {formData.caregiverType?.replace('_', ' ') || 'Not provided'}
            </p>
          </div>
        </div>

        {/* Business Information */}
        {formData.businessName && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Business Information</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Business:</span> {formData.businessName}
              </p>
              {formData.companyType && (
                <p className="text-gray-600">
                  <span className="font-medium">Company Type:</span>{' '}
                  {formData.companyType.replace('_', ' ')}
                </p>
              )}
              {formData.employeeCount && (
                <p className="text-gray-600">
                  <span className="font-medium">Employees:</span> {formData.employeeCount}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Professional Information */}
        {(formData.licenseNumber || formData.specialization) && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Professional Information</h3>
            </div>
            <div className="space-y-1 text-sm">
              {formData.licenseNumber && (
                <p className="text-gray-600">
                  <span className="font-medium">License:</span> {formData.licenseNumber}
                </p>
              )}
              {formData.specialization && (
                <p className="text-gray-600">
                  <span className="font-medium">Specialization:</span> {formData.specialization}
                </p>
              )}
              {formData.yearsOfExperience && (
                <p className="text-gray-600">
                  <span className="font-medium">Experience:</span> {formData.yearsOfExperience} years
                </p>
              )}
            </div>
          </div>
        )}

        {/* Banking & Tax */}
        {(formData.bankName || formData.taxId) && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Banking & Tax Information</h3>
            </div>
            <div className="space-y-1 text-sm">
              {formData.bankName && (
                <p className="text-gray-600">
                  <span className="font-medium">Bank:</span> {formData.bankName}
                </p>
              )}
              {formData.accountHolderName && (
                <p className="text-gray-600">
                  <span className="font-medium">Account Holder:</span> {formData.accountHolderName}
                </p>
              )}
              {formData.taxId && (
                <p className="text-gray-600">
                  <span className="font-medium">Tax ID:</span> {formData.taxId}
                </p>
              )}
              {formData.taxClassification && (
                <p className="text-gray-600">
                  <span className="font-medium">Tax Classification:</span> {formData.taxClassification}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          By completing this onboarding, you agree to our terms of service and privacy policy.
          Your information will be reviewed and you'll receive a confirmation email within 24-48 hours.
        </p>
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
          onClick={handleComplete}
          className="bg-green-600 hover:bg-green-700 flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Completing...' : 'Complete Onboarding'}
          <CheckCircle2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
