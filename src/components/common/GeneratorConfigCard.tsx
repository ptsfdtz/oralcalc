import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { GeneratorConfig, OperatorKey, OperatorOption } from '@/types';

interface GeneratorConfigCardProps {
  config: GeneratorConfig;
  operatorOptions: OperatorOption[];
  showAnswersPreview: boolean;
  error: string;
  hasQuestions: boolean;
  onTitleChange: (value: string) => void;
  onNumberConfigChange: (field: 'count' | 'min' | 'max' | 'columns', value: string) => void;
  onToggleOperator: (operator: OperatorKey) => void;
  onAllowNegativeSubtractionChange: (checked: boolean) => void;
  onDivisionIntegerOnlyChange: (checked: boolean) => void;
  onShowAnswersInExportChange: (checked: boolean) => void;
  onShowAnswersPreviewChange: (checked: boolean) => void;
  onGenerate: () => void;
  onOpenPdfPreview: () => void;
  onPrintPdf: () => void;
  onExportWord: () => void;
}

export function GeneratorConfigCard({
  config,
  operatorOptions,
  showAnswersPreview,
  error,
  hasQuestions,
  onTitleChange,
  onNumberConfigChange,
  onToggleOperator,
  onAllowNegativeSubtractionChange,
  onDivisionIntegerOnlyChange,
  onShowAnswersInExportChange,
  onShowAnswersPreviewChange,
  onGenerate,
  onOpenPdfPreview,
  onPrintPdf,
  onExportWord,
}: GeneratorConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>题目配置</CardTitle>
        <CardDescription>先设置参数，再点击「生成题目」（加乘结果不超过最大值，减除左侧数不超过最大值）。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="worksheet-title">试卷标题</Label>
            <Input id="worksheet-title" value={config.worksheetTitle} onChange={(event) => onTitleChange(event.target.value)} placeholder="例如：三年级口算练习" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="question-count">题目数量</Label>
            <Input
              id="question-count"
              type="number"
              min={1}
              max={300}
              value={config.count}
              onChange={(event) => onNumberConfigChange('count', event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="min-value">最小值</Label>
            <Input id="min-value" type="number" min={0} value={config.min} onChange={(event) => onNumberConfigChange('min', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max-value">最大值</Label>
            <Input id="max-value" type="number" min={0} value={config.max} onChange={(event) => onNumberConfigChange('max', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="columns-count">每行题数</Label>
            <Input
              id="columns-count"
              type="number"
              min={1}
              max={6}
              value={config.columns}
              onChange={(event) => onNumberConfigChange('columns', event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>运算符（可多选）</Label>
          <div className="flex flex-wrap gap-2">
            {operatorOptions.map((option) => (
              <Button key={option.key} type="button" variant={config.operators[option.key] ? 'default' : 'outline'} onClick={() => onToggleOperator(option.key)}>
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
            <Switch checked={config.allowNegativeSubtraction} onCheckedChange={onAllowNegativeSubtractionChange} />
          </label>

          <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">除法仅生成整除题</p>
              <p className="text-muted-foreground text-xs">建议保持开启，更适合小学生口算训练。</p>
            </div>
            <Switch checked={config.divisionIntegerOnly} onCheckedChange={onDivisionIntegerOnlyChange} />
          </label>

          <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">导出时附带答案</p>
              <p className="text-muted-foreground text-xs">导出的文档会新增答案页。</p>
            </div>
            <Switch checked={config.showAnswersInExport} onCheckedChange={onShowAnswersInExportChange} />
          </label>

          <label className="border-border flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">预览显示答案</p>
              <p className="text-muted-foreground text-xs">仅影响页面预览，不影响导出设置。</p>
            </div>
            <Switch checked={showAnswersPreview} onCheckedChange={onShowAnswersPreviewChange} />
          </label>
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onGenerate}>
            生成题目
          </Button>
          <Button type="button" variant="outline" onClick={onOpenPdfPreview} disabled={!hasQuestions}>
            PDF 预览
          </Button>
          <Button type="button" variant="outline" onClick={onPrintPdf} disabled={!hasQuestions}>
            打印 / 导出 PDF
          </Button>
          <Button type="button" variant="outline" onClick={onExportWord} disabled={!hasQuestions}>
            导出 Word
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

