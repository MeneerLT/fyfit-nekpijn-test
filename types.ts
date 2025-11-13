
export type ClassificationLevel = 'Licht' | 'Matig' | 'Ernstig' | 'Zeer ernstig';

export interface Classification {
  level: ClassificationLevel;
  description: string;
  urgency: string;
}

export interface Question {
  id: string;
  text: string;
}

export type Answers = Record<string, number>;

export type AppStep = 'intro' | 'questions' | 'lead-capture' | 'results';
