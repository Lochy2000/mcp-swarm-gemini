export class Memory {
    messages = [];
    add(m) { this.messages.push(m); }
    recent(n = 4) {
        return this.messages.slice(-n)
            .map(m => `${m.role}: ${m.content.slice(0, 300)}`)
            .join("\n");
    }
    reset() { this.messages = []; }
}
