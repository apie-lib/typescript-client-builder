var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
export class InMemoryTransportLayer {
    constructor() {
        this.context = new Map();
        this.counters = new Map();
    }
    create(contextName, resourceName, rawData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.context.has(contextName)) {
                this.context.set(contextName, new Map());
            }
            const contextMap = this.context.get(contextName);
            if (!contextMap.has(resourceName)) {
                contextMap.set(resourceName, new Map());
            }
            const resourceMap = contextMap.get(resourceName);
            if (!rawData.id) {
                if (!this.counters.has(contextName)) {
                    this.counters.set(contextName, new Map());
                }
                const counterMap = this.counters.get(contextName);
                const counter = 1 + ((_a = counterMap.get(resourceName)) !== null && _a !== void 0 ? _a : 0);
                counterMap.set(resourceName, counter);
                rawData.id = counter;
            }
            resourceMap.set(rawData.id, rawData);
            return rawData;
        });
    }
    modify(contextName, resourceName, id, rawData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.context.has(contextName)) {
                throw new Error(`Context ${contextName} does not exist`);
            }
            const contextMap = this.context.get(contextName);
            if (!contextMap.has(resourceName)) {
                throw new Error(`Resource ${resourceName} does not exist`);
            }
            const resourceMap = contextMap.get(resourceName);
            const originalData = resourceMap.get(id);
            if (!originalData) {
                throw new Error(`Resource with id ${id} does not exist`);
            }
            Object.assign(originalData, rawData);
            resourceMap.set(id, originalData);
            return originalData;
        });
    }
    remove(contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextMap = this.context.get(contextName);
            const resourceMap = contextMap === null || contextMap === void 0 ? void 0 : contextMap.get(resourceName);
            resourceMap === null || resourceMap === void 0 ? void 0 : resourceMap.delete(id);
        });
    }
    get(contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    list(contextName, resourceName, options) {
        return __asyncGenerator(this, arguments, function* list_1() {
            var _a, _b;
            const contextMap = this.context.get(contextName);
            if (!contextMap) {
                throw new Error(`Context ${contextName} does not exist`);
            }
            const resourceMap = contextMap.get(resourceName);
            if (!resourceMap) {
                throw new Error(`Resource ${resourceName} does not exist`);
            }
            const allItems = Array.from(resourceMap.values());
            const offset = (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : 0;
            const limit = (_b = options === null || options === void 0 ? void 0 : options.limit) !== null && _b !== void 0 ? _b : allItems.length;
            for (let i = offset; i < Math.min(offset + limit, allItems.length); i++) {
                yield yield __await(structuredClone(allItems[i]));
            }
        });
    }
}
export class FetchTransportLayer {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    buildUrl(contextName, resourceName, id, queryParams) {
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
            if (qs)
                url += `?${qs}`;
        }
        return url;
    }
    create(contextName, resourceName, rawData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasId = rawData.id !== undefined && rawData.id !== null;
            const url = hasId
                ? this.buildUrl(contextName, resourceName, rawData.id)
                : this.buildUrl(contextName, resourceName);
            const method = hasId ? 'PUT' : 'POST';
            const response = yield fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rawData),
            });
            if (!response.ok) {
                throw new Error(`Failed to create resource: ${response.status} ${response.statusText}`);
            }
            return response.json();
        });
    }
    modify(contextName, resourceName, id, rawData) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.buildUrl(contextName, resourceName, id);
            const response = yield fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rawData),
            });
            if (!response.ok) {
                throw new Error(`Failed to modify resource: ${response.status} ${response.statusText}`);
            }
            return response.json();
        });
    }
    remove(contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.buildUrl(contextName, resourceName, id);
            const response = yield fetch(url, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to remove resource: ${response.status} ${response.statusText}`);
            }
        });
    }
    get(contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.buildUrl(contextName, resourceName, id);
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to get resource: ${response.status} ${response.statusText}`);
            }
            return response.json();
        });
    }
    list(contextName, resourceName, options) {
        return __asyncGenerator(this, arguments, function* list_2() {
            var _a;
            // Initial URL
            let url = this.buildUrl(contextName, resourceName, undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
            });
            while (url) {
                const response = yield __await(fetch(url));
                if (!response.ok) {
                    throw new Error(`Failed to list resources: ${response.status} ${response.statusText}`);
                }
                const data = yield __await(response.json());
                const items = (_a = data.list) !== null && _a !== void 0 ? _a : [];
                for (const item of items) {
                    yield yield __await(item);
                }
                // If the API returns a relative `next` link
                url = data.next ? `${this.baseUrl}${data.next}` : '';
            }
        });
    }
}
