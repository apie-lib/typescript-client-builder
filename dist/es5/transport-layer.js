import { __asyncGenerator, __await, __awaiter, __generator, __read, __values } from "tslib";
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
