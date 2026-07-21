export interface Scenario {
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  description: string;
  descriptionZh: string;
  systemPrompt: string;
  initialMessage: string;
}

export interface GrammarCheck {
  hasErrors: boolean;
  corrected?: string;
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  grammarCheck?: GrammarCheck;
  hints?: string[];
  timestamp: number;
}

export interface WritingCheckCorrection {
  error: string;
  fix: string;
  explanation: string;
}

export interface WritingCheckResult {
  original: string;
  corrected: string;
  score: number;
  overallFeedback: string;
  detailedCorrections: WritingCheckCorrection[];
  alternativeVersions: {
    professional: string;
    casual: string;
  };
}

export interface VocabWord {
  word: string;
  phonetic: string;
  pos: string; // Part of speech (e.g., n., v., adj.)
  meaning: string;
  definition: string;
  exampleEn: string;
  exampleZh: string;
}

export interface PracticeSession {
  id: string;
  scenarioId: string;
  messages: ChatMessage[];
  lastUpdated: number;
}
