import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  minCharacters?: number;
}

export function TextInput({ value, onChange, minCharacters = 100 }: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value.length;
  const isValid = charCount >= minCharacters;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative rounded-lg border-2 transition-colors duration-200',
          isFocused ? 'border-accent' : 'border-border',
          !isValid && charCount > 0 ? 'border-warning/50' : ''
        )}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste your design brief here...

A design brief typically includes project objectives, target audience, constraints, deliverables, and context. The more detailed your brief, the richer the critical analysis will be."
          className="min-h-[300px] border-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <p className={cn(
          'transition-colors',
          isValid ? 'text-success' : 'text-muted-foreground'
        )}>
          {isValid ? '✓ Ready for analysis' : `Minimum ${minCharacters} characters required`}
        </p>
        <p className={cn(
          'font-mono',
          charCount < minCharacters ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {charCount.toLocaleString()} characters
        </p>
      </div>
    </div>
  );
}
