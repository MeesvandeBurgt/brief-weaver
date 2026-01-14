import { useState } from 'react';
import { ThinkingBox } from '@/components/synthesis/ThinkingBox';
import { FrameCard } from '@/components/synthesis/FrameCard';
import { Frame } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock PESTEL insights from expert conversations
const mockPestelInsights = [
  { dimension: 'Political', insight: 'Who controls the narrative? Management surveillance vs worker autonomy', color: 'from-red-500 to-red-600' },
  { dimension: 'Economic', insight: 'Productivity gains flow to shareholders, not the workers producing them', color: 'from-amber-500 to-amber-600' },
  { dimension: 'Social', insight: '"Remote work" assumes Western, individualist knowledge workers', color: 'from-emerald-500 to-emerald-600' },
  { dimension: 'Technological', insight: 'Always-on connectivity excludes 40% of global population', color: 'from-blue-500 to-blue-600' },
  { dimension: 'Environmental', insight: 'Cloud infrastructure has hidden carbon costs in data centers', color: 'from-green-600 to-green-700' },
  { dimension: 'Legal', insight: 'Data ownership unclear—who owns worker productivity metrics?', color: 'from-violet-500 to-violet-600' },
];

// Mock frames for testing
const mockFrames: Frame[] = [
  {
    id: 'frame-1',
    title: 'The Labor Extraction Frame',
    coreNarrative: 'This brief positions "user productivity" as an unquestioned good, but whose productivity? The design assumes workers should be optimized like machines, erasing the power dynamics between employer surveillance and employee autonomy.',
    makesVisible: 'Hidden assumptions about who benefits from "efficiency" — often management and shareholders rather than workers themselves.',
    historicalGrounding: 'Connects to Taylorism and scientific management movements of the early 20th century, which treated workers as interchangeable parts.',
    designImplications: 'Consider designing for worker agency and rest, not just throughput. Include features that protect employee boundaries.',
    sourceConversations: ['conv-1', 'conv-2'],
    discussionQuestions: [
      'What if we optimized for worker wellbeing instead of productivity metrics?',
      'Who decides what counts as "productive" in this system?',
      'How might this tool be used for surveillance rather than support?'
    ],
    tensionsWith: 'Conflicts with the Innovation Frame which assumes creative freedom drives output.'
  },
  {
    id: 'frame-2',
    title: 'The Environmental Externality Frame',
    coreNarrative: 'The brief treats digital solutions as inherently "clean" and sustainable, ignoring the material infrastructure — data centers, rare earth mining, e-waste — that underpins every software product.',
    makesVisible: 'The hidden environmental costs embedded in cloud computing and always-on connectivity assumptions.',
    historicalGrounding: 'Echoes colonial patterns of resource extraction where costs are externalized to the Global South.',
    designImplications: 'Design for minimal data storage, local-first architecture, and planned longevity rather than planned obsolescence.',
    sourceConversations: ['conv-2', 'conv-3'],
    discussionQuestions: [
      'What is the carbon footprint of this "digital" solution?',
      'Could this work offline or with minimal connectivity?',
      'How do we account for the lifecycle of devices this requires?'
    ],
    tensionsWith: 'Tensions with scalability assumptions in the Growth Frame.'
  },
  {
    id: 'frame-3',
    title: 'The Accessibility Justice Frame',
    coreNarrative: 'The brief\'s "target user" implicitly assumes able-bodied, neurotypical, tech-literate users with stable internet. This excludes the majority of the global population from the design conversation.',
    makesVisible: 'How "universal" design often universalizes a very particular (privileged) user experience.',
    historicalGrounding: 'Disability rights movements have long challenged the medical model, advocating for social models where environments — not bodies — are the problem.',
    designImplications: 'Begin with edge cases. Design for screen readers, cognitive load variations, and intermittent connectivity as baseline, not afterthought.',
    sourceConversations: ['conv-1', 'conv-3'],
    discussionQuestions: [
      'Who is systematically excluded by our "average user" assumptions?',
      'What if we designed for the hardest use case first?',
      'How does this perpetuate or challenge ableist design norms?'
    ],
    tensionsWith: 'May conflict with speed-to-market priorities in the Business Frame.'
  },
  {
    id: 'frame-4',
    title: 'The Democratic Participation Frame',
    coreNarrative: 'The brief assumes a top-down design process where experts define problems for users to consume. But what if affected communities were co-designers rather than research subjects?',
    makesVisible: 'The colonial epistemology embedded in "user research" that extracts knowledge without sharing power.',
    historicalGrounding: 'Participatory action research traditions from Latin America and community organizing show alternatives to extractive design.',
    designImplications: 'Build in governance mechanisms. Let communities fork, modify, and own their tools rather than just "provide feedback."',
    sourceConversations: ['conv-2', 'conv-3'],
    discussionQuestions: [
      'How might affected communities govern this tool\'s development?',
      'What would genuine co-design (not just consultation) look like?',
      'Who profits from this, and could that value be redistributed?'
    ],
    tensionsWith: 'Challenges intellectual property assumptions in the Business Frame.'
  }
];

export function TestSynthesis() {
  const [viewMode, setViewMode] = useState<'box' | 'cards'>('box');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <h1 className="font-serif text-2xl font-bold">ThinkingBox Test View</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'box' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('box')}
            >
              <Box className="w-4 h-4 mr-2" />
              3D Box
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Cards
            </Button>
          </div>
        </div>

          {/* Box View */}
          {viewMode === 'box' && (
            <div className="card-editorial overflow-hidden">
              <ThinkingBox
                frames={mockFrames}
                briefSummary="Design a productivity dashboard for remote teams..."
                pestelInsights={mockPestelInsights}
                onFrameSelect={(frame) => console.log('Selected:', frame.title)}
              />
            </div>
          )}

        {/* Card View */}
        {viewMode === 'cards' && (
          <div className="grid md:grid-cols-2 gap-6">
            {mockFrames.map((frame, index) => (
              <FrameCard key={frame.id} frame={frame} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
