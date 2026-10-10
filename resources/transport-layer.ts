export interface TransportLayer {
    create(contextName: string, resourceName: string, rawData: Record<string, any>): Promise<Record<string, any>>;
    modify(contextName: string, resourceName: string, id: string|number, rawData: Record<string, any>): Promise<Record<string, any>>;
    remove(contextName: string, resourceName: string, id: string|number): Promise<void>;
    get(contextName: string, resourceName: string, id: string | number): Promise<Record<string, any>>;
    list(
        contextName: string,
        resourceName: string,
        options?: { limit?: number; offset?: number; }
    ): AsyncIterable<Record<string, any>>;
}

export class InMemoryTransportLayer implements TransportLayer {
    private context: Map<string, Map<string, Map<string | number, Record<string, any>>>> = new Map();
    private counters: Map<string, Map<string, number>> = new Map();

    async create(contextName: string, resourceName: string, rawData: Record<string, any>): Promise<Record<string, any>> {
        if (!this.context.has(contextName)) {
            this.context.set(contextName, new Map());
        }
        const contextMap = this.context.get(contextName)!;

        if (!contextMap.has(resourceName)) {
            contextMap.set(resourceName, new Map());
        }
        const resourceMap = contextMap.get(resourceName)!;

        if (!rawData.id) {
            if (!this.counters.has(contextName)) {
                this.counters.set(contextName, new Map());
            }
            const counterMap = this.counters.get(contextName)!;
            const counter = 1 + (counterMap.get(resourceName) ?? 0);
            counterMap.set(resourceName, counter);
            rawData.id = counter;
        }

        resourceMap.set(rawData.id, rawData);

        return rawData;
    }

    async modify(contextName: string, resourceName: string, id: string | number, rawData: Record<string, any>): Promise<Record<string, any>> {
        if (!this.context.has(contextName)) {
            throw new Error(`Context ${contextName} does not exist`);
        }
        const contextMap = this.context.get(contextName)!;

        if (!contextMap.has(resourceName)) {
            throw new Error(`Resource ${resourceName} does not exist`);
        }
        const resourceMap = contextMap.get(resourceName)!;

        const originalData = resourceMap.get(id);
        if (!originalData) {
            throw new Error(`Resource with id ${id} does not exist`);
        }

        Object.assign(originalData, rawData);
        resourceMap.set(id, originalData);

        return originalData;
    }

    async remove(contextName: string, resourceName: string, id: string | number): Promise<void> {
        const contextMap = this.context.get(contextName);
        const resourceMap = contextMap?.get(resourceName);
        resourceMap?.delete(id);
    }

    async get(contextName: string, resourceName: string, id: string | number): Promise<Record<string, any>> {
        const contextMap = this.context.get(contextName);
        if (!contextMap) {
            throw new Error(`Context ${contextName} does not exist`);
        }

        const resourceMap = contextMap.get(resourceName);
        if (!resourceMap) {
            throw new Error(`Resource ${resourceName} does not exist`);
        }

        const item = resourceMap.get(id);
        if (!item) {
            throw new Error(`Resource with id ${id} does not exist`);
        }

        return structuredClone(item);
    }

    async *list(
        contextName: string,
        resourceName: string,
        options?: { limit?: number; offset?: number }
    ): AsyncIterable<Record<string, any>> {
        const contextMap = this.context.get(contextName);
        if (!contextMap) {
            throw new Error(`Context ${contextName} does not exist`);
        }

        const resourceMap = contextMap.get(resourceName);
        if (!resourceMap) {
            throw new Error(`Resource ${resourceName} does not exist`);
        }

        const allItems = Array.from(resourceMap.values());
        const offset = options?.offset ?? 0;
        const limit = options?.limit ?? allItems.length;

        for (let i = offset; i < Math.min(offset + limit, allItems.length); i++) {
            yield structuredClone(allItems[i]);
        }
    }
}

export class FetchTransportLayer implements TransportLayer {
  constructor(private baseUrl: string) {}

  private buildUrl(
    contextName: string,
    resourceName: string,
    id?: string | number,
    queryParams?: Record<string, string | number | undefined>
  ): string {
    let url = `${this.baseUrl}/${contextName}/${resourceName}`;
    if (id !== undefined) {
      url += `/${id}`;
    }

    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    return url;
  }

  async create(
    contextName: string,
    resourceName: string,
    rawData: Record<string, any>
  ): Promise<Record<string, any>> {
    const hasId = rawData.id !== undefined && rawData.id !== null;

    const url = hasId
      ? this.buildUrl(contextName, resourceName, rawData.id)
      : this.buildUrl(contextName, resourceName);

    const method = hasId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create resource: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async modify(
    contextName: string,
    resourceName: string,
    id: string | number,
    rawData: Record<string, any>
  ): Promise<Record<string, any>> {
    const url = this.buildUrl(contextName, resourceName, id);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to modify resource: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async remove(
    contextName: string,
    resourceName: string,
    id: string | number
  ): Promise<void> {
    const url = this.buildUrl(contextName, resourceName, id);

    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to remove resource: ${response.status} ${response.statusText}`
      );
    }
  }

  async get(
    contextName: string,
    resourceName: string,
    id: string | number
  ): Promise<Record<string, any>> {
    const url = this.buildUrl(contextName, resourceName, id);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to get resource: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async *list(
    contextName: string,
    resourceName: string,
    options?: { limit?: number; offset?: number; }
  ): AsyncIterable<Record<string, any>> {
    // Initial URL
    let url = this.buildUrl(contextName, resourceName, undefined, {
      limit: options?.limit,
      offset: options?.offset,
    });

    while (url) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to list resources: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      const items: Record<string, any>[] = data.list ?? [];

      for (const item of items) {
        yield item;
      }

      // If the API returns a relative `next` link
      url = data.next ? `${this.baseUrl}${data.next}` : '';
    }
  }
}

export interface OfflineStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface OfflineTransportLayerOptions {
  /** Where the pending operations are persisted. Defaults to localStorage (or memory when unavailable). */
  storage?: OfflineStorage;
  storageKey?: string;
  /** Overrides online detection. Defaults to navigator.onLine. */
  isOnline?: () => boolean;
  /** Automatically synchronize on the browser 'online' event and on construction. Default true. */
  autoSync?: boolean;
}

type PendingOperation =
  | { type: 'create'; contextName: string; resourceName: string; id: string | number; temporary: boolean; data: Record<string, any> }
  | { type: 'modify'; contextName: string; resourceName: string; id: string | number; data: Record<string, any> }
  | { type: 'remove'; contextName: string; resourceName: string; id: string | number };

export interface FailedOperation {
  operation: PendingOperation;
  error: string;
}

interface OfflineState {
  pending: PendingOperation[];
  failed: FailedOperation[];
  idMap: Record<string, string | number>;
}

class MemoryStorage implements OfflineStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

/**
 * Wraps another transport layer. While the browser is offline (or the inner transport cannot be reached)
 * changes are stored in a persistent queue so they survive a page refresh and are sent
 * to the inner transport layer once the connection is back.
 */
export class OfflineTransportLayer implements TransportLayer {
  private state: OfflineState = { pending: [], failed: [], idMap: {} };
  private storage: OfflineStorage;
  private storageKey: string;
  private isOnlineFn: () => boolean;
  private syncing: Promise<void> | null = null;

  constructor(private inner: TransportLayer, options: OfflineTransportLayerOptions = {}) {
    this.storage = options.storage
      ?? (typeof localStorage !== 'undefined' ? localStorage : new MemoryStorage());
    this.storageKey = options.storageKey ?? 'apie-offline-queue';
    this.isOnlineFn = options.isOnline
      ?? (() => typeof navigator === 'undefined' || navigator.onLine !== false);
    this.load();

    if (options.autoSync ?? true) {
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('online', this.onOnline);
      }
      if (this.isOnlineFn() && this.state.pending.length > 0) {
        void this.sync();
      }
    }
  }

  private onOnline = (): void => { void this.sync(); };

  /** Stops listening for the browser 'online' event. */
  dispose(): void {
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('online', this.onOnline);
    }
  }

  /** Number of operations waiting to be sent. */
  pendingCount(): number {
    return this.state.pending.length;
  }

  /** Operations that were rejected by the server when synchronizing. */
  failedOperations(): FailedOperation[] {
    return structuredClone(this.state.failed);
  }

  clearFailedOperations(): void {
    this.state.failed = [];
    this.save();
  }

  async create(contextName: string, resourceName: string, rawData: Record<string, any>): Promise<Record<string, any>> {
    if (this.canTryOnline()) {
      try {
        return await this.inner.create(contextName, resourceName, rawData);
      } catch (error) {
        this.rethrowUnlessNetworkError(error);
      }
    }
    const hasId = rawData.id !== undefined && rawData.id !== null;
    const id = hasId ? rawData.id : `offline-${this.uuid()}`;
    const data = { ...structuredClone(rawData), id };
    this.state.pending.push({ type: 'create', contextName, resourceName, id, temporary: !hasId, data });
    this.save();
    return structuredClone(data);
  }

  async modify(contextName: string, resourceName: string, id: string | number, rawData: Record<string, any>): Promise<Record<string, any>> {
    const pendingCreate = this.findPendingCreate(contextName, resourceName, id);
    if (pendingCreate) {
      Object.assign(pendingCreate.data, structuredClone(rawData), { id: pendingCreate.id });
      this.save();
      return structuredClone(pendingCreate.data);
    }
    if (this.canTryOnline() && !this.hasPendingFor(contextName, resourceName, id)) {
      try {
        return await this.inner.modify(contextName, resourceName, this.resolveId(contextName, resourceName, id), rawData);
      } catch (error) {
        this.rethrowUnlessNetworkError(error);
      }
    }
    this.state.pending.push({ type: 'modify', contextName, resourceName, id, data: structuredClone(rawData) });
    this.save();
    return { ...structuredClone(rawData), id };
  }

  async remove(contextName: string, resourceName: string, id: string | number): Promise<void> {
    const index = this.state.pending.findIndex(
      (op) => op.type === 'create' && this.sameResource(op, contextName, resourceName) && op.id === id
    );
    if (index >= 0) {
      // Never reached the server, so just forget about it (including queued changes to it).
      this.state.pending = this.state.pending.filter(
        (op) => !(this.sameResource(op, contextName, resourceName) && op.id === id)
      );
      this.save();
      return;
    }
    if (this.canTryOnline() && !this.hasPendingFor(contextName, resourceName, id)) {
      try {
        await this.inner.remove(contextName, resourceName, this.resolveId(contextName, resourceName, id));
        return;
      } catch (error) {
        this.rethrowUnlessNetworkError(error);
      }
    }
    this.state.pending = this.state.pending.filter(
      (op) => !(op.type === 'modify' && this.sameResource(op, contextName, resourceName) && op.id === id)
    );
    this.state.pending.push({ type: 'remove', contextName, resourceName, id });
    this.save();
  }

  async get(contextName: string, resourceName: string, id: string | number): Promise<Record<string, any>> {
    const pendingCreate = this.findPendingCreate(contextName, resourceName, id);
    if (pendingCreate) {
      return structuredClone(pendingCreate.data);
    }
    if (this.isRemoved(contextName, resourceName, id)) {
      throw new Error(`Resource with id ${id} does not exist`);
    }
    const item = await this.inner.get(contextName, resourceName, this.resolveId(contextName, resourceName, id));
    return this.applyModifications(contextName, resourceName, id, item);
  }

  async *list(
    contextName: string,
    resourceName: string,
    options?: { limit?: number; offset?: number; }
  ): AsyncIterable<Record<string, any>> {
    // Pending creates are appended after the stored items, so offset/limit are applied to the combined list.
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? Infinity;
    let index = 0;
    let yielded = 0;

    const emit = (item: Record<string, any>): boolean => {
      const current = index++;
      return current >= offset && yielded < limit && ++yielded > 0;
    };

    if (this.canTryOnline()) {
      try {
        for await (const item of this.inner.list(contextName, resourceName)) {
          const id = item.id;
          if (id !== undefined && this.isRemoved(contextName, resourceName, id)) {
            continue;
          }
          if (emit(item)) {
            yield id === undefined ? item : this.applyModifications(contextName, resourceName, id, item);
          }
        }
      } catch (error) {
        this.rethrowUnlessNetworkError(error);
      }
    }

    for (const op of this.state.pending) {
      if (op.type === 'create' && this.sameResource(op, contextName, resourceName)) {
        if (emit(op.data)) {
          yield structuredClone(op.data);
        }
      }
    }
  }

  /**
   * Sends all queued operations to the inner transport layer, in order.
   * Stops when the connection is lost; operations rejected by the server are moved to failedOperations().
   */
  sync(): Promise<void> {
    if (!this.syncing) {
      this.syncing = this.doSync().finally(() => { this.syncing = null; });
    }
    return this.syncing;
  }

  private async doSync(): Promise<void> {
    while (this.state.pending.length > 0 && this.isOnlineFn()) {
      const op = this.state.pending[0];
      try {
        await this.send(op);
      } catch (error) {
        if (this.isNetworkError(error)) {
          return;
        }
        this.state.failed.push({ operation: op, error: error instanceof Error ? error.message : String(error) });
      }
      this.state.pending.shift();
      this.save();
    }
  }

  private async send(op: PendingOperation): Promise<void> {
    switch (op.type) {
      case 'create': {
        const data = { ...op.data };
        if (op.temporary) {
          delete data.id;
        }
        const result = await this.inner.create(op.contextName, op.resourceName, data);
        if (op.temporary && result?.id !== undefined && result.id !== null) {
          this.state.idMap[this.key(op.contextName, op.resourceName, op.id)] = result.id;
        }
        break;
      }
      case 'modify':
        await this.inner.modify(op.contextName, op.resourceName, this.resolveId(op.contextName, op.resourceName, op.id), op.data);
        break;
      case 'remove':
        await this.inner.remove(op.contextName, op.resourceName, this.resolveId(op.contextName, op.resourceName, op.id));
        break;
    }
  }

  private canTryOnline(): boolean {
    return this.isOnlineFn();
  }

  private rethrowUnlessNetworkError(error: unknown): void {
    if (!this.isNetworkError(error)) {
      throw error;
    }
  }

  private isNetworkError(error: unknown): boolean {
    return error instanceof TypeError || !this.isOnlineFn();
  }

  private sameResource(op: PendingOperation, contextName: string, resourceName: string): boolean {
    return op.contextName === contextName && op.resourceName === resourceName;
  }

  private key(contextName: string, resourceName: string, id: string | number): string {
    return JSON.stringify([contextName, resourceName, id]);
  }

  private resolveId(contextName: string, resourceName: string, id: string | number): string | number {
    return this.state.idMap[this.key(contextName, resourceName, id)] ?? id;
  }

  private findPendingCreate(contextName: string, resourceName: string, id: string | number) {
    return this.state.pending.find(
      (op): op is Extract<PendingOperation, { type: 'create' }> =>
        op.type === 'create' && this.sameResource(op, contextName, resourceName) && op.id === id
    );
  }

  private hasPendingFor(contextName: string, resourceName: string, id: string | number): boolean {
    return this.state.pending.some((op) => this.sameResource(op, contextName, resourceName) && op.id === id);
  }

  private isRemoved(contextName: string, resourceName: string, id: string | number): boolean {
    return this.state.pending.some(
      (op) => op.type === 'remove' && this.sameResource(op, contextName, resourceName) && op.id === id
    );
  }

  private applyModifications(contextName: string, resourceName: string, id: string | number, item: Record<string, any>): Record<string, any> {
    for (const op of this.state.pending) {
      if (op.type === 'modify' && this.sameResource(op, contextName, resourceName) && op.id === id) {
        item = { ...item, ...structuredClone(op.data) };
      }
    }
    return item;
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  private load(): void {
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = {
          pending: Array.isArray(parsed.pending) ? parsed.pending : [],
          failed: Array.isArray(parsed.failed) ? parsed.failed : [],
          idMap: parsed.idMap && typeof parsed.idMap === 'object' ? parsed.idMap : {},
        };
      }
    } catch {
      this.state = { pending: [], failed: [], idMap: {} };
    }
  }

  private save(): void {
    if (this.state.pending.length === 0 && this.state.failed.length === 0 && Object.keys(this.state.idMap).length === 0) {
      this.storage.removeItem(this.storageKey);
      return;
    }
    this.storage.setItem(this.storageKey, JSON.stringify(this.state));
  }
}
