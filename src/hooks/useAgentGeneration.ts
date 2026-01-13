import { useState, useCallback } from 'react';
import { Agent } from '@/types';
import { callOpenRouter } from '@/services/openrouter';
import { AGENT_GENERATION_PROMPT, AGENT_STANCE_PROMPT } from '@/utils/promptTemplates';

export function useAgentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAgent = useCallback(async (
    briefText: string,
    colorIndex: number,
    existingAgents: Agent[] = []
  ): Promise<Agent | null> => {
    try {
      // Generate agent persona
      const personaPrompt = existingAgents.length > 0
        ? `${AGENT_GENERATION_PROMPT(briefText)}\n\nIMPORTANT: Create a persona DIFFERENT from these existing experts:\n${existingAgents.map(a => `- ${a.name}: ${a.domain}, ${a.theoreticalFramework}`).join('\n')}`
        : AGENT_GENERATION_PROMPT(briefText);

      const personaResponse = await callOpenRouter({
        messages: [{ role: 'user', content: personaPrompt }],
        temperature: 0.9,
        max_tokens: 1000,
      });

      // Parse JSON response
      let personaData;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = personaResponse.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        personaData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse persona:', personaResponse);
        throw new Error('Failed to parse agent persona');
      }

      const agentId = `agent-${Date.now()}-${colorIndex}`;

      const agent: Agent = {
        id: agentId,
        name: personaData.name || 'Dr. Unknown',
        title: personaData.title || 'Scholar',
        domain: personaData.domain || 'Critical Theory',
        theoreticalFramework: personaData.theoreticalFramework || 'Critical Analysis',
        historicalFocus: personaData.historicalFocus || 'Modern Era',
        keyReferences: personaData.keyReferences || [],
        stanceKeywords: personaData.stanceKeywords || [],
        criticalPerspective: personaData.criticalPerspective || '',
        initialStance: '',
        colorIndex,
        status: 'validating',
        generationAttempts: 1,
      };

      // Generate initial stance
      const stanceResponse = await callOpenRouter({
        messages: [{
          role: 'user',
          content: AGENT_STANCE_PROMPT(agent, briefText),
        }],
        temperature: 0.85,
        max_tokens: 1500,
      });

      agent.initialStance = stanceResponse.content;
      agent.status = 'ready';

      return agent;
    } catch (err) {
      console.error('Agent generation error:', err);
      return null;
    }
  }, []);

  const generateAgents = useCallback(async (
    briefText: string,
    count: number,
    onAgentUpdate: (agent: Agent) => void
  ): Promise<Agent[]> => {
    setIsGenerating(true);
    setError(null);
    const agents: Agent[] = [];

    try {
      for (let i = 0; i < count; i++) {
        // Create placeholder agent
        const placeholderAgent: Agent = {
          id: `placeholder-${i}`,
          name: '',
          title: '',
          domain: '',
          theoreticalFramework: '',
          historicalFocus: '',
          keyReferences: [],
          stanceKeywords: [],
          criticalPerspective: '',
          initialStance: '',
          colorIndex: i,
          status: 'generating',
          generationAttempts: 0,
        };
        onAgentUpdate(placeholderAgent);

        // Generate actual agent
        let attempts = 0;
        let agent: Agent | null = null;

        while (!agent && attempts < 3) {
          attempts++;
          agent = await generateAgent(briefText, i, agents);

          if (!agent) {
            onAgentUpdate({ ...placeholderAgent, status: 'error', generationAttempts: attempts });
            await new Promise(r => setTimeout(r, 1000)); // Wait before retry
          }
        }

        if (agent) {
          agents.push(agent);
          onAgentUpdate(agent);
        } else {
          throw new Error(`Failed to generate agent ${i + 1} after ${attempts} attempts`);
        }

        // Add delay between agents to avoid rate limiting
        if (i < count - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      return agents;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate agents';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [generateAgent]);

  return { generateAgents, isGenerating, error };
}
