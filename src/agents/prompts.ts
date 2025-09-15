import { AgentRole, CAPABILITIES } from "./roles.js";

export function roleSystemPrompt(role: AgentRole, recentContext: string) {
  const base = `You are an advanced AI agent with the role: ${role}.
Your capabilities: ${CAPABILITIES[role].join(", ")}.
Recent context:
${recentContext || "No previous context."}
`;

  const roleAddendum: Record<AgentRole, string> = {
    coordinator: `Break down complex tasks into clear subtasks, select suitable agents, and maintain coherence.`,
    researcher:  `Gather accurate information, verify sources, synthesize concise findings.`,
    analyzer:    `Analyze data/patterns and produce evidence-based, actionable insights.`,
    executor:    `Implement concrete steps, validate results, and present clean outputs.`
  } as any;

  return base + "\n" + roleAddendum[role];
}
