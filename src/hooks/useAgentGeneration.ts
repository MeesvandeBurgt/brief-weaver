import { useState, useCallback } from 'react';
import { Agent } from '@/types';
import { callOpenRouter } from '@/services/openrouter';
import { 
  AGENT_GENERATION_PROMPT, 
  AGENT_VALIDATION_PROMPT, 
  AGENT_STANCE_PROMPT,
  WILDCARD_AGENT_PROMPT 
} from '@/utils/promptTemplates';

const MIN_RELEVANCE_SCORE = 3;

export function useAgentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate agent relevance to brief
  const validateAgent = useCallback(async (
    agent: Partial<Agent>,
    briefText: string
  ): Promise<{ score: number; rationale: string } | null> => {
    try {
      const response = await callOpenRouter({
        messages: [{
          role: 'user',
          content: AGENT_VALIDATION_PROMPT(
            agent as { name: string; title: string; domain: string; theoreticalFramework: string; briefSnippets: string[]; consultationRationale: string },
            briefText
          ),
        }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      
      const data = JSON.parse(jsonMatch[0]);
      return {
        score: data.relevanceScore || 0,
        rationale: data.relevanceRationale || '',
      };
    } catch (err) {
      console.error('Validation error:', err);
      return null;
    }
  }, []);

  // Generate a core (domain-proximate) agent
  const generateCoreAgent = useCallback(async (
    briefText: string,
    colorIndex: number,
    existingAgents: Agent[] = []
  ): Promise<Agent | null> => {
    try {
      // Generate agent persona with domain-proximity requirements
      const personaPrompt = existingAgents.length > 0
        ? `${AGENT_GENERATION_PROMPT(briefText)}\n\nIMPORTANT: Create a persona with a DIFFERENT critical lens and domain focus from these existing experts. Aim for genuine intellectual diversity—if existing experts lean progressive, consider conservative/libertarian/traditionalist perspectives, and vice versa:\n${existingAgents.map(a => `- ${a.name}: ${a.domain}, ${a.theoreticalFramework}`).join('\n')}`
        : AGENT_GENERATION_PROMPT(briefText);

      const personaResponse = await callOpenRouter({
        messages: [{ role: 'user', content: personaPrompt }],
        temperature: 0.9,
        max_tokens: 4000,
      });

      // Parse JSON response
      let personaData;
      try {
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
        briefSnippets: personaData.briefSnippets || [],
        consultationRationale: personaData.consultationRationale || '',
        initialStance: '',
        colorIndex,
        status: 'validating',
        generationAttempts: 1,
        isWildcard: false,
      };

      return agent;
    } catch (err) {
      console.error('Agent generation error:', err);
      return null;
    }
  }, []);

  // Generate a wildcard agent
  const generateWildcardAgent = useCallback(async (
    briefText: string,
    colorIndex: number,
    existingAgents: Agent[] = []
  ): Promise<Agent | null> => {
    try {
      const personaResponse = await callOpenRouter({
        messages: [{
          role: 'user',
          content: WILDCARD_AGENT_PROMPT(
            briefText,
            existingAgents.map(a => ({ name: a.name, domain: a.domain, theoreticalFramework: a.theoreticalFramework }))
          ),
        }],
        temperature: 0.95,
        max_tokens: 4000,
      });

      let personaData;
      try {
        const jsonMatch = personaResponse.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        personaData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse wildcard persona:', personaResponse);
        throw new Error('Failed to parse wildcard agent');
      }

      const agentId = `agent-wildcard-${Date.now()}`;

      const agent: Agent = {
        id: agentId,
        name: personaData.name || 'Dr. Unknown',
        title: personaData.title || 'Scholar',
        domain: personaData.domain || 'Unexpected Domain',
        theoreticalFramework: personaData.theoreticalFramework || 'Unconventional Analysis',
        historicalFocus: personaData.historicalFocus || 'Modern Era',
        keyReferences: personaData.keyReferences || [],
        stanceKeywords: personaData.stanceKeywords || [],
        criticalPerspective: personaData.criticalPerspective || '',
        briefSnippets: personaData.briefSnippets || [],
        consultationRationale: '', // Wildcards use wildcardBridge instead
        wildcardBridge: personaData.wildcardBridge || '',
        initialStance: '',
        colorIndex,
        status: 'validating',
        generationAttempts: 1,
        isWildcard: true,
      };

      return agent;
    } catch (err) {
      console.error('Wildcard generation error:', err);
      return null;
    }
  }, []);

  // Generate stance for an agent
  const generateStance = useCallback(async (
    agent: Agent,
    briefText: string
  ): Promise<string> => {
    const stanceResponse = await callOpenRouter({
      messages: [{
        role: 'user',
        content: AGENT_STANCE_PROMPT(agent, briefText),
      }],
      temperature: 0.85,
      max_tokens: 4000,
    });
    return stanceResponse.content;
  }, []);

  const generateAgents = useCallback(async (
    briefText: string,
    count: number,
    onAgentUpdate: (agent: Agent) => void,
    includeWildcard: boolean = false
  ): Promise<Agent[]> => {
    setIsGenerating(true);
    setError(null);
    const agents: Agent[] = [];

    // Calculate how many core agents vs wildcard
    const coreCount = includeWildcard ? count - 1 : count;
    const totalCount = count;

    try {
      // Generate core (domain-proximate) agents
      for (let i = 0; i < coreCount; i++) {
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
          briefSnippets: [],
          consultationRationale: '',
          initialStance: '',
          colorIndex: i,
          status: 'generating',
          generationAttempts: 0,
          isWildcard: false,
        };
        onAgentUpdate(placeholderAgent);

        let attempts = 0;
        let validAgent: Agent | null = null;

        // Retry loop with validation
        while (!validAgent && attempts < 5) {
          attempts++;

          // Generate candidate agent
          const candidate = await generateCoreAgent(briefText, i, agents);
          if (!candidate) {
            onAgentUpdate({ ...placeholderAgent, status: 'error', generationAttempts: attempts });
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }

          // Update UI to show validating
          onAgentUpdate({ ...candidate, status: 'validating', generationAttempts: attempts });

          // Validate relevance
          const validation = await validateAgent(candidate, briefText);
          
          if (validation && validation.score >= MIN_RELEVANCE_SCORE) {
            candidate.relevanceScore = validation.score;
            candidate.relevanceRationale = validation.rationale;
            
            // Generate stance
            candidate.initialStance = await generateStance(candidate, briefText);
            candidate.status = 'ready';
            validAgent = candidate;
          } else {
            console.log(`Agent ${i + 1} failed validation (score: ${validation?.score || 0}), regenerating...`);
            onAgentUpdate({ 
              ...placeholderAgent, 
              status: 'generating', 
              generationAttempts: attempts,
            });
            await new Promise(r => setTimeout(r, 1500));
          }
        }

        if (validAgent) {
          agents.push(validAgent);
          onAgentUpdate(validAgent);
        } else {
          throw new Error(`Failed to generate relevant agent ${i + 1} after ${attempts} attempts`);
        }

        // Rate limiting delay
        if (i < coreCount - 1 || includeWildcard) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      // Generate wildcard agent if requested
      if (includeWildcard) {
        const wildcardIndex = totalCount - 1;
        const wildcardPlaceholder: Agent = {
          id: `placeholder-wildcard`,
          name: '',
          title: '',
          domain: '',
          theoreticalFramework: '',
          historicalFocus: '',
          keyReferences: [],
          stanceKeywords: [],
          criticalPerspective: '',
          briefSnippets: [],
          consultationRationale: '',
          initialStance: '',
          colorIndex: wildcardIndex,
          status: 'generating',
          generationAttempts: 0,
          isWildcard: true,
        };
        onAgentUpdate(wildcardPlaceholder);

        let wildcardAttempts = 0;
        let wildcard: Agent | null = null;

        while (!wildcard && wildcardAttempts < 3) {
          wildcardAttempts++;
          
          const candidate = await generateWildcardAgent(briefText, wildcardIndex, agents);
          if (candidate) {
            // Wildcards skip strict validation but still need a bridge
            if (candidate.wildcardBridge && candidate.wildcardBridge.length > 20) {
              candidate.initialStance = await generateStance(candidate, briefText);
              candidate.status = 'ready';
              wildcard = candidate;
            } else {
              console.log('Wildcard missing bridge, regenerating...');
              await new Promise(r => setTimeout(r, 1000));
            }
          } else {
            onAgentUpdate({ ...wildcardPlaceholder, status: 'error', generationAttempts: wildcardAttempts });
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        if (wildcard) {
          agents.push(wildcard);
          onAgentUpdate(wildcard);
        } else {
          throw new Error(`Failed to generate wildcard agent after ${wildcardAttempts} attempts`);
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
  }, [generateCoreAgent, generateWildcardAgent, generateStance, validateAgent]);

  return { generateAgents, isGenerating, error };
}
