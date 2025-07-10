import { TransportLayer } from "./transport-layer";

/**
 * - Draft: new object is created
 * - Creating: new object is being persisted
 * - Creating+: new object is being persisted, new changes are added
 * - Persisted: object is persisted
 * - Pending: object is persisted and has changes
 * - Updating: object is being updated 
 * - Updating: object is being updated, new changes are added
 * - Unverified: Object comes from ajax action, but is not confirmed to exist server-side
 * - Deleting: object is being deleted
 * - Deleted: object is deleted
 */
type EntityState = 'Draft'|'Creating'|'Creating+'|'Persisted'|'Pending'|'Updating+'|'Updating'|'Unverified'|'Deleting'|'Deleted';
interface Entity {
    get id(): string|number;
}

type EntityConstructor = {
  new (initialData: Record<string|number, any>|null): Entity;
};

interface BaseBoundedContext {
    readonly name: string;
}

export interface BoundedContext extends BaseBoundedContext {
    entities: Record<string, EntityConstructor>;
    persist: (entity: Entity) => Promise<Entity>;
    delete: (entity: Entity) => Promise<Entity>;
}

export interface BoundedContextDefinition extends BaseBoundedContext {
    createEntity: (entityName: string) => Function;
    createProperty: (entityName: string, propertyName: string, writableOnCreation: boolean, writableOnModification: boolean, readable: boolean) => void;
    toBoundedContext: () => BoundedContext
}

interface EntityInstanceMetadata {
    state: EntityState;
    creationData: Record<string|number, any>|null;
    modificationData: Record<string|number, any>|null;
    retrievalData: Record<string|number, any>|null;
}

function toPersistedState(state: EntityState): EntityState {
    switch(state) {
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

function toModifiedState(state: EntityState): EntityState {
    switch(state) {
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

function toDeletedState(state: EntityState): EntityState {
    switch(state) {
        case 'Deleting':
        case 'Deleted':
            return 'Deleted';
        default:
            throw new Error('Entity in state "' + state + '" can not be deleted');;
    }
}

function createNamedFunction(functionName: string, functionBody: Function) {
  const body = `
    return function ${functionName}(...args) {
      return func.apply(this, args);
    }
  `;
  try {
    return new Function('func', body)(functionBody);
  } catch (err) {
    // happens on CSP unsafe-eval missing.
    return functionBody;
  }
}

export function createBoundedContext(contextName: string, transportLayer: TransportLayer): BoundedContextDefinition
{
    const metadata: WeakMap<any, EntityInstanceMetadata> = new WeakMap();
    const entityMap: Map<string, EntityConstructor> = new Map();

    function createProperty(entityName: string, propertyName: string, writableOnCreation: boolean, writableOnModification: boolean, readable: boolean) {
        const constructor = entityMap.get(entityName);
        if (!constructor) {
            throw new Error(entityName + ' is not defined!');
        }
        Object.defineProperty(
            constructor.prototype,
            propertyName,
            {
                enumerable: readable,
                configurable: false,
                writable: writableOnCreation||writableOnModification,
                set: function (this: Entity, v: any): void {
                    const state = metadata.get(this);
                    if (!state) {
                        throw new Error('Unknown entity');
                    }
                    if (['Draft', 'Creating'].includes(state.state)) {
                        if (!state.creationData) {
                            state.creationData = {};
                        }
                        state.creationData[propertyName] = v;
                    } else {
                        if (!state.modificationData) {
                            state.modificationData = {};
                        }
                        state.modificationData[propertyName] = v;
                    }
                    state.state = toModifiedState(state.state);
                    metadata.set(this, state);
                },
                get: readable
                    ? function (this: Entity): any {
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
                    } : function (): any {
                        throw new Error(propertyName + ' is not readable');
                    }
            }
        )
    }

    function createEntity(entityName: string) {
        if (entityMap.has(entityName)) {
            throw new Error(entityName + ' is already defined!');
        }
        const constructor = createNamedFunction(
            entityName,
            function (this: Entity, creationData: Record<string|number, any>|null) {
                metadata.set(this, { state: 'Draft', creationData: creationData ?? {}, modificationData: null, retrievalData: null });
            }
        );
        entityMap.set(entityName, constructor);
        return constructor;
    }

    function toBoundedContext(): BoundedContext {
        const context: BoundedContext = {
            name: contextName,
            entities: {},
            persist: async function (entity: Entity): Promise<Entity> {
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
                    ? await transportLayer.create(contextName, entity.constructor.name, state.creationData ?? {})
                    : await transportLayer.modify(contextName, entity.constructor.name, entity.id, state.modificationData ?? {});
                state.state = toPersistedState(state.state);
                state.retrievalData = rawData;
                metadata.set(entity, state);

                return entity;
            },
            delete: async function (entity: Entity): Promise<Entity> {
                const state = metadata.get(entity);
                if (!state) {
                    throw new Error('Unknown entity');
                }
                if (['Deleting', 'Deleted', 'Draft', 'Creating', 'Creating+', 'Updating', 'Updating+'].includes(state.state)) {
                    throw new Error('I can not delete an entity in state ' + state.state);
                }
                state.state = 'Deleting';
                metadata.set(entity, state);
                await transportLayer.remove(contextName, entity.constructor.name, entity.id);
                state.state = toDeletedState(state.state);
                metadata.set(entity, state);

                return Promise.resolve(entity);
            }
        }
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
