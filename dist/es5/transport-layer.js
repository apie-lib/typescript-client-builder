import { __assign, __asyncGenerator, __asyncValues, __await, __awaiter, __generator, __read, __values } from "tslib";
var InMemoryTransportLayer = /** @class */ (function () {
    function InMemoryTransportLayer() {
        this.context = new Map();
        this.counters = new Map();
    }
    InMemoryTransportLayer.prototype.create = function (contextName, resourceName, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var contextMap, resourceMap, counterMap, counter;
            var _a;
            return __generator(this, function (_b) {
                if (!this.context.has(contextName)) {
                    this.context.set(contextName, new Map());
                }
                contextMap = this.context.get(contextName);
                if (!contextMap.has(resourceName)) {
                    contextMap.set(resourceName, new Map());
                }
                resourceMap = contextMap.get(resourceName);
                if (!rawData.id) {
                    if (!this.counters.has(contextName)) {
                        this.counters.set(contextName, new Map());
                    }
                    counterMap = this.counters.get(contextName);
                    counter = 1 + ((_a = counterMap.get(resourceName)) !== null && _a !== void 0 ? _a : 0);
                    counterMap.set(resourceName, counter);
                    rawData.id = counter;
                }
                resourceMap.set(rawData.id, rawData);
                return [2 /*return*/, rawData];
            });
        });
    };
    InMemoryTransportLayer.prototype.modify = function (contextName, resourceName, id, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var contextMap, resourceMap, originalData;
            return __generator(this, function (_a) {
                if (!this.context.has(contextName)) {
                    throw new Error("Context ".concat(contextName, " does not exist"));
                }
                contextMap = this.context.get(contextName);
                if (!contextMap.has(resourceName)) {
                    throw new Error("Resource ".concat(resourceName, " does not exist"));
                }
                resourceMap = contextMap.get(resourceName);
                originalData = resourceMap.get(id);
                if (!originalData) {
                    throw new Error("Resource with id ".concat(id, " does not exist"));
                }
                Object.assign(originalData, rawData);
                resourceMap.set(id, originalData);
                return [2 /*return*/, originalData];
            });
        });
    };
    InMemoryTransportLayer.prototype.remove = function (contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var contextMap, resourceMap;
            return __generator(this, function (_a) {
                contextMap = this.context.get(contextName);
                resourceMap = contextMap === null || contextMap === void 0 ? void 0 : contextMap.get(resourceName);
                resourceMap === null || resourceMap === void 0 ? void 0 : resourceMap.delete(id);
                return [2 /*return*/];
            });
        });
    };
    InMemoryTransportLayer.prototype.get = function (contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var contextMap, resourceMap, item;
            return __generator(this, function (_a) {
                contextMap = this.context.get(contextName);
                if (!contextMap) {
                    throw new Error("Context ".concat(contextName, " does not exist"));
                }
                resourceMap = contextMap.get(resourceName);
                if (!resourceMap) {
                    throw new Error("Resource ".concat(resourceName, " does not exist"));
                }
                item = resourceMap.get(id);
                if (!item) {
                    throw new Error("Resource with id ".concat(id, " does not exist"));
                }
                return [2 /*return*/, structuredClone(item)];
            });
        });
    };
    InMemoryTransportLayer.prototype.list = function (contextName, resourceName, options) {
        return __asyncGenerator(this, arguments, function list_1() {
            var contextMap, resourceMap, allItems, offset, limit, i;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        contextMap = this.context.get(contextName);
                        if (!contextMap) {
                            throw new Error("Context ".concat(contextName, " does not exist"));
                        }
                        resourceMap = contextMap.get(resourceName);
                        if (!resourceMap) {
                            throw new Error("Resource ".concat(resourceName, " does not exist"));
                        }
                        allItems = Array.from(resourceMap.values());
                        offset = (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : 0;
                        limit = (_b = options === null || options === void 0 ? void 0 : options.limit) !== null && _b !== void 0 ? _b : allItems.length;
                        i = offset;
                        _c.label = 1;
                    case 1:
                        if (!(i < Math.min(offset + limit, allItems.length))) return [3 /*break*/, 5];
                        return [4 /*yield*/, __await(structuredClone(allItems[i]))];
                    case 2: return [4 /*yield*/, _c.sent()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return InMemoryTransportLayer;
}());
export { InMemoryTransportLayer };
var FetchTransportLayer = /** @class */ (function () {
    function FetchTransportLayer(baseUrl) {
        this.baseUrl = baseUrl;
    }
    FetchTransportLayer.prototype.buildUrl = function (contextName, resourceName, id, queryParams) {
        var e_1, _a;
        var url = "".concat(this.baseUrl, "/").concat(contextName, "/").concat(resourceName);
        if (id !== undefined) {
            url += "/".concat(id);
        }
        if (queryParams) {
            var params = new URLSearchParams();
            try {
                for (var _b = __values(Object.entries(queryParams)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    if (value !== undefined) {
                        params.append(key, String(value));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var qs = params.toString();
            if (qs)
                url += "?".concat(qs);
        }
        return url;
    };
    FetchTransportLayer.prototype.create = function (contextName, resourceName, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var hasId, url, method, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hasId = rawData.id !== undefined && rawData.id !== null;
                        url = hasId
                            ? this.buildUrl(contextName, resourceName, rawData.id)
                            : this.buildUrl(contextName, resourceName);
                        method = hasId ? 'PUT' : 'POST';
                        return [4 /*yield*/, fetch(url, {
                                method: method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(rawData),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to create resource: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    FetchTransportLayer.prototype.modify = function (contextName, resourceName, id, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildUrl(contextName, resourceName, id);
                        return [4 /*yield*/, fetch(url, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(rawData),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to modify resource: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    FetchTransportLayer.prototype.remove = function (contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildUrl(contextName, resourceName, id);
                        return [4 /*yield*/, fetch(url, {
                                method: 'DELETE',
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to remove resource: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FetchTransportLayer.prototype.get = function (contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildUrl(contextName, resourceName, id);
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to get resource: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    FetchTransportLayer.prototype.list = function (contextName, resourceName, options) {
        return __asyncGenerator(this, arguments, function list_2() {
            var url, response, data, items, items_1, items_1_1, item, e_2_1;
            var e_2, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = this.buildUrl(contextName, resourceName, undefined, {
                            limit: options === null || options === void 0 ? void 0 : options.limit,
                            offset: options === null || options === void 0 ? void 0 : options.offset,
                        });
                        _c.label = 1;
                    case 1:
                        if (!url) return [3 /*break*/, 13];
                        return [4 /*yield*/, __await(fetch(url))];
                    case 2:
                        response = _c.sent();
                        if (!response.ok) {
                            throw new Error("Failed to list resources: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, __await(response.json())];
                    case 3:
                        data = _c.sent();
                        items = (_b = data.list) !== null && _b !== void 0 ? _b : [];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 10, 11, 12]);
                        items_1 = (e_2 = void 0, __values(items)), items_1_1 = items_1.next();
                        _c.label = 5;
                    case 5:
                        if (!!items_1_1.done) return [3 /*break*/, 9];
                        item = items_1_1.value;
                        return [4 /*yield*/, __await(item)];
                    case 6: return [4 /*yield*/, _c.sent()];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        items_1_1 = items_1.next();
                        return [3 /*break*/, 5];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_2_1 = _c.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 12:
                        // If the API returns a relative `next` link
                        url = data.next ? "".concat(this.baseUrl).concat(data.next) : '';
                        return [3 /*break*/, 1];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return FetchTransportLayer;
}());
export { FetchTransportLayer };
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage() {
        this.data = new Map();
    }
    MemoryStorage.prototype.getItem = function (key) { var _a; return (_a = this.data.get(key)) !== null && _a !== void 0 ? _a : null; };
    MemoryStorage.prototype.setItem = function (key, value) { this.data.set(key, value); };
    MemoryStorage.prototype.removeItem = function (key) { this.data.delete(key); };
    return MemoryStorage;
}());
/**
 * Wraps another transport layer. While the browser is offline (or the inner transport cannot be reached)
 * changes are stored in a persistent queue so they survive a page refresh and are sent
 * to the inner transport layer once the connection is back.
 */
var OfflineTransportLayer = /** @class */ (function () {
    function OfflineTransportLayer(inner, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        var _a, _b, _c, _d;
        this.inner = inner;
        this.state = { pending: [], failed: [], idMap: {} };
        this.syncing = null;
        this.onOnline = function () { void _this.sync(); };
        this.storage = (_a = options.storage) !== null && _a !== void 0 ? _a : (typeof localStorage !== 'undefined' ? localStorage : new MemoryStorage());
        this.storageKey = (_b = options.storageKey) !== null && _b !== void 0 ? _b : 'apie-offline-queue';
        this.isOnlineFn = (_c = options.isOnline) !== null && _c !== void 0 ? _c : (function () { return typeof navigator === 'undefined' || navigator.onLine !== false; });
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
    OfflineTransportLayer.prototype.dispose = function () {
        if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
            window.removeEventListener('online', this.onOnline);
        }
    };
    /** Number of operations waiting to be sent. */
    OfflineTransportLayer.prototype.pendingCount = function () {
        return this.state.pending.length;
    };
    /** Operations that were rejected by the server when synchronizing. */
    OfflineTransportLayer.prototype.failedOperations = function () {
        return structuredClone(this.state.failed);
    };
    OfflineTransportLayer.prototype.clearFailedOperations = function () {
        this.state.failed = [];
        this.save();
    };
    OfflineTransportLayer.prototype.create = function (contextName, resourceName, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, hasId, id, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.canTryOnline()) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.inner.create(contextName, resourceName, rawData)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        this.rethrowUnlessNetworkError(error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        hasId = rawData.id !== undefined && rawData.id !== null;
                        id = hasId ? rawData.id : "offline-".concat(this.uuid());
                        data = __assign(__assign({}, structuredClone(rawData)), { id: id });
                        this.state.pending.push({ type: 'create', contextName: contextName, resourceName: resourceName, id: id, temporary: !hasId, data: data });
                        this.save();
                        return [2 /*return*/, structuredClone(data)];
                }
            });
        });
    };
    OfflineTransportLayer.prototype.modify = function (contextName, resourceName, id, rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var pendingCreate, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingCreate = this.findPendingCreate(contextName, resourceName, id);
                        if (pendingCreate) {
                            Object.assign(pendingCreate.data, structuredClone(rawData), { id: pendingCreate.id });
                            this.save();
                            return [2 /*return*/, structuredClone(pendingCreate.data)];
                        }
                        if (!(this.canTryOnline() && !this.hasPendingFor(contextName, resourceName, id))) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.inner.modify(contextName, resourceName, this.resolveId(contextName, resourceName, id), rawData)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        this.rethrowUnlessNetworkError(error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        this.state.pending.push({ type: 'modify', contextName: contextName, resourceName: resourceName, id: id, data: structuredClone(rawData) });
                        this.save();
                        return [2 /*return*/, __assign(__assign({}, structuredClone(rawData)), { id: id })];
                }
            });
        });
    };
    OfflineTransportLayer.prototype.remove = function (contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var index, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = this.state.pending.findIndex(function (op) { return op.type === 'create' && _this.sameResource(op, contextName, resourceName) && op.id === id; });
                        if (index >= 0) {
                            // Never reached the server, so just forget about it (including queued changes to it).
                            this.state.pending = this.state.pending.filter(function (op) { return !(_this.sameResource(op, contextName, resourceName) && op.id === id); });
                            this.save();
                            return [2 /*return*/];
                        }
                        if (!(this.canTryOnline() && !this.hasPendingFor(contextName, resourceName, id))) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.inner.remove(contextName, resourceName, this.resolveId(contextName, resourceName, id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        error_3 = _a.sent();
                        this.rethrowUnlessNetworkError(error_3);
                        return [3 /*break*/, 4];
                    case 4:
                        this.state.pending = this.state.pending.filter(function (op) { return !(op.type === 'modify' && _this.sameResource(op, contextName, resourceName) && op.id === id); });
                        this.state.pending.push({ type: 'remove', contextName: contextName, resourceName: resourceName, id: id });
                        this.save();
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineTransportLayer.prototype.get = function (contextName, resourceName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var pendingCreate, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingCreate = this.findPendingCreate(contextName, resourceName, id);
                        if (pendingCreate) {
                            return [2 /*return*/, structuredClone(pendingCreate.data)];
                        }
                        if (this.isRemoved(contextName, resourceName, id)) {
                            throw new Error("Resource with id ".concat(id, " does not exist"));
                        }
                        return [4 /*yield*/, this.inner.get(contextName, resourceName, this.resolveId(contextName, resourceName, id))];
                    case 1:
                        item = _a.sent();
                        return [2 /*return*/, this.applyModifications(contextName, resourceName, id, item)];
                }
            });
        });
    };
    OfflineTransportLayer.prototype.list = function (contextName, resourceName, options) {
        return __asyncGenerator(this, arguments, function list_3() {
            var offset, limit, index, yielded, emit, _a, _b, _c, item, id, e_3_1, error_4, _d, _e, op, e_4_1;
            var e_4, _f;
            var _g, e_3, _h, _j;
            var _k, _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        offset = (_k = options === null || options === void 0 ? void 0 : options.offset) !== null && _k !== void 0 ? _k : 0;
                        limit = (_l = options === null || options === void 0 ? void 0 : options.limit) !== null && _l !== void 0 ? _l : Infinity;
                        index = 0;
                        yielded = 0;
                        emit = function (item) {
                            var current = index++;
                            return current >= offset && yielded < limit && ++yielded > 0;
                        };
                        if (!this.canTryOnline()) return [3 /*break*/, 17];
                        _m.label = 1;
                    case 1:
                        _m.trys.push([1, 16, , 17]);
                        _m.label = 2;
                    case 2:
                        _m.trys.push([2, 9, 10, 15]);
                        _a = true, _b = __asyncValues(this.inner.list(contextName, resourceName));
                        _m.label = 3;
                    case 3: return [4 /*yield*/, __await(_b.next())];
                    case 4:
                        if (!(_c = _m.sent(), _g = _c.done, !_g)) return [3 /*break*/, 8];
                        _j = _c.value;
                        _a = false;
                        item = _j;
                        id = item.id;
                        if (id !== undefined && this.isRemoved(contextName, resourceName, id)) {
                            return [3 /*break*/, 7];
                        }
                        if (!emit(item)) return [3 /*break*/, 7];
                        return [4 /*yield*/, __await(id === undefined ? item : this.applyModifications(contextName, resourceName, id, item))];
                    case 5: return [4 /*yield*/, _m.sent()];
                    case 6:
                        _m.sent();
                        _m.label = 7;
                    case 7:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        e_3_1 = _m.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 15];
                    case 10:
                        _m.trys.push([10, , 13, 14]);
                        if (!(!_a && !_g && (_h = _b.return))) return [3 /*break*/, 12];
                        return [4 /*yield*/, __await(_h.call(_b))];
                    case 11:
                        _m.sent();
                        _m.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        if (e_3) throw e_3.error;
                        return [7 /*endfinally*/];
                    case 14: return [7 /*endfinally*/];
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        error_4 = _m.sent();
                        this.rethrowUnlessNetworkError(error_4);
                        return [3 /*break*/, 17];
                    case 17:
                        _m.trys.push([17, 23, 24, 25]);
                        _d = __values(this.state.pending), _e = _d.next();
                        _m.label = 18;
                    case 18:
                        if (!!_e.done) return [3 /*break*/, 22];
                        op = _e.value;
                        if (!(op.type === 'create' && this.sameResource(op, contextName, resourceName))) return [3 /*break*/, 21];
                        if (!emit(op.data)) return [3 /*break*/, 21];
                        return [4 /*yield*/, __await(structuredClone(op.data))];
                    case 19: return [4 /*yield*/, _m.sent()];
                    case 20:
                        _m.sent();
                        _m.label = 21;
                    case 21:
                        _e = _d.next();
                        return [3 /*break*/, 18];
                    case 22: return [3 /*break*/, 25];
                    case 23:
                        e_4_1 = _m.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 25];
                    case 24:
                        try {
                            if (_e && !_e.done && (_f = _d.return)) _f.call(_d);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends all queued operations to the inner transport layer, in order.
     * Stops when the connection is lost; operations rejected by the server are moved to failedOperations().
     */
    OfflineTransportLayer.prototype.sync = function () {
        var _this = this;
        if (!this.syncing) {
            this.syncing = this.doSync().finally(function () { _this.syncing = null; });
        }
        return this.syncing;
    };
    OfflineTransportLayer.prototype.doSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var op, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.state.pending.length > 0 && this.isOnlineFn())) return [3 /*break*/, 5];
                        op = this.state.pending[0];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(op)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        if (this.isNetworkError(error_5)) {
                            return [2 /*return*/];
                        }
                        this.state.failed.push({ operation: op, error: error_5 instanceof Error ? error_5.message : String(error_5) });
                        return [3 /*break*/, 4];
                    case 4:
                        this.state.pending.shift();
                        this.save();
                        return [3 /*break*/, 0];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OfflineTransportLayer.prototype.send = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = op.type;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 1];
                            case 'modify': return [3 /*break*/, 3];
                            case 'remove': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        data = __assign({}, op.data);
                        if (op.temporary) {
                            delete data.id;
                        }
                        return [4 /*yield*/, this.inner.create(op.contextName, op.resourceName, data)];
                    case 2:
                        result = _b.sent();
                        if (op.temporary && (result === null || result === void 0 ? void 0 : result.id) !== undefined && result.id !== null) {
                            this.state.idMap[this.key(op.contextName, op.resourceName, op.id)] = result.id;
                        }
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, this.inner.modify(op.contextName, op.resourceName, this.resolveId(op.contextName, op.resourceName, op.id), op.data)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.inner.remove(op.contextName, op.resourceName, this.resolveId(op.contextName, op.resourceName, op.id))];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OfflineTransportLayer.prototype.canTryOnline = function () {
        return this.isOnlineFn();
    };
    OfflineTransportLayer.prototype.rethrowUnlessNetworkError = function (error) {
        if (!this.isNetworkError(error)) {
            throw error;
        }
    };
    OfflineTransportLayer.prototype.isNetworkError = function (error) {
        return error instanceof TypeError || !this.isOnlineFn();
    };
    OfflineTransportLayer.prototype.sameResource = function (op, contextName, resourceName) {
        return op.contextName === contextName && op.resourceName === resourceName;
    };
    OfflineTransportLayer.prototype.key = function (contextName, resourceName, id) {
        return JSON.stringify([contextName, resourceName, id]);
    };
    OfflineTransportLayer.prototype.resolveId = function (contextName, resourceName, id) {
        var _a;
        return (_a = this.state.idMap[this.key(contextName, resourceName, id)]) !== null && _a !== void 0 ? _a : id;
    };
    OfflineTransportLayer.prototype.findPendingCreate = function (contextName, resourceName, id) {
        var _this = this;
        return this.state.pending.find(function (op) {
            return op.type === 'create' && _this.sameResource(op, contextName, resourceName) && op.id === id;
        });
    };
    OfflineTransportLayer.prototype.hasPendingFor = function (contextName, resourceName, id) {
        var _this = this;
        return this.state.pending.some(function (op) { return _this.sameResource(op, contextName, resourceName) && op.id === id; });
    };
    OfflineTransportLayer.prototype.isRemoved = function (contextName, resourceName, id) {
        var _this = this;
        return this.state.pending.some(function (op) { return op.type === 'remove' && _this.sameResource(op, contextName, resourceName) && op.id === id; });
    };
    OfflineTransportLayer.prototype.applyModifications = function (contextName, resourceName, id, item) {
        var e_5, _a;
        try {
            for (var _b = __values(this.state.pending), _c = _b.next(); !_c.done; _c = _b.next()) {
                var op = _c.value;
                if (op.type === 'modify' && this.sameResource(op, contextName, resourceName) && op.id === id) {
                    item = __assign(__assign({}, item), structuredClone(op.data));
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return item;
    };
    OfflineTransportLayer.prototype.uuid = function () {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return "".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2));
    };
    OfflineTransportLayer.prototype.load = function () {
        try {
            var raw = this.storage.getItem(this.storageKey);
            if (raw) {
                var parsed = JSON.parse(raw);
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
    };
    OfflineTransportLayer.prototype.save = function () {
        if (this.state.pending.length === 0 && this.state.failed.length === 0 && Object.keys(this.state.idMap).length === 0) {
            this.storage.removeItem(this.storageKey);
            return;
        }
        this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    };
    return OfflineTransportLayer;
}());
export { OfflineTransportLayer };
