export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  structured?: {
    compliance_status?: string;
    reasoning?: string;
    fix_suggestion?: string;
    action_label?: string;
  } | null;
  autoFixAvailable?: boolean;
  model?: string;
}

export interface ChatSession {
  id: string;
  sdsId: string;
  title: string;
  createdAt: string;
}

export interface SendMessageInput {
  sdsId: string;
  message: string;
  sessionId?: string;
  language?: string;
}

export interface SendMessageResult {
  sessionId: string;
  message: string;
  structured?: ChatMessage['structured'];
  autoFixAvailable?: boolean;
  model?: string;
}
