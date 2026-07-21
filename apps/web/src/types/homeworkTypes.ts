export type HomeworkStageType =
  | 'QUICK_RECALL'
  | 'CONCEPT_VERIFICATION'
  | 'CONCEPT_APPLICATION'
  | 'PRACTICAL_EXERCISES'
  | 'REAL_WORLD_SCENARIOS'
  | 'CHALLENGE_MODE'
  | 'REFLECTION';

export type AdaptiveDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Stage1QuickRecallItem {
  id: string;
  frontPrompt: string;
  backConceptSummary: string;
  keyTakeaway: string;
}

export interface Stage2VerificationQuestion {
  id: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'MATCHING' | 'SEQUENCE_ORDER' | 'FILL_BLANK';
  question: string;
  options?: string[];
  correctAnswer: string | string[] | Record<string, string>;
  explanation: string;
}

export interface Stage3ApplicationItem {
  id: string;
  type: 'SHORT_ANSWER' | 'PREDICT_OUTPUT' | 'FIND_BUG' | 'EXPLAIN_LOGIC';
  prompt: string;
  snippet?: string;
  expectedKeywords?: string[];
  solutionExplanation: string;
}

export interface Stage4PracticalExercise {
  id: string;
  title: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
  hint?: string;
}

export interface Stage5RealWorldScenario {
  id: string;
  title: string;
  businessContext: string;
  problemStatement: string;
  architectureSnippet?: string;
  tasks: string[];
  rubric: string[];
}

export interface Stage6ChallengeItem {
  id: string;
  title: string;
  timeLimitSeconds: number;
  question: string;
  starterCode?: string;
  expectedOutputOrBehavior: string;
  faangTopicTag: string;
}

export interface Stage7ReflectionItem {
  id: string;
  prompt: string;
  category: 'DIFFICULTY' | 'LESSONS_LEARNED' | 'MISTAKES' | 'REVISION_NEEDS';
}

export interface HomeworkAssignment {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  estimatedMinutes: number;
  stage1Recall: Stage1QuickRecallItem[];
  stage2Verification: Stage2VerificationQuestion[];
  stage3Application: Stage3ApplicationItem[];
  stage4Practical: Stage4PracticalExercise[];
  stage5RealWorld: Stage5RealWorldScenario[];
  stage6Challenge: Stage6ChallengeItem[];
  stage7Reflection: Stage7ReflectionItem[];
}

export type StageAnswerPayload = Record<string, string | number | boolean | Record<string, any>>;

export interface StageCompletionCallback {
  (score: number, answers: StageAnswerPayload): void;
}

export interface AIEvaluationReport {
  score: number;
  correctness: number;
  codeQuality: number;
  performance: number;
  maintainability: number;
  detailedFeedback: string;
  improvementTips: string[];
}
