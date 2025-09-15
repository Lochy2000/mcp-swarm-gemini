import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Swarm } from "./agents/swarm.js";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const swarm = new Swarm(GEMINI_API_KEY);
// Create high-level MCP server
const mcpServer = new McpServer({
    name: "mcp-swarm-gemini",
    version: "0.1.0"
});
// coordinate_task tool
mcpServer.registerTool("coordinate_task", {
    description: "Decompose and coordinate a complex task across role agents and return a synthesized result.",
    inputSchema: {
        task: z.string().min(4, "Provide a non-trivial task.")
    }
}, async ({ task }) => {
    const result = await swarm.coordinateTask(task);
    return {
        content: [{ type: "text", text: result.final }]
    };
});
// swarm_status tool
mcpServer.registerTool("swarm_status", {
    description: "Report current swarm status (agents, tasks completed, last task).",
    inputSchema: {}
}, async () => {
    const s = swarm.status();
    return { content: [{ type: "text", text: JSON.stringify(s, null, 2) }] };
});
// reset_memory tool
mcpServer.registerTool("reset_memory", {
    description: "Clear all agent memories and task history.",
    inputSchema: {}
}, async () => {
    swarm.resetMemory();
    return { content: [{ type: "text", text: "Swarm memory cleared." }] };
});
// Start over stdio (default for local hosts like Claude Desktop/Cursor)
async function main() {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.log("mcp-swarm-gemini server connected over stdio");
}
main().catch((err) => {
    console.error("MCP server failed to start:", err);
    process.exit(1);
});
