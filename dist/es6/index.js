var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const result = {};
    for (let [key, data] of Object.entries(definition)) {
        const boundedContext = createBoundedContext(key, transportLayer);
        for (let methodDefinition of data) {
            applyDefinition(boundedContext, methodDefinition);
        }
        result[key] = boundedContext.toBoundedContext();
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
const SETTINGS_KEY = 'apie-playground-settings';
export class BrowserPlayground {
    constructor(definition, apiUrl) {
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
    loadSettings() {
        var _a;
        const defaults = { backend: 'memory', offline: true };
        try {
            const parsed = JSON.parse((_a = localStorage.getItem(SETTINGS_KEY)) !== null && _a !== void 0 ? _a : 'null');
            if (parsed && (parsed.backend === 'memory' || parsed.backend === 'api')) {
                return { backend: parsed.backend, offline: parsed.offline !== false };
            }
        }
        catch (_b) {
            // localStorage unavailable or corrupt: use defaults
        }
        return defaults;
    }
    applySettings() {
        if (this.transport instanceof OfflineTransportLayer) {
            this.transport.dispose();
        }
        if (this.settings.backend === 'api' && !this.apiUrl) {
            this.settings.backend = 'memory';
        }
        const base = this.settings.backend === 'api'
            ? new FetchTransportLayer(this.apiUrl)
            : new InMemoryTransportLayer();
        this.transport = wrapOffline(base, this.settings.offline
            ? { storageKey: `apie-playground-offline-queue-${this.settings.backend}` }
            : false);
        this.api = createForTransport(this.definition, this.transport);
    }
    changeSettings(settings) {
        this.settings = settings;
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
        catch (_a) {
            // settings just will not be remembered
        }
        this.applySettings();
        this.reset();
        this.log(`Using ${settings.backend === 'api' ? 'real API' : 'in-memory'} transport ${settings.offline ? 'with' : 'without'} offline support`);
    }
    start(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Cannot start Apie browser playground: element with id "${id}" was not found`);
        }
        this.root = element;
        this.reset();
        return this;
    }
    defs(contextName, entityName) {
        return (this.definition[contextName] || []).filter((x) => x.type === "createProperty" && x.entityName === entityName);
    }
    entities(contextName) {
        return (this.definition[contextName] || [])
            .filter(x => x.type === "createEntity")
            .map(x => x.name);
    }
    context() {
        return this.api[this.selectedContext];
    }
    Ctor() {
        return this.context().entities[this.selectedEntity];
    }
    fmt(value) {
        try {
            return JSON.stringify(value, (_, x) => typeof x === "bigint" ? `${x}n` : x, 2);
        }
        catch (_a) {
            return String(value);
        }
    }
    esc(value) {
        return String(value !== null && value !== void 0 ? value : "").replace(/[&<>"']/g, c => {
            var _a;
            return ((_a = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[c]) !== null && _a !== void 0 ? _a : c);
        });
    }
    log(message, value) {
        this.logs.unshift({
            time: new Date().toLocaleTimeString(),
            message,
            value
        });
        this.renderLog();
    }
    pendingLabel() {
        const count = this.transport instanceof OfflineTransportLayer ? this.transport.pendingCount() : 0;
        return count > 0 ? ` (${count} pending)` : '';
    }
    errorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
    rootElement() {
        if (!this.root) {
            throw new Error("Browser playground has not been started");
        }
        return this.root;
    }
    showTestOutput(text) {
        const output = this.rootElement().querySelector("#test-output");
        if (output)
            output.textContent = text;
    }
    reset() {
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
    }
    render() {
        if (!this.root) {
            return;
        }
        const contextNames = Object.keys(this.definition);
        this.root.innerHTML = `
      <header>
        <div>
          <h1>Apie Test Playground</h1>
          <p>CRUD and state-transition tester.</p>
        </div>
        <div class="flags">
          <label>
            Backend
            <select id="setting-backend">
              <option value="memory" ${this.settings.backend === 'memory' ? 'selected' : ''}>In-memory</option>
              <option value="api" ${this.settings.backend === 'api' ? 'selected' : ''} ${this.apiUrl ? '' : 'disabled'}>Real API</option>
            </select>
          </label>
          <label>
            <input type="checkbox" id="setting-offline" ${this.settings.offline ? 'checked' : ''}>
            Offline support${this.pendingLabel()}
          </label>
          <button id="reset" class="primary">Reset</button>
        </div>
      </header>

      <div class="layout">
        <aside class="panel sidebar">
          <h2>Bounded contexts</h2>

          <div class="tabs">
            ${contextNames
            .map(c => `
                  <button
                    class="${c === this.selectedContext ? "active" : ""}"
                    data-context="${this.esc(c)}"
                  >
                    ${this.esc(c)}
                  </button>
                `)
            .join("")}
          </div>

          <h2>Entities</h2>

          <div class="entity-list">
            ${this.entities(this.selectedContext)
            .map(e => `
                  <button
                    class="${e === this.selectedEntity ? "active" : ""}"
                    data-entity="${this.esc(e)}"
                  >
                    ${this.esc(e)}
                  </button>
                `)
            .join("")}
          </div>
        </aside>

        <section class="content">
          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>${this.esc(this.selectedEntity)}</h2>
                <span class="muted">
                  ${this.esc(this.selectedContext)}
                </span>
              </div>
            </div>

            <div class="grid">
              <div>
                <h3>Create</h3>

                <div id="create-fields">
                  ${this.createFields()}
                </div>

                <button id="create" class="primary">
                  Create & Persist
                </button>
              </div>

              <div>
                <h3>Find by id</h3>

                <div class="flags">
                  <input id="find-id" placeholder="id" value="${this.esc(this.lastSearchId)}">
                  <button id="find">Find</button>
                </div>
              </div>

              <div>
                <h3>Active entity</h3>
                ${this.entityPanel()}
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h2>Tests</h2>
            </div>

            <div class="test-buttons">
              <button id="test-rules">Property rules</button>
              <button id="test-lifecycle">Full lifecycle</button>
              <button id="test-delete">Delete lifecycle</button>
            </div>

            <pre id="test-output" class="output">Run a test suite.</pre>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h2>Activity</h2>
              <button id="clear-log">Clear</button>
            </div>

            <pre id="log" class="output"></pre>
          </div>
        </section>
      </div>
    `;
        this.bindEvents();
        this.renderLog();
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f;
        const root = this.rootElement();
        const backendSelect = root.querySelector("#setting-backend");
        const offlineCheckbox = root.querySelector("#setting-offline");
        const settingChanged = () => {
            var _a;
            return this.changeSettings({
                backend: (backendSelect === null || backendSelect === void 0 ? void 0 : backendSelect.value) === 'api' ? 'api' : 'memory',
                offline: (_a = offlineCheckbox === null || offlineCheckbox === void 0 ? void 0 : offlineCheckbox.checked) !== null && _a !== void 0 ? _a : true,
            });
        };
        backendSelect === null || backendSelect === void 0 ? void 0 : backendSelect.addEventListener("change", settingChanged);
        offlineCheckbox === null || offlineCheckbox === void 0 ? void 0 : offlineCheckbox.addEventListener("change", settingChanged);
        (_a = root
            .querySelector("#reset")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            this.reset();
        });
        root
            .querySelectorAll("[data-context]")
            .forEach(button => {
            button.addEventListener("click", () => {
                var _a, _b;
                this.selectedContext = (_a = button.dataset.context) !== null && _a !== void 0 ? _a : "";
                this.selectedEntity =
                    (_b = this.entities(this.selectedContext)[0]) !== null && _b !== void 0 ? _b : '';
                this.activeEntity = null;
                this.activeForm = null;
                this.render();
            });
        });
        root
            .querySelectorAll("[data-entity]")
            .forEach(button => {
            button.addEventListener("click", () => {
                var _a;
                this.selectedEntity = (_a = button.dataset.entity) !== null && _a !== void 0 ? _a : "";
                this.activeEntity = null;
                this.activeForm = null;
                this.render();
            });
        });
        (_b = root
            .querySelector("#create")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            this.createEntity();
        });
        (_c = root
            .querySelector("#test-rules")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            this.propertyRulesTest();
        });
        (_d = root
            .querySelector("#test-lifecycle")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            this.lifecycleTest();
        });
        (_e = root
            .querySelector("#test-delete")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
            this.deleteTest();
        });
        (_f = root
            .querySelector("#clear-log")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
            this.logs = [];
            this.renderLog();
        });
        this.bindEntityActions();
    }
    createFields() {
        return this.defs(this.selectedContext, this.selectedEntity)
            .map(d => `
          <label>
            ${this.esc(d.propertyName)}

            <span class="flags">
              ${d.writableOnCreation ? "W" : "—"} /
              ${d.readable ? "R" : "—"}
            </span>

            <input
              data-create="${this.esc(d.propertyName)}"
              ${d.writableOnCreation ? "" : "disabled"}
              placeholder="${d.writableOnCreation
            ? "writable on creation"
            : "read-only on creation"}"
            >
          </label>
        `)
            .join("");
    }
    entityPanel() {
        if (!this.activeEntity) {
            return `
        <div class="empty">
          No entity yet. Create one to inspect its state
          and modification form.
        </div>
      `;
        }
        const activeEntity = this.activeEntity;
        const props = this.defs(this.selectedContext, this.selectedEntity);
        return `
      <div class="state">
        State:
        <strong>${this.activeEntityContext ? "Persisted" : "Draft"}</strong>
        · id:
        <strong>${this.esc(activeEntity.id)}</strong>
      </div>

      <div class="property-list">
        ${props
            .map(d => {
            let value;
            try {
                value = activeEntity[d.propertyName];
            }
            catch (error) {
                value = `[${this.errorMessage(error)}]`;
            }
            return `
              <div>
                <span>${this.esc(d.propertyName)}</span>
                <code>
                  ${this.esc(value === undefined
                ? "undefined"
                : String(value))}
                </code>
              </div>
            `;
        })
            .join("")}
      </div>

      <div class="actions">
        <button id="form">
          Create modification form
        </button>

        <button id="persist" class="primary">
          Persist
        </button>

        <button id="delete">
          Delete
        </button>
      </div>

      ${this.activeForm ? this.formPanel() : ""}
    `;
    }
    formPanel() {
        return `
      <div class="form-box">
        <h3>Modification form</h3>

        ${this.defs(this.selectedContext, this.selectedEntity)
            .map(d => `
              <label>
                ${this.esc(d.propertyName)}

                <span class="flags">
                  ${d.writableOnModification ? "W" : "—"} /
                  ${d.readable ? "R" : "—"}
                </span>

                <input
                  data-form="${this.esc(d.propertyName)}"
                  ${d.writableOnModification ? "" : "disabled"}
                  placeholder="${d.writableOnModification
            ? "writable on modification"
            : "not writable on modification"}"
                >
              </label>
            `)
            .join("")}

        <button id="save-form" class="primary">
          Apply form & persist
        </button>
      </div>
    `;
    }
    bindEntityActions() {
        var _a, _b, _c, _d, _e, _f;
        const root = this.rootElement();
        (_a = root
            .querySelector("#form")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            try {
                if (!this.activeEntity)
                    return;
                this.activeForm = this.activeEntity.createForm();
                this.render();
                this.log("Created modification form");
            }
            catch (error) {
                this.log("Create form failed", this.errorMessage(error));
            }
        });
        const findEntity = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const input = root.querySelector("#find-id");
            const searched = ((_a = input === null || input === void 0 ? void 0 : input.value) !== null && _a !== void 0 ? _a : "").trim();
            this.lastSearchId = searched;
            if (searched === "") {
                this.log("Find failed", "Please enter an id");
                return;
            }
            const candidates = /^-?\d+$/.test(searched)
                ? [Number(searched), searched]
                : [searched];
            let lastError = null;
            for (const id of candidates) {
                try {
                    const entity = yield this.context().find(this.selectedEntity, id);
                    this.activeEntity = entity;
                    this.activeEntityContext = this.context();
                    this.activeForm = null;
                    this.render();
                    this.log(`Found ${this.selectedEntity} ${searched}`, this.snapshot(entity));
                    return;
                }
                catch (error) {
                    lastError = error;
                }
            }
            this.log("Find failed", this.errorMessage(lastError));
        });
        (_b = root.querySelector("#find")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", findEntity);
        (_c = root.querySelector("#find-id")) === null || _c === void 0 ? void 0 : _c.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                void findEntity();
            }
        });
        (_d = root
            .querySelector("#persist")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.activeEntity)
                    return;
                const entity = this.activeEntity;
                yield this.context().persist(entity);
                this.render();
                this.log("Entity persisted", this.snapshot(entity));
            }
            catch (error) {
                this.log("Persist failed", this.errorMessage(error));
            }
        }));
        (_e = root
            .querySelector("#delete")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.activeEntity)
                    return;
                yield this.context().delete(this.activeEntity);
                this.log("Entity deleted");
                this.activeEntity = null;
                this.activeForm = null;
                this.render();
            }
            catch (error) {
                this.log("Delete failed", this.errorMessage(error));
            }
        }));
        (_f = root
            .querySelector("#save-form")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            for (const d of this.defs(this.selectedContext, this.selectedEntity)) {
                const selector = `[data-form="${CSS.escape(d.propertyName)}"]`;
                const element = root.querySelector(selector);
                if (element &&
                    !element.disabled &&
                    element.value !== "") {
                    try {
                        if (!this.activeForm)
                            return;
                        this.activeForm[d.propertyName] =
                            this.parseValue(element.value);
                    }
                    catch (error) {
                        this.log(`Setting ${d.propertyName} failed`, this.errorMessage(error));
                    }
                }
            }
            try {
                if (!this.activeForm)
                    return;
                const form = this.activeForm;
                yield this.context().persist(form);
                this.activeForm = null;
                this.render();
                this.log("Modification persisted", this.snapshot(form));
            }
            catch (error) {
                this.log("Modification failed", this.errorMessage(error));
            }
        }));
    }
    parseValue(value) {
        const text = value.trim();
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
    }
    createEntity() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = {};
                for (const d of this.defs(this.selectedContext, this.selectedEntity)) {
                    const element = this.rootElement().querySelector(`[data-create="${CSS.escape(d.propertyName)}"]`);
                    if (element &&
                        !element.disabled &&
                        element.value !== "") {
                        data[d.propertyName] =
                            this.parseValue(element.value);
                    }
                }
                const C = this.Ctor();
                const entity = new C(data);
                this.activeEntity = entity;
                yield this.context().persist(entity);
                this.activeEntityContext =
                    this.context();
                this.render();
                this.log(`Created and persisted ${this.selectedEntity}`, this.snapshot(entity));
            }
            catch (error) {
                this.log("Create failed", this.errorMessage(error));
            }
        });
    }
    snapshot(entity) {
        const result = {};
        for (const d of this.defs(this.selectedContext, this.selectedEntity)) {
            try {
                result[d.propertyName] =
                    entity[d.propertyName];
            }
            catch (error) {
                result[d.propertyName] =
                    `[${this.errorMessage(error)}]`;
            }
        }
        return result;
    }
    propertyRulesTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const out = [];
            let passed = 0;
            let failed = 0;
            const test = (name, fn) => {
                try {
                    fn();
                    out.push(`✓ ${name}`);
                    passed++;
                }
                catch (error) {
                    out.push(`✗ ${name}: ${this.errorMessage(error)}`);
                    failed++;
                }
            };
            const C = this.Ctor();
            const entity = new C({});
            const propertyDefinitions = {};
            for (const definition of this.defs(this.selectedContext, this.selectedEntity)) {
                propertyDefinitions[definition.propertyName] = definition;
            }
            for (const [name, definition] of Object.entries(propertyDefinitions)) {
                if (!definition.writableOnCreation) {
                    test(`${name} rejects creation write`, () => {
                        entity[name] = "should fail";
                    });
                }
            }
            for (const [name, definition] of Object.entries(propertyDefinitions)) {
                if (!definition.readable) {
                    test(`${name} rejects read`, () => {
                        const value = entity[name];
                        if (!String(value).startsWith("[")) {
                            throw new Error("property unexpectedly readable");
                        }
                    });
                }
            }
            const element = this.rootElement().querySelector("#test-output");
            if (element) {
                element.textContent =
                    out.join("\n") +
                        `\n\n${passed} passed, ${failed} failed`;
            }
        });
    }
    lifecycleTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const out = [];
            try {
                const C = this.Ctor();
                const entity = new C({});
                out.push(`Draft: created ${this.selectedEntity}`);
                yield this.context().persist(entity);
                out.push(`Persisted: id=${entity.id}`);
                const form = entity.createForm();
                const writable = this.defs(this.selectedContext, this.selectedEntity).find(d => d.writableOnModification);
                if (writable) {
                    form[writable.propertyName] =
                        this.parseValue("playground-test");
                    out.push(`Modification: changed ${writable.propertyName}`);
                    yield this.context().persist(form);
                    out.push("Updated: persisted modification");
                }
                else {
                    out.push("Modification: no writable-on-modification property defined");
                }
                this.showTestOutput("✓ Lifecycle passed\n\n" +
                    out.join("\n"));
                this.log("Lifecycle test passed", out);
            }
            catch (error) {
                this.showTestOutput("✗ Lifecycle failed\n\n" +
                    out.join("\n") +
                    "\n" +
                    this.errorMessage(error));
                this.log("Lifecycle test failed", this.errorMessage(error));
            }
        });
    }
    deleteTest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const C = this.Ctor();
                const entity = new C({});
                yield this.context().persist(entity);
                yield this.context().delete(entity);
                let failedAsExpected = false;
                try {
                    yield this.context().delete(entity);
                }
                catch (_a) {
                    failedAsExpected = true;
                }
                if (!failedAsExpected) {
                    throw new Error("Second delete unexpectedly succeeded");
                }
                this.showTestOutput("✓ Delete lifecycle passed\n\n" +
                    "Create → Persist → Delete → Delete rejected");
                this.log("Delete lifecycle passed");
            }
            catch (error) {
                this.showTestOutput("✗ Delete lifecycle failed\n\n" +
                    this.errorMessage(error));
                this.log("Delete lifecycle failed", this.errorMessage(error));
            }
        });
    }
    renderLog() {
        if (!this.root) {
            return;
        }
        const element = this.root.querySelector("#log");
        if (!element) {
            return;
        }
        element.textContent = this.logs
            .map(x => `[${x.time}] ${x.message}` +
            (x.value === undefined
                ? ""
                : `\n${this.fmt(x.value)}`))
            .join("\n\n");
    }
}
export function createBrowserPlayground(definition, apiUrl) {
    return new BrowserPlayground(definition, apiUrl);
}
