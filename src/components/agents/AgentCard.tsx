import { Agent } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Check, AlertCircle, RefreshCw, User, Shuffle, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  showStance?: boolean;
}

const agentColors = [
  'bg-agent-1',
  'bg-agent-2', 
  'bg-agent-3',
  'bg-agent-4',
  'bg-agent-5',
];

export function AgentCard({ agent, showStance = false }: AgentCardProps) {
  const colorClass = agentColors[agent.colorIndex % agentColors.length];

  return (
    <div className={cn(
      'card-editorial p-5 transition-all duration-300 overflow-hidden',
      agent.status === 'ready' && 'animate-fade-in'
    )}>
      <div className="flex items-start gap-4 min-w-0">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0',
          colorClass
        )}>
          <User className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif font-semibold text-lg text-foreground truncate">
                {agent.name || 'Generating...'}
              </h3>
              {agent.title && (
                <p className="text-sm text-muted-foreground truncate">
                  {agent.title}
                </p>
              )}
            </div>
            
            <StatusIndicator status={agent.status} attempts={agent.generationAttempts} />
          </div>

          {agent.status === 'ready' && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {agent.isWildcard && (
                  <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium flex items-center gap-1">
                    <Shuffle className="w-3 h-3" />
                    Wildcard
                  </span>
                )}
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {agent.domain}
                </span>
                <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                  {agent.theoreticalFramework}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                {agent.criticalPerspective}
              </p>

              {/* Thematic Anchors - More prominent */}
              {agent.briefSnippets && agent.briefSnippets.length > 0 && (
                <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Quote className="w-3 h-3" />
                    Thematic Anchors
                  </p>
                  <ul className="space-y-1">
                    {agent.briefSnippets.slice(0, 3).map((snippet, i) => (
                      <li key={i} className="text-xs text-foreground/80 italic pl-2 border-l-2 border-accent/40">
                        {snippet.slice(0, 60)}{snippet.length > 60 ? '...' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wildcard Bridge */}
              {agent.isWildcard && agent.wildcardBridge && (
                <p className="text-xs text-warning/80 italic">
                  Bridge: {agent.wildcardBridge.slice(0, 100)}{agent.wildcardBridge.length > 100 ? '...' : ''}
                </p>
              )}

              {agent.keyReferences && agent.keyReferences.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">References:</span>{' '}
                  {agent.keyReferences.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          )}

          {showStance && agent.initialStance && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Initial Critical Stance</h4>
              <p className="text-sm text-muted-foreground prose-editorial leading-relaxed">
                {agent.initialStance}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status, attempts }: { status: Agent['status']; attempts: number }) {
  switch (status) {
    case 'generating':
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoadingSpinner size="sm" />
          <span className="text-xs">Generating...</span>
        </div>
      );
    case 'validating':
      return (
        <div className="flex items-center gap-2 text-info">
          <LoadingSpinner size="sm" />
          <span className="text-xs">Validating...</span>
        </div>
      );
    case 'ready':
      return (
        <div className="flex items-center gap-2 text-success">
          <Check className="w-4 h-4" />
          <span className="text-xs">Ready</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-2 text-destructive">
          {attempts > 1 ? (
            <RefreshCw className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-xs">
            {attempts > 1 ? `Retry ${attempts}` : 'Error'}
          </span>
        </div>
      );
    default:
      return null;
  }
}
