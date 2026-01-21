export const AGENT_GENERATION_PROMPT = (briefText: string) => `You are creating a domain agent persona who brings a distinctive critical lens to design briefs.

Given this design brief:
"""
${briefText}
"""

Generate a domain agent persona with these requirements:

1. THEMATIC CONNECTION: The agent's field should connect to THEMES or TENSIONS in the brief, not its literal subject. For example, a brief about a parking app might attract a labor economist (gig economy), an urban theorist (car dependency), or a disability advocate (mobility justice)—not just a "parking agent."

2. ANCHORING THEMES: Identify 3 broader themes, tensions, or assumptions in the brief that this agent would interrogate. These should be conceptual hooks (e.g., "the assumption of individual car ownership"), not verbatim quotes.

3. CRITICAL LENS: Apply a coherent worldview from ANY part of the intellectual spectrum. Diversity comes from the LENS:
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

IMPORTANT: Be genuinely pluralist. Do not default to progressive/left-academic perspectives.

You MUST respond with ONLY valid JSON in this exact format (no additional text):
{
  "name": "Dr. [Full Name]",
  "title": "[Academic/Professional Title]",
  "domain": "[Specific domain of focus]",
  "theoreticalFramework": "[Critical lens/framework name]",
  "historicalFocus": "[Time period or movement]",
  "keyReferences": ["Thinker 1", "Thinker 2", "Historical Event/Movement"],
  "stanceKeywords": ["keyword1", "keyword2", "keyword3"],
  "criticalPerspective": "[2-3 sentence summary of their anticipated critique approach]",
  "briefSnippets": ["thematic anchor 1", "thematic anchor 2", "thematic anchor 3"],
  "consultationRationale": "[1-2 sentences explaining the conceptual bridge between their domain and this brief]"
}`;

export const AGENT_VALIDATION_PROMPT = (agent: {
  name: string;
  title: string;
  domain: string;
  theoreticalFramework: string;
  briefSnippets: string[];
  consultationRationale: string;
}, briefText: string) => `You are a relevance validator. Assess whether this agent persona is appropriate for analyzing the given design brief.

Design Brief:
"""
${briefText}
"""

Agent Persona:
- Name: ${agent.name}
- Title: ${agent.title}
- Domain: ${agent.domain}
- Framework: ${agent.theoreticalFramework}
- Consultation Rationale: ${agent.consultationRationale}
- Brief Snippets to Interrogate: ${agent.briefSnippets.map(s => `"${s}"`).join(', ')}

Evaluate on these criteria:
1. DOMAIN PROXIMITY (0-1): Would this agent plausibly be consulted for this brief?
2. SNIPPET VALIDITY (0-1): Are the snippets actual quotes from the brief?
3. RATIONALE COHERENCE (0-1): Does the consultation rationale make sense?
4. CRITICAL VALUE (0-2): Will this perspective surface non-obvious insights about the brief?

You MUST respond with ONLY valid JSON:
{
  "relevanceScore": [1-5 total score],
  "relevanceRationale": "[2-3 sentence explanation of score]",
  "domainProximity": [0 or 1],
  "snippetValidity": [0 or 1],
  "rationaleCoherence": [0 or 1],
  "criticalValue": [0, 1, or 2]
}

A score of 3 or higher means the agent should proceed. Below 3 means regenerate.`;

export const WILDCARD_AGENT_PROMPT = (briefText: string, existingAgents: Array<{name: string; domain: string; theoreticalFramework: string}>) => `You are creating a WILDCARD agent persona—someone from an unexpected domain who can offer a surprising but valuable perspective on this design brief.

Given this design brief:
"""
${briefText}
"""

Existing agents already cover these perspectives:
${existingAgents.map(a => `- ${a.name}: ${a.domain}, ${a.theoreticalFramework}`).join('\n')}

Create a wildcard agent who:
1. Comes from a domain NOT obviously related to the brief's literal subject
2. Has a CONCEPTUAL BRIDGE to the brief—a surprising but defensible thematic connection
3. Will surface insights that domain-proximate agents would miss
4. Brings historical depth and intellectual rigor despite the unconventional angle

The wildcard must NOT be random—they need a compelling conceptual bridge explaining why their perspective matters for the deeper themes in this brief.

You MUST respond with ONLY valid JSON:
{
  "name": "Dr. [Full Name]",
  "title": "[Academic/Professional Title]",
  "domain": "[Unexpected but bridgeable domain]",
  "theoreticalFramework": "[Framework name]",
  "historicalFocus": "[Time period or movement]",
  "keyReferences": ["Thinker 1", "Thinker 2", "Historical Event/Movement"],
  "stanceKeywords": ["keyword1", "keyword2", "keyword3"],
  "criticalPerspective": "[2-3 sentence summary of their anticipated critique approach]",
  "briefSnippets": ["thematic anchor 1", "thematic anchor 2", "thematic anchor 3"],
  "wildcardBridge": "[2-3 sentences explaining the conceptual connection between their unexpected domain and the deeper themes in this brief]"
}`;

export const AGENT_STANCE_PROMPT = (agent: {
  name: string;
  title: string;
  domain: string;
  theoreticalFramework: string;
  historicalFocus: string;
  keyReferences: string[];
}, briefText: string) => `You are ${agent.name}, ${agent.title}, with focus on ${agent.domain} and a perspective informed by ${agent.theoreticalFramework}.

Your historical knowledge spans ${agent.historicalFocus}, and you frequently reference ${agent.keyReferences.join(', ')}.

Analyze this design brief to uncover its sociohistorical undercurrents:
"""
${briefText}
"""

Through your distinctive lens, examine the broader forces shaping this brief. Consider whichever of these dimensions are most relevant to your perspective:
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
4. Draw on specific historical precedents, patterns, or analogies from your perspective
5. Illuminate what the brief naturalizes or treats as inevitable that is actually contingent
6. Be intellectually rigorous and true to your worldview (300-500 words)

Do NOT propose solutions. Your role is to excavate the deeper context this brief operates within. Write in first person as this agent.`;

export const CONVERSATION_START_PROMPT = (
  agent1: { name: string; title: string; domain: string; theoreticalFramework: string },
  agent2: { name: string; title: string; domain: string; theoreticalFramework: string },
  agent1Stance: string,
  agent2Stance: string
) => `You are ${agent1.name}, ${agent1.title}, with focus on ${agent1.domain} through a ${agent1.theoreticalFramework} lens.

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

Provide a structured summary designed to TRIGGER FURTHER DISCUSSION (this is not a final answer, but a springboard):

1. CORE TENSION: [1-2 sentences on the fundamental disagreement or productive friction]

2. KEY PROVOCATIONS (questions the team should discuss):
   - [Provocative question 1 raised by this dialogue]
   - [Provocative question 2 that remains unresolved]
   - [Provocative question 3 for the design team to debate]

3. ASSUMPTIONS EXPOSED: [What hidden assumptions about the brief were surfaced?]

4. DISCUSSION HOOKS (conversation starters for a team workshop):
   - "What if we assumed the opposite of [X]?"
   - "Who benefits if we [Y]? Who loses?"
   - "How would this look in [historical/geographic context Z]?"

5. UNRESOLVED TENSIONS: [What fundamental disagreements could not be reconciled, and why do they matter?]

Focus on generating TRIGGERS FOR FURTHER CONVERSATION, not conclusions. The goal is to open up discussion, not close it down.`;

export const FRAME_SYNTHESIS_PROMPT = (summaries: string[]) => `You have analyzed a design brief through multiple critical dialogues. Here are the conversation summaries:

${summaries.map((s, i) => `--- Conversation ${i + 1} ---\n${s}`).join('\n\n')}

Generate 3-5 "problem frames" that represent fundamentally different ways to understand this design brief. These frames are STARTING POINTS FOR DISCUSSION, not final answers.

You MUST respond with ONLY valid JSON in this exact format (no additional text):
{
  "frames": [
    {
      "title": "[3-5 word frame title]",
      "coreNarrative": "[2-3 sentences describing this way of seeing the problem]",
      "makesVisible": "[What this frame reveals that others obscure]",
      "historicalGrounding": "[Historical or theoretical basis]",
      "designImplications": "[How a designer might proceed differently with this frame]",
      "discussionQuestions": ["Provocative question 1 for team discussion", "Provocative question 2", "What-if scenario to explore"],
      "tensionsWith": "[Which other frames does this conflict with, and why might that tension be productive?]"
    }
  ]
}

These frames should be genuinely distinct and designed to SPARK DEBATE within a design team. Include uncomfortable questions and productive tensions. The goal is to open up the problem space, not close it down.`;
