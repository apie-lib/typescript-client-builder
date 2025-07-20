import { __read, __values } from "tslib";
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
    var e_1, _a, e_2, _b;
    var transportLayer = new FetchTransportLayer(apiUrl);
    var result = {};
    try {
        for (var _c = __values(Object.entries(definition)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), key = _e[0], data = _e[1];
            var definition_1 = createBoundedContext(key, transportLayer);
            try {
                for (var data_1 = (e_2 = void 0, __values(data)), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                    var methodDefinition = data_1_1.value;
                    applyDefinition(definition_1, methodDefinition);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (data_1_1 && !data_1_1.done && (_b = data_1.return)) _b.call(data_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            result[key] = definition_1.toBoundedContext();
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
}
export function createForTest(definition) {
    var e_3, _a, e_4, _b;
    var transportLayer = new InMemoryTransportLayer();
    var result = {};
    try {
        for (var _c = __values(Object.entries(definition)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), key = _e[0], data = _e[1];
            var definition_2 = createBoundedContext(key, transportLayer);
            try {
                for (var data_2 = (e_4 = void 0, __values(data)), data_2_1 = data_2.next(); !data_2_1.done; data_2_1 = data_2.next()) {
                    var methodDefinition = data_2_1.value;
                    applyDefinition(definition_2, methodDefinition);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (data_2_1 && !data_2_1.done && (_b = data_2.return)) _b.call(data_2);
                }
                finally { if (e_4) throw e_4.error; }
            }
            result[key] = definition_2.toBoundedContext();
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return result;
}
