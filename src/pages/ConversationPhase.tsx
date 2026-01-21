import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useConversations } from '@/hooks/useConversations';
import { ConversationCard } from '@/components/conversations/ConversationCard';
import { ConversationModal } from '@/components/conversations/ConversationModal';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types';
import { MessageSquare, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export function ConversationPhase() {
  const { state, dispatch } = useApp();
  const [localConversations, setLocalConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    createConversationPairs,
    runAllConversations,
    isRunning,
    currentConversationId,
    streamingContent,
    streamingAgentId,
  } = useConversations({
    maxTurns: 10,
    onConversationUpdate: (conv) => {
      setLocalConversations(prev => {
        const existing = prev.findIndex(c => c.id === conv.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = conv;
          return updated;
        }
        return [...prev, conv];
      });
    },
    onMessageAdd: (convId, message) => {
      setLocalConversations(prev => 
        prev.map(c => 
          c.id === convId 
            ? { ...c, messages: [...c.messages, message] }
            : c
        )
      );
    },
  });

  useEffect(() => {
    if (!hasStarted && state.agents.length > 0) {
      setHasStarted(true);
      const conversations = createConversationPairs(state.agents);
      setLocalConversations(conversations);

      runAllConversations(conversations, state.agents)
        .then((completed) => {
          dispatch({ type: 'SET_CONVERSATIONS', conversations: completed });
        })
        .catch(console.error);
    }
  }, [hasStarted, state.agents, createConversationPairs, runAllConversations, dispatch]);

  const completedCount = localConversations.filter(c => c.status === 'completed').length;
  const totalCount = localConversations.length;
  const allComplete = completedCount === totalCount && totalCount > 0;

  const handleBack = () => {
    dispatch({ type: 'SET_PHASE', phase: 'generation' });
    setLocalConversations([]);
    setHasStarted(false);
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_PHASE', phase: 'synthesis' });
  };

  const getAgentById = (id: string) => state.agents.find(a => a.id === id)!;

  // Update selected conversation with latest data
  const currentSelectedConv = selectedConversation 
    ? localConversations.find(c => c.id === selectedConversation.id) || selectedConversation
    : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
          <MessageSquare className="w-4 h-4" />
          Phase 3: Critical Dialogue
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Agents in Discourse
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Watch as agents engage in critical dialogue, surfacing hidden narratives in your brief.
        </p>
      </div>

      {/* Progress */}
      <div className="card-editorial p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isRunning && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
            <span className="text-sm font-medium text-foreground">
              {isRunning ? 'Dialogues in progress...' : allComplete ? 'All dialogues complete!' : 'Starting dialogues...'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <ProgressBar value={completedCount} max={totalCount} />
      </div>

      {/* Conversation Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {localConversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            conversation={conv}
            agent1={getAgentById(conv.agent1Id)}
            agent2={getAgentById(conv.agent2Id)}
            onClick={() => setSelectedConversation(conv)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={isRunning}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Agents
        </Button>
        
        <Button 
          size="lg"
          disabled={!allComplete}
          onClick={handleContinue}
          className="px-6"
        >
          View Synthesis
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Conversation Modal */}
      {currentSelectedConv && (
        <ConversationModal
          conversation={currentSelectedConv}
          agent1={getAgentById(currentSelectedConv.agent1Id)}
          agent2={getAgentById(currentSelectedConv.agent2Id)}
          onClose={() => setSelectedConversation(null)}
          streamingMessage={currentSelectedConv.id === currentConversationId ? streamingContent : undefined}
          streamingAgentId={currentSelectedConv.id === currentConversationId ? streamingAgentId : undefined}
        />
      )}
    </div>
  );
}
