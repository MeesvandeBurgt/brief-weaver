import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  onClear: () => void;
  currentFile?: string;
}

export function FileUploader({ onFileContent, onClear, currentFile }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);

    const validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    const validExtensions = ['.txt', '.md', '.pdf'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      setError('Please upload a TXT, MD, or PDF file');
      setIsLoading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setIsLoading(false);
      return;
    }

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setError('PDF parsing requires additional setup. Please paste text directly for now.');
        setIsLoading(false);
        return;
      }

      const text = await file.text();
      onFileContent(text, file.name);
    } catch (err) {
      setError('Failed to read file. Please try again or paste text directly.');
    } finally {
      setIsLoading(false);
    }
  }, [onFileContent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  if (currentFile) {
    return (
      <div className="border-2 border-success/50 bg-success/5 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <File className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">{currentFile}</p>
              <p className="text-sm text-muted-foreground">File loaded successfully</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center',
          isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground',
          isLoading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".txt,.md,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className={cn(
            'w-10 h-10 mx-auto mb-4 transition-colors',
            isDragging ? 'text-accent' : 'text-muted-foreground'
          )} />
          <p className="text-lg font-medium text-foreground mb-1">
            {isDragging ? 'Drop your file here' : 'Upload design brief'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to browse • TXT, MD (PDF coming soon)
          </p>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
