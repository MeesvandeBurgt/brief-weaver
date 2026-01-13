import { Message, Agent } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  agent: Agent;
  isStreaming?: boolean;
}

const agentBorderColors = [
  'border-l-agent-1',
  'border-l-agent-2',
  'border-l-agent-3',
  'border-l-agent-4',
  'border-l-agent-5',
];

export function MessageBubble({ message, agent, isStreaming = false }: MessageBubbleProps) {
  const borderColor = agentBorderColors[agent.colorIndex % agentBorderColors.length];

  return (
    <div className={cn(
      'message-bubble py-4 animate-slide-up',
      borderColor
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-serif font-semibold text-foreground">
          {agent.name}
        </span>
        <span className="text-xs text-muted-foreground">
          Turn {message.turnNumber}
        </span>
        {isStreaming && (
          <span className="text-xs text-accent animate-pulse">
            typing...
          </span>
        )}
      </div>
      <div className="prose-editorial text-foreground/90">
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i} className={cn(i > 0 && 'mt-3')}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
