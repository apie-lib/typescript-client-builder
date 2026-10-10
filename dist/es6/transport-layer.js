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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }
    getItem(key) { var _a; return (_a = this.data.get(key)) !== null && _a !== void 0 ? _a : null; }
    setItem(key, value) { this.data.set(key, value); }
    removeItem(key) { this.data.delete(key); }
}
/**
 * Wraps another transport layer. While the browser is offline (or the inner transport cannot be reached)
 * changes are stored in a persistent queue so they survive a page refresh and are sent
 * to the inner transport layer once the connection is back.
 */
export class OfflineTransportLayer {
    constructor(inner, options = {}) {
        var _a, _b, _c, _d;
        this.inner = inner;
        this.state = { pending: [], failed: [], idMap: {} };
        this.syncing = null;
        this.onOnline = () => { void this.sync(); };
        this.storage = (_a = options.storage) !== null && _a !== void 0 ? _a : (typeof localStorage !== 'undefined' ? localStorage : new MemoryStorage());
        this.storageKey = (_b = options.storageKey) !== null && _b !== void 0 ? _b : 'apie-offline-queue';
        this.isOnlineFn = (_c = options.isOnline) !== null && _c !== void 0 ? _c : (() => typeof navigator === 'undefined' || navigator.onLine !== false);
        this.load();
        if ((_d = options.autoSync) !== null && _d !== void 0 ? _d : true) {
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                window.addEventListener('online', this.onOnline);
            }
            if (this.isOnlineFn() && this.state.pending.length > 0) {
                void this.sync();
            }
        }
    }
    /** Stops listening for the browser 'online' event. */
    dispose() {
        if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
            window.removeEventListener('online', this.onOnline);
        }
    }
    /** Number of operations waiting to be sent. */
    pendingCount() {
        return this.state.pending.length;
    }
    /** Operations that were rejected by the server when synchronizing. */
    failedOperations() {
        return structuredClone(this.state.failed);
    }
    clearFailedOperations() {
        this.state.failed = [];
        this.save();
    }
    create(contextName, resourceName, rawData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.canTryOnline()) {
                try {
                    return yield this.inner.create(contextName, resourceName, rawData);
                }
                catch (error) {
                    this.rethrowUnlessNetworkError(error);
                }
            }
            const hasId = rawData.id !== undefined && rawData.id !== null;
            const id = hasId ? rawData.id : `offline-${this.uuid()}`;
            const data = Object.assign(Object.assign({}, structuredClone(rawData)), { id });
            this.state.pending.push({ type: 'create', contextName, resourceName, id, temporary: !hasId, data });
            this.save();
            return structuredClone(data);
        });
    }
    modify(contextName, resourceName, id, rawData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingCreate = this.findPendingCreate(contextName, resourceName, id);
            if (pendingCreate) {
                Object.assign(pendingCreate.data, structuredClone(rawData), { id: pendingCreate.id });
                this.save();
                return structuredClone(pendingCreate.data);
            }
            if (this.canTryOnline() && !this.hasPendingFor(contextName, resourceName, id)) {
                try {
                    return yield this.inner.modify(contextName, resourceName, this.resolveId(contextName, resourceName, id), rawData);
                }
                catch (error) {
                    this.rethrowUnlessNetworkError(error);
                }
            }
            this.state.pending.push({ type: 'modify', contextName, resourceName, id, data: structuredClone(rawData) });
            this.save();
            return Object.assign(Object.assign({}, structuredClone(rawData)), { id });
        });
    }
    remove(contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.state.pending.findIndex((op) => op.type === 'create' && this.sameResource(op, contextName, resourceName) && op.id === id);
            if (index >= 0) {
                // Never reached the server, so just forget about it (including queued changes to it).
                this.state.pending = this.state.pending.filter((op) => !(this.sameResource(op, contextName, resourceName) && op.id === id));
                this.save();
                return;
            }
            if (this.canTryOnline() && !this.hasPendingFor(contextName, resourceName, id)) {
                try {
                    yield this.inner.remove(contextName, resourceName, this.resolveId(contextName, resourceName, id));
                    return;
                }
                catch (error) {
                    this.rethrowUnlessNetworkError(error);
                }
            }
            this.state.pending = this.state.pending.filter((op) => !(op.type === 'modify' && this.sameResource(op, contextName, resourceName) && op.id === id));
            this.state.pending.push({ type: 'remove', contextName, resourceName, id });
            this.save();
        });
    }
    get(contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingCreate = this.findPendingCreate(contextName, resourceName, id);
            if (pendingCreate) {
                return structuredClone(pendingCreate.data);
            }
            if (this.isRemoved(contextName, resourceName, id)) {
                throw new Error(`Resource with id ${id} does not exist`);
            }
            const item = yield this.inner.get(contextName, resourceName, this.resolveId(contextName, resourceName, id));
            return this.applyModifications(contextName, resourceName, id, item);
        });
    }
    list(contextName, resourceName, options) {
        return __asyncGenerator(this, arguments, function* list_3() {
            var _a, e_1, _b, _c;
            var _d, _e;
            // Pending creates are appended after the stored items, so offset/limit are applied to the combined list.
            const offset = (_d = options === null || options === void 0 ? void 0 : options.offset) !== null && _d !== void 0 ? _d : 0;
            const limit = (_e = options === null || options === void 0 ? void 0 : options.limit) !== null && _e !== void 0 ? _e : Infinity;
            let index = 0;
            let yielded = 0;
            const emit = (item) => {
                const current = index++;
                return current >= offset && yielded < limit && ++yielded > 0;
            };
            if (this.canTryOnline()) {
                try {
                    try {
                        for (var _f = true, _g = __asyncValues(this.inner.list(contextName, resourceName)), _h; _h = yield __await(_g.next()), _a = _h.done, !_a; _f = true) {
                            _c = _h.value;
                            _f = false;
                            const item = _c;
                            const id = item.id;
                            if (id !== undefined && this.isRemoved(contextName, resourceName, id)) {
                                continue;
                            }
                            if (emit(item)) {
                                yield yield __await(id === undefined ? item : this.applyModifications(contextName, resourceName, id, item));
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_f && !_a && (_b = _g.return)) yield __await(_b.call(_g));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                catch (error) {
                    this.rethrowUnlessNetworkError(error);
                }
            }
            for (const op of this.state.pending) {
                if (op.type === 'create' && this.sameResource(op, contextName, resourceName)) {
                    if (emit(op.data)) {
                        yield yield __await(structuredClone(op.data));
                    }
                }
            }
        });
    }
    /**
     * Sends all queued operations to the inner transport layer, in order.
     * Stops when the connection is lost; operations rejected by the server are moved to failedOperations().
     */
    sync() {
        if (!this.syncing) {
            this.syncing = this.doSync().finally(() => { this.syncing = null; });
        }
        return this.syncing;
    }
    doSync() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.state.pending.length > 0 && this.isOnlineFn()) {
                const op = this.state.pending[0];
                try {
                    yield this.send(op);
                }
                catch (error) {
                    if (this.isNetworkError(error)) {
                        return;
                    }
                    this.state.failed.push({ operation: op, error: error instanceof Error ? error.message : String(error) });
                }
                this.state.pending.shift();
                this.save();
            }
        });
    }
    send(op) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (op.type) {
                case 'create': {
                    const data = Object.assign({}, op.data);
                    if (op.temporary) {
                        delete data.id;
                    }
                    const result = yield this.inner.create(op.contextName, op.resourceName, data);
                    if (op.temporary && (result === null || result === void 0 ? void 0 : result.id) !== undefined && result.id !== null) {
                        this.state.idMap[this.key(op.contextName, op.resourceName, op.id)] = result.id;
                    }
                    break;
                }
                case 'modify':
                    yield this.inner.modify(op.contextName, op.resourceName, this.resolveId(op.contextName, op.resourceName, op.id), op.data);
                    break;
                case 'remove':
                    yield this.inner.remove(op.contextName, op.resourceName, this.resolveId(op.contextName, op.resourceName, op.id));
                    break;
            }
        });
    }
    canTryOnline() {
        return this.isOnlineFn();
    }
    rethrowUnlessNetworkError(error) {
        if (!this.isNetworkError(error)) {
            throw error;
        }
    }
    isNetworkError(error) {
        return error instanceof TypeError || !this.isOnlineFn();
    }
    sameResource(op, contextName, resourceName) {
        return op.contextName === contextName && op.resourceName === resourceName;
    }
    key(contextName, resourceName, id) {
        return JSON.stringify([contextName, resourceName, id]);
    }
    resolveId(contextName, resourceName, id) {
        var _a;
        return (_a = this.state.idMap[this.key(contextName, resourceName, id)]) !== null && _a !== void 0 ? _a : id;
    }
    findPendingCreate(contextName, resourceName, id) {
        return this.state.pending.find((op) => op.type === 'create' && this.sameResource(op, contextName, resourceName) && op.id === id);
    }
    hasPendingFor(contextName, resourceName, id) {
        return this.state.pending.some((op) => this.sameResource(op, contextName, resourceName) && op.id === id);
    }
    isRemoved(contextName, resourceName, id) {
        return this.state.pending.some((op) => op.type === 'remove' && this.sameResource(op, contextName, resourceName) && op.id === id);
    }
    applyModifications(contextName, resourceName, id, item) {
        for (const op of this.state.pending) {
            if (op.type === 'modify' && this.sameResource(op, contextName, resourceName) && op.id === id) {
                item = Object.assign(Object.assign({}, item), structuredClone(op.data));
            }
        }
        return item;
    }
    uuid() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
    load() {
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
        }
        catch (_a) {
            this.state = { pending: [], failed: [], idMap: {} };
        }
    }
    save() {
        if (this.state.pending.length === 0 && this.state.failed.length === 0 && Object.keys(this.state.idMap).length === 0) {
            this.storage.removeItem(this.storageKey);
            return;
        }
        this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    }
}
