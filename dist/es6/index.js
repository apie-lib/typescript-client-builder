import { createBoundedContext } from "./build-script";
import { FetchTransportLayer, InMemoryTransportLayer } from "./transport-layer";
function applyDefinition(context, definition) {
    switch (definition.type) {
        case 'createEntity':
            context.createEntity(definition.name);
            break;
        case 'createProperty':
            context.createProperty(definition.entityName, definition.propertyName, definition.writableOnCreation, definition.writableOnModification, definition.readable);
            break;
    }
}
export function createForApi(apiUrl, definition) {
    const transportLayer = new FetchTransportLayer(apiUrl);
    const result = {};
    for (let [key, data] of Object.entries(definition)) {
        const definition = createBoundedContext(key, transportLayer);
        for (let methodDefinition of data) {
            applyDefinition(definition, methodDefinition);
        }
        result[key] = definition.toBoundedContext();
    }
    return result;
}
export function createForTest(definition) {
    const transportLayer = new InMemoryTransportLayer();
    const result = {};
    for (let [key, data] of Object.entries(definition)) {
        const definition = createBoundedContext(key, transportLayer);
        for (let methodDefinition of data) {
            applyDefinition(definition, methodDefinition);
        }
        result[key] = definition.toBoundedContext();
    }
    return result;
}
