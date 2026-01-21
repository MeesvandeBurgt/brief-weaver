import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAgentGeneration } from '@/hooks/useAgentGeneration';
import { AgentCard } from '@/components/agents/AgentCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { Agent } from '@/types';

export function GenerationPhase() {
  const { state, dispatch } = useApp();
  const { generateAgents, isGenerating, error } = useAgentGeneration();
  const [localAgents, setLocalAgents] = useState<Agent[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const readyAgents = localAgents.filter(a => a.status === 'ready').length;
  const allReady = readyAgents === state.agentCount;

  useEffect(() => {
    if (!hasStarted && state.brief) {
      setHasStarted(true);
      
      generateAgents(
        state.brief.content,
        state.agentCount,
        (agent) => {
          setLocalAgents(prev => {
            const existing = prev.findIndex(a => a.colorIndex === agent.colorIndex);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = agent;
              return updated;
            }
            return [...prev, agent];
          });
        },
        state.includeWildcard
      ).then((agents) => {
        dispatch({ type: 'SET_AGENTS', agents });
      }).catch(console.error);
    }
  }, [hasStarted, state.brief, state.agentCount, state.includeWildcard, generateAgents, dispatch]);

  const handleBack = () => {
    dispatch({ type: 'SET_PHASE', phase: 'input' });
    setLocalAgents([]);
    setHasStarted(false);
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_PHASE', phase: 'conversation' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          <Users className="w-4 h-4" />
          Phase 2: Agent Generation
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Assembling Critical Agents
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          AI is generating agents with unique theoretical lenses to analyze your brief.
        </p>
      </div>

      {/* Progress */}
      <div className="card-editorial p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {isGenerating ? 'Generating agents...' : allReady ? 'All agents ready!' : 'Generation complete'}
          </span>
          <span className="text-sm text-muted-foreground">
            {readyAgents} of {state.agentCount} ready
          </span>
        </div>
        <ProgressBar value={readyAgents} max={state.agentCount} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Generation Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: state.agentCount }).map((_, i) => {
          const agent = localAgents.find(a => a.colorIndex === i);
          if (agent) {
            return <AgentCard key={agent.id} agent={agent} />;
          }
          return (
            <div key={i} className="card-editorial p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Brief
        </Button>
        
        <Button 
          size="lg"
          disabled={!allReady || isGenerating}
          onClick={handleContinue}
          className="px-6"
        >
          Start Dialogues
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {allReady && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          {localAgents.length * (localAgents.length - 1) / 2} critical dialogues will be generated
        </p>
      )}
    </div>
  );
}
