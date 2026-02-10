import type {
  ColorScheme,
  ColorTheme,
  ColorThemeOption,
  DocumentOptions,
  GenerateProblemsResult,
  GeneratorConfig,
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
export const SHOW_ANSWERS_PREVIEW_STORAGE_KEY = 'oralcalc-show-answers-preview';

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

export const INITIAL_CONFIG: GeneratorConfig = {
  worksheetTitle: '小学口算练习',
  count: 50,
  min: 0,
  max: 20,
  columns: 4,
  allowNegativeSubtraction: false,
  divisionIntegerOnly: true,
  showAnswersInExport: true,
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

function normalizeString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value;
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
    worksheetTitle: normalizeString(storedConfig.worksheetTitle, INITIAL_CONFIG.worksheetTitle),
    count: normalizeInteger(storedConfig.count, INITIAL_CONFIG.count),
    min: normalizeInteger(storedConfig.min, INITIAL_CONFIG.min),
    max: normalizeInteger(storedConfig.max, INITIAL_CONFIG.max),
    columns: normalizeInteger(storedConfig.columns, INITIAL_CONFIG.columns),
    allowNegativeSubtraction: normalizeBoolean(storedConfig.allowNegativeSubtraction, INITIAL_CONFIG.allowNegativeSubtraction),
    divisionIntegerOnly: normalizeBoolean(storedConfig.divisionIntegerOnly, INITIAL_CONFIG.divisionIntegerOnly),
    showAnswersInExport: normalizeBoolean(storedConfig.showAnswersInExport, INITIAL_CONFIG.showAnswersInExport),
    operators: {
      add: normalizeBoolean(storedOperators?.add, INITIAL_CONFIG.operators.add),
      sub: normalizeBoolean(storedOperators?.sub, INITIAL_CONFIG.operators.sub),
      mul: normalizeBoolean(storedOperators?.mul, INITIAL_CONFIG.operators.mul),
      div: normalizeBoolean(storedOperators?.div, INITIAL_CONFIG.operators.div),
    },
  };
}

export function loadShowAnswersPreviewFromStorage(): boolean {
  const storedValue = parseStoredJson(SHOW_ANSWERS_PREVIEW_STORAGE_KEY);

  if (typeof storedValue !== 'boolean') {
    return false;
  }

  return storedValue;
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

export function formatProblem(problem: Problem, withAnswer = false): string {
  const symbol = OPERATOR_OPTIONS.find((option) => option.key === problem.operator)?.symbol ?? '?';
  const result = withAnswer ? formatAnswer(problem.answer) : '____';
  return `${problem.index}. ${problem.left} ${symbol} ${problem.right} = ${result}`;
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

function buildProblemSeed(operator: OperatorKey, config: GeneratorConfig): ProblemSeed | null {
  if (config.min > config.max) {
    return null;
  }

  if (operator === 'add') {
    const minSum = config.min * 2;
    if (minSum > config.max) {
      return null;
    }

    const answer = randomInt(minSum, config.max);
    const left = randomInt(config.min, answer - config.min);
    const right = answer - left;
    return { left, right, operator, answer };
  }

  if (operator === 'sub') {
    let left = randomInt(config.min, config.max);
    let right = randomInt(config.min, config.max);

    if (!config.allowNegativeSubtraction && right > left) {
      [left, right] = [right, left];
    }

    return { left, right, operator, answer: left - right };
  }

  if (operator === 'mul') {
    if (config.min === 0) {
      const left = randomInt(config.min, config.max);
      const rightMax = left === 0 ? config.max : Math.floor(config.max / left);
      const right = randomInt(config.min, Math.min(config.max, rightMax));
      return { left, right, operator, answer: left * right };
    }

    if (config.min * config.min > config.max) {
      return null;
    }

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const leftMax = Math.min(config.max, Math.floor(config.max / config.min));
      const left = randomInt(config.min, leftMax);
      const rightMax = Math.min(config.max, Math.floor(config.max / left));

      if (rightMax < config.min) {
        continue;
      }

      const right = randomInt(config.min, rightMax);
      return { left, right, operator, answer: left * right };
    }

    return null;
  }

  const minDivisor = Math.max(config.min, 1);
  if (minDivisor > config.max) {
    return null;
  }

  if (config.divisionIntegerOnly) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const right = randomInt(minDivisor, config.max);
      const minQuotient = Math.ceil(config.min / right);
      const maxQuotient = Math.floor(config.max / right);

      if (minQuotient > maxQuotient) {
        continue;
      }

      const quotient = randomInt(minQuotient, maxQuotient);
      const left = right * quotient;

      if (left < config.min || left > config.max) {
        continue;
      }

      return { left, right, operator, answer: quotient };
    }

    return null;
  }

  const left = randomInt(config.min, config.max);
  const right = randomInt(minDivisor, config.max);
  return { left, right, operator, answer: Number((left / right).toFixed(2)) };
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

  if (config.columns < 1 || config.columns > 6) {
    return { questions: [], error: '每行题目数量请设置在 1 到 6 之间。' };
  }

  const enabledOperators = getEnabledOperators(config.operators);
  if (enabledOperators.length === 0) {
    return { questions: [], error: '请至少选择一个运算符。' };
  }

  if (enabledOperators.length === 1 && enabledOperators[0] === 'add' && config.min * 2 > config.max) {
    return { questions: [], error: '当前最小值与最大值无法生成加法题，请调小最小值或调大最大值。' };
  }

  if (enabledOperators.length === 1 && enabledOperators[0] === 'mul' && config.min > 0 && config.min * config.min > config.max) {
    return { questions: [], error: '当前最小值与最大值无法生成乘法题，请调小最小值或调大最大值。' };
  }

  if (enabledOperators.includes('div') && config.max < 1) {
    return { questions: [], error: '启用除法时，最大值至少需要为 1。' };
  }

  const questions: Problem[] = [];

  for (let index = 1; index <= config.count; index += 1) {
    let seed: ProblemSeed | null = null;

    for (let attempt = 0; attempt < 200; attempt += 1) {
      const operator = enabledOperators[randomInt(0, enabledOperators.length - 1)];
      const candidate = buildProblemSeed(operator, config);

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
    });
  }

  return { questions };
}

function buildTableRowsHtml(rows: Problem[][], columns: number, withAnswer = false): string {
  return rows
    .map((row) => {
      const cells = row.map((question) => `<td>${escapeHtml(formatProblem(question, withAnswer))}</td>`);
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
  const questionRows = buildTableRowsHtml(rows, options.columns, false);
  const answerRows = buildTableRowsHtml(rows, options.columns, true);
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
      .answers {
        page-break-before: always;
      }
      .section-title {
        margin: 0 0 8px;
        font-size: 18px;
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
    ${
      options.showAnswers
        ? `<div class="answers">
      <h2 class="section-title">答案</h2>
      <table class="worksheet">
        <tbody>
          ${answerRows}
        </tbody>
      </table>
    </div>`
        : ''
    }
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
