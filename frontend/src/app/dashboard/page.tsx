import MedicalDashboard from '@/components/MedicalDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MedicalDashboard />
    </ProtectedRoute>
  );
}
