import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TextInput } from '@/components/brief-input/TextInput';
import { FileUploader } from '@/components/brief-input/FileUploader';
import { AgentCountSelector } from '@/components/brief-input/AgentCountSelector';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, FileText, Type, Sparkles, Shuffle } from 'lucide-react';

export function InputPhase() {
  const { state, dispatch } = useApp();
  const [briefText, setBriefText] = useState('');
  const [fileName, setFileName] = useState<string>();
  const [inputMethod, setInputMethod] = useState<'paste' | 'file'>('paste');

  const isValid = briefText.length >= 100;

  const handleFileContent = (content: string, name: string) => {
    setBriefText(content);
    setFileName(name);
    setInputMethod('file');
  };

  const handleClearFile = () => {
    setBriefText('');
    setFileName(undefined);
  };

  const handleSubmit = () => {
    dispatch({
      type: 'SET_BRIEF',
      brief: {
        id: `brief-${Date.now()}`,
        content: briefText,
        source: inputMethod,
        fileName,
        uploadedAt: new Date(),
        characterCount: briefText.length,
      },
    });
    dispatch({ type: 'SET_PHASE', phase: 'generation' });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Mediated Critical Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
          Interrogate Your Design Brief
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Surface hidden assumptions, challenge normative frameworks, and discover 
          alternative problem narratives through critical discourse between AI agent personas.
        </p>
      </div>

      {/* Input Card */}
      <div className="card-editorial p-6 md:p-8 mb-8">
        <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'paste' | 'file')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste">
            <TextInput value={briefText} onChange={setBriefText} />
          </TabsContent>

          <TabsContent value="file">
            <FileUploader 
              onFileContent={handleFileContent}
              onClear={handleClearFile}
              currentFile={fileName}
            />
            {fileName && briefText && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <p className="text-sm text-foreground line-clamp-3">
                  {briefText.slice(0, 300)}...
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Agent Count Selection */}
      <div className="card-editorial p-6 md:p-8 mb-8">
        <AgentCountSelector 
          value={state.agentCount} 
          onChange={(count) => dispatch({ type: 'SET_AGENT_COUNT', count })}
        />

        {/* Wildcard Toggle */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3">
              <Switch
                id="wildcard-toggle"
                checked={state.includeWildcard}
                onCheckedChange={(checked) => dispatch({ type: 'SET_INCLUDE_WILDCARD', include: checked })}
              />
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-accent" />
                <label htmlFor="wildcard-toggle" className="font-medium text-foreground cursor-pointer">
                  Include Wildcard Agent
                </label>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 ml-12">
            Add one agent from an unexpected domain who can offer surprising perspectives. 
            They'll have a concrete bridge connecting their domain to your brief.
          </p>
          {state.includeWildcard && (
            <p className="text-xs text-accent mt-2 ml-12">
              One of your {state.agentCount} agents will be a wildcard.
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          disabled={!isValid}
          onClick={handleSubmit}
          className="px-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90 shadow-editorial btn-glow"
        >
          Generate Agents
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {!isValid && briefText.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Add {100 - briefText.length} more characters to continue
        </p>
      )}
    </div>
  );
}
