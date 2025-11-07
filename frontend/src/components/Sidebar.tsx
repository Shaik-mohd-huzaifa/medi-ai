'use client';

import { useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Project {
  name: string;
  id: string;
  icon: string;
}

const projects: Project[] = [
  {
    id: 'symptom-checker',
    name: 'Symptom Checker',
    icon: '🔍',
  },
  {
    id: 'appointment-scheduler',
    name: 'Appointment Scheduler',
    icon: '📅',
  },
  {
    id: 'medication-advisor',
    name: 'Medication Advisor',
    icon: '💊',
  },
  {
    id: 'triage-assistant',
    name: 'Triage Assistant',
    icon: '🚑',
  },
  {
    id: 'health-coach',
    name: 'Health Coach',
    icon: '💪',
  },
];

interface SidebarProps {
  selectedAgent: string;
  onSelectAgent: (agentId: string) => void;
}

export function Sidebar({ selectedAgent, onSelectAgent }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            <button
              key={project.id}
              onClick={() => onSelectAgent(project.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                selectedAgent === project.id
                  ? 'bg-white text-gray-900 font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              <span className="text-lg">{project.icon}</span>
              <span className="flex-1 text-left text-sm font-medium">
                {project.name}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
