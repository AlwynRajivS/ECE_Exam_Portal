
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum QuestionPart {
  A = 'PART_A', // 1 Mark
  B = 'PART_B'  // 2 Marks
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  part: QuestionPart;
}

export interface Student {
  rollNo: string;
  name: string;
  department: string;
  year: string;
  section: string;
  examId: string;
}

export interface ExamSettings {
  examId: string;
  totalTimeMinutes: number;
  maxViolations: number;
  partACount: number;
  partBCount: number;
  isReviewEnabled: boolean;
  isReleased: boolean;
  isCalculatorEnabled: boolean; // New feature
}

export interface Violation {
  type: string;
  timestamp: string;
}

export interface StudentResult {
  rollNo: string;
  name: string;
  dept: string;
  year: string;
  section: string;
  examId: string;
  score: number;
  violations: number;
  violationLog: Violation[];
  submittedAt: string;
  answers: Record<string, number>;
  status: 'SUBMITTED' | 'TERMINATED' | 'VOID_RESET' | 'ACTIVE';
  isReleased?: boolean;
}

export interface AuthState {
  role: UserRole | null;
  user: any | null;
}
