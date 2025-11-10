'use client';

import { useAuth } from '@/contexts/AuthContext';
import MedicalDashboard from '@/components/MedicalDashboard';
import { CaregiverDashboard } from '@/components/CaregiverDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === 'caregiver' ? <CaregiverDashboard /> : <MedicalDashboard />}
    </ProtectedRoute>
  );
}
