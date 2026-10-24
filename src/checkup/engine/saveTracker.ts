/**
 * Tracks draft saves so an older response can never mark newer edits as saved,
 * and a failure is never shown as "Saved".
 */
export type SaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: string }
  | { kind: 'error' };

export class SaveTracker<T> {
  private seq = 0;
  private lastConfirmedSeq = 0;
  private latestPayload: T | null = null;
  status: SaveStatus = { kind: 'idle' };

  constructor(
    private readonly save: (payload: T) => Promise<{ savedAt: string }>,
    private readonly onChange: (s: SaveStatus) => void,
  ) {}

  async submit(payload: T): Promise<void> {
    const mySeq = ++this.seq;
    this.latestPayload = payload;
    this.set({ kind: 'saving' });
    try {
      const res = await this.save(payload);
      if (mySeq > this.lastConfirmedSeq) this.lastConfirmedSeq = mySeq;
      // Only the newest request may report the overall state.
      if (mySeq === this.seq) this.set({ kind: 'saved', at: res.savedAt });
    } catch {
      if (mySeq === this.seq) this.set({ kind: 'error' });
    }
  }

  /** Re-send the most recent payload after a failure. */
  retry(): Promise<void> {
    return this.latestPayload === null ? Promise.resolve() : this.submit(this.latestPayload);
  }

  /** True when the newest edits are confirmed by the server. */
  get isCurrentSaved(): boolean {
    return this.lastConfirmedSeq === this.seq && this.seq > 0;
  }

  private set(s: SaveStatus) {
    this.status = s;
    this.onChange(s);
  }
}
