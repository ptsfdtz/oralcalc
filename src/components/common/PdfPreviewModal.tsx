import { Button } from '@/components/ui/button';

interface PdfPreviewModalProps {
  html: string;
  onExportPdf: () => void;
  onClose: () => void;
}

export function PdfPreviewModal({ html, onExportPdf, onClose }: PdfPreviewModalProps) {
  return (
    <div className="bg-black/55 fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-background border-border flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border shadow-2xl">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">PDF 预览</p>
            <p className="text-muted-foreground text-xs">确认无误后点击「导出 PDF」。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onExportPdf();
              }}
            >
              导出 PDF
            </Button>
            <Button type="button" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>

        <iframe title="PDF 预览" srcDoc={html} className="h-full w-full bg-white" />
      </div>
    </div>
  );
}

