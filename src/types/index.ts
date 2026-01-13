// Brief Types
export interface Brief {
  id: string;
  content: string;
  source: 'file' | 'paste';
  fileName?: string;
  uploadedAt: Date;
  characterCount: number;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  title: string;
  domain: string;
  theoreticalFramework: string;
  historicalFocus: string;
  keyReferences: string[];
  stanceKeywords: string[];
  criticalPerspective: string;
  initialStance: string;
  colorIndex: number;
  status: 'generating' | 'validating' | 'ready' | 'error';
  generationAttempts: number;
}

// Conversation Types
export interface Message {
  id: string;
  agentId: string;
  content: string;
  turnNumber: number;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  agent1Id: string;
  agent2Id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  messages: Message[];
  currentTurn: number;
  maxTurns: number;
  summary?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Frame Types
export interface Frame {
  id: string;
  title: string;
  coreNarrative: string;
  makesVisible: string;
  historicalGrounding: string;
  designImplications: string;
  sourceConversations: string[];
}

// App State
export type AppPhase = 'input' | 'generation' | 'conversation' | 'synthesis';

export interface AppState {
  phase: AppPhase;
  brief: Brief | null;
  agentCount: number;
  agents: Agent[];
  conversations: Conversation[];
  frames: Frame[];
  error: string | null;
  isProcessing: boolean;
}

// OpenRouter Types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
