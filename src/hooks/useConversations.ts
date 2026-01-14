import { useState, useCallback } from 'react';
import { Agent, Conversation, Message, Frame } from '@/types';
import { callOpenRouter } from '@/services/openrouter';
import {
  CONVERSATION_START_PROMPT,
  CONVERSATION_CONTINUE_PROMPT,
  CONVERSATION_SUMMARY_PROMPT,
  FRAME_SYNTHESIS_PROMPT
} from '@/utils/promptTemplates';

interface UseConversationsOptions {
  maxTurns?: number;
  onConversationUpdate?: (conversation: Conversation) => void;
  onMessageAdd?: (conversationId: string, message: Message) => void;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const { maxTurns = 10, onConversationUpdate, onMessageAdd } = options;
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [streamingAgentId, setStreamingAgentId] = useState<string | null>(null);

  const createConversationPairs = useCallback((agents: Agent[]): Conversation[] => {
    const conversations: Conversation[] = [];

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        conversations.push({
          id: `conv-${agents[i].id}-${agents[j].id}`,
          agent1Id: agents[i].id,
          agent2Id: agents[j].id,
          status: 'pending',
          messages: [],
          currentTurn: 0,
          maxTurns,
        });
      }
    }

    return conversations;
  }, [maxTurns]);

  const formatConversationHistory = (messages: Message[], agents: Agent[]): string => {
    return messages.map(m => {
      const agent = agents.find(a => a.id === m.agentId);
      return `${agent?.name}:\n${m.content}`;
    }).join('\n\n---\n\n');
  };

  const runConversation = useCallback(async (
    conversation: Conversation,
    agents: Agent[]
  ): Promise<Conversation> => {
    const agent1 = agents.find(a => a.id === conversation.agent1Id)!;
    const agent2 = agents.find(a => a.id === conversation.agent2Id)!;

    let currentConv = {
      ...conversation,
      status: 'in_progress' as const,
      startedAt: new Date(),
    };

    setCurrentConversationId(conversation.id);
    onConversationUpdate?.(currentConv);

    try {
      // Alternate between agents
      const speakerOrder = [];
      for (let i = 0; i < maxTurns; i++) {
        speakerOrder.push(i % 2 === 0 ? agent1 : agent2);
      }

      for (let turn = 0; turn < maxTurns; turn++) {
        const currentSpeaker = speakerOrder[turn];
        const otherSpeaker = currentSpeaker.id === agent1.id ? agent2 : agent1;

        setStreamingAgentId(currentSpeaker.id);
        setStreamingContent('');

        let prompt: string;

        if (turn === 0) {
          prompt = CONVERSATION_START_PROMPT(
            currentSpeaker,
            otherSpeaker,
            currentSpeaker.initialStance,
            otherSpeaker.initialStance
          );
        } else {
          prompt = CONVERSATION_CONTINUE_PROMPT(
            currentSpeaker,
            otherSpeaker,
            formatConversationHistory(currentConv.messages, agents),
            turn + 1,
            maxTurns
          );
        }

        const response = await callOpenRouter({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85,
          max_tokens: 2000,
        });

        const message: Message = {
          id: `msg-${conversation.id}-${turn}`,
          agentId: currentSpeaker.id,
          content: response.content,
          reasoning_details: response.reasoning_details,
          turnNumber: turn + 1,
          timestamp: new Date(),
        };

        currentConv = {
          ...currentConv,
          messages: [...currentConv.messages, message],
          currentTurn: turn + 1,
        };

        onMessageAdd?.(conversation.id, message);
        onConversationUpdate?.(currentConv);

        // Brief pause between turns
        await new Promise(r => setTimeout(r, 1500));
      }

      // Generate summary
      const summaryResponse = await callOpenRouter({
        messages: [{
          role: 'user',
          content: CONVERSATION_SUMMARY_PROMPT(
            agent1.name,
            agent2.name,
            formatConversationHistory(currentConv.messages, agents)
          ),
        }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const completedConv: Conversation = {
        ...currentConv,
        status: 'completed' as const,
        summary: summaryResponse.content,
        completedAt: new Date(),
      };

      onConversationUpdate?.(completedConv);
      return completedConv;

    } catch (err) {
      console.error('Conversation error:', err);
      const errorConv: Conversation = { ...currentConv, status: 'error' as const };
      onConversationUpdate?.(errorConv);
      throw err;
    } finally {
      setStreamingContent('');
      setStreamingAgentId(null);
    }
  }, [maxTurns, onConversationUpdate, onMessageAdd]);

  const runAllConversations = useCallback(async (
    conversations: Conversation[],
    agents: Agent[]
  ): Promise<Conversation[]> => {
    setIsRunning(true);
    setError(null);
    const completedConversations: Conversation[] = [];

    try {
      for (const conv of conversations) {
        const completed = await runConversation(conv, agents);
        completedConversations.push(completed);

        // Delay between conversations
        await new Promise(r => setTimeout(r, 3000));
      }

      return completedConversations;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run conversations';
      setError(message);
      throw err;
    } finally {
      setIsRunning(false);
      setCurrentConversationId(null);
    }
  }, [runConversation]);

  const synthesizeFrames = useCallback(async (
    conversations: Conversation[]
  ): Promise<Frame[]> => {
    const summaries = conversations
      .filter(c => c.summary)
      .map(c => c.summary!);

    if (summaries.length === 0) {
      throw new Error('No conversation summaries available');
    }

    const response = await callOpenRouter({
      messages: [{
        role: 'user',
        content: FRAME_SYNTHESIS_PROMPT(summaries),
      }],
      temperature: 0.8,
      max_tokens: 4000,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const data = JSON.parse(jsonMatch[0]);

      return data.frames.map((frame: any, i: number) => ({
        id: `frame-${i}`,
        title: frame.title,
        coreNarrative: frame.coreNarrative,
        makesVisible: frame.makesVisible,
        historicalGrounding: frame.historicalGrounding,
        designImplications: frame.designImplications,
        discussionQuestions: frame.discussionQuestions || [],
        tensionsWith: frame.tensionsWith || '',
        sourceConversations: conversations.map(c => c.id),
      }));
    } catch (err) {
      console.error('Failed to parse frames:', response);
      throw new Error('Failed to synthesize frames');
    }
  }, []);

  return {
    createConversationPairs,
    runAllConversations,
    synthesizeFrames,
    isRunning,
    error,
    currentConversationId,
    streamingContent,
    streamingAgentId,
  };
}
