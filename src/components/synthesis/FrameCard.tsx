import { Frame } from '@/types';
import { Lightbulb, Eye, BookOpen, ArrowRight, MessageCircleQuestion, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrameCardProps {
  frame: Frame;
  index: number;
}

export function FrameCard({ frame, index }: FrameCardProps) {
  return (
    <div className="card-editorial p-6 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-foreground">
            {frame.title}
          </h3>
        </div>
      </div>

      <p className="prose-editorial text-foreground mb-4">
        {frame.coreNarrative}
      </p>

      {/* Discussion Questions - Prominent */}
      {frame.discussionQuestions && frame.discussionQuestions.length > 0 && (
        <div className="mb-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircleQuestion className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-accent">Discussion Starters</p>
          </div>
          <ul className="space-y-2">
            {frame.discussionQuestions.map((q, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-accent font-bold">→</span>
                <span className="italic">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Eye className="w-4 h-4 text-accent mt-1 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">What This Reveals</p>
            <p className="text-sm text-muted-foreground">{frame.makesVisible}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-accent mt-1 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Historical Grounding</p>
            <p className="text-sm text-muted-foreground">{frame.historicalGrounding}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ArrowRight className="w-4 h-4 text-accent mt-1 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Design Implications</p>
            <p className="text-sm text-muted-foreground">{frame.designImplications}</p>
          </div>
        </div>

        {/* Tensions - Shows productive conflicts */}
        {frame.tensionsWith && (
          <div className="flex items-start gap-3 pt-2 border-t border-border mt-3">
            <Zap className="w-4 h-4 text-warning mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Productive Tensions</p>
              <p className="text-sm text-muted-foreground">{frame.tensionsWith}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
