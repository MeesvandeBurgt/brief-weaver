import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useConversations } from '@/hooks/useConversations';
import { FrameCard } from '@/components/synthesis/FrameCard';
import { ThinkingBox } from '@/components/synthesis/ThinkingBox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Frame } from '@/types';
import { Lightbulb, Download, RefreshCw, ArrowLeft, Copy, Check, FileText, LayoutGrid, Box } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

export function SynthesisPhase() {
  const { state, dispatch } = useApp();
  const { synthesizeFrames } = useConversations();
  const [localFrames, setLocalFrames] = useState<Frame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'box' | 'cards'>('box');

  // Load frames from persisted state OR generate new ones
  useEffect(() => {
    // Already have local frames, do nothing
    if (localFrames.length > 0) return;
    
    // Load from persisted state if available
    if (state.frames && state.frames.length > 0) {
      setLocalFrames(state.frames);
      return;
    }
    
    // Generate new frames if we have conversations
    if (state.conversations.length > 0 && !isGenerating) {
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
  }, [state.frames, state.conversations, localFrames.length, isGenerating, synthesizeFrames, dispatch]);

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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidth);
      
      for (const line of lines) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      }
      y += 4;
    };

    const addSection = (title: string) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      y += 8;
      addText(title, 14, true, [59, 130, 246]);
      y += 2;
    };

    // Title
    addText('Critical Design Brief Analysis', 20, true);
    addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, [128, 128, 128]);
    y += 10;

    // Brief Summary
    if (state.brief) {
      addSection('Design Brief');
      const briefPreview = state.brief.content.slice(0, 500) + (state.brief.content.length > 500 ? '...' : '');
      addText(briefPreview, 10);
    }

    // Agents
    addSection('Agents');
    state.agents.forEach((agent, i) => {
      addText(`${i + 1}. ${agent.name}`, 11, true);
      addText(`${agent.title} | ${agent.domain}`, 9, false, [100, 100, 100]);
      addText(`Framework: ${agent.theoreticalFramework}`, 9);
      if (agent.isWildcard) {
        addText('(Wildcard Agent)', 9, false, [234, 179, 8]);
      }
      y += 4;
    });

    // Conversation Summaries
    addSection('Dialogue Summaries');
    state.conversations.forEach((conv, i) => {
      const agent1 = state.agents.find(a => a.id === conv.agent1Id);
      const agent2 = state.agents.find(a => a.id === conv.agent2Id);
      addText(`Dialogue ${i + 1}: ${agent1?.name?.split(' ').pop()} × ${agent2?.name?.split(' ').pop()}`, 11, true);
      if (conv.summary) {
        addText(conv.summary.slice(0, 400) + (conv.summary.length > 400 ? '...' : ''), 9);
      }
      y += 4;
    });

    // Alternative Frames
    addSection('Alternative Problem Frames');
    localFrames.forEach((frame, i) => {
      addText(`Frame ${i + 1}: ${frame.title}`, 12, true);
      addText(frame.coreNarrative, 10);
      addText(`Reveals: ${frame.makesVisible}`, 9, false, [80, 80, 80]);
      addText(`Historical Grounding: ${frame.historicalGrounding}`, 9, false, [80, 80, 80]);
      addText(`Design Implications: ${frame.designImplications}`, 9, false, [80, 80, 80]);
      y += 6;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Brief Weaver Analysis | Page ${i} of ${pageCount}`, margin, 290);
    }

    doc.save(`critical-analysis-${Date.now()}.pdf`);
    toast.success('PDF exported successfully');
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

      {/* Empty State - No conversations */}
      {!isGenerating && localFrames.length === 0 && state.conversations.length === 0 && (
        <div className="card-editorial p-12 text-center mb-8">
          <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
            No Conversations Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Complete the agent dialogues first to generate synthesis frames.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dialogues
          </Button>
        </div>
      )}

      {/* Empty State - Has conversations but no frames yet */}
      {!isGenerating && localFrames.length === 0 && state.conversations.length > 0 && (
        <div className="card-editorial p-12 text-center mb-8">
          <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
            Ready to Synthesize
          </h3>
          <p className="text-muted-foreground mb-4">
            {state.conversations.length} conversation(s) ready. Generating frames...
          </p>
          <LoadingSpinner size="md" className="mx-auto" />
        </div>
      )}

      {/* Frames Grid */}
      {!isGenerating && localFrames.length > 0 && (
        <>
          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={viewMode === 'box' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('box')}
            >
              <Box className="w-4 h-4 mr-2" />
              Think Outside the Box
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Card View
            </Button>
          </div>

          {/* Interactive Box View */}
          {viewMode === 'box' && (
            <div className="card-editorial mb-8 overflow-hidden">
              <ThinkingBox
                frames={localFrames}
                briefSummary={state.brief?.content.slice(0, 200) || ''}
                conversations={state.conversations}
                onFrameSelect={(frame) => {
                  // Frame selection is handled inside ThinkingBox
                }}
              />
            </div>
          )}

          {/* Traditional Card View */}
          {viewMode === 'cards' && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {localFrames.map((frame, index) => (
                <FrameCard key={frame.id} frame={frame} index={index} />
              ))}
            </div>
          )}

          {/* Summary Stats */}
          <div className="card-editorial p-6 mb-8">
            <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
              Analysis Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-serif font-bold text-primary">{state.agents.length}</p>
                <p className="text-sm text-muted-foreground">Agents</p>
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
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
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
