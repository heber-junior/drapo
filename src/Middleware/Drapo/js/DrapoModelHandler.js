"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DrapoModelHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    HasContentModelContext(content) {
        return (content.indexOf('d-model') > -1);
    }
    ResolveOnModelChange(contextItem, el) {
        return __awaiter(this, void 0, void 0, function* () {
            const onModel = el.getAttribute('d-on-model-change');
            if ((onModel === null) || (onModel === undefined))
                return;
            const sector = this.Application.Document.GetSector(el);
            yield this.Application.FunctionHandler.ResolveFunction(sector, contextItem, null, null, onModel);
        });
    }
    ResolveOnModelComplete(contextItem, el) {
        return __awaiter(this, void 0, void 0, function* () {
            const onModel = el.getAttribute('d-on-model-complete');
            if ((onModel === null) || (onModel === undefined))
                return;
            const sector = this.Application.Document.GetSector(el);
            yield this.Application.FunctionHandler.ResolveFunction(sector, contextItem, null, null, onModel);
        });
    }
    ResolveModel(context, renderContext, el, sector, canBind, isContext = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = el.getAttribute('d-model');
            if (model == null)
                return (false);
            const isMustacheContext = this.Application.Barber.HasMustacheContext(model, sector, renderContext);
            if (isContext !== isMustacheContext)
                return;
            const isMustacheOnly = this.Application.Parser.IsMustacheOnly(model, true);
            const mustache = isMustacheOnly ? model : null;
            const mustacheParts = isMustacheOnly ? this.Application.Parser.ParseMustache(model) : null;
            const dataFields = isMustacheOnly ? this.Application.Solver.ResolveDataFields(mustacheParts) : null;
            const onModelInitialize = el.getAttribute('d-on-model-initialize');
            if ((onModelInitialize !== null) && (onModelInitialize !== undefined) && (!(yield this.Application.Solver.ExistDataPath(context, sector, mustacheParts)))) {
                yield this.Application.FunctionHandler.ResolveFunction(sector, context.Item, null, null, onModelInitialize);
                if ((!isContext) || (!context.CanUpdateTemplate))
                    el.removeAttribute('d-on-model-initialize');
            }
            let canNotify = true;
            const modelNotify = el.getAttribute('d-modelNotify');
            if (modelNotify != null) {
                canNotify = modelNotify === 'true';
                if ((isContext) && (context.CanUpdateTemplate))
                    el.removeAttribute('d-modelNotify');
            }
            const modelEvents = this.Application.Parser.ParseEvents(el.getAttribute('d-model-event'));
            if (modelEvents.length === 0)
                modelEvents.push('change');
            if ((isMustacheOnly) && (context.CanUpdateTemplate)) {
                const mustacheResolved = yield this.Application.Solver.ResolveDataPathMustache(context, null, el, sector, mustacheParts);
                if (mustacheResolved !== null)
                    el.setAttribute('d-model', mustacheResolved);
            }
            const modelOrValue = isMustacheOnly ? model : yield this.ResolveValueExpression(context, el, sector, model, canBind);
            let updated = false;
            const tag = el.tagName.toLowerCase();
            if (tag === 'input')
                updated = yield this.ResolveModelInput(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, this.Application.Parser.ParseEvents(el.getAttribute('d-model-event-cancel')), canNotify);
            else if (tag === 'select')
                updated = yield this.ResolveModelSelect(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify);
            else if (tag === 'textarea')
                updated = yield this.ResolveModelTextArea(context, el, sector, modelOrValue, mustache, mustacheParts, dataFields, canBind, modelEvents, this.Application.Parser.ParseEvents(el.getAttribute('d-model-event-cancel')), canNotify);
            else if (tag === 'span')
                updated = yield this.ResolveModelSpan(context, el, sector, modelOrValue, mustache, mustacheParts, dataFields, canBind, ((isContext) && (!context.CanUpdateTemplate)));
            else if (tag === 'li')
                updated = yield this.ResolveModelLI(context, el, sector, model, mustache, mustacheParts, dataFields, canBind);
            else if (tag === 'div')
                updated = true;
            else if (tag === 'label')
                updated = yield this.ResolveModelSpan(context, el, sector, modelOrValue, mustache, mustacheParts, dataFields, canBind, ((isContext) && (!context.CanUpdateTemplate)));
            else if (tag === 'button')
                updated = yield this.ResolveModelSpan(context, el, sector, modelOrValue, mustache, mustacheParts, dataFields, canBind, ((isContext) && (!context.CanUpdateTemplate)));
            else
                yield this.Application.ExceptionHandler.HandleError('DrapoModelHandler - ResolveModel - model not supported in tag: {0}', tag);
            if ((updated) && (isContext)) {
                const canRemoveModel = ((!context.CanUpdateTemplate) || (context.IsInsideRecursion));
                const dataKey = isMustacheOnly ? this.Application.Solver.ResolveDataKey(mustacheParts) : null;
                if ((canRemoveModel) && ((!isMustacheOnly) || (dataKey === context.Item.Key)))
                    el.removeAttribute('d-model');
            }
            return (updated);
        });
    }
    ResolveValueExpression(context, el, sector, model, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            if (canBind) {
                const mustaches = this.Application.Parser.ParseMustaches(model, true);
                for (let i = 0; i < mustaches.length; i++) {
                    const mustache = mustaches[i];
                    const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                    const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                    const dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
                    this.Application.Binder.BindReader(yield this.Application.Solver.ResolveDataPathObjectItem(context.Item, dataKey, sector), el, dataFields);
                }
            }
            const executionContext = new DrapoExecutionContext(this.Application);
            const value = yield this.Application.FunctionHandler.ResolveFunctions(sector, context.Item, el, executionContext, model, false);
            const valueString = this.Application.Solver.EnsureString(value);
            if (valueString != model)
                return (yield this.ResolveValueExpression(context, el, sector, valueString, canBind));
            return (valueString);
        });
    }
    ResolveModelInput(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = el.getAttribute('type');
            if (type == 'checkbox')
                return (this.ResolveModelInputCheckbox(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify));
            if (type == 'text')
                return (this.ResolveModelInputText(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify));
            if (type == 'number')
                return (this.ResolveModelInputNumber(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify));
            if (type == 'password')
                return (this.ResolveModelInputPassword(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify));
            if (type == 'hidden')
                return (this.ResolveModelInputHidden(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify));
            if (type == 'range')
                return (this.ResolveModelInputRange(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify));
            yield this.Application.ExceptionHandler.HandleError('DrapoModelHandler - ResolveModelInput - model not supported in input type: {0}', type);
            return (false);
        });
    }
    ResolveModelInputCheckbox(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Solver.ResolveConditional(yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, null, canNotify));
            element.checked = value;
            return (true);
        });
    }
    ResolveModelTextArea(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = mustacheParts != null ? yield this.Application.Solver.ResolveDataPath(context, null, el, sector, mustacheParts, canBind, canBind, modelEvents, modelEventsCancel, canNotify) : model;
            el.value = value;
            return (true);
        });
    }
    ResolveModelInputText(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = mustacheParts != null ? yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, modelEventsCancel, canNotify) : model;
            const elementInput = element;
            if (elementInput.value !== value)
                elementInput.value = value;
            return (true);
        });
    }
    ResolveModelInputNumber(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, modelEventsCancel, canNotify);
            const elementInput = element;
            if (elementInput.value !== value)
                elementInput.value = value;
            return (true);
        });
    }
    ResolveModelInputPassword(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, modelEventsCancel, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, modelEventsCancel, canNotify);
            const elementInput = element;
            elementInput.value = value;
            return (true);
        });
    }
    ResolveModelInputHidden(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, null, canNotify);
            const elementInput = element;
            if (elementInput.value !== value)
                elementInput.value = value;
            return (true);
        });
    }
    ResolveModelInputRange(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, null, canNotify);
            const elementInput = element;
            if (elementInput.value !== value)
                elementInput.value = value;
            return (true);
        });
    }
    ResolveModelSelect(context, element, sector, model, mustache, mustacheParts, dataFields, canBind, modelEvents, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, canBind, canBind, modelEvents, null, canNotify);
            const elementSelect = element;
            if (elementSelect.value !== value)
                elementSelect.value = value;
            return (true);
        });
    }
    ResolveModelSpan(context, el, sector, model, mustache, mustacheParts, dataFields, canBind, canClean) {
        return __awaiter(this, void 0, void 0, function* () {
            let updated = true;
            const format = el.getAttribute("d-format");
            let value = mustacheParts != null ? yield this.Application.Solver.ResolveDataPath(context, null, el, sector, mustacheParts, canBind, false) : model;
            if (this.Application.Parser.IsMustache(value)) {
                el.setAttribute('d-model', value);
                value = '';
                updated = false;
            }
            else if ((canClean) && (format != null)) {
                el.removeAttribute('d-model');
            }
            let valueFormatted = value;
            if (format != null) {
                if (canClean)
                    el.removeAttribute('d-format');
                let formatResolved = format;
                while (this.Application.Parser.HasMustache(formatResolved))
                    formatResolved = yield this.Application.Barber.ResolveControlFlowMustacheString(context, null, null, formatResolved, el, sector, false);
                const culture = el.getAttribute("d-culture");
                let cultureResolved = culture;
                if (cultureResolved != null) {
                    if (canClean)
                        el.removeAttribute('d-culture');
                    while (this.Application.Parser.HasMustache(cultureResolved))
                        cultureResolved = yield this.Application.Barber.ResolveControlFlowMustacheString(context, null, null, cultureResolved, el, sector, false);
                }
                const formatTimezone = el.getAttribute("d-format-timezone");
                if ((canClean) && (formatTimezone != null))
                    el.removeAttribute('d-format-timezone');
                const applyTimezone = (formatTimezone != 'false');
                valueFormatted = this.Application.Formatter.Format(value, formatResolved, cultureResolved, applyTimezone);
            }
            const elementSpan = el;
            if (elementSpan.textContent !== valueFormatted)
                elementSpan.textContent = valueFormatted;
            return (updated);
        });
    }
    ResolveModelLI(context, el, sector, model, mustache, mustacheParts, dataFields, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            let updated = true;
            let value = yield this.Application.Solver.ResolveDataPath(context, null, el, sector, mustacheParts, canBind, false);
            if (this.Application.Parser.IsMustache(value)) {
                el.setAttribute('d-model', value);
                value = '';
                updated = false;
            }
            const elementLI = el;
            if (elementLI.textContent !== value)
                elementLI.textContent = value;
            return (updated);
        });
    }
}
//# sourceMappingURL=DrapoModelHandler.js.map