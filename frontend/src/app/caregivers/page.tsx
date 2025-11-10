'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  Briefcase, 
  User, 
  Building2,
  MessageSquare,
  Video,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { bedrockApi } from '@/services/api';

interface Caregiver {
  id: number;
  full_name: string;
  business_name: string;
  caregiver_type: string;
  specialization: string;
  consultation_modes: string;
  years_of_experience: number;
  rating: number;
  total_consultations: number;
  business_city: string;
  business_state: string;
  business_country: string;
}

export default function CaregiversPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchCaregivers();
  }, []);

  useEffect(() => {
    filterCaregivers();
  }, [searchQuery, selectedCity, selectedSpecialization, selectedType, caregivers]);

  const fetchCaregivers = async () => {
    try {
      setIsLoading(true);
      const data = await bedrockApi.listCaregivers({
        country: 'India',
        limit: 100
      });
      setCaregivers(data);
      setFilteredCaregivers(data);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCaregivers = () => {
    let filtered = [...caregivers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(c => c.business_city === selectedCity);
    }

    // Specialization filter
    if (selectedSpecialization) {
      filtered = filtered.filter(c => 
        c.specialization?.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(c => c.caregiver_type === selectedType);
    }

    setFilteredCaregivers(filtered);
  };

  const getCaregiverTypeDisplay = (type: string) => {
    switch (type) {
      case 'individual_doctor': return 'Doctor';
      case 'clinic': return 'Clinic';
      case 'hospital': return 'Hospital';
      default: return type;
    }
  };

  const getCaregiverTypeIcon = (type: string) => {
    switch (type) {
      case 'individual_doctor': return <User className="w-4 h-4" />;
      case 'clinic': return <Briefcase className="w-4 h-4" />;
      case 'hospital': return <Building2 className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getConsultationModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'chat': return <MessageSquare className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      case 'in-person': return <Building2 className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const handleBookConsultation = (caregiver: Caregiver, mode: string) => {
    // TODO: Implement booking functionality
    alert(`Booking ${mode} consultation with ${caregiver.business_name}`);
  };

  // Get unique values for filters
  const uniqueCities = Array.from(new Set(caregivers.map(c => c.business_city))).filter(Boolean).sort();
  const uniqueSpecializations = Array.from(new Set(
    caregivers.flatMap(c => c.specialization?.split(',').map(s => s.trim()) || [])
  )).filter(Boolean).sort();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Browse Caregivers</h1>
                  <p className="text-sm text-gray-500">
                    {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user.full_name}</span>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, specialty, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Specialization Filter */}
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Specializations</option>
                {uniqueSpecializations.slice(0, 15).map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Types</option>
                <option value="individual_doctor">Doctors</option>
                <option value="clinic">Clinics</option>
                <option value="hospital">Hospitals</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || selectedCity || selectedSpecialization || selectedType) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('');
                    setSelectedSpecialization('');
                    setSelectedType('');
                  }}
                >
                  Clear Filters
                </Button>
              )}

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCaregivers}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading caregivers...</p>
              </div>
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No caregivers found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedCity || selectedSpecialization || selectedType
                  ? 'Try adjusting your filters'
                  : 'No caregivers available at the moment'}
              </p>
              {(searchQuery || selectedCity || selectedSpecialization || selectedType) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('');
                    setSelectedSpecialization('');
                    setSelectedType('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCaregivers.map((caregiver) => (
                <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCaregiverTypeIcon(caregiver.caregiver_type)}
                            {getCaregiverTypeDisplay(caregiver.caregiver_type)}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {caregiver.business_name}
                        </h3>
                        <p className="text-sm text-gray-600">{caregiver.full_name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="text-sm font-semibold">{caregiver.rating}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span>{caregiver.years_of_experience} years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{caregiver.total_consultations} consults</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {caregiver.business_city}, {caregiver.business_state}
                      </span>
                    </div>

                    {/* Specializations */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.specialization?.split(',').slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec.trim()}
                          </Badge>
                        ))}
                        {caregiver.specialization?.split(',').length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{caregiver.specialization.split(',').length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Consultation Modes */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Available via:</p>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.consultation_modes?.split(',').map((mode, idx) => (
                          <Badge key={idx} variant="outline" className="flex items-center gap-1 text-xs">
                            {getConsultationModeIcon(mode.trim())}
                            {mode.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      {caregiver.consultation_modes?.includes('chat') && (
                        <Button
                          size="sm"
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                          onClick={() => handleBookConsultation(caregiver, 'chat')}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      )}
                      {caregiver.consultation_modes?.includes('video') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleBookConsultation(caregiver, 'video')}
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Button>
                      )}
                      {caregiver.consultation_modes?.includes('in-person') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleBookConsultation(caregiver, 'in-person')}
                        >
                          <Building2 className="w-3 h-3 mr-1" />
                          Visit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
