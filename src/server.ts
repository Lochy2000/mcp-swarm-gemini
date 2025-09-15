import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { AgentRole } from "./agents/roles.js";
import { Swarm } from "./agents/swarm.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const swarm = new Swarm(GEMINI_API_KEY);

// Create MCP server
const server = new Server(
  {
    name: "mcp-swarm-gemini",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// coordinate_task tool
server.tool(
  {
    name: "coordinate_task",
    description: "Decompose and coordinate a complex task across role agents and return a synthesized result.",
    inputSchema: z.object({
      task: z.string().min(4, "Provide a non-trivial task.")
    })
  },
  async ({ task }) => {
    const result = await swarm.coordinateTask(task);
    return {
      content: [{ type: "text", text: result.final }],
      isError: false,
      metadata: {
        decomposition: result.decomposition,
        researcher: result.researcher,
        analyzer: result.analyzer,
        executor: result.executor
      }
    };
  }
);

// swarm_status tool
server.tool(
  {
    name: "swarm_status",
    description: "Report current swarm status (agents, tasks completed, last task).",
    inputSchema: z.object({})
  },
  async () => {
    const s = swarm.status();
    return { content: [{ type: "text", text: JSON.stringify(s, null, 2) }] };
  }
);

// reset_memory tool
server.tool(
  {
    name: "reset_memory",
    description: "Clear all agent memories and task history.",
    inputSchema: z.object({})
  },
  async () => {
    swarm.resetMemory();
    return { content: [{ type: "text", text: "Swarm memory cleared." }] };
  }
);

// Start over stdio (default for local hosts like Claude Desktop/Cursor)
server.start().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
