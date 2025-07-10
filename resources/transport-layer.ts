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
