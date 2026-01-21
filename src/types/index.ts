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
  status: 'generating' | 'ready' | 'error';
  generationAttempts: number;
  // Domain proximity fields
  briefSnippets: string[];           // 3 exact quotes from brief this agent will interrogate
  consultationRationale: string;     // Why this agent would plausibly be consulted
  isWildcard?: boolean;              // True if this is an optional wildcard agent
  wildcardBridge?: string;           // For wildcards: concrete connection to brief
}

// Conversation Types
export interface Message {
  id: string;
  agentId: string;
  content: string;
  reasoning_details?: string;
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
  discussionQuestions?: string[];  // Provocative questions for team discussion
  tensionsWith?: string;           // Which other frames this conflicts with
  sourceConversations: string[];
}

// App State
export type AppPhase = 'input' | 'generation' | 'conversation' | 'synthesis';

export interface AppState {
  phase: AppPhase;
  brief: Brief | null;
  agentCount: number;
  includeWildcard: boolean;
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
  reasoning_details?: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  reasoning?: {
    enabled: boolean;
  };
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
      reasoning_details?: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
