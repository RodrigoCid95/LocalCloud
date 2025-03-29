@Namespace('core', 'sessions')
export class SessionStore {
  private store = new Map()

  @On('get')
  public get({ data: [sid] }: PXIOWorkers.EventArgs<string>) {
    return this.store.get(sid) || null
  }

  @On('set')
  public set({ data: [sid, session] }: PXIOWorkers.EventArgs) {
    this.store.set(sid, session)
    return null
  }

  @On('destroy')
  public destroy({ data: [sid] }: PXIOWorkers.EventArgs<string>) {
    this.store.delete(sid)
    return null
  }

  @On('delete')
  public delete({ data: [sid] }: PXIOWorkers.EventArgs<string>) {
    this.store.delete(sid)
    return null
  }

  @On('length')
  public length() {
    return this.store.size
  }

  @On('all')
  public all() {
    return Array.from(this.store.values())
  }

  @On('clear')
  public clear() {
    this.store.clear()
  }
}