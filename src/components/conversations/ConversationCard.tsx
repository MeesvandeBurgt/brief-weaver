import { Conversation, Agent } from '@/types';
import { ProgressBar } from '@/components/common/ProgressBar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageSquare, Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationCardProps {
  conversation: Conversation;
  agent1: Agent;
  agent2: Agent;
  onClick: () => void;
}

const agentColors = [
  'bg-agent-1',
  'bg-agent-2',
  'bg-agent-3',
  'bg-agent-4',
  'bg-agent-5',
];

export function ConversationCard({ 
  conversation, 
  agent1, 
  agent2, 
  onClick 
}: ConversationCardProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const color1 = agentColors[agent1.colorIndex % agentColors.length];
  const color2 = agentColors[agent2.colorIndex % agentColors.length];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left card-editorial p-4 transition-all duration-200 hover:shadow-editorial-lg',
        conversation.status === 'in_progress' && 'ring-2 ring-accent/50'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center -space-x-2">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-card', color1)}>
            {agent1.name.split(' ').pop()?.charAt(0)}
          </div>
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-card', color2)}>
            {agent2.name.split(' ').pop()?.charAt(0)}
          </div>
        </div>
        
        <StatusBadge status={conversation.status} />
      </div>

      <div className="space-y-1 mb-3">
        <p className="text-sm font-medium text-foreground truncate">
          {agent1.name.split(' ').slice(-1)[0]} × {agent2.name.split(' ').slice(-1)[0]}
        </p>
        <p className="text-xs text-muted-foreground">
          {agent1.theoreticalFramework} vs {agent2.theoreticalFramework}
        </p>
      </div>

      {conversation.status !== 'pending' && (
        <ProgressBar 
          value={conversation.currentTurn} 
          max={conversation.maxTurns}
          className="mb-3"
        />
      )}

      {lastMessage && (
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          "{lastMessage.content.slice(0, 100)}..."
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {conversation.messages.length} exchanges
        </span>
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: Conversation['status'] }) {
  const styles = {
    pending: 'bg-muted text-muted-foreground',
    in_progress: 'bg-accent/20 text-accent',
    completed: 'bg-success/20 text-success',
    error: 'bg-destructive/20 text-destructive',
  };

  const icons = {
    pending: Clock,
    in_progress: LoadingSpinner,
    completed: Check,
    error: AlertCircle,
  };

  const labels = {
    pending: 'Queued',
    in_progress: 'Active',
    completed: 'Done',
    error: 'Error',
  };

  const Icon = icons[status];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', styles[status])}>
      {status === 'in_progress' ? (
        <LoadingSpinner size="sm" className="w-3 h-3" />
      ) : (
        <Icon className="w-3 h-3" />
      )}
      {labels[status]}
    </span>
  );
}
