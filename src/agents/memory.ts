export type Msg = { role: "user" | "assistant" | "system"; content: string; ts: number };

export class Memory {
  private messages: Msg[] = [];
  add(m: Msg) { this.messages.push(m); }
  recent(n = 4) {
    return this.messages.slice(-n)
      .map(m => `${m.role}: ${m.content.slice(0, 300)}`)
      .join("\n");
  }
  reset() { this.messages = []; }
}
