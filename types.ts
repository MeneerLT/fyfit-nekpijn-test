export type ClassificationLevel = 'Licht' | 'Matig' | 'Ernstig' | 'Zeer ernstig';

export interface Classification {
  level: ClassificationLevel;
  description: string;
  urgency: string;
}

export type QuestionType = 'slider' | 'multiple-choice';

export interface QuestionOption {
    text: string;
    value: number; // For scoring or data
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[]; // Only for multiple-choice
  scored?: boolean; // Default to true if not present
}

export type Answers = Record<string, number>;

export type AppStep = 'intro' | 'questions' | 'lead-capture' | 'results';
