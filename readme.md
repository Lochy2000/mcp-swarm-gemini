<img width="100" height="100" alt="swarm" src="https://github.com/user-attachments/assets/cb349ef1-6e52-4373-9eae-3247fb9f97ef"/>

## MCP Swarm Gemini 



[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20.18-blue?logo=node.js)](https://nodejs.org)
[![TypeScript 5](https://img.shields.io/badge/typescript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![MCP SDK 1.2](https://img.shields.io/badge/MCP%20SDK-1.2-6e5bdc)](https://modelcontextprotocol.io)
[![Google Generative AI](https://img.shields.io/badge/google-generative--ai-1b73e7?logo=google)](https://ai.google.dev/gemini-api/docs/quickstart?utm_source=chatgpt.com#javascript_1)

### Overview
- An MCP server that exposes a multi‑agent “swarm” powered by Google Gemini models.
- Not a standalone app; designed to be spawned and orchestrated by an MCP‑capable client (Cursor, Claude Desktop, custom apps) via stdio.
- Provides tools for task coordination and status reporting, delegating actual work to role‑specialized agents.

### Features
- Role‑based multi‑agent coordination: coordinator, researcher, analyzer, executor.
- Gemini API integration with graceful demo fallback when no `GEMINI_API_KEY` is configured.
- MCP server over stdio using a simple, typed tool registration API.
- Strict TypeScript, ESM, minimal dependencies.

### Requirements
- Node.js >= 20.18
- Optional: `GEMINI_API_KEY` for live Gemini responses. Without it, the swarm replies with deterministic demo outputs.

### Installation
```bash
git clone <your-repo>
cd mcp-swarm-gemini
npm install
```

### Development (local)
```bash
# Windows PowerShell
$env:GEMINI_API_KEY = "YOUR_KEY"

npm run dev
```
You should see: `mcp-swarm-gemini server connected over stdio`.

### Production build
```bash
npm run build
# Windows PowerShell
$env:GEMINI_API_KEY = "YOUR_KEY"
npm start
```
This runs `node dist/server.js`. In real usage, your MCP client spawns this command automatically.

### Using with an MCP client
Configure your client to spawn the server via stdio. Example (conceptual):
```json
{
  "mcpServers": {
    "mcp-swarm-gemini": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": { "GEMINI_API_KEY": "YOUR_KEY" }
    }
  }
}
```
The client will initialize, list tools, and call them as needed.

### Exposed tools
- coordinate_task
  - Input: `{ task: string }` (>= 4 chars)
  - Behavior: Decomposes and coordinates the task across agents; returns a synthesized final answer.
  - Output: Text content.
- swarm_status
  - Input: none
  - Behavior: Returns agent count, roles, tasks completed, and last task.
  - Output: Text (JSON string).
- reset_memory
  - Input: none
  - Behavior: Clears agent memories and task history.
  - Output: Confirmation text.

### Architecture
- `src/server.ts`: MCP server setup using `McpServer` and `StdioServerTransport`. Registers tools and connects over stdio.
- `src/agents/swarm.ts`: Core multi‑agent orchestration. Creates/ensures role agents, calls Gemini (or demo), tracks task history.
- `src/agents/roles.ts`: Role enum and capability map.
- `src/agents/memory.ts`: Lightweight rolling memory for context.
- `src/agents/prompts.ts`: Role system prompt builder using recent context.

Flow:
1) Client calls `coordinate_task` → coordinator decomposes.
2) Researcher builds a brief → analyzer extracts insights → executor outlines an actionable plan.
3) Coordinator synthesizes the final deliverable and returns it to the client.

### Configuration
- Environment variables
  - `GEMINI_API_KEY`: Required for live model calls.
  - Model selection: The swarm uses a default model (e.g., `gemini-2.5-flash`). Adjust in `Swarm` constructor if you need a different model.

### Troubleshooting
- “server.tool is not a function”: Ensure you’re using `McpServer.registerTool(...)` and `StdioServerTransport`, not the low‑level `Server` methods.
- No API key: The swarm returns demo responses; set `GEMINI_API_KEY` for real outputs.
- Client cannot connect: Verify the spawn command, arguments, and environment variables in your client config.
- Windows env vars: Use `$env:GEMINI_API_KEY = "..."` in PowerShell.

### References
- Marktechpost tutorial: Building MCP agents with multi‑agent coordination and Gemini integration — [link](https://www.marktechpost.com/2025/09/10/building-advanced-mcp-model-context-protocol-agents-with-multi-agent-coordination-context-awareness-and-gemini-integration/?amp)
- Google Gemini API Quickstart (JavaScript) — [link](https://ai.google.dev/gemini-api/docs/quickstart?utm_source=chatgpt.com#javascript_1)

### License
This repository is intended for internal or private use. Add a license if you plan to distribute.
