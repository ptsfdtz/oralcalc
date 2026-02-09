import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FiMoon, FiSun } from 'react-icons/fi';

const COLOR_SCHEME_STORAGE_KEY = 'oralcalc-color-scheme';

const OPERATOR_OPTIONS = [
  { key: 'add', label: '加法', symbol: '+' },
  { key: 'sub', label: '减法', symbol: '−' },
  { key: 'mul', label: '乘法', symbol: '×' },
  { key: 'div', label: '除法', symbol: '÷' },
] as const;

type OperatorKey = (typeof OPERATOR_OPTIONS)[number]['key'];

type OperatorState = Record<OperatorKey, boolean>;

interface GeneratorConfig {
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

interface Problem {
  index: number;
  left: number;
  right: number;
  operator: OperatorKey;
  answer: number;
}

interface ProblemSeed {
  left: number;
  right: number;
  operator: OperatorKey;
  answer: number;
}

interface DocumentOptions {
  title: string;
  questions: Problem[];
  columns: number;
  showAnswers: boolean;
  rangeText: string;
  operatorText: string;
  generatedAt: string;
}

const INITIAL_CONFIG: GeneratorConfig = {
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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chunkArray<T>(items: T[], size: number): T[][] {
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

function getEnabledOperators(operators: OperatorState): OperatorKey[] {
  return OPERATOR_OPTIONS.filter((option) => operators[option.key]).map((option) => option.key);
}

function formatAnswer(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, '');
}

function formatProblem(problem: Problem, withAnswer = false): string {
  const symbol = OPERATOR_OPTIONS.find((option) => option.key === problem.operator)?.symbol ?? '?';
  const result = withAnswer ? formatAnswer(problem.answer) : '____';
  return `${problem.index}. ${problem.left} ${symbol} ${problem.right} = ${result}`;
}

function buildProblemSeed(operator: OperatorKey, config: GeneratorConfig): ProblemSeed | null {
  if (config.min > config.max) {
    return null;
  }

  if (operator === 'add') {
    const left = randomInt(config.min, config.max);
    const right = randomInt(config.min, config.max);
    return { left, right, operator, answer: left + right };
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
    const left = randomInt(config.min, config.max);
    const right = randomInt(config.min, config.max);
    return { left, right, operator, answer: left * right };
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

function generateProblems(config: GeneratorConfig): { questions: Problem[]; error?: string } {
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

function buildWorksheetHtml(options: DocumentOptions): string {
  const safeTitle = escapeHtml(options.title);
  const rows = chunkArray(options.questions, options.columns);
  const questionRows = buildTableRowsHtml(rows, options.columns, false);
  const answerRows = buildTableRowsHtml(rows, options.columns, true);

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
        padding: 8px 6px;
        border: 1px solid #e5e7eb;
        font-size: 18px;
        line-height: 1.8;
        vertical-align: top;
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

function sanitizeFilename(value: string): string {
  const fallback = 'oralcalc-worksheet';
  const trimmed = value.trim();
  const source = trimmed.length > 0 ? trimmed : fallback;
  const cleaned = source.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-');
  return cleaned.length > 0 ? cleaned : fallback;
}

function formatTimestampForFilename(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function App() {
  const [config, setConfig] = React.useState<GeneratorConfig>(INITIAL_CONFIG);
  const [questions, setQuestions] = React.useState<Problem[]>([]);
  const [error, setError] = React.useState<string>('');
  const [showAnswersPreview, setShowAnswersPreview] = React.useState<boolean>(false);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const storedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialScheme = storedScheme ?? (prefersDark ? 'dark' : 'light');
    setColorScheme(initialScheme);
    document.documentElement.classList.toggle('dark', initialScheme === 'dark');
  }, []);

  const previewRows = React.useMemo(() => chunkArray(questions, config.columns), [questions, config.columns]);

  const enabledOperatorKeys = React.useMemo(() => getEnabledOperators(config.operators), [config.operators]);
  const operatorSummary = enabledOperatorKeys
    .map((key) => {
      const option = OPERATOR_OPTIONS.find((item) => item.key === key);
      return option ? `${option.label}${option.symbol}` : key;
    })
    .join('、');

  const handleToggleOperator = (operator: OperatorKey) => {
    const enabledCount = getEnabledOperators(config.operators).length;
    if (config.operators[operator] && enabledCount === 1) {
      setError('至少保留一个运算符。');
      return;
    }

    setConfig((previous) => ({
      ...previous,
      operators: {
        ...previous.operators,
        [operator]: !previous.operators[operator],
      },
    }));
    setError('');
  };

  const handleNumberConfigChange = (field: 'count' | 'min' | 'max' | 'columns', value: string) => {
    const parsed = Number.parseInt(value, 10);
    setConfig((previous) => ({
      ...previous,
      [field]: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleGenerate = () => {
    const result = generateProblems(config);
    if (result.error) {
      setQuestions([]);
      setError(result.error);
      return;
    }

    setQuestions(result.questions);
    setError('');
  };

  const buildDocumentOptions = (): DocumentOptions => {
    const generatedAt = new Date().toLocaleString('zh-CN', { hour12: false });
    const operatorText = operatorSummary.length > 0 ? operatorSummary : '未选择';
    return {
      title: config.worksheetTitle.trim() || '小学口算练习',
      questions,
      columns: config.columns,
      showAnswers: config.showAnswersInExport,
      rangeText: `${config.min} ~ ${config.max}`,
      operatorText,
      generatedAt,
    };
  };

  const handleExportWord = () => {
    if (questions.length === 0) {
      setError('请先生成题目，再导出 Word。');
      return;
    }

    const documentOptions = buildDocumentOptions();
    const html = buildWorksheetHtml(documentOptions);
    const now = new Date();
    const fileName = `${sanitizeFilename(documentOptions.title)}-${formatTimestampForFilename(now)}.doc`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });

    downloadBlob(blob, fileName);
    setError('');
  };

  const handlePrintPdf = () => {
    if (questions.length === 0) {
      setError('请先生成题目，再打印或导出 PDF。');
      return;
    }

    const documentOptions = buildDocumentOptions();
    const html = buildWorksheetHtml(documentOptions);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=800');

    if (!printWindow) {
      setError('弹窗被阻止，请允许弹窗后重试打印。');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    printWindow.addEventListener('load', () => window.setTimeout(triggerPrint, 150), { once: true });
    setError('');
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold md:text-3xl">小学计算题生成器</h1>
            <p className="text-muted-foreground text-sm">可配置运算符、数字范围，支持打印与 Word 导出。</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiSun className={colorScheme === 'light' ? 'text-foreground' : 'text-muted-foreground'} />
            <Switch
              aria-label="切换明暗模式"
              checked={colorScheme === 'dark'}
              onCheckedChange={(checked) => {
                const nextScheme = checked ? 'dark' : 'light';
                setColorScheme(nextScheme);
                localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, nextScheme);
                document.documentElement.classList.toggle('dark', nextScheme === 'dark');
              }}
            />
            <FiMoon className={colorScheme === 'dark' ? 'text-foreground' : 'text-muted-foreground'} />
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>题目配置</CardTitle>
            <CardDescription>先设置参数，再点击「生成题目」。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5">
                <Label htmlFor="worksheet-title">试卷标题</Label>
                <Input
                  id="worksheet-title"
                  value={config.worksheetTitle}
                  onChange={(event) =>
                    setConfig((previous) => ({
                      ...previous,
                      worksheetTitle: event.target.value,
                    }))
                  }
                  placeholder="例如：三年级口算练习"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="question-count">题目数量</Label>
                <Input
                  id="question-count"
                  type="number"
                  min={1}
                  max={300}
                  value={config.count}
                  onChange={(event) => handleNumberConfigChange('count', event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min-value">最小值</Label>
                <Input
                  id="min-value"
                  type="number"
                  min={0}
                  value={config.min}
                  onChange={(event) => handleNumberConfigChange('min', event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-value">最大值</Label>
                <Input
                  id="max-value"
                  type="number"
                  min={0}
                  value={config.max}
                  onChange={(event) => handleNumberConfigChange('max', event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="columns-count">每行题数</Label>
                <Input
                  id="columns-count"
                  type="number"
                  min={1}
                  max={6}
                  value={config.columns}
                  onChange={(event) => handleNumberConfigChange('columns', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>运算符（可多选）</Label>
              <div className="flex flex-wrap gap-2">
                {OPERATOR_OPTIONS.map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    variant={config.operators[option.key] ? 'default' : 'outline'}
                    onClick={() => handleToggleOperator(option.key)}
                  >
                    {option.label} {option.symbol}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">减法允许负数结果</p>
                  <p className="text-muted-foreground text-xs">关闭后会自动保证被减数大于等于减数。</p>
                </div>
                <Switch
                  checked={config.allowNegativeSubtraction}
                  onCheckedChange={(checked) =>
                    setConfig((previous) => ({
                      ...previous,
                      allowNegativeSubtraction: checked,
                    }))
                  }
                />
              </label>

              <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">除法仅生成整除题</p>
                  <p className="text-muted-foreground text-xs">建议保持开启，更适合小学生口算训练。</p>
                </div>
                <Switch
                  checked={config.divisionIntegerOnly}
                  onCheckedChange={(checked) =>
                    setConfig((previous) => ({
                      ...previous,
                      divisionIntegerOnly: checked,
                    }))
                  }
                />
              </label>

              <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">导出时附带答案</p>
                  <p className="text-muted-foreground text-xs">导出的文档会新增答案页。</p>
                </div>
                <Switch
                  checked={config.showAnswersInExport}
                  onCheckedChange={(checked) =>
                    setConfig((previous) => ({
                      ...previous,
                      showAnswersInExport: checked,
                    }))
                  }
                />
              </label>

              <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">预览显示答案</p>
                  <p className="text-muted-foreground text-xs">仅影响页面预览，不影响导出设置。</p>
                </div>
                <Switch checked={showAnswersPreview} onCheckedChange={setShowAnswersPreview} />
              </label>
            </div>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleGenerate}>
                生成题目
              </Button>
              <Button type="button" variant="outline" onClick={handlePrintPdf} disabled={questions.length === 0}>
                打印 / 导出 PDF
              </Button>
              <Button type="button" variant="outline" onClick={handleExportWord} disabled={questions.length === 0}>
                导出 Word
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>预览</CardTitle>
            <CardDescription>
              当前配置：范围 {config.min} ~ {config.max}，运算符 {operatorSummary || '未选择'}，共 {questions.length} 题。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-muted-foreground text-sm">还没有题目，点击上方「生成题目」。</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full table-fixed border-collapse">
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="[&:not(:last-child)>td]:border-b">
                        {row.map((problem) => (
                          <td key={problem.index} className="border-border p-3 align-top text-base leading-8 not-last:border-r">
                            {formatProblem(problem, showAnswersPreview)}
                          </td>
                        ))}
                        {Array.from({ length: Math.max(config.columns - row.length, 0) }).map((_, cellIndex) => (
                          <td key={`empty-${rowIndex}-${cellIndex}`} className="border-border p-3 not-last:border-r" />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default App;
