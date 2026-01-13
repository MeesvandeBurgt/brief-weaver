import { cn } from '@/lib/utils';

interface AgentCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const options = [
  { count: 2, conversations: 1, description: 'Quick analysis' },
  { count: 3, conversations: 3, description: 'Balanced depth' },
  { count: 4, conversations: 6, description: 'Rich dialogue' },
  { count: 5, conversations: 10, description: 'Comprehensive' },
];

export function AgentCountSelector({ value, onChange }: AgentCountSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Number of Expert Agents</h3>
        <p className="text-sm text-muted-foreground">
          More agents = deeper analysis
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.count}
            onClick={() => onChange(option.count)}
            className={cn(
              'p-4 rounded-lg border-2 text-left transition-all duration-200',
              value === option.count
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-serif font-bold text-foreground">
                {option.count}
              </span>
              <span className="text-sm text-muted-foreground">agents</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {option.conversations} conversation{option.conversations !== 1 ? 's' : ''}
            </p>
            <p className="text-xs font-medium text-accent mt-1">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
