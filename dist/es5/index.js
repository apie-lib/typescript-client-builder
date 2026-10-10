import { __awaiter, __generator, __read, __values } from "tslib";
import { createBoundedContext } from "./build-script";
import { FetchTransportLayer, InMemoryTransportLayer, OfflineTransportLayer } from "./transport-layer";
export { OfflineTransportLayer };
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
export function createForTransport(definition, transportLayer) {
    var e_1, _a, e_2, _b;
    var result = {};
    try {
        for (var _c = __values(Object.entries(definition)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), key = _e[0], data = _e[1];
            var boundedContext = createBoundedContext(key, transportLayer);
            try {
                for (var data_1 = (e_2 = void 0, __values(data)), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                    var methodDefinition = data_1_1.value;
                    applyDefinition(boundedContext, methodDefinition);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (data_1_1 && !data_1_1.done && (_b = data_1.return)) _b.call(data_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            result[key] = boundedContext.toBoundedContext();
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
function wrapOffline(layer, offline) {
    return offline ? new OfflineTransportLayer(layer, offline === true ? {} : offline) : layer;
}
export function createForApi(apiUrl, definition, offline) {
    return createForTransport(definition, wrapOffline(new FetchTransportLayer(apiUrl), offline));
}
export function createForTest(definition, offline) {
    return createForTransport(definition, wrapOffline(new InMemoryTransportLayer(), offline));
}
var SETTINGS_KEY = 'apie-playground-settings';
var BrowserPlayground = /** @class */ (function () {
    function BrowserPlayground(definition, apiUrl) {
        var _a, _b;
        this.definition = definition;
        this.apiUrl = apiUrl;
        this.root = null;
        this.selectedContext = '';
        this.selectedEntity = '';
        this.activeEntity = null;
        this.activeEntityContext = null;
        this.lastSearchId = '';
        this.activeForm = null;
        this.logs = [];
        this.api = {};
        this.transport = null;
        this.settings = { backend: 'memory', offline: true };
        this.settings = this.loadSettings();
        this.applySettings();
        this.selectedContext = (_a = Object.keys(definition)[0]) !== null && _a !== void 0 ? _a : '';
        this.selectedEntity = (_b = this.entities(this.selectedContext)[0]) !== null && _b !== void 0 ? _b : '';
    }
    BrowserPlayground.prototype.loadSettings = function () {
        var _a;
        var defaults = { backend: 'memory', offline: true };
        try {
            var parsed = JSON.parse((_a = localStorage.getItem(SETTINGS_KEY)) !== null && _a !== void 0 ? _a : 'null');
            if (parsed && (parsed.backend === 'memory' || parsed.backend === 'api')) {
                return { backend: parsed.backend, offline: parsed.offline !== false };
            }
        }
        catch (_b) {
            // localStorage unavailable or corrupt: use defaults
        }
        return defaults;
    };
    BrowserPlayground.prototype.applySettings = function () {
        if (this.transport instanceof OfflineTransportLayer) {
            this.transport.dispose();
        }
        if (this.settings.backend === 'api' && !this.apiUrl) {
            this.settings.backend = 'memory';
        }
        var base = this.settings.backend === 'api'
            ? new FetchTransportLayer(this.apiUrl)
            : new InMemoryTransportLayer();
        this.transport = wrapOffline(base, this.settings.offline
            ? { storageKey: "apie-playground-offline-queue-".concat(this.settings.backend) }
            : false);
        this.api = createForTransport(this.definition, this.transport);
    };
    BrowserPlayground.prototype.changeSettings = function (settings) {
        this.settings = settings;
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
        catch (_a) {
            // settings just will not be remembered
        }
        this.applySettings();
        this.reset();
        this.log("Using ".concat(settings.backend === 'api' ? 'real API' : 'in-memory', " transport ").concat(settings.offline ? 'with' : 'without', " offline support"));
    };
    BrowserPlayground.prototype.start = function (id) {
        var element = document.getElementById(id);
        if (!element) {
            throw new Error("Cannot start Apie browser playground: element with id \"".concat(id, "\" was not found"));
        }
        this.root = element;
        this.reset();
        return this;
    };
    BrowserPlayground.prototype.defs = function (contextName, entityName) {
        return (this.definition[contextName] || []).filter(function (x) {
            return x.type === "createProperty" && x.entityName === entityName;
        });
    };
    BrowserPlayground.prototype.entities = function (contextName) {
        return (this.definition[contextName] || [])
            .filter(function (x) { return x.type === "createEntity"; })
            .map(function (x) { return x.name; });
    };
    BrowserPlayground.prototype.context = function () {
        return this.api[this.selectedContext];
    };
    BrowserPlayground.prototype.Ctor = function () {
        return this.context().entities[this.selectedEntity];
    };
    BrowserPlayground.prototype.fmt = function (value) {
        try {
            return JSON.stringify(value, function (_, x) {
                return typeof x === "bigint" ? "".concat(x, "n") : x;
            }, 2);
        }
        catch (_a) {
            return String(value);
        }
    };
    BrowserPlayground.prototype.esc = function (value) {
        return String(value !== null && value !== void 0 ? value : "").replace(/[&<>"']/g, function (c) {
            var _a;
            return ((_a = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[c]) !== null && _a !== void 0 ? _a : c);
        });
    };
    BrowserPlayground.prototype.log = function (message, value) {
        this.logs.unshift({
            time: new Date().toLocaleTimeString(),
            message: message,
            value: value
        });
        this.renderLog();
    };
    BrowserPlayground.prototype.pendingLabel = function () {
        var count = this.transport instanceof OfflineTransportLayer ? this.transport.pendingCount() : 0;
        return count > 0 ? " (".concat(count, " pending)") : '';
    };
    BrowserPlayground.prototype.errorMessage = function (error) {
        return error instanceof Error ? error.message : String(error);
    };
    BrowserPlayground.prototype.rootElement = function () {
        if (!this.root) {
            throw new Error("Browser playground has not been started");
        }
        return this.root;
    };
    BrowserPlayground.prototype.showTestOutput = function (text) {
        var output = this.rootElement().querySelector("#test-output");
        if (output)
            output.textContent = text;
    };
    BrowserPlayground.prototype.reset = function () {
        var _a, _b;
        this.selectedContext =
            (_a = Object.keys(this.definition)[0]) !== null && _a !== void 0 ? _a : "";
        this.selectedEntity =
            (_b = this.entities(this.selectedContext)[0]) !== null && _b !== void 0 ? _b : '';
        this.activeEntity = null;
        this.activeEntityContext = null;
        this.activeForm = null;
        this.logs = [];
        if (this.root) {
            this.render();
            this.log("Test environment reset");
        }
    };
    BrowserPlayground.prototype.render = function () {
        var _this = this;
        if (!this.root) {
            return;
        }
        var contextNames = Object.keys(this.definition);
        this.root.innerHTML = "\n      <header>\n        <div>\n          <h1>Apie Test Playground</h1>\n          <p>CRUD and state-transition tester.</p>\n        </div>\n        <div class=\"flags\">\n          <label>\n            Backend\n            <select id=\"setting-backend\">\n              <option value=\"memory\" ".concat(this.settings.backend === 'memory' ? 'selected' : '', ">In-memory</option>\n              <option value=\"api\" ").concat(this.settings.backend === 'api' ? 'selected' : '', " ").concat(this.apiUrl ? '' : 'disabled', ">Real API</option>\n            </select>\n          </label>\n          <label>\n            <input type=\"checkbox\" id=\"setting-offline\" ").concat(this.settings.offline ? 'checked' : '', ">\n            Offline support").concat(this.pendingLabel(), "\n          </label>\n          <button id=\"reset\" class=\"primary\">Reset</button>\n        </div>\n      </header>\n\n      <div class=\"layout\">\n        <aside class=\"panel sidebar\">\n          <h2>Bounded contexts</h2>\n\n          <div class=\"tabs\">\n            ").concat(contextNames
            .map(function (c) { return "\n                  <button\n                    class=\"".concat(c === _this.selectedContext ? "active" : "", "\"\n                    data-context=\"").concat(_this.esc(c), "\"\n                  >\n                    ").concat(_this.esc(c), "\n                  </button>\n                "); })
            .join(""), "\n          </div>\n\n          <h2>Entities</h2>\n\n          <div class=\"entity-list\">\n            ").concat(this.entities(this.selectedContext)
            .map(function (e) { return "\n                  <button\n                    class=\"".concat(e === _this.selectedEntity ? "active" : "", "\"\n                    data-entity=\"").concat(_this.esc(e), "\"\n                  >\n                    ").concat(_this.esc(e), "\n                  </button>\n                "); })
            .join(""), "\n          </div>\n        </aside>\n\n        <section class=\"content\">\n          <div class=\"panel\">\n            <div class=\"panel-head\">\n              <div>\n                <h2>").concat(this.esc(this.selectedEntity), "</h2>\n                <span class=\"muted\">\n                  ").concat(this.esc(this.selectedContext), "\n                </span>\n              </div>\n            </div>\n\n            <div class=\"grid\">\n              <div>\n                <h3>Create</h3>\n\n                <div id=\"create-fields\">\n                  ").concat(this.createFields(), "\n                </div>\n\n                <button id=\"create\" class=\"primary\">\n                  Create & Persist\n                </button>\n              </div>\n\n              <div>\n                <h3>Find by id</h3>\n\n                <div class=\"flags\">\n                  <input id=\"find-id\" placeholder=\"id\" value=\"").concat(this.esc(this.lastSearchId), "\">\n                  <button id=\"find\">Find</button>\n                </div>\n              </div>\n\n              <div>\n                <h3>Active entity</h3>\n                ").concat(this.entityPanel(), "\n              </div>\n            </div>\n          </div>\n\n          <div class=\"panel\">\n            <div class=\"panel-head\">\n              <h2>Tests</h2>\n            </div>\n\n            <div class=\"test-buttons\">\n              <button id=\"test-rules\">Property rules</button>\n              <button id=\"test-lifecycle\">Full lifecycle</button>\n              <button id=\"test-delete\">Delete lifecycle</button>\n            </div>\n\n            <pre id=\"test-output\" class=\"output\">Run a test suite.</pre>\n          </div>\n\n          <div class=\"panel\">\n            <div class=\"panel-head\">\n              <h2>Activity</h2>\n              <button id=\"clear-log\">Clear</button>\n            </div>\n\n            <pre id=\"log\" class=\"output\"></pre>\n          </div>\n        </section>\n      </div>\n    ");
        this.bindEvents();
        this.renderLog();
    };
    BrowserPlayground.prototype.bindEvents = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        var root = this.rootElement();
        var backendSelect = root.querySelector("#setting-backend");
        var offlineCheckbox = root.querySelector("#setting-offline");
        var settingChanged = function () {
            var _a;
            return _this.changeSettings({
                backend: (backendSelect === null || backendSelect === void 0 ? void 0 : backendSelect.value) === 'api' ? 'api' : 'memory',
                offline: (_a = offlineCheckbox === null || offlineCheckbox === void 0 ? void 0 : offlineCheckbox.checked) !== null && _a !== void 0 ? _a : true,
            });
        };
        backendSelect === null || backendSelect === void 0 ? void 0 : backendSelect.addEventListener("change", settingChanged);
        offlineCheckbox === null || offlineCheckbox === void 0 ? void 0 : offlineCheckbox.addEventListener("change", settingChanged);
        (_a = root
            .querySelector("#reset")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
            _this.reset();
        });
        root
            .querySelectorAll("[data-context]")
            .forEach(function (button) {
            button.addEventListener("click", function () {
                var _a, _b;
                _this.selectedContext = (_a = button.dataset.context) !== null && _a !== void 0 ? _a : "";
                _this.selectedEntity =
                    (_b = _this.entities(_this.selectedContext)[0]) !== null && _b !== void 0 ? _b : '';
                _this.activeEntity = null;
                _this.activeForm = null;
                _this.render();
            });
        });
        root
            .querySelectorAll("[data-entity]")
            .forEach(function (button) {
            button.addEventListener("click", function () {
                var _a;
                _this.selectedEntity = (_a = button.dataset.entity) !== null && _a !== void 0 ? _a : "";
                _this.activeEntity = null;
                _this.activeForm = null;
                _this.render();
            });
        });
        (_b = root
            .querySelector("#create")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
            _this.createEntity();
        });
        (_c = root
            .querySelector("#test-rules")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
            _this.propertyRulesTest();
        });
        (_d = root
            .querySelector("#test-lifecycle")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () {
            _this.lifecycleTest();
        });
        (_e = root
            .querySelector("#test-delete")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", function () {
            _this.deleteTest();
        });
        (_f = root
            .querySelector("#clear-log")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", function () {
            _this.logs = [];
            _this.renderLog();
        });
        this.bindEntityActions();
    };
    BrowserPlayground.prototype.createFields = function () {
        var _this = this;
        return this.defs(this.selectedContext, this.selectedEntity)
            .map(function (d) { return "\n          <label>\n            ".concat(_this.esc(d.propertyName), "\n\n            <span class=\"flags\">\n              ").concat(d.writableOnCreation ? "W" : "—", " /\n              ").concat(d.readable ? "R" : "—", "\n            </span>\n\n            <input\n              data-create=\"").concat(_this.esc(d.propertyName), "\"\n              ").concat(d.writableOnCreation ? "" : "disabled", "\n              placeholder=\"").concat(d.writableOnCreation
            ? "writable on creation"
            : "read-only on creation", "\"\n            >\n          </label>\n        "); })
            .join("");
    };
    BrowserPlayground.prototype.entityPanel = function () {
        var _this = this;
        if (!this.activeEntity) {
            return "\n        <div class=\"empty\">\n          No entity yet. Create one to inspect its state\n          and modification form.\n        </div>\n      ";
        }
        var activeEntity = this.activeEntity;
        var props = this.defs(this.selectedContext, this.selectedEntity);
        return "\n      <div class=\"state\">\n        State:\n        <strong>".concat(this.activeEntityContext ? "Persisted" : "Draft", "</strong>\n        \u00B7 id:\n        <strong>").concat(this.esc(activeEntity.id), "</strong>\n      </div>\n\n      <div class=\"property-list\">\n        ").concat(props
            .map(function (d) {
            var value;
            try {
                value = activeEntity[d.propertyName];
            }
            catch (error) {
                value = "[".concat(_this.errorMessage(error), "]");
            }
            return "\n              <div>\n                <span>".concat(_this.esc(d.propertyName), "</span>\n                <code>\n                  ").concat(_this.esc(value === undefined
                ? "undefined"
                : String(value)), "\n                </code>\n              </div>\n            ");
        })
            .join(""), "\n      </div>\n\n      <div class=\"actions\">\n        <button id=\"form\">\n          Create modification form\n        </button>\n\n        <button id=\"persist\" class=\"primary\">\n          Persist\n        </button>\n\n        <button id=\"delete\">\n          Delete\n        </button>\n      </div>\n\n      ").concat(this.activeForm ? this.formPanel() : "", "\n    ");
    };
    BrowserPlayground.prototype.formPanel = function () {
        var _this = this;
        return "\n      <div class=\"form-box\">\n        <h3>Modification form</h3>\n\n        ".concat(this.defs(this.selectedContext, this.selectedEntity)
            .map(function (d) { return "\n              <label>\n                ".concat(_this.esc(d.propertyName), "\n\n                <span class=\"flags\">\n                  ").concat(d.writableOnModification ? "W" : "—", " /\n                  ").concat(d.readable ? "R" : "—", "\n                </span>\n\n                <input\n                  data-form=\"").concat(_this.esc(d.propertyName), "\"\n                  ").concat(d.writableOnModification ? "" : "disabled", "\n                  placeholder=\"").concat(d.writableOnModification
            ? "writable on modification"
            : "not writable on modification", "\"\n                >\n              </label>\n            "); })
            .join(""), "\n\n        <button id=\"save-form\" class=\"primary\">\n          Apply form & persist\n        </button>\n      </div>\n    ");
    };
    BrowserPlayground.prototype.bindEntityActions = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        var root = this.rootElement();
        (_a = root
            .querySelector("#form")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
            try {
                if (!_this.activeEntity)
                    return;
                _this.activeForm = _this.activeEntity.createForm();
                _this.render();
                _this.log("Created modification form");
            }
            catch (error) {
                _this.log("Create form failed", _this.errorMessage(error));
            }
        });
        var findEntity = function () { return __awaiter(_this, void 0, void 0, function () {
            var input, searched, candidates, lastError, candidates_1, candidates_1_1, id, entity, error_1, e_3_1;
            var e_3, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        input = root.querySelector("#find-id");
                        searched = ((_b = input === null || input === void 0 ? void 0 : input.value) !== null && _b !== void 0 ? _b : "").trim();
                        this.lastSearchId = searched;
                        if (searched === "") {
                            this.log("Find failed", "Please enter an id");
                            return [2 /*return*/];
                        }
                        candidates = /^-?\d+$/.test(searched)
                            ? [Number(searched), searched]
                            : [searched];
                        lastError = null;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, 9, 10]);
                        candidates_1 = __values(candidates), candidates_1_1 = candidates_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!candidates_1_1.done) return [3 /*break*/, 7];
                        id = candidates_1_1.value;
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.context().find(this.selectedEntity, id)];
                    case 4:
                        entity = _c.sent();
                        this.activeEntity = entity;
                        this.activeEntityContext = this.context();
                        this.activeForm = null;
                        this.render();
                        this.log("Found ".concat(this.selectedEntity, " ").concat(searched), this.snapshot(entity));
                        return [2 /*return*/];
                    case 5:
                        error_1 = _c.sent();
                        lastError = error_1;
                        return [3 /*break*/, 6];
                    case 6:
                        candidates_1_1 = candidates_1.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_3_1 = _c.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        this.log("Find failed", this.errorMessage(lastError));
                        return [2 /*return*/];
                }
            });
        }); };
        (_b = root.querySelector("#find")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", findEntity);
        (_c = root.querySelector("#find-id")) === null || _c === void 0 ? void 0 : _c.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                void findEntity();
            }
        });
        (_d = root
            .querySelector("#persist")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
            var entity, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.activeEntity)
                            return [2 /*return*/];
                        entity = this.activeEntity;
                        return [4 /*yield*/, this.context().persist(entity)];
                    case 1:
                        _a.sent();
                        this.render();
                        this.log("Entity persisted", this.snapshot(entity));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.log("Persist failed", this.errorMessage(error_2));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        (_e = root
            .querySelector("#delete")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.activeEntity)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.context().delete(this.activeEntity)];
                    case 1:
                        _a.sent();
                        this.log("Entity deleted");
                        this.activeEntity = null;
                        this.activeForm = null;
                        this.render();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.log("Delete failed", this.errorMessage(error_3));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        (_f = root
            .querySelector("#save-form")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, d, selector, element, form, error_4;
            var e_4, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        try {
                            for (_a = __values(this.defs(this.selectedContext, this.selectedEntity)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                d = _b.value;
                                selector = "[data-form=\"".concat(CSS.escape(d.propertyName), "\"]");
                                element = root.querySelector(selector);
                                if (element &&
                                    !element.disabled &&
                                    element.value !== "") {
                                    try {
                                        if (!this.activeForm)
                                            return [2 /*return*/];
                                        this.activeForm[d.propertyName] =
                                            this.parseValue(element.value);
                                    }
                                    catch (error) {
                                        this.log("Setting ".concat(d.propertyName, " failed"), this.errorMessage(error));
                                    }
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        if (!this.activeForm)
                            return [2 /*return*/];
                        form = this.activeForm;
                        return [4 /*yield*/, this.context().persist(form)];
                    case 2:
                        _d.sent();
                        this.activeForm = null;
                        this.render();
                        this.log("Modification persisted", this.snapshot(form));
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _d.sent();
                        this.log("Modification failed", this.errorMessage(error_4));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    BrowserPlayground.prototype.parseValue = function (value) {
        var text = value.trim();
        if (text === "true")
            return true;
        if (text === "false")
            return false;
        if (text === "null")
            return null;
        if (/^-?\d+(?:\.\d+)?$/.test(text)) {
            return Number(text);
        }
        try {
            return JSON.parse(text);
        }
        catch (_a) {
            return value;
        }
    };
    BrowserPlayground.prototype.createEntity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, _a, _b, d, element, C, entity, error_5;
            var e_5, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        data = {};
                        try {
                            for (_a = __values(this.defs(this.selectedContext, this.selectedEntity)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                d = _b.value;
                                element = this.rootElement().querySelector("[data-create=\"".concat(CSS.escape(d.propertyName), "\"]"));
                                if (element &&
                                    !element.disabled &&
                                    element.value !== "") {
                                    data[d.propertyName] =
                                        this.parseValue(element.value);
                                }
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                        C = this.Ctor();
                        entity = new C(data);
                        this.activeEntity = entity;
                        return [4 /*yield*/, this.context().persist(entity)];
                    case 1:
                        _d.sent();
                        this.activeEntityContext =
                            this.context();
                        this.render();
                        this.log("Created and persisted ".concat(this.selectedEntity), this.snapshot(entity));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _d.sent();
                        this.log("Create failed", this.errorMessage(error_5));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BrowserPlayground.prototype.snapshot = function (entity) {
        var e_6, _a;
        var result = {};
        try {
            for (var _b = __values(this.defs(this.selectedContext, this.selectedEntity)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var d = _c.value;
                try {
                    result[d.propertyName] =
                        entity[d.propertyName];
                }
                catch (error) {
                    result[d.propertyName] =
                        "[".concat(this.errorMessage(error), "]");
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return result;
    };
    BrowserPlayground.prototype.propertyRulesTest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var out, passed, failed, test, C, entity, propertyDefinitions, _a, _b, definition, _loop_1, _c, _d, _e, name_1, definition, _loop_2, _f, _g, _h, name_2, definition, element;
            var e_7, _j, e_8, _k, e_9, _l;
            var _this = this;
            return __generator(this, function (_m) {
                out = [];
                passed = 0;
                failed = 0;
                test = function (name, fn) {
                    try {
                        fn();
                        out.push("\u2713 ".concat(name));
                        passed++;
                    }
                    catch (error) {
                        out.push("\u2717 ".concat(name, ": ").concat(_this.errorMessage(error)));
                        failed++;
                    }
                };
                C = this.Ctor();
                entity = new C({});
                propertyDefinitions = {};
                try {
                    for (_a = __values(this.defs(this.selectedContext, this.selectedEntity)), _b = _a.next(); !_b.done; _b = _a.next()) {
                        definition = _b.value;
                        propertyDefinitions[definition.propertyName] = definition;
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_j = _a.return)) _j.call(_a);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                _loop_1 = function (name_1, definition) {
                    if (!definition.writableOnCreation) {
                        test("".concat(name_1, " rejects creation write"), function () {
                            entity[name_1] = "should fail";
                        });
                    }
                };
                try {
                    for (_c = __values(Object.entries(propertyDefinitions)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        _e = __read(_d.value, 2), name_1 = _e[0], definition = _e[1];
                        _loop_1(name_1, definition);
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_k = _c.return)) _k.call(_c);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                _loop_2 = function (name_2, definition) {
                    if (!definition.readable) {
                        test("".concat(name_2, " rejects read"), function () {
                            var value = entity[name_2];
                            if (!String(value).startsWith("[")) {
                                throw new Error("property unexpectedly readable");
                            }
                        });
                    }
                };
                try {
                    for (_f = __values(Object.entries(propertyDefinitions)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        _h = __read(_g.value, 2), name_2 = _h[0], definition = _h[1];
                        _loop_2(name_2, definition);
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_l = _f.return)) _l.call(_f);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                element = this.rootElement().querySelector("#test-output");
                if (element) {
                    element.textContent =
                        out.join("\n") +
                            "\n\n".concat(passed, " passed, ").concat(failed, " failed");
                }
                return [2 /*return*/];
            });
        });
    };
    BrowserPlayground.prototype.lifecycleTest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var out, C, entity, form, writable, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        out = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        C = this.Ctor();
                        entity = new C({});
                        out.push("Draft: created ".concat(this.selectedEntity));
                        return [4 /*yield*/, this.context().persist(entity)];
                    case 2:
                        _a.sent();
                        out.push("Persisted: id=".concat(entity.id));
                        form = entity.createForm();
                        writable = this.defs(this.selectedContext, this.selectedEntity).find(function (d) { return d.writableOnModification; });
                        if (!writable) return [3 /*break*/, 4];
                        form[writable.propertyName] =
                            this.parseValue("playground-test");
                        out.push("Modification: changed ".concat(writable.propertyName));
                        return [4 /*yield*/, this.context().persist(form)];
                    case 3:
                        _a.sent();
                        out.push("Updated: persisted modification");
                        return [3 /*break*/, 5];
                    case 4:
                        out.push("Modification: no writable-on-modification property defined");
                        _a.label = 5;
                    case 5:
                        this.showTestOutput("✓ Lifecycle passed\n\n" +
                            out.join("\n"));
                        this.log("Lifecycle test passed", out);
                        return [3 /*break*/, 7];
                    case 6:
                        error_6 = _a.sent();
                        this.showTestOutput("✗ Lifecycle failed\n\n" +
                            out.join("\n") +
                            "\n" +
                            this.errorMessage(error_6));
                        this.log("Lifecycle test failed", this.errorMessage(error_6));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    BrowserPlayground.prototype.deleteTest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var C, entity, failedAsExpected, _a, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        C = this.Ctor();
                        entity = new C({});
                        return [4 /*yield*/, this.context().persist(entity)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.context().delete(entity)];
                    case 2:
                        _b.sent();
                        failedAsExpected = false;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.context().delete(entity)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        failedAsExpected = true;
                        return [3 /*break*/, 6];
                    case 6:
                        if (!failedAsExpected) {
                            throw new Error("Second delete unexpectedly succeeded");
                        }
                        this.showTestOutput("✓ Delete lifecycle passed\n\n" +
                            "Create → Persist → Delete → Delete rejected");
                        this.log("Delete lifecycle passed");
                        return [3 /*break*/, 8];
                    case 7:
                        error_7 = _b.sent();
                        this.showTestOutput("✗ Delete lifecycle failed\n\n" +
                            this.errorMessage(error_7));
                        this.log("Delete lifecycle failed", this.errorMessage(error_7));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BrowserPlayground.prototype.renderLog = function () {
        var _this = this;
        if (!this.root) {
            return;
        }
        var element = this.root.querySelector("#log");
        if (!element) {
            return;
        }
        element.textContent = this.logs
            .map(function (x) {
            return "[".concat(x.time, "] ").concat(x.message) +
                (x.value === undefined
                    ? ""
                    : "\n".concat(_this.fmt(x.value)));
        })
            .join("\n\n");
    };
    return BrowserPlayground;
}());
export { BrowserPlayground };
export function createBrowserPlayground(definition, apiUrl) {
    return new BrowserPlayground(definition, apiUrl);
}
