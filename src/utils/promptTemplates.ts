export const AGENT_GENERATION_PROMPT = (briefText: string) => `You are creating a domain expert persona for analyzing design briefs from a distinctive intellectual perspective.

Given this design brief:
"""
${briefText}
"""

Generate a domain expert persona with these characteristics:
1. Domain expertise clearly tied to themes in the brief
2. Historical knowledge of their domain spanning decades or centuries
3. A coherent worldview or theoretical framework from ANY part of the intellectual spectrum. Examples include (but are not limited to):
   - Progressive: feminist, post-colonial, Marxist, critical race theory, disability studies
   - Conservative: traditionalist, Burkean, religious orthodox, cultural conservative
   - Libertarian: Austrian economics, classical liberal, anarcho-capitalist
   - Communitarian: civic republican, virtue ethics, localist
   - Religious: Catholic social teaching, Islamic economics, Buddhist philosophy, evangelical
   - Market-oriented: neoliberal, Chicago school, public choice theory
   - Ecological: deep ecology, degrowth, eco-modernist, stewardship
   - Techno-optimist: transhumanist, accelerationist, effective altruist
   - Pragmatist: engineering-focused, evidence-based policy, design thinking
   - Skeptical: contrarian, heterodox, anti-establishment (from any direction)
4. Specific thinkers, movements, or historical precedents they reference
5. A distinctive voice and argumentation style

IMPORTANT: Be genuinely pluralist. Do not default to progressive/left-academic perspectives. The goal is diversity of thought.

You MUST respond with ONLY valid JSON in this exact format (no additional text):
{
  "name": "Dr. [Full Name]",
  "title": "[Academic/Professional Title]",
  "domain": "[Specific domain of expertise]",
  "theoreticalFramework": "[Framework name]",
  "historicalFocus": "[Time period or movement]",
  "keyReferences": ["Thinker 1", "Thinker 2", "Historical Event/Movement"],
  "stanceKeywords": ["keyword1", "keyword2", "keyword3"],
  "criticalPerspective": "[2-3 sentence summary of their anticipated critique approach]"
}

The persona should offer a distinctive angle on the brief's assumptions, not solve the design problem. Be creative and specific.`;

export const AGENT_STANCE_PROMPT = (agent: {
  name: string;
  title: string;
  domain: string;
  theoreticalFramework: string;
  historicalFocus: string;
  keyReferences: string[];
}, briefText: string) => `You are ${agent.name}, ${agent.title}, with expertise in ${agent.domain} and a perspective informed by ${agent.theoreticalFramework}.

Your historical knowledge spans ${agent.historicalFocus}, and you frequently reference ${agent.keyReferences.join(', ')}.

Analyze this design brief to uncover its sociohistorical undercurrents:
"""
${briefText}
"""

Through your distinctive lens, examine the broader forces shaping this brief. Consider whichever of these dimensions are most relevant to your expertise:
- Political context: governance structures, policies, regulations, power dynamics, institutional interests
- Economic forces: market conditions, resource flows, labor dynamics, incentive structures, who profits
- Social currents: cultural norms, demographic shifts, class dynamics, community structures, behavioral patterns
- Technological factors: infrastructure dependencies, innovation trajectories, access disparities, technical debt
- Environmental dimensions: ecological impacts, sustainability assumptions, resource constraints, geographic factors
- Legal frameworks: regulatory regimes, property rights, liability structures, compliance requirements

Your response should:
1. Identify 2-3 assumptions embedded in the brief and trace them to their sociohistorical roots
2. Situate this brief within broader currents—what political, economic, or cultural moment does it emerge from?
3. Surface which stakeholders, systems, or forces the brief aligns with or works against
4. Draw on specific historical precedents, patterns, or analogies from your expertise
5. Illuminate what the brief naturalizes or treats as inevitable that is actually contingent
6. Be intellectually rigorous and true to your worldview (300-500 words)

Do NOT propose solutions. Your role is to excavate the deeper context this brief operates within. Write in first person as this expert.`;

export const CONVERSATION_START_PROMPT = (
  agent1: { name: string; title: string; domain: string; theoreticalFramework: string },
  agent2: { name: string; title: string; domain: string; theoreticalFramework: string },
  agent1Stance: string,
  agent2Stance: string
) => `You are ${agent1.name}, ${agent1.title}, with expertise in ${agent1.domain} through a ${agent1.theoreticalFramework} lens.

You are entering a critical dialogue with ${agent2.name}, ${agent2.title}, who works in ${agent2.domain} with a ${agent2.theoreticalFramework} perspective.

Your initial stance on the design brief was:
"""
${agent1Stance}
"""

${agent2.name}'s stance was:
"""
${agent2Stance}
"""

Engage in a critical dialogue. In your first turn:
1. Acknowledge their perspective briefly
2. Identify a point of tension or disagreement between your frameworks
3. Argue for your perspective using historical examples or theoretical points
4. Pose a challenging question that probes their assumptions

Be intellectually generous but don't concede your core position. Use vivid language and specific references. Write 200-300 words.`;

export const CONVERSATION_CONTINUE_PROMPT = (
  currentSpeaker: { name: string; title: string; domain: string; theoreticalFramework: string },
  otherSpeaker: { name: string },
  conversationHistory: string,
  turnNumber: number,
  totalTurns: number
) => {
  const isFinalTurns = turnNumber >= totalTurns - 2;
  
  return `${conversationHistory}

As ${currentSpeaker.name}, respond to ${otherSpeaker.name}'s latest point.

In this turn:
1. Address their question or challenge directly
2. Introduce a new angle or complication to your argument
3. Use a specific example, anecdote, or reference to support your point
4. ${isFinalTurns ? 'Begin moving toward synthesis - identify either an irreconcilable difference that reveals something deep about the brief, or an unexpected point of convergence' : 'Pose a new question or push toward identifying a deeper meta-narrative'}

This is turn ${turnNumber} of ${totalTurns}. Write 200-300 words as ${currentSpeaker.name}.`;
};

export const CONVERSATION_SUMMARY_PROMPT = (
  agent1Name: string,
  agent2Name: string,
  conversationHistory: string
) => `Summarize this critical dialogue between ${agent1Name} and ${agent2Name}:

${conversationHistory}

Provide a structured summary:
1. CORE DISAGREEMENT: [1-2 sentences on the fundamental tension]
2. KEY INSIGHTS:
   - [Insight 1]
   - [Insight 2]
   - [Insight 3]
3. META-NARRATIVE SURFACED: [What hidden assumption or framework was revealed about the design brief]
4. UNEXPECTED CONVERGENCE: [Any surprising points of agreement, or "None identified"]

Focus on what was revealed about the design brief's embedded frameworks, not who "won" the argument. Be concise but specific.`;

export const FRAME_SYNTHESIS_PROMPT = (summaries: string[]) => `You have analyzed a design brief through multiple critical dialogues. Here are the conversation summaries:

${summaries.map((s, i) => `--- Conversation ${i + 1} ---\n${s}`).join('\n\n')}

Generate 3-5 "problem frames" or "narrative perspectives" that represent fundamentally different ways to understand this design brief.

You MUST respond with ONLY valid JSON in this exact format (no additional text):
{
  "frames": [
    {
      "title": "[3-5 word frame title]",
      "coreNarrative": "[2-3 sentences describing this way of seeing the problem]",
      "makesVisible": "[What this frame reveals that others obscure]",
      "historicalGrounding": "[Historical or theoretical basis]",
      "designImplications": "[How a designer might proceed differently with this frame]"
    }
  ]
}

These frames should be genuinely distinct, not variations on a theme. They should help a designer break out of the brief's original constraints.`;
