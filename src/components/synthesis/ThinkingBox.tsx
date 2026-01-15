import { useState, useRef, useEffect } from 'react';
import { Frame } from '@/types';
import { cn } from '@/lib/utils';
import { RotateCcw, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PestelInsight {
  dimension: string;
  insight: string;
  color: string;
}

interface ThinkingBoxProps {
  frames: Frame[];
  briefSummary: string;
  pestelInsights?: PestelInsight[];
  onFrameSelect: (frame: Frame) => void;
}

// Extract discussion questions from all frames
const extractDiscussionStarters = (frames: Frame[]): string[] => {
  const questions: string[] = [];
  frames.forEach(frame => {
    if (frame.discussionQuestions) {
      questions.push(...frame.discussionQuestions);
    }
  });
  // Return a subset to avoid crowding
  return questions.slice(0, 6);
};

// Default PESTEL insights if none provided
const defaultPestelInsights: PestelInsight[] = [
  { dimension: 'Political', insight: 'Power structures embedded in the brief', color: 'from-red-500 to-red-600' },
  { dimension: 'Economic', insight: 'Value extraction & distribution patterns', color: 'from-amber-500 to-amber-600' },
  { dimension: 'Social', insight: 'Community impacts & cultural assumptions', color: 'from-emerald-500 to-emerald-600' },
  { dimension: 'Technological', insight: 'Infrastructure dependencies & digital divides', color: 'from-blue-500 to-blue-600' },
  { dimension: 'Environmental', insight: 'Material footprint & sustainability gaps', color: 'from-green-500 to-green-600' },
  { dimension: 'Legal', insight: 'Rights, ownership & regulatory blind spots', color: 'from-violet-500 to-violet-600' },
];

export function ThinkingBox({ frames, briefSummary, pestelInsights, onFrameSelect }: ThinkingBoxProps) {
  const [rotateX, setRotateX] = useState(-15);
  const [rotateY, setRotateY] = useState(-25);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const lastPos = useRef({ x: 0, y: 0 });

  const insights = pestelInsights || defaultPestelInsights;
  const discussionStarters = extractDiscussionStarters(frames);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      if (!isDragging && autoRotate) {
        setRotateY(prev => prev + 0.3);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setAutoRotate(false);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;
    setRotateY(prev => prev + deltaX * 0.5);
    setRotateX(prev => Math.max(-60, Math.min(60, prev - deltaY * 0.5)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Position discussion starters around the box in a wide orbit - like clock positions
  const getStarterPosition = (index: number) => {
    // 6 positions spread evenly around with generous clearance from box and edges
    const positions = [
      { top: '-80%', left: '50%', rotate: 2 },      // 12 o'clock - top center
      { top: '-40%', left: '220%', rotate: 4 },     // 2 o'clock - top right
      { top: '60%', left: '220%', rotate: -3 },     // 4 o'clock - middle right  
      { top: '120%', left: '50%', rotate: -2 },     // 6 o'clock - bottom center
      { top: '60%', left: '-170%', rotate: 3 },     // 8 o'clock - middle left
      { top: '-40%', left: '-170%', rotate: -4 },   // 10 o'clock - top left
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="relative w-full min-h-[950px] flex items-center justify-center py-40">
      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(autoRotate && 'bg-accent/20')}
        >
          <RotateCcw className={cn('w-4 h-4 mr-2', autoRotate && 'animate-spin')} />
          {autoRotate ? 'Stop' : 'Auto-rotate'}
        </Button>
      </div>

      {/* The 3D Box Container */}
      <div
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: '1200px', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* The Cube - PESTEL faces */}
        <div
          className="relative w-52 h-52 transition-transform duration-100 select-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            userSelect: 'none',
          }}
        >
          {/* Front face - Political */}
          <div
            className={cn('absolute w-52 h-52 border border-white/20 flex flex-col items-center justify-center p-4 bg-gradient-to-br', insights[0].color)}
            style={{ transform: 'translateZ(104px)' }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{insights[0].dimension}</p>
            <p className="text-white text-sm text-center font-serif leading-snug">{insights[0].insight}</p>
          </div>

          {/* Back face - Economic */}
          <div
            className={cn('absolute w-52 h-52 border border-white/20 flex flex-col items-center justify-center p-4 bg-gradient-to-br', insights[1].color)}
            style={{ transform: 'rotateY(180deg) translateZ(104px)' }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{insights[1].dimension}</p>
            <p className="text-white text-sm text-center font-serif leading-snug">{insights[1].insight}</p>
          </div>

          {/* Right face - Social */}
          <div
            className={cn('absolute w-52 h-52 border border-white/20 flex flex-col items-center justify-center p-4 bg-gradient-to-br', insights[2].color)}
            style={{ transform: 'rotateY(90deg) translateZ(104px)' }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{insights[2].dimension}</p>
            <p className="text-white text-sm text-center font-serif leading-snug">{insights[2].insight}</p>
          </div>

          {/* Left face - Technological */}
          <div
            className={cn('absolute w-52 h-52 border border-white/20 flex flex-col items-center justify-center p-4 bg-gradient-to-br', insights[3].color)}
            style={{ transform: 'rotateY(-90deg) translateZ(104px)' }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{insights[3].dimension}</p>
            <p className="text-white text-sm text-center font-serif leading-snug">{insights[3].insight}</p>
          </div>

          {/* Top face - Environmental */}
          <div
            className={cn('absolute w-52 h-52 border border-white/20 flex flex-col items-center justify-center p-4 bg-gradient-to-br', insights[4].color)}
            style={{ transform: 'rotateX(90deg) translateZ(104px)' }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{insights[4].dimension}</p>
            <p className="text-white text-sm text-center font-serif leading-snug">{insights[4].insight}</p>
          </div>

          {/* Bottom face - Legal */}
          <div
            className={cn('absolute w-52 h-52 border border-white/20 flex flex-col items-center justify-center p-4 bg-gradient-to-br', insights[5].color)}
            style={{ transform: 'rotateX(-90deg) translateZ(104px)' }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{insights[5].dimension}</p>
            <p className="text-white text-sm text-center font-serif leading-snug">{insights[5].insight}</p>
          </div>
        </div>

        {/* Floating Discussion Starters */}
        {discussionStarters.map((question, index) => {
          const pos = getStarterPosition(index);
          return (
            <div
              key={index}
              className="absolute animate-float opacity-90 hover:opacity-100 transition-opacity z-10 pointer-events-none"
              style={{
                top: pos.top,
                left: pos.left,
                transform: `rotate(${pos.rotate}deg)`,
                animationDelay: `${index * 800}ms`,
                animationDuration: `${7 + index}s`,
              }}
            >
              <div className="bg-card/95 backdrop-blur-sm border border-accent/30 rounded-xl p-4 shadow-lg max-w-[200px] pointer-events-auto">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground italic leading-relaxed select-none">
                    {question}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Drag to explore PESTEL dimensions • Questions spark further inquiry
        </p>
      </div>
    </div>
  );
}
