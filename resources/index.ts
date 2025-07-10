import { BoundedContextDefinition, createBoundedContext, type BoundedContext } from "./build-script";
import { FetchTransportLayer, InMemoryTransportLayer } from "./transport-layer";

interface CreateEntityDefinition {
    type: 'createEntity',
    name: string
}

interface CreatePropertyDefinition {
    type: 'createProperty',
    entityName: string,
    propertyName: string,
    writableOnCreation: boolean,
    writableOnModification: boolean,
    readable: boolean;
}

type ResourceDefinition = CreateEntityDefinition|CreatePropertyDefinition;

type ResourceDefinitionList = Array<ResourceDefinition>

interface ResourcesDefinition {
    [name: string]: ResourceDefinitionList;
}

function applyDefinition(context: BoundedContextDefinition, definition: ResourceDefinition): void {
    switch (definition.type) {
        case 'createEntity':
            context.createEntity(definition.name);
            break;
        case 'createProperty':
            context.createProperty(
                definition.entityName,
                definition.propertyName,
                definition.writableOnCreation,
                definition.writableOnModification,
                definition.readable
            );
            break;
    }
}

export function createForApi(apiUrl: string, definition: ResourcesDefinition): Record<string, BoundedContext> {
    const transportLayer = new FetchTransportLayer(apiUrl);
    const result: Record<string, BoundedContext> = {};
    for (let [key, data] of Object.entries(definition)) {
        const definition =  createBoundedContext(
            key,
            transportLayer
        );
        for (let methodDefinition of data) {
            applyDefinition(definition, methodDefinition);
        }

        result[key] = definition.toBoundedContext()
    }
    return result;
}

export function createForTest(definition: ResourcesDefinition): Record<string, BoundedContext> {
    const transportLayer = new InMemoryTransportLayer();
    const result: Record<string, BoundedContext> = {};
    for (let [key, data] of Object.entries(definition)) {
        const definition =  createBoundedContext(
            key,
            transportLayer
        );
        for (let methodDefinition of data) {
            applyDefinition(definition, methodDefinition);
        }

        result[key] = definition.toBoundedContext()
    }
    return result;
}