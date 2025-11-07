'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Agent {
  name: string;
  id: string;
}

interface Project {
  name: string;
  id: string;
  agents: Agent[];
  icon: string;
}

const projects: Project[] = [
  {
    id: 'medical-agents',
    name: 'Medical Agents',
    icon: '🏥',
    agents: [
      { id: 'symptom-checker', name: 'Symptom Checker' },
      { id: 'appointment-scheduler', name: 'Appointment Scheduler' },
      { id: 'medication-advisor', name: 'Medication Advisor' },
    ],
  },
  {
    id: 'emergency-ai',
    name: 'Emergency AI',
    icon: '🚨',
    agents: [
      { id: 'triage-assistant', name: 'Triage Assistant' },
      { id: 'emergency-guide', name: 'Emergency Guide' },
    ],
  },
  {
    id: 'patient-support',
    name: 'Patient Support AI',
    icon: '💬',
    agents: [
      { id: 'health-coach', name: 'Health Coach' },
      { id: 'wellness-advisor', name: 'Wellness Advisor' },
    ],
  },
  {
    id: 'diagnostics',
    name: 'Diagnostics & Analysis',
    icon: '🔬',
    agents: [
      { id: 'lab-results', name: 'Lab Results Analyzer' },
      { id: 'imaging-assistant', name: 'Imaging Assistant' },
    ],
  },
];

interface SidebarProps {
  selectedAgent: string;
  onSelectAgent: (agentId: string) => void;
}

export function Sidebar({ selectedAgent, onSelectAgent }: SidebarProps) {
  const [openProjects, setOpenProjects] = useState<string[]>(['medical-agents']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[#E8E5B8] border-r border-gray-300 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {projects.map((project) => (
          <div key={project.id} className="text-2xl mb-3">
            {project.icon}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#E8E5B8] border-r border-gray-300 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold text-sm uppercase tracking-wide">Projects</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-lg">⋯</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-2">
          {projects.map((project) => (
            <Collapsible
              key={project.id}
              open={openProjects.includes(project.id)}
              onOpenChange={() => toggleProject(project.id)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/50 transition-colors">
                <span className="text-lg">{project.icon}</span>
                <span className="flex-1 text-left text-sm font-medium">
                  {project.name}
                </span>
                {openProjects.includes(project.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 ml-6 space-y-1">
                {project.agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedAgent === agent.id
                        ? 'bg-white text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-white/30'
                    }`}
                  >
                    {agent.name}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
