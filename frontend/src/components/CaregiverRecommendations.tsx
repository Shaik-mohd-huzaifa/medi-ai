'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Star, 
  Briefcase, 
  MessageSquare, 
  Video, 
  Building2,
  Phone,
  X
} from 'lucide-react';

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
  match_score: number;
}

interface CaregiverRecommendationsProps {
  caregivers: Caregiver[];
  onClose: () => void;
}

export function CaregiverRecommendations({ caregivers, onClose }: CaregiverRecommendationsProps) {
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended Caregivers</h2>
            <p className="text-sm text-gray-500 mt-1">Top {caregivers.length} matches based on your needs</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {caregivers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No caregivers found matching your criteria.</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search parameters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {caregivers.map((caregiver, index) => (
                <Card 
                  key={caregiver.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-teal-500"
                  onClick={() => setSelectedCaregiver(caregiver)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{caregiver.business_name}</h3>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getCaregiverTypeIcon(caregiver.caregiver_type)}
                              {getCaregiverTypeDisplay(caregiver.caregiver_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{caregiver.full_name}</p>
                          
                          {/* Rating and Experience */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{caregiver.rating}/5</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span>{caregiver.years_of_experience} years exp</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{caregiver.total_consultations} consultations</span>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{caregiver.business_city}, {caregiver.business_state}, {caregiver.business_country}</span>
                          </div>

                          {/* Specializations */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Specializations:</p>
                            <div className="flex flex-wrap gap-1">
                              {caregiver.specialization?.split(',').slice(0, 3).map((spec, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {spec.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Consultation Modes */}
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Available via:</p>
                            <div className="flex gap-2">
                              {caregiver.consultation_modes?.split(',').map((mode, idx) => (
                                <Badge key={idx} variant="outline" className="flex items-center gap-1 text-xs">
                                  {getConsultationModeIcon(mode.trim())}
                                  {mode.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {Math.round(caregiver.match_score)}%
                        </div>
                        <p className="text-xs text-gray-500">Match</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      {caregiver.consultation_modes?.includes('chat') && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookConsultation(caregiver, 'chat');
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat Now
                        </Button>
                      )}
                      {caregiver.consultation_modes?.includes('video') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookConsultation(caregiver, 'video');
                          }}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Video Call
                        </Button>
                      )}
                      {caregiver.consultation_modes?.includes('in-person') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookConsultation(caregiver, 'in-person');
                          }}
                        >
                          <Building2 className="w-4 h-4 mr-2" />
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Need help choosing? Our AI assistant can guide you through the selection process.
          </p>
        </div>
      </div>
    </div>
  );
}
