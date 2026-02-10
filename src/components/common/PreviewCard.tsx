import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, WorksheetTypography } from '@/types';

interface PreviewCardProps {
  min: number;
  max: number;
  operatorSummary: string;
  questions: Problem[];
  previewRows: Problem[][];
  previewTypography: WorksheetTypography;
  columns: number;
  formatProblem: (problem: Problem) => ReactNode;
}

export function PreviewCard({
  min,
  max,
  operatorSummary,
  questions,
  previewRows,
  previewTypography,
  columns,
  formatProblem,
}: PreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>预览</CardTitle>
        <CardDescription>
          当前配置：范围 {min} ~ {max}，运算符 {operatorSummary || '未选择'}，共 {questions.length} 题。
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
                      <td
                        key={problem.index}
                        className="border-border align-top whitespace-nowrap not-last:border-r"
                        style={{
                          fontSize: `${previewTypography.fontSize}px`,
                          lineHeight: previewTypography.lineHeight,
                          padding: `${previewTypography.paddingY}px ${previewTypography.paddingX}px`,
                        }}
                      >
                        {formatProblem(problem)}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(columns - row.length, 0) }).map((_, cellIndex) => (
                      <td
                        key={`empty-${rowIndex}-${cellIndex}`}
                        className="border-border not-last:border-r"
                        style={{
                          padding: `${previewTypography.paddingY}px ${previewTypography.paddingX}px`,
                        }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
