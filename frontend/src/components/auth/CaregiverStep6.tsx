'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';

interface CaregiverStep6Props {
  onComplete: () => void;
  onBack: () => void;
}

export function CaregiverStep6({ onComplete, onBack }: CaregiverStep6Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Two-factor authentication</h2>
        <p className="text-gray-600">Secure your account (Optional)</p>
      </div>

      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-100 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          Two-factor authentication will be available soon to add an extra layer of security to your account
        </p>
        <p className="text-sm text-gray-500">
          You can set this up later in your account settings
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
          onClick={onComplete}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
