import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useConversations } from '@/hooks/useConversations';
import { FrameCard } from '@/components/synthesis/FrameCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Frame } from '@/types';
import { Lightbulb, Download, RefreshCw, ArrowLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function SynthesisPhase() {
  const { state, dispatch } = useApp();
  const { synthesizeFrames } = useConversations();
  const [localFrames, setLocalFrames] = useState<Frame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hasGenerated && state.conversations.length > 0) {
      setHasGenerated(true);
      setIsGenerating(true);

      synthesizeFrames(state.conversations)
        .then((frames) => {
          setLocalFrames(frames);
          dispatch({ type: 'SET_FRAMES', frames });
        })
        .catch((err) => {
          console.error('Synthesis error:', err);
          toast.error('Failed to synthesize frames. Please try again.');
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [hasGenerated, state.conversations, synthesizeFrames, dispatch]);

  const handleRestart = () => {
    dispatch({ type: 'RESET' });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_PHASE', phase: 'conversation' });
  };

  const handleExport = () => {
    const exportData = {
      brief: state.brief,
      agents: state.agents.map(a => ({
        name: a.name,
        title: a.title,
        domain: a.domain,
        framework: a.theoreticalFramework,
        stance: a.initialStance,
      })),
      conversations: state.conversations.map(c => ({
        agents: [
          state.agents.find(a => a.id === c.agent1Id)?.name,
          state.agents.find(a => a.id === c.agent2Id)?.name,
        ],
        summary: c.summary,
        messageCount: c.messages.length,
      })),
      frames: localFrames,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `critical-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analysis exported successfully');
  };

  const handleCopyFrames = async () => {
    const text = localFrames.map(f => 
      `## ${f.title}\n\n${f.coreNarrative}\n\n**Reveals:** ${f.makesVisible}\n\n**Grounding:** ${f.historicalGrounding}\n\n**Implications:** ${f.designImplications}`
    ).join('\n\n---\n\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Frames copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-4">
          <Lightbulb className="w-4 h-4" />
          Phase 4: Synthesis
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Alternative Problem Frames
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover fundamentally different ways to understand and approach your design challenge.
        </p>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="card-editorial p-12 text-center mb-8">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
            Synthesizing Insights
          </h3>
          <p className="text-muted-foreground">
            Analyzing conversation patterns to generate alternative problem frames...
          </p>
        </div>
      )}

      {/* Frames Grid */}
      {!isGenerating && localFrames.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {localFrames.map((frame, index) => (
              <FrameCard key={frame.id} frame={frame} index={index} />
            ))}
          </div>

          {/* Summary Stats */}
          <div className="card-editorial p-6 mb-8">
            <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
              Analysis Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-serif font-bold text-primary">{state.agents.length}</p>
                <p className="text-sm text-muted-foreground">Expert Agents</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-primary">{state.conversations.length}</p>
                <p className="text-sm text-muted-foreground">Dialogues</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-primary">
                  {state.conversations.reduce((sum, c) => sum + c.messages.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Exchanges</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-accent">{localFrames.length}</p>
                <p className="text-sm text-muted-foreground">Frames Generated</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Button variant="outline" onClick={handleCopyFrames}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Frames'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Full Analysis
            </Button>
            <Button onClick={handleRestart}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze New Brief
            </Button>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dialogues
        </Button>
      </div>
    </div>
  );
}
