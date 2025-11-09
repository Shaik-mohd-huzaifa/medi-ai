'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, User, Users, Building2 } from 'lucide-react';
import { authApi, CompanyType, EmployeeCount } from '@/services/authApi';

interface CaregiverStep2Props {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function CaregiverStep2({ onComplete, onBack }: CaregiverStep2Props) {
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>(CompanyType.LLC_PARTNERSHIP);
  const [employeeCount, setEmployeeCount] = useState<EmployeeCount>(EmployeeCount.SMALL);
  const [businessAddressLine1, setBusinessAddressLine1] = useState('');
  const [businessAddressLine2, setBusinessAddressLine2] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [businessZipcode, setBusinessZipcode] = useState('');
  const [billingSameAsBusiness, setBillingSameAsBusiness] = useState(true);
  const [billingAddressLine1, setBillingAddressLine1] = useState('');
  const [billingAddressLine2, setBillingAddressLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipcode, setBillingZipcode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.caregiverOnboardingStep2({
        business_name: businessName,
        business_description: businessDescription,
        company_type: companyType,
        employee_count: employeeCount,
        business_address_line1: businessAddressLine1,
        business_address_line2: businessAddressLine2,
        business_city: businessCity,
        business_state: businessState,
        business_zipcode: businessZipcode,
        billing_same_as_business: billingSameAsBusiness,
        billing_address_line1: billingSameAsBusiness ? undefined : billingAddressLine1,
        billing_address_line2: billingSameAsBusiness ? undefined : billingAddressLine2,
        billing_city: billingSameAsBusiness ? undefined : billingCity,
        billing_state: billingSameAsBusiness ? undefined : billingState,
        billing_zipcode: billingSameAsBusiness ? undefined : billingZipcode,
      });

      onComplete({
        businessName,
        businessDescription,
        companyType,
        employeeCount,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save business overview.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">About your business</h2>
        <p className="text-gray-600">Tell us about your practice</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Your business title *</Label>
          <Input
            id="businessName"
            placeholder="I've typed something here"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Description of business conducted</Label>
          <Textarea
            id="businessDescription"
            placeholder="I've typed something here"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Company type</Label>
          <RadioGroup value={companyType} onValueChange={(v) => setCompanyType(v as CompanyType)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CompanyType.LLC_PARTNERSHIP} id="llc" />
              <Label htmlFor="llc" className="font-normal cursor-pointer">
                LLC / Partnership / Single-member
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CompanyType.C_S_CORPORATION} id="corp" />
              <Label htmlFor="corp" className="font-normal cursor-pointer">
                C / S Corporation
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CompanyType.B_CORPORATION} id="bcorp" />
              <Label htmlFor="bcorp" className="font-normal cursor-pointer">
                B Corporation
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Number of employees</Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: EmployeeCount.SMALL, label: '1-10', icon: User },
              { value: EmployeeCount.MEDIUM, label: '21-49', icon: Users },
              { value: EmployeeCount.LARGE, label: '50+', icon: Building2 },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEmployeeCount(option.value)}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  employeeCount === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option.icon className="w-6 h-6" />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Business address</Label>
          <p className="text-sm text-gray-500">Where your business is located</p>
          <Input
            placeholder="Select a country"
            value="United States"
            disabled
            className="bg-gray-50"
          />
          <Input
            placeholder="Address line 1"
            value={businessAddressLine1}
            onChange={(e) => setBusinessAddressLine1(e.target.value)}
          />
          <Input
            placeholder="Address line 2"
            value={businessAddressLine2}
            onChange={(e) => setBusinessAddressLine2(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="City"
              value={businessCity}
              onChange={(e) => setBusinessCity(e.target.value)}
            />
            <Input
              placeholder="State"
              value={businessState}
              onChange={(e) => setBusinessState(e.target.value)}
            />
            <Input
              placeholder="Zipcode"
              value={businessZipcode}
              onChange={(e) => setBusinessZipcode(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Billing address</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billingSame"
              checked={billingSameAsBusiness}
              onCheckedChange={(checked) => setBillingSameAsBusiness(checked as boolean)}
            />
            <Label htmlFor="billingSame" className="font-normal cursor-pointer">
              Same as business address
            </Label>
          </div>

          {!billingSameAsBusiness && (
            <div className="space-y-2 pl-6">
              <Input
                placeholder="Address line 1"
                value={billingAddressLine1}
                onChange={(e) => setBillingAddressLine1(e.target.value)}
              />
              <Input
                placeholder="Address line 2"
                value={billingAddressLine2}
                onChange={(e) => setBillingAddressLine2(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="City"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                />
                <Input
                  placeholder="State"
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                />
                <Input
                  placeholder="Zipcode"
                  value={billingZipcode}
                  onChange={(e) => setBillingZipcode(e.target.value)}
                />
              </div>
            </div>
          )}
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
