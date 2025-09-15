import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentRole } from "./roles.js";
import { roleSystemPrompt } from "./prompts.js";
import { Memory } from "./memory.js";

type Agent = {
  id: string;
  role: AgentRole;
  mem: Memory;
  model?: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;
};

export class Swarm {
  private agents = new Map<string, Agent>();
  private taskHistory: any[] = [];
  private genai?: GoogleGenerativeAI;

  constructor(apiKey?: string, private modelName = "gemini-2.5-flash") {
    if (apiKey) {
      this.genai = new GoogleGenerativeAI(apiKey);
    }
  }

  private ensure(role: AgentRole, id: string = role): Agent {
    if (this.agents.has(id)) return this.agents.get(id)!;
    const mem = new Memory();
    const agent: Agent = {
      id,
      role,
      mem,
      model: this.genai?.getGenerativeModel({ model: this.modelName })
    };
    this.agents.set(id, agent);
    return agent;
  }

  resetMemory() {
    for (const a of this.agents.values()) a.mem.reset();
    this.taskHistory = [];
  }

  status() {
    return {
      total_agents: this.agents.size,
      agent_roles: Array.from(this.agents.values()).reduce((acc, a) => {
        acc[a.id] = a.role; return acc;
      }, {} as Record<string, string>),
      tasks_completed: this.taskHistory.length,
      last_task: this.taskHistory.at(-1)?.task ?? null
    };
  }

  async coordinateTask(task: string) {
    const coordinator = this.ensure(AgentRole.COORDINATOR, "coordinator");
    const researcher  = this.ensure(AgentRole.RESEARCHER,  "researcher");
    const analyzer    = this.ensure(AgentRole.ANALYZER,    "analyzer");
    const executor    = this.ensure(AgentRole.EXECUTOR,    "executor");

    // Step 1: Decompose
    const decomp = await this.ask(coordinator, `Decompose this complex task into 3–6 subtasks and assign roles:\n\n"${task}"`);
    // Step 2: Delegate
    const research = await this.ask(researcher, `Using the coordinator plan:\n${decomp}\n\nProduce a concise research brief with citations (bulleted).`);
    const analysis = await this.ask(analyzer,   `Given the task and research:\nTASK: ${task}\nRESEARCH:\n${research}\n\nProvide key patterns/insights and risks.`);
    const execOut  = await this.ask(executor,   `Turn this into an actionable plan or implementation outline:\nTASK: ${task}\nINSIGHTS:\n${analysis}`);

    // Step 3: Synthesize
    const final = await this.ask(coordinator, `Synthesize a final deliverable:\nTask: ${task}\nResearch brief:\n${research}\nInsights:\n${analysis}\nExecution plan:\n${execOut}\n\nReturn a clearly structured answer.`);

    const record = {
      task,
      decomposition: decomp,
      researcher: research,
      analyzer: analysis,
      executor: execOut,
      final
    };
    this.taskHistory.push(record);
    return record;
  }

  private async ask(agent: Agent, userMsg: string) {
    agent.mem.add({ role: "user", content: userMsg, ts: Date.now() });
    const sys = roleSystemPrompt(agent.role, agent.mem.recent());
    const model = agent.model;

    // Fallback to deterministic local response if no API key/model
    if (!model) {
      const canned = `${agent.role.toUpperCase()}: ${userMsg.slice(0, 120)} … [demo response]`;
      agent.mem.add({ role: "assistant", content: canned, ts: Date.now() });
      return canned;
    }

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: sys }] },
        { role: "user", parts: [{ text: userMsg }] }
      ]
    });
    const text = result.response.text() ?? "";
    agent.mem.add({ role: "assistant", content: text, ts: Date.now() });
    return text;
  }
}
