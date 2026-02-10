import * as React from 'react';

import { AppHeader, GeneratorConfigCard, PdfPreviewModal, PreviewCard } from '@/components';
import type { ColorScheme, ColorTheme, DocumentOptions, GeneratorConfig, OperatorKey, Problem } from '@/types';
import {
  buildWorksheetHtml,
  chunkArray,
  COLOR_SCHEME_STORAGE_KEY,
  COLOR_THEME_OPTIONS,
  COLOR_THEME_STORAGE_KEY,
  formatProblem,
  generateProblems,
  GENERATOR_CONFIG_STORAGE_KEY,
  getEnabledOperators,
  getLocalStorageItem,
  getWorksheetTypography,
  isColorScheme,
  isColorTheme,
  loadConfigFromStorage,
  OPERATOR_OPTIONS,
  printHtmlWithIframe,
  setLocalStorageItem,
} from '@/utils';
import { Toaster, toast } from 'sonner';

function formatProblemContent(problem: Problem, withAnswer: boolean, formatter: (problem: Problem, withAnswer?: boolean) => string) {
  const display = formatter(problem, withAnswer);
  const indexPart = `${problem.index}.`;
  const content = display.startsWith(indexPart) ? display.slice(indexPart.length).trimStart() : display;

  return {
    indexPart,
    content,
  };
}

export function App() {
  const [config, setConfig] = React.useState<GeneratorConfig>(() => loadConfigFromStorage());
  const [questions, setQuestions] = React.useState<Problem[]>([]);
  const [error, setError] = React.useState<string>('');
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>('light');
  const [colorTheme, setColorTheme] = React.useState<ColorTheme>('neutral');
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = React.useState<boolean>(false);
  const [pdfPreviewHtml, setPdfPreviewHtml] = React.useState<string>('');

  React.useEffect(() => {
    const storedSchemeValue = getLocalStorageItem(COLOR_SCHEME_STORAGE_KEY);
    const storedTheme = getLocalStorageItem(COLOR_THEME_STORAGE_KEY);
    const storedScheme = storedSchemeValue && isColorScheme(storedSchemeValue) ? storedSchemeValue : null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialScheme = storedScheme ?? (prefersDark ? 'dark' : 'light');
    const initialTheme = storedTheme && isColorTheme(storedTheme) ? storedTheme : 'neutral';

    setColorScheme(initialScheme);
    setColorTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialScheme === 'dark');
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  React.useEffect(() => {
    setLocalStorageItem(GENERATOR_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const reportError = React.useCallback((location: string, message: string) => {
    setError(`[${location}] ${message}`);
    toast.error(message, { description: `位置：${location}` });
  }, []);

  const clearError = React.useCallback(() => {
    setError('');
  }, []);

  const worksheetColumns = 4;
  const worksheetTitle = '小学计算题生成器';
  const previewRows = React.useMemo(() => chunkArray(questions, worksheetColumns), [questions]);
  const previewTypography = React.useMemo(() => getWorksheetTypography(worksheetColumns), []);

  const enabledOperatorKeys = React.useMemo(() => getEnabledOperators(config.operators), [config.operators]);
  const operatorSummary = React.useMemo(
    () =>
      enabledOperatorKeys
        .map((key) => {
          const option = OPERATOR_OPTIONS.find((item) => item.key === key);
          return option ? `${option.label}${option.symbol}` : key;
        })
        .join('、'),
    [enabledOperatorKeys],
  );

  const handleToggleOperator = (operator: OperatorKey) => {
    const enabledCount = getEnabledOperators(config.operators).length;
    if (config.operators[operator] && enabledCount === 1) {
      reportError('运算符设置', '至少保留一个运算符。');
      return;
    }

    setConfig((previous) => ({
      ...previous,
      operators: {
        ...previous.operators,
        [operator]: !previous.operators[operator],
      },
    }));
    clearError();
  };

  const handleNumberConfigChange = (field: 'count' | 'min' | 'max', value: string) => {
    const parsed = Number.parseInt(value, 10);
    setConfig((previous) => ({
      ...previous,
      [field]: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleThemeChange = (value: string) => {
    if (!isColorTheme(value)) {
      return;
    }

    setColorTheme(value);
    setLocalStorageItem(COLOR_THEME_STORAGE_KEY, value);
    document.documentElement.setAttribute('data-theme', value);
  };

  const handleColorSchemeCheckedChange = (checked: boolean) => {
    const nextScheme = checked ? 'dark' : 'light';
    setColorScheme(nextScheme);
    setLocalStorageItem(COLOR_SCHEME_STORAGE_KEY, nextScheme);
    document.documentElement.classList.toggle('dark', nextScheme === 'dark');
  };

  const handleGenerate = () => {
    const result = generateProblems(config);
    if (result.error) {
      setQuestions([]);
      reportError('题目配置', result.error);
      return;
    }

    setQuestions(result.questions);
    clearError();
  };

  const buildDocumentOptions = (): DocumentOptions => {
    const generatedAt = new Date().toLocaleString('zh-CN', { hour12: false });
    const operatorText = operatorSummary.length > 0 ? operatorSummary : '未选择';

    return {
      title: worksheetTitle,
      questions,
      columns: worksheetColumns,
      showAnswerWithRandomBlankOperand: config.showAnswerWithRandomBlankOperand,
      rangeText: `${config.min} ~ ${config.max}`,
      operatorText,
      generatedAt,
    };
  };

  const handleOpenPdfPreview = () => {
    try {
      if (questions.length === 0) {
        reportError('PDF 预览', '请先生成题目，再预览 PDF。');
        return;
      }

      const html = buildWorksheetHtml(buildDocumentOptions());
      setPdfPreviewHtml(html);
      setIsPdfPreviewOpen(true);
      clearError();
    } catch {
      reportError('PDF 预览', '生成预览失败，请重试。');
    }
  };

  const handlePrintPdf = () => {
    try {
      if (questions.length === 0) {
        reportError('PDF 导出', '请先生成题目，再打印或导出 PDF。');
        return;
      }

      const documentOptions = buildDocumentOptions();
      const html = buildWorksheetHtml(documentOptions);
      const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=800');

      if (!printWindow) {
        printHtmlWithIframe(html);
        clearError();
        toast.success('已调用系统打印', { description: '请在打印对话框中选择“另存为 PDF”。' });
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
      clearError();
      toast.success('已打开打印窗口', { description: '请在系统打印对话框中选择“另存为 PDF”。' });
    } catch {
      reportError('PDF 导出', '打开打印窗口失败，请重试。');
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 md:px-8">
        <AppHeader
          colorTheme={colorTheme}
          colorThemeOptions={COLOR_THEME_OPTIONS}
          colorScheme={colorScheme}
          onThemeChange={handleThemeChange}
          onColorSchemeCheckedChange={handleColorSchemeCheckedChange}
        />

        <GeneratorConfigCard
          config={config}
          operatorOptions={OPERATOR_OPTIONS}
          error={error}
          hasQuestions={questions.length > 0}
          onOperandCountChange={(value) => {
            setConfig((previous) => ({
              ...previous,
              operandCount: value,
            }));
          }}
          onNumberConfigChange={handleNumberConfigChange}
          onToggleOperator={handleToggleOperator}
          onShowAnswerWithRandomBlankOperandChange={(checked) => {
            setConfig((previous) => ({
              ...previous,
              showAnswerWithRandomBlankOperand: checked,
            }));
          }}
          onAllowNegativeSubtractionChange={(checked) => {
            setConfig((previous) => ({
              ...previous,
              allowNegativeSubtraction: checked,
            }));
          }}
          onDivisionIntegerOnlyChange={(checked) => {
            setConfig((previous) => ({
              ...previous,
              divisionIntegerOnly: checked,
            }));
          }}
          onGenerate={handleGenerate}
          onOpenPdfPreview={handleOpenPdfPreview}
          onPrintPdf={handlePrintPdf}
        />

        <PreviewCard
          min={config.min}
          max={config.max}
          operatorSummary={operatorSummary}
          questions={questions}
          previewRows={previewRows}
          previewTypography={previewTypography}
          columns={worksheetColumns}
          formatProblem={(problem) => {
            const parts = formatProblemContent(problem, config.showAnswerWithRandomBlankOperand, formatProblem);
            return (
              <>
                <span className="text-muted-foreground mr-1 text-[0.84em] font-medium">{parts.indexPart}</span>
                <span>{parts.content}</span>
              </>
            );
          }}
        />
      </main>

      {isPdfPreviewOpen ? <PdfPreviewModal html={pdfPreviewHtml} onExportPdf={handlePrintPdf} onClose={() => setIsPdfPreviewOpen(false)} /> : null}

      <Toaster richColors position="top-right" theme={colorScheme === 'dark' ? 'dark' : 'light'} />
    </div>
  );
}

export default App;
