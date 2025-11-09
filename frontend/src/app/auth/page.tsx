'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Stethoscope, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'select' | 'login' | 'signup-patient' | 'signup-caregiver';

export default function AuthPage() {
  const router = useRouter();
  const { login, setAuthData } = useAuth();
  const [mode, setMode] = useState<AuthMode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { authApi } = await import('@/services/authApi');
      await authApi.patientSignup({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
      });
      
      // Show success message and redirect to login
      alert('Account created successfully! Please log in.');
      setMode('login');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaregiverSignup = () => {
    router.push('/auth/caregiver-onboarding');
  };

  // Role Selection View
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A7373] to-[#0A5252] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome to AIRA</CardTitle>
            <CardDescription className="text-lg">
              Choose how you'd like to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Patient Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#0A7373]"
                onClick={() => setMode('signup-patient')}
              >
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">I'm a Patient</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Get AI-powered health insights and connect with caregivers
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Caregiver Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#0A7373]"
                onClick={handleCaregiverSignup}
              >
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">I'm a Caregiver</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      For doctors, clinics, and hospitals
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#0A7373] font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login View
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A7373] to-[#0A5252] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <button
              onClick={() => setMode('select')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <CardTitle className="text-2xl">Log in to AIRA</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0A7373] hover:bg-[#0A5252]"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="text-[#0A7373] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Patient Signup View
  if (mode === 'signup-patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A7373] to-[#0A5252] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <button
              onClick={() => setMode('select')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <CardTitle className="text-2xl">Create Patient Account</CardTitle>
            <CardDescription>Start your health journey with AIRA</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePatientSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">At least 8 characters</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0A7373] hover:bg-[#0A5252]"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#0A7373] font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
