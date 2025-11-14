'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  MessageSquare, 
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Plus,
  Filter,
  Users,
  Activity
} from 'lucide-react';
import { bedrockApi } from '@/services/api';
import { CaregiverChatPanel } from '@/components/CaregiverChatPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PatientRequest {
  id: string;
  patientName: string;
  symptoms: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt: Date;
  age?: number;
  status: 'new' | 'in-progress' | 'completed';
  assignedTo?: string;
  notes?: string;
  preferredMode?: 'chat' | 'call' | 'in-person';
}

export function CaregiverDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'triage' | 'chat'>('triage');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock patient requests - in production, fetch from API
  const [patientRequests] = useState<PatientRequest[]>([
    {
      id: '1',
      patientName: 'John Doe',
      symptoms: 'Persistent cough, mild fever (100.5°F)',
      severity: 'medium',
      requestedAt: new Date('2024-11-10T09:30:00'),
      age: 35,
      status: 'new',
      preferredMode: 'chat',
    },
    {
      id: '2',
      patientName: 'Sarah Smith',
      symptoms: 'Severe chest pain, difficulty breathing',
      severity: 'urgent',
      requestedAt: new Date('2024-11-10T10:15:00'),
      age: 58,
      status: 'in-progress',
      assignedTo: 'You',
      preferredMode: 'call',
    },
    {
      id: '3',
      patientName: 'Mike Johnson',
      symptoms: 'Mild headache, slight nausea',
      severity: 'low',
      requestedAt: new Date('2024-11-10T08:00:00'),
      age: 28,
      status: 'new',
      preferredMode: 'chat',
    },
    {
      id: '4',
      patientName: 'Emily Davis',
      symptoms: 'Sprained ankle, swelling',
      severity: 'medium',
      requestedAt: new Date('2024-11-10T07:45:00'),
      age: 42,
      status: 'completed',
      assignedTo: 'Dr. Williams',
      preferredMode: 'in-person',
    },
  ]);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const handleAcceptRequest = (requestId: string) => {
    // TODO: Update request status in database
    alert(`Request ${requestId} accepted! In production, this would update the database and notify the patient.`);
    // For now, just show the action worked
  };

  const handleViewDetails = (requestId: string) => {
    // TODO: Show detailed patient information modal
    alert(`Viewing details for request ${requestId}. In production, this would show full patient history.`);
  };

  const handleChatWithPatient = () => {
    // Switch to chat view to see real patient conversations
    setActiveView('chat');
  };

  const handleCompleteRequest = (requestId: string) => {
    // TODO: Mark request as completed in database
    alert(`Request ${requestId} marked as complete! In production, this would update the database.`);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const payload = {
        messages: [
          {
            role: 'system' as const,
            content: `You are AIRA Medical Professional Assistant, an AI designed specifically to support healthcare providers (doctors, nurses, caregivers) in their clinical practice.

**Your Role & Capabilities:**

1. **CLINICAL DECISION SUPPORT:**
   - Help analyze patient symptoms and suggest differential diagnoses
   - Provide evidence-based treatment recommendations
   - Offer drug interaction checks and dosage guidance
   - Assist with medical terminology and clinical guidelines

2. **PATIENT TRIAGE ASSISTANCE:**
   - Help prioritize patient cases based on severity
   - Suggest appropriate urgency levels (low, medium, high, urgent)
   - Recommend immediate actions for critical cases
   - Assist with follow-up scheduling recommendations

3. **MEDICAL RESEARCH & INFORMATION:**
   - Provide up-to-date medical information
   - Reference clinical guidelines and protocols
   - Summarize medical literature findings
   - Explain complex medical concepts

4. **DOCUMENTATION SUPPORT:**
   - Help draft clinical notes and assessments
   - Suggest ICD codes and diagnoses terminology
   - Assist with treatment plan documentation
   - Generate patient education materials

5. **PROFESSIONAL COMMUNICATION:**
   - Use medical terminology appropriately
   - Maintain a professional, clinical tone
   - Provide structured, organized responses
   - Include relevant clinical reasoning

6. **IMPORTANT LIMITATIONS:**
   - Always emphasize you're supporting, not replacing, clinical judgment
   - Recommend consulting specialists when appropriate
   - Acknowledge when cases are beyond AI scope
   - Remind to follow local protocols and regulations

**Response Format:**
- Start with key clinical points
- Use bullet points for clarity
- Include severity indicators when relevant
- Provide actionable recommendations
- Cite evidence levels when applicable

**Example Interactions:**
- "What's your assessment of this patient case?"
- "Suggest differential diagnoses for these symptoms"
- "What are the treatment options for [condition]?"
- "Help me prioritize these patient requests"
- "Check for drug interactions between [medications]"

Remember: You're assisting licensed healthcare professionals who have final clinical decision-making authority.`,
          },
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          {
            role: 'user' as const,
            content: userMessage.content,
          },
        ],
        temperature: 0.5, // Lower temperature for more precise medical responses
      };

      const response = await bedrockApi.chatCompletion(payload);

      if (response.success && response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content || '' }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Sorry, I'm having trouble connecting right now. Please try again." 
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.detail || error.message || 'Unable to connect to server'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filterByStatus = (status: string) => {
    return patientRequests.filter(req => req.status === status);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AIRA</h2>
              <p className="text-xs text-gray-500">Caregiver Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <Button
            variant={activeView === 'triage' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => setActiveView('triage')}
          >
            <Users className="w-4 h-4 mr-2" />
            Patient Triage
          </Button>
          <Button
            variant={activeView === 'chat' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => setActiveView('chat')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'triage' ? (
          <>
            {/* Triage Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Patient Triage Board</h1>
                  <p className="text-gray-500 mt-1">Manage and prioritize patient consultation requests</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">New Requests</p>
                        <p className="text-2xl font-bold">{filterByStatus('new').length}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold">{filterByStatus('in-progress').length}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold">{filterByStatus('completed').length}</p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Urgent</p>
                        <p className="text-2xl font-bold">
                          {patientRequests.filter(r => r.severity === 'urgent').length}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* New Requests Column */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">New Requests</h3>
                      <Badge variant="secondary">{filterByStatus('new').length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {filterByStatus('new').map(request => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{request.patientName}</h4>
                              <p className="text-xs text-gray-500">Age: {request.age}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{request.symptoms}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={getSeverityColor(request.severity)}>
                              {request.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {request.requestedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-teal-600 hover:bg-teal-700"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleViewDetails(request.id)}
                            >
                              Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">In Progress</h3>
                      <Badge variant="secondary">{filterByStatus('in-progress').length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {filterByStatus('in-progress').map(request => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{request.patientName}</h4>
                              <p className="text-xs text-gray-500">Age: {request.age}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{request.symptoms}</p>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getSeverityColor(request.severity)}>
                              {request.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {request.requestedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {request.assignedTo && (
                            <p className="text-xs text-gray-600 mb-2">Assigned to: {request.assignedTo}</p>
                          )}
                          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleCompleteRequest(request.id)}
                            >
                              Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleChatWithPatient}
                            >
                              Chat
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Completed</h3>
                      <Badge variant="secondary">{filterByStatus('completed').length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {filterByStatus('completed').map(request => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{request.patientName}</h4>
                              <p className="text-xs text-gray-500">Age: {request.age}</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{request.symptoms}</p>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getSeverityColor(request.severity)}>
                              {request.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {request.requestedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {request.assignedTo && (
                            <p className="text-xs text-gray-600">Handled by: {request.assignedTo}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Patient Chat View */}
            <div className="bg-white border-b border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900">Patient Messages</h1>
              <p className="text-gray-500 mt-1">Chat with patients in real-time</p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <CaregiverChatPanel />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
