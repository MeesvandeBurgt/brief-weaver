import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppPhase, Brief, Agent, Conversation, Frame, Message } from '@/types';

type AppAction =
  | { type: 'SET_PHASE'; phase: AppPhase }
  | { type: 'SET_BRIEF'; brief: Brief }
  | { type: 'SET_AGENT_COUNT'; count: number }
  | { type: 'ADD_AGENT'; agent: Agent }
  | { type: 'UPDATE_AGENT'; id: string; updates: Partial<Agent> }
  | { type: 'SET_AGENTS'; agents: Agent[] }
  | { type: 'ADD_CONVERSATION'; conversation: Conversation }
  | { type: 'UPDATE_CONVERSATION'; id: string; updates: Partial<Conversation> }
  | { type: 'ADD_MESSAGE'; conversationId: string; message: Message }
  | { type: 'SET_CONVERSATIONS'; conversations: Conversation[] }
  | { type: 'SET_FRAMES'; frames: Frame[] }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'RESET' };

const initialState: AppState = {
  phase: 'input',
  brief: null,
  agentCount: 3,
  agents: [],
  conversations: [],
  frames: [],
  error: null,
  isProcessing: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_BRIEF':
      return { ...state, brief: action.brief };
    case 'SET_AGENT_COUNT':
      return { ...state, agentCount: action.count };
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.agent] };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.id ? { ...a, ...action.updates } : a
        ),
      };
    case 'SET_AGENTS':
      return { ...state, agents: action.agents };
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [...state.conversations, action.conversation] };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, ...action.updates } : c
        ),
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, action.message] }
            : c
        ),
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };
    case 'SET_FRAMES':
      return { ...state, frames: action.frames };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
