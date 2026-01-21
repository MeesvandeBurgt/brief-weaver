import { useApp } from '@/contexts/AppContext';
import { BookOpen, Users, MessageSquare, Lightbulb } from 'lucide-react';

const phases = [
  { id: 'input', label: 'Brief Input', icon: BookOpen },
  { id: 'generation', label: 'Agents', icon: Users },
  { id: 'conversation', label: 'Critical Dialogue', icon: MessageSquare },
  { id: 'synthesis', label: 'Synthesis', icon: Lightbulb },
] as const;

export function Header() {
  const { state } = useApp();
  const currentPhaseIndex = phases.findIndex((p) => p.id === state.phase);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold text-foreground">
                Critical Brief Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-Mediated Design Discourse
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.id === state.phase;
              const isCompleted = index < currentPhaseIndex;
              const isAccessible = index <= currentPhaseIndex;

              return (
                <div key={phase.id} className="flex items-center">
                  <div
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                      ${isActive ? 'bg-primary text-primary-foreground' : ''}
                      ${isCompleted ? 'text-success' : ''}
                      ${!isActive && !isCompleted ? 'text-muted-foreground' : ''}
                      ${isAccessible ? '' : 'opacity-50'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{phase.label}</span>
                  </div>
                  {index < phases.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        index < currentPhaseIndex ? 'bg-success' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
