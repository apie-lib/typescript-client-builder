var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const body = `
    return function ${functionName}(...args) {
      return func.apply(this, args);
    }
  `;
    try {
        return new Function('func', body)(functionBody);
    }
    catch (err) {
        // happens on CSP unsafe-eval missing.
        return functionBody;
    }
}
export function createBoundedContext(contextName, transportLayer) {
    const metadata = new WeakMap();
    const retrievalData = new Map();
    const entityNameMap = new Map();
    const entityFormMap = new Map();
    function remember(entityName, rawData) {
        if (!retrievalData.has(entityName)) {
            retrievalData.set(entityName, new Map());
        }
        retrievalData.get(entityName).set(rawData.id, structuredClone(rawData));
    }
    function toBoundedContext() {
        const context = {
            name: contextName,
            entities: {},
            persist: function (entity) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    const state = metadata.get(entity);
                    if (!state) {
                        throw new Error('Unknown entity');
                    }
                    const isNew = ['Draft', 'Creating'].includes(state.state);
                    if (['Deleting', 'Deleted'].includes(state.state)) {
                        throw new Error('I can not persist a deleted entity');
                    }
                    state.state = isNew ? 'Creating' : 'Updating';
                    metadata.set(entity, state);
                    const rawData = isNew
                        ? yield transportLayer.create(contextName, entity.constructor.name, (_a = state.data) !== null && _a !== void 0 ? _a : {})
                        : yield transportLayer.modify(contextName, entity.constructor.name, entity.id, (_b = state.data) !== null && _b !== void 0 ? _b : {});
                    state.state = toPersistedState(state.state);
                    state.data = rawData;
                    if (rawData && rawData.id !== undefined && rawData.id !== null) {
                        state.id = rawData.id;
                        remember(entity.constructor.name, rawData);
                    }
                    metadata.set(entity, state);
                    return entity;
                });
            },
            find: function (entityName, id) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const constructor = entityNameMap.get(entityName);
                    if (!constructor) {
                        throw new Error(entityName + ' is not defined!');
                    }
                    const rawData = yield transportLayer.get(contextName, entityName, id);
                    const entity = new constructor(null);
                    const state = metadata.get(entity);
                    state.id = (_a = rawData === null || rawData === void 0 ? void 0 : rawData.id) !== null && _a !== void 0 ? _a : id;
                    state.state = 'Persisted';
                    state.data = rawData;
                    metadata.set(entity, state);
                    remember(entityName, Object.assign(Object.assign({}, rawData), { id: state.id }));
                    return entity;
                });
            },
            delete: function (entity) {
                return __awaiter(this, void 0, void 0, function* () {
                    const state = metadata.get(entity);
                    if (!state) {
                        throw new Error('Unknown entity');
                    }
                    if (['Deleting', 'Deleted', 'Draft', 'Creating', 'Creating+', 'Updating', 'Updating+'].includes(state.state)) {
                        throw new Error('I can not delete an entity in state ' + state.state);
                    }
                    state.state = 'Deleting';
                    metadata.set(entity, state);
                    yield transportLayer.remove(contextName, entity.constructor.name, entity.id);
                    state.state = toDeletedState(state.state);
                    metadata.set(entity, state);
                    return Promise.resolve(entity);
                });
            }
        };
        for (let [entityName, entity] of entityNameMap.entries()) {
            context.entities[entityName] = entity;
        }
        return context;
    }
    function createEntity(entityName) {
        if (entityNameMap.has(entityName)) {
            throw new Error(entityName + ' is already defined!');
        }
        const constructor = createNamedFunction(entityName, function (creationData) {
            metadata.set(this, { id: null, state: 'Draft', data: creationData !== null && creationData !== void 0 ? creationData : {} });
        });
        const formConstructor = createNamedFunction(entityName, function (id) {
            var _a, _b;
            metadata.set(this, { id, state: 'Updating', data: structuredClone((_b = (_a = retrievalData.get(entityName)) === null || _a === void 0 ? void 0 : _a.get(id)) !== null && _b !== void 0 ? _b : {}) });
        });
        entityNameMap.set(entityName, constructor);
        entityFormMap.set(entityName, formConstructor);
        Object.defineProperty(constructor.prototype, 'id', {
            enumerable: false,
            configurable: true,
            get: function () {
                var _a, _b;
                return (_b = (_a = metadata.get(this)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
            }
        });
        Object.defineProperty(formConstructor.prototype, 'id', {
            enumerable: false,
            configurable: true,
            get: function () {
                var _a, _b;
                return (_b = (_a = metadata.get(this)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
            }
        });
        constructor.prototype.createForm = function () {
            return new formConstructor(this.id);
        };
        return constructor;
    }
    function createProperty(entityName, propertyName, writableOnCreation, writableOnModification, readable) {
        const constructor = entityNameMap.get(entityName);
        if (!constructor) {
            throw new Error(entityName + ' is not defined!');
        }
        const formConstructor = entityFormMap.get(entityName);
        if (!formConstructor) {
            throw new Error(entityName + ' is not defined!');
        }
        if (readable || writableOnCreation) {
            Object.defineProperty(constructor.prototype, propertyName, {
                enumerable: readable,
                configurable: false,
                get: readable ? function () {
                    var _a, _b;
                    const state = metadata.get(this);
                    if (state && ['Draft', 'Creating'].includes(state.state)) {
                        return state.data ? state.data[propertyName] : undefined;
                    }
                    const id = state === null || state === void 0 ? void 0 : state.id;
                    return id === null || id === undefined ? undefined : (_b = (_a = retrievalData.get(entityName)) === null || _a === void 0 ? void 0 : _a.get(id)) === null || _b === void 0 ? void 0 : _b[propertyName];
                } : function () {
                    throw new Error(propertyName + ' is not readable');
                },
                set: writableOnCreation
                    ? function (v) {
                        const state = metadata.get(this);
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
            set: function (v) {
                const state = metadata.get(this);
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
                const state = metadata.get(this);
                if (!state) {
                    throw new Error('Unknown entity form');
                }
                return state.data ? state.data[propertyName] : undefined;
            }
        });
    }
    return {
        name: contextName,
        createEntity,
        createProperty,
        toBoundedContext,
    };
}
