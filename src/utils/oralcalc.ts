import type {
  ColorScheme,
  ColorTheme,
  ColorThemeOption,
  DocumentOptions,
  GenerateProblemsResult,
  GeneratorConfig,
  OperandCount,
  OperatorKey,
  OperatorOption,
  OperatorState,
  Problem,
  ProblemSeed,
  WorksheetTypography,
} from '@/types';

export const COLOR_SCHEME_STORAGE_KEY = 'oralcalc-color-scheme';
export const COLOR_THEME_STORAGE_KEY = 'oralcalc-color-theme';
export const GENERATOR_CONFIG_STORAGE_KEY = 'oralcalc-generator-config';

export const COLOR_THEME_OPTIONS: ColorThemeOption[] = [
  { key: 'neutral', label: '中性灰' },
  { key: 'amber', label: '琥珀' },
  { key: 'blue', label: '蓝色' },
  { key: 'cyan', label: '青色' },
  { key: 'emerald', label: '翠绿' },
  { key: 'fuchsia', label: '洋红' },
  { key: 'green', label: '绿色' },
  { key: 'indigo', label: '靛蓝' },
  { key: 'lime', label: '黄绿' },
  { key: 'orange', label: '橙色' },
  { key: 'pink', label: '粉色' },
  { key: 'purple', label: '紫色' },
  { key: 'red', label: '红色' },
  { key: 'rose', label: '玫红' },
  { key: 'sky', label: '天空蓝' },
  { key: 'teal', label: '蓝绿' },
  { key: 'violet', label: '紫罗兰' },
  { key: 'yellow', label: '黄色' },
];

export const OPERATOR_OPTIONS: OperatorOption[] = [
  { key: 'add', label: '加法', symbol: '+' },
  { key: 'sub', label: '减法', symbol: '−' },
  { key: 'mul', label: '乘法', symbol: '×' },
  { key: 'div', label: '除法', symbol: '÷' },
];

export const OPERAND_COUNT_OPTIONS: { key: OperandCount; label: string }[] = [
  { key: 2, label: '两个数' },
  { key: 3, label: '三个数' },
  { key: 'mixed', label: '两个数 + 三个数混合' },
];

export const INITIAL_CONFIG: GeneratorConfig = {
  count: 50,
  min: 0,
  max: 20,
  operandCount: 2,
  showAnswerWithRandomBlankOperand: false,
  allowNegativeSubtraction: false,
  divisionIntegerOnly: true,
  operators: {
    add: true,
    sub: true,
    mul: false,
    div: false,
  },
};

export function getLocalStorageItem(storageKey: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(storageKey: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    return;
  }
}

function parseStoredJson(storageKey: string): unknown | null {
  const rawValue = getLocalStorageItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    return null;
  }
}

function normalizeInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.trunc(value);
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value !== 'boolean') {
    return fallback;
  }

  return value;
}

function normalizeOperandCount(value: unknown, fallback: OperandCount): OperandCount {
  if (value === 2 || value === 3 || value === 'mixed') {
    return value;
  }

  return fallback;
}

export function loadConfigFromStorage(): GeneratorConfig {
  const storedValue = parseStoredJson(GENERATOR_CONFIG_STORAGE_KEY);

  if (!storedValue || typeof storedValue !== 'object') {
    return {
      ...INITIAL_CONFIG,
      operators: {
        ...INITIAL_CONFIG.operators,
      },
    };
  }

  const storedConfig = storedValue as Partial<GeneratorConfig> & { operators?: Partial<OperatorState> };
  const storedOperators = storedConfig.operators;

  return {
    count: normalizeInteger(storedConfig.count, INITIAL_CONFIG.count),
    min: normalizeInteger(storedConfig.min, INITIAL_CONFIG.min),
    max: normalizeInteger(storedConfig.max, INITIAL_CONFIG.max),
    operandCount: normalizeOperandCount(storedConfig.operandCount, INITIAL_CONFIG.operandCount),
    showAnswerWithRandomBlankOperand: normalizeBoolean(
      storedConfig.showAnswerWithRandomBlankOperand,
      INITIAL_CONFIG.showAnswerWithRandomBlankOperand,
    ),
    allowNegativeSubtraction: normalizeBoolean(storedConfig.allowNegativeSubtraction, INITIAL_CONFIG.allowNegativeSubtraction),
    divisionIntegerOnly: normalizeBoolean(storedConfig.divisionIntegerOnly, INITIAL_CONFIG.divisionIntegerOnly),
    operators: {
      add: normalizeBoolean(storedOperators?.add, INITIAL_CONFIG.operators.add),
      sub: normalizeBoolean(storedOperators?.sub, INITIAL_CONFIG.operators.sub),
      mul: normalizeBoolean(storedOperators?.mul, INITIAL_CONFIG.operators.mul),
      div: normalizeBoolean(storedOperators?.div, INITIAL_CONFIG.operators.div),
    },
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const actualSize = Math.max(1, size);
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += actualSize) {
    rows.push(items.slice(index, index + actualSize));
  }

  return rows;
}

function escapeHtml(input: string): string {
  return input.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function getEnabledOperators(operators: OperatorState): OperatorKey[] {
  return OPERATOR_OPTIONS.filter((option) => operators[option.key]).map((option) => option.key);
}

export function isColorTheme(value: string): value is ColorTheme {
  return COLOR_THEME_OPTIONS.some((option) => option.key === value);
}

export function isColorScheme(value: string): value is ColorScheme {
  return value === 'light' || value === 'dark';
}

function formatAnswer(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, '');
}

function formatOperand(value: number): string {
  return formatAnswer(value);
}

export function formatProblem(problem: Problem, withAnswer = false): string {
  const symbols = problem.operators.map((operator) => OPERATOR_OPTIONS.find((option) => option.key === operator)?.symbol ?? '?');
  const result = withAnswer ? formatAnswer(problem.answer) : '____';

  let expression = problem.blankOperandIndex === 0 ? '____' : formatOperand(problem.operands[0] ?? 0);
  for (let index = 1; index < problem.operands.length; index += 1) {
    const symbol = symbols[index - 1] ?? '?';
    const operandText = problem.blankOperandIndex === index ? '____' : formatOperand(problem.operands[index]);
    expression += ` ${symbol} ${operandText}`;
  }

  return `${problem.index}. ${expression} = ${result}`;
}

export function getWorksheetTypography(columns: number): WorksheetTypography {
  const normalized = Math.min(6, Math.max(1, columns));

  if (normalized <= 2) {
    return { fontSize: 17, lineHeight: 1.7, paddingY: 8, paddingX: 6 };
  }

  if (normalized === 3) {
    return { fontSize: 16, lineHeight: 1.6, paddingY: 7, paddingX: 5 };
  }

  if (normalized === 4) {
    return { fontSize: 15, lineHeight: 1.5, paddingY: 6, paddingX: 5 };
  }

  if (normalized === 5) {
    return { fontSize: 14, lineHeight: 1.45, paddingY: 5, paddingX: 4 };
  }

  return { fontSize: 13, lineHeight: 1.35, paddingY: 4, paddingX: 3 };
}

type FixedOperandCount = 2 | 3;

function resolveOperandCount(operandCount: OperandCount): FixedOperandCount {
  if (operandCount === 'mixed') {
    return Math.random() < 0.5 ? 2 : 3;
  }

  return operandCount;
}

function pickOperatorSequence(enabledOperators: OperatorKey[], slots: number): OperatorKey[] {
  if (slots <= 0) {
    return [];
  }

  return Array.from({ length: slots }, () => enabledOperators[randomInt(0, enabledOperators.length - 1)]);
}

function applyOperator(left: number, right: number, operator: OperatorKey, divisionIntegerOnly: boolean): number | null {
  if (operator === 'add') {
    return left + right;
  }

  if (operator === 'sub') {
    return left - right;
  }

  if (operator === 'mul') {
    return left * right;
  }

  if (right === 0) {
    return null;
  }

  const quotient = left / right;
  if (!Number.isFinite(quotient)) {
    return null;
  }

  if (divisionIntegerOnly) {
    return Number.isInteger(quotient) ? quotient : null;
  }

  return Number(quotient.toFixed(2));
}

function pickNextOperand(currentValue: number, operator: OperatorKey, config: GeneratorConfig): number | null {
  if (operator === 'add') {
    const maxOperand = Math.min(config.max, Math.floor(config.max - currentValue));
    if (maxOperand < config.min) {
      return null;
    }

    return randomInt(config.min, maxOperand);
  }

  if (operator === 'sub') {
    const upperBound = config.allowNegativeSubtraction ? config.max : Math.min(config.max, Math.floor(currentValue));

    if (upperBound < config.min) {
      return null;
    }

    return randomInt(config.min, upperBound);
  }

  if (operator === 'mul') {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const candidate = randomInt(config.min, config.max);
      const product = currentValue * candidate;

      if (!Number.isFinite(product)) {
        continue;
      }

      if (product > config.max) {
        continue;
      }

      if (!config.allowNegativeSubtraction && product < 0) {
        continue;
      }

      return candidate;
    }

    return null;
  }

  const minDivisor = Math.max(config.min, 1);
  if (minDivisor > config.max) {
    return null;
  }

  if (!config.divisionIntegerOnly) {
    return randomInt(minDivisor, config.max);
  }

  if (!Number.isInteger(currentValue)) {
    return null;
  }

  const candidates: number[] = [];
  for (let divisor = minDivisor; divisor <= config.max; divisor += 1) {
    if (currentValue % divisor === 0) {
      candidates.push(divisor);
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[randomInt(0, candidates.length - 1)];
}

function buildProblemSeed(operandCount: FixedOperandCount, enabledOperators: OperatorKey[], config: GeneratorConfig): ProblemSeed | null {
  const operators = pickOperatorSequence(enabledOperators, operandCount - 1);
  const operands: number[] = [randomInt(config.min, config.max)];
  let currentValue = operands[0];

  for (const operator of operators) {
    const nextOperand = pickNextOperand(currentValue, operator, config);

    if (nextOperand === null) {
      return null;
    }

    const nextValue = applyOperator(currentValue, nextOperand, operator, config.divisionIntegerOnly);
    if (nextValue === null || !Number.isFinite(nextValue)) {
      return null;
    }

    if (!config.allowNegativeSubtraction && nextValue < 0) {
      return null;
    }

    currentValue = nextValue;
    operands.push(nextOperand);
  }

  const answer = Number.isInteger(currentValue) ? currentValue : Number(currentValue.toFixed(2));

  return {
    operands,
    operators,
    answer,
  };
}

export function generateProblems(config: GeneratorConfig): GenerateProblemsResult {
  if (config.count < 1 || config.count > 300) {
    return { questions: [], error: '题目数量请设置在 1 到 300 之间。' };
  }

  if (config.min < 0 || config.max < 0) {
    return { questions: [], error: '运算范围请使用 0 或正整数。' };
  }

  if (config.min > config.max) {
    return { questions: [], error: '最小值不能大于最大值。' };
  }

  const enabledOperators = getEnabledOperators(config.operators);
  if (enabledOperators.length === 0) {
    return { questions: [], error: '请至少选择一个运算符。' };
  }

  if (enabledOperators.includes('div') && config.max < 1) {
    return { questions: [], error: '启用除法时，最大值至少需要为 1。' };
  }

  const questions: Problem[] = [];

  for (let index = 1; index <= config.count; index += 1) {
    let seed: ProblemSeed | null = null;

    for (let attempt = 0; attempt < 320; attempt += 1) {
      const operandCount = resolveOperandCount(config.operandCount);
      const candidate = buildProblemSeed(operandCount, enabledOperators, config);

      if (candidate) {
        seed = candidate;
        break;
      }
    }

    if (!seed) {
      return {
        questions: [],
        error: '当前范围下无法生成题目，请扩大范围或调整运算符。',
      };
    }

    questions.push({
      index,
      ...seed,
      blankOperandIndex: config.showAnswerWithRandomBlankOperand ? randomInt(0, seed.operands.length - 1) : null,
    });
  }

  return { questions };
}

function buildTableRowsHtml(rows: Problem[][], columns: number, withAnswer: boolean): string {
  return rows
    .map((row) => {
      const cells = row.map((question) => {
        const display = formatProblem(question, withAnswer);
        const indexPart = `${question.index}.`;
        const contentPart = display.slice(indexPart.length).trimStart();

        return `<td><span class="problem-index">${escapeHtml(indexPart)}</span> ${escapeHtml(contentPart)}</td>`;
      });
      const missingCells = columns - row.length;

      for (let index = 0; index < missingCells; index += 1) {
        cells.push('<td></td>');
      }

      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');
}

export function buildWorksheetHtml(options: DocumentOptions): string {
  const safeTitle = escapeHtml(options.title);
  const rows = chunkArray(options.questions, options.columns);
  const questionRows = buildTableRowsHtml(rows, options.columns, options.showAnswerWithRandomBlankOperand);
  const typography = getWorksheetTypography(options.columns);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        color: #111827;
        font-family: "Noto Sans CJK SC", "Microsoft YaHei", "PingFang SC", sans-serif;
      }
      h1 {
        margin: 0 0 6px;
        text-align: center;
        font-size: 24px;
      }
      .meta {
        margin: 0 0 14px;
        text-align: center;
        color: #4b5563;
        font-size: 12px;
      }
      .worksheet {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .worksheet td {
        width: ${100 / options.columns}%;
        padding: ${typography.paddingY}px ${typography.paddingX}px;
        border: 1px solid #e5e7eb;
        font-size: ${typography.fontSize}px;
        line-height: ${typography.lineHeight};
        vertical-align: top;
        white-space: nowrap;
      }
      .problem-index {
        opacity: 0.6;
        font-size: 0.84em;
        font-weight: 500;
      }
      @media print {
        .no-print {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    <p class="meta">范围：${escapeHtml(options.rangeText)} ｜ 运算：${escapeHtml(options.operatorText)} ｜ 生成时间：${escapeHtml(options.generatedAt)}</p>
    <table class="worksheet">
      <tbody>
        ${questionRows}
      </tbody>
    </table>
  </body>
</html>`;
}

export function sanitizeFilename(value: string): string {
  const fallback = 'oralcalc-worksheet';
  const trimmed = value.trim();
  const source = trimmed.length > 0 ? trimmed : fallback;
  const cleaned = source.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-');
  return cleaned.length > 0 ? cleaned : fallback;
}

export function formatTimestampForFilename(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printHtmlWithIframe(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.append(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = frameWindow?.document;

  if (!frameWindow || !frameDocument) {
    iframe.remove();
    throw new Error('iframe-print-unavailable');
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  frameWindow.addEventListener(
    'load',
    () => {
      window.setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();

        window.setTimeout(() => {
          iframe.remove();
        }, 2000);
      }, 120);
    },
    { once: true },
  );
}
