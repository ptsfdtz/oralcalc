export type ColorScheme = 'light' | 'dark';

export type ColorTheme =
  | 'neutral'
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'fuchsia'
  | 'green'
  | 'indigo'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'rose'
  | 'sky'
  | 'teal'
  | 'violet'
  | 'yellow';

export interface ColorThemeOption {
  key: ColorTheme;
  label: string;
}

export type OperatorKey = 'add' | 'sub' | 'mul' | 'div';

export interface OperatorOption {
  key: OperatorKey;
  label: string;
  symbol: string;
}

export type OperatorState = Record<OperatorKey, boolean>;

export interface GeneratorConfig {
  worksheetTitle: string;
  count: number;
  min: number;
  max: number;
  columns: number;
  allowNegativeSubtraction: boolean;
  divisionIntegerOnly: boolean;
  showAnswersInExport: boolean;
  operators: OperatorState;
}

export interface Problem {
  index: number;
  left: number;
  right: number;
  operator: OperatorKey;
  answer: number;
}

export interface ProblemSeed {
  left: number;
  right: number;
  operator: OperatorKey;
  answer: number;
}

export interface DocumentOptions {
  title: string;
  questions: Problem[];
  columns: number;
  showAnswers: boolean;
  rangeText: string;
  operatorText: string;
  generatedAt: string;
}

export interface WorksheetTypography {
  fontSize: number;
  lineHeight: number;
  paddingY: number;
  paddingX: number;
}

export interface GenerateProblemsResult {
  questions: Problem[];
  error?: string;
}

