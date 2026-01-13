import { useEffect, useRef } from 'react';
import { Conversation, Agent } from '@/types';
import { MessageBubble } from './MessageBubble';
import { ProgressBar } from '@/components/common/ProgressBar';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConversationModalProps {
  conversation: Conversation;
  agent1: Agent;
  agent2: Agent;
  onClose: () => void;
  streamingMessage?: string;
  streamingAgentId?: string;
}

export function ConversationModal({
  conversation,
  agent1,
  agent2,
  onClose,
  streamingMessage,
  streamingAgentId,
}: ConversationModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, streamingMessage]);

  const getAgentForMessage = (agentId: string) => {
    return agentId === agent1.id ? agent1 : agent2;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-card rounded-xl shadow-editorial-lg flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-accent" />
            <div>
              <h2 className="font-serif font-semibold text-lg text-foreground">
                {agent1.name.split(' ').slice(-1)[0]} × {agent2.name.split(' ').slice(-1)[0]}
              </h2>
              <p className="text-sm text-muted-foreground">
                {agent1.theoreticalFramework} meets {agent2.theoreticalFramework}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              Dialogue Progress
            </span>
            <span className="text-xs font-medium text-foreground">
              Turn {conversation.currentTurn} of {conversation.maxTurns}
            </span>
          </div>
          <ProgressBar value={conversation.currentTurn} max={conversation.maxTurns} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              agent={getAgentForMessage(message.agentId)}
            />
          ))}
          
          {/* Streaming message */}
          {streamingMessage && streamingAgentId && (
            <MessageBubble
              message={{
                id: 'streaming',
                agentId: streamingAgentId,
                content: streamingMessage,
                turnNumber: conversation.currentTurn + 1,
                timestamp: new Date(),
              }}
              agent={getAgentForMessage(streamingAgentId)}
              isStreaming
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        {conversation.status === 'completed' && conversation.summary && (
          <div className="p-4 border-t border-border bg-muted/30">
            <h3 className="font-medium text-foreground mb-2">Conversation Summary</h3>
            <p className="text-sm text-muted-foreground">{conversation.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
