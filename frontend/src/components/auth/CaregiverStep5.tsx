'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { authApi } from '@/services/authApi';

interface CaregiverStep5Props {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function CaregiverStep5({ onComplete, onBack }: CaregiverStep5Props) {
  const [taxId, setTaxId] = useState('');
  const [taxClassification, setTaxClassification] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.caregiverOnboardingStep5({
        tax_id: taxId,
        tax_classification: taxClassification,
      });

      onComplete({
        taxId,
        taxClassification,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save tax information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Tax information</h2>
        <p className="text-gray-600">Required for compliance</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID (EIN or SSN)</Label>
          <Input
            id="taxId"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="XX-XXXXXXX"
          />
          <p className="text-xs text-gray-500">Your Employer Identification Number or Social Security Number</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxClassification">Tax Classification</Label>
          <Input
            id="taxClassification"
            placeholder="e.g., Individual, Corporation, Partnership"
            value={taxClassification}
            onChange={(e) => setTaxClassification(e.target.value)}
          />
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
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
