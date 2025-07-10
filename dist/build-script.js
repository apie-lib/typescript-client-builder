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
    const entityMap = new Map();
    function createProperty(entityName, propertyName, writableOnCreation, writableOnModification, readable) {
        const constructor = entityMap.get(entityName);
        if (!constructor) {
            throw new Error(entityName + ' is not defined!');
        }
        Object.defineProperty(constructor.prototype, propertyName, {
            enumerable: readable,
            configurable: false,
            writable: writableOnCreation || writableOnModification,
            set: function (v) {
                const state = metadata.get(this);
                if (!state) {
                    throw new Error('Unknown entity');
                }
                if (['Draft', 'Creating'].includes(state.state)) {
                    if (!state.creationData) {
                        state.creationData = {};
                    }
                    state.creationData[propertyName] = v;
                }
                else {
                    if (!state.modificationData) {
                        state.modificationData = {};
                    }
                    state.modificationData[propertyName] = v;
                }
                state.state = toModifiedState(state.state);
                metadata.set(this, state);
            },
            get: readable
                ? function () {
                    const state = metadata.get(this);
                    if (!state) {
                        throw new Error('Unknown entity');
                    }
                    if (['Draft', 'Creating'].includes(state.state)) {
                        return state.creationData ? state.creationData[propertyName] : undefined;
                    }
                    const mData = state.modificationData ? state.modificationData[propertyName] : undefined;
                    if (mData === undefined) {
                        return state.retrievalData ? state.retrievalData[propertyName] : undefined;
                    }
                    return mData;
                } : function () {
                throw new Error(propertyName + ' is not readable');
            }
        });
    }
    function createEntity(entityName) {
        if (entityMap.has(entityName)) {
            throw new Error(entityName + ' is already defined!');
        }
        const constructor = createNamedFunction(entityName, function (creationData) {
            metadata.set(this, { state: 'Draft', creationData: creationData !== null && creationData !== void 0 ? creationData : {}, modificationData: null, retrievalData: null });
        });
        entityMap.set(entityName, constructor);
        return constructor;
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
                        ? yield transportLayer.create(contextName, entity.constructor.name, (_a = state.creationData) !== null && _a !== void 0 ? _a : {})
                        : yield transportLayer.modify(contextName, entity.constructor.name, entity.id, (_b = state.modificationData) !== null && _b !== void 0 ? _b : {});
                    state.state = toPersistedState(state.state);
                    state.retrievalData = rawData;
                    metadata.set(entity, state);
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
        for (let [entityName, entity] of entityMap.entries()) {
            context.entities[entityName] = entity;
        }
        return context;
    }
    return {
        name: contextName,
        createEntity,
        createProperty,
        toBoundedContext,
    };
}
