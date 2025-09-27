import { __awaiter, __generator, __read, __values } from "tslib";
function toPersistedState(state) {
    switch (state) {
        case 'Deleting':
        case 'Deleted':
        case 'Draft':
        case 'Unverified':
            throw new Error('Entity is in state "' + state + '" which does not allow modification');
        case 'Creating':
        case 'Updating':
            return 'Persisted';
        case 'Creating+':
        case 'Updating+':
            return 'Pending';
        default:
            return state;
    }
}
function toModifiedState(state) {
    switch (state) {
        case 'Deleting':
        case 'Deleted':
            throw new Error('Entity is in state "' + state + '" which does not allow modification');
        case 'Creating':
            return 'Creating+';
        case 'Persisted':
        case 'Unverified':
            return 'Pending';
        case 'Updating':
            return 'Updating+';
        default:
            return state;
    }
}
function toDeletedState(state) {
    switch (state) {
        case 'Deleting':
        case 'Deleted':
            return 'Deleted';
        default:
            throw new Error('Entity in state "' + state + '" can not be deleted');
            ;
    }
}
function createNamedFunction(functionName, functionBody) {
    var body = "\n    return function ".concat(functionName, "(...args) {\n      return func.apply(this, args);\n    }\n  ");
    try {
        return new Function('func', body)(functionBody);
    }
    catch (err) {
        // happens on CSP unsafe-eval missing.
        return functionBody;
    }
}
export function createBoundedContext(contextName, transportLayer) {
    var metadata = new WeakMap();
    var retrievalData = new Map();
    var entityNameMap = new Map();
    var entityFormMap = new Map();
    function toBoundedContext() {
        var e_1, _a;
        var context = {
            name: contextName,
            entities: {},
            persist: function (entity) {
                return __awaiter(this, void 0, void 0, function () {
                    var state, isNew, rawData, _a;
                    var _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                state = metadata.get(entity);
                                if (!state) {
                                    throw new Error('Unknown entity');
                                }
                                isNew = ['Draft', 'Creating'].includes(state.state);
                                if (['Deleting', 'Deleted'].includes(state.state)) {
                                    throw new Error('I can not persist a deleted entity');
                                }
                                state.state = isNew ? 'Creating' : 'Updating';
                                metadata.set(entity, state);
                                if (!isNew) return [3 /*break*/, 2];
                                return [4 /*yield*/, transportLayer.create(contextName, entity.constructor.name, (_b = state.data) !== null && _b !== void 0 ? _b : {})];
                            case 1:
                                _a = _d.sent();
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, transportLayer.modify(contextName, entity.constructor.name, entity.id, (_c = state.data) !== null && _c !== void 0 ? _c : {})];
                            case 3:
                                _a = _d.sent();
                                _d.label = 4;
                            case 4:
                                rawData = _a;
                                state.state = toPersistedState(state.state);
                                state.data = rawData;
                                metadata.set(entity, state);
                                return [2 /*return*/, entity];
                        }
                    });
                });
            },
            delete: function (entity) {
                return __awaiter(this, void 0, void 0, function () {
                    var state;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                state = metadata.get(entity);
                                if (!state) {
                                    throw new Error('Unknown entity');
                                }
                                if (['Deleting', 'Deleted', 'Draft', 'Creating', 'Creating+', 'Updating', 'Updating+'].includes(state.state)) {
                                    throw new Error('I can not delete an entity in state ' + state.state);
                                }
                                state.state = 'Deleting';
                                metadata.set(entity, state);
                                return [4 /*yield*/, transportLayer.remove(contextName, entity.constructor.name, entity.id)];
                            case 1:
                                _a.sent();
                                state.state = toDeletedState(state.state);
                                metadata.set(entity, state);
                                return [2 /*return*/, Promise.resolve(entity)];
                        }
                    });
                });
            }
        };
        try {
            for (var _b = __values(entityNameMap.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), entityName = _d[0], entity = _d[1];
                context.entities[entityName] = entity;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return context;
    }
    function createEntity(entityName) {
        if (entityNameMap.has(entityName)) {
            throw new Error(entityName + ' is already defined!');
        }
        var constructor = createNamedFunction(entityName, function (creationData) {
            metadata.set(this, { id: null, state: 'Draft', data: creationData !== null && creationData !== void 0 ? creationData : {} });
        });
        var formConstructor = createNamedFunction(entityName, function (id) {
            var _a, _b;
            metadata.set(this, { id: id, state: 'Updating', data: (_b = (_a = retrievalData.get(entityName)) === null || _a === void 0 ? void 0 : _a.get(id)) !== null && _b !== void 0 ? _b : {} });
        });
        entityNameMap.set(entityName, constructor);
        entityFormMap.set(entityName, formConstructor);
        constructor.prototype.createForm = function () {
            return new formConstructor(this.id);
        };
        return constructor;
    }
    function createProperty(entityName, propertyName, writableOnCreation, writableOnModification, readable) {
        var constructor = entityNameMap.get(entityName);
        if (!constructor) {
            throw new Error(entityName + ' is not defined!');
        }
        var formConstructor = entityFormMap.get(entityName);
        if (!formConstructor) {
            throw new Error(entityName + ' is not defined!');
        }
        if (readable || writableOnCreation) {
            Object.defineProperty(constructor.prototype, propertyName, {
                enumerable: readable,
                configurable: false,
                get: readable ? function () {
                    var _a, _b;
                    var state = metadata.get(this);
                    if (state && ['Draft', 'Creating'].includes(state.state)) {
                        return state.data ? state.data[propertyName] : undefined;
                    }
                    return (_b = (_a = retrievalData.get(entityName)) === null || _a === void 0 ? void 0 : _a.get(this.id)) === null || _b === void 0 ? void 0 : _b[propertyName];
                } : function () {
                    throw new Error(propertyName + ' is not readable');
                },
                set: writableOnCreation
                    ? function (v) {
                        var state = metadata.get(this);
                        if (!state) {
                            throw new Error('Can not set property ' + propertyName + ' on already persisted entity. Use createForm() to modify an existing entity.');
                        }
                        if (['Draft', 'Creating'].includes(state.state)) {
                            if (!state.data) {
                                state.data = {};
                            }
                            state.data[propertyName] = v;
                        }
                        state.state = toModifiedState(state.state);
                        metadata.set(this, state);
                    }
                    : function () {
                        throw new Error(propertyName + ' is not writable on creation');
                    }
            });
        }
        Object.defineProperty(formConstructor.prototype, propertyName, {
            enumerable: readable,
            configurable: false,
            writable: writableOnCreation || writableOnModification,
            set: function (v) {
                var state = metadata.get(this);
                if (!state) {
                    throw new Error('Unknown entity form');
                }
                if (!state.data) {
                    state.data = {};
                }
                state.data[propertyName] = v;
                state.state = toModifiedState(state.state);
                metadata.set(this, state);
            },
            get: function () {
                var state = metadata.get(this);
                if (!state) {
                    throw new Error('Unknown entity form');
                }
                return state.data ? state.data[propertyName] : undefined;
            }
        });
    }
    return {
        name: contextName,
        createEntity: createEntity,
        createProperty: createProperty,
        toBoundedContext: toBoundedContext,
    };
}
