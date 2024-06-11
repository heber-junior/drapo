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
class DrapoBarber {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    HasContentMustacheNodesContext(content) {
        let isInsideTag = false;
        const length = content.length - 1;
        for (let i = 0; i < length; i++) {
            const chr = content[i];
            if (chr == '>') {
                isInsideTag = false;
            }
            else if (chr == '<') {
                isInsideTag = true;
            }
            else if ((!isInsideTag) && (chr === '{')) {
                if (content[i + 1] === '{')
                    return (true);
            }
        }
        return (false);
    }
    HasContentMustacheAttributeContext(content) {
        const attributes = this.Application.Parser.ParseHTMLAttributes(content);
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            const attributeKey = attribute[0];
            if ((attributeKey !== 'value') && (attributeKey !== 'class'))
                continue;
            const attributeValue = attribute[1];
            if (attributeValue.indexOf('{{') >= 0)
                return (true);
        }
        return (false);
    }
    HasContentMustacheAttributeContextMustache(content, attribute) {
        return ((content.indexOf(attribute + '="{{') > -1) || (content.indexOf(attribute + "='{{") > -1));
    }
    ResolveMustaches(el = null, sector = null, stopAtSectors = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el == null)
                el = document.documentElement;
            if (sector === null)
                sector = this.Application.Document.GetSector(el);
            const renderContext = new DrapoRenderContext();
            const context = new DrapoContext();
            this.Application.ControlFlow.InitializeContext(context, el.outerHTML);
            yield this.ResolveMustachesInternal(el, sector, context, renderContext, stopAtSectors);
            yield this.Application.Storage.LoadDataDelayedAndNotify();
        });
    }
    ResolveMustachesInternal(el, sector, context, renderContext, stopAtSectors) {
        return __awaiter(this, void 0, void 0, function* () {
            const pre = el.getAttribute != null ? el.getAttribute('d-pre') : null;
            if (pre === 'true')
                return;
            const children = [].slice.call(el.children);
            const hasChildren = children.length > 0;
            if (hasChildren) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    const childSector = child.getAttribute('d-sector');
                    if (childSector != null) {
                        if (stopAtSectors)
                            continue;
                        sector = childSector;
                    }
                    const canRender = yield this.CanRender(child, sector);
                    if (canRender) {
                        yield this.ResolveMustachesInternal(child, sector, context, renderContext, stopAtSectors);
                    }
                    else {
                        yield this.Application.Document.RemoveElement(child);
                    }
                }
            }
            else {
                yield this.ResolveMustacheElementLeaf(el);
            }
            if (context.CheckID)
                yield this.Application.AttributeHandler.ResolveID(el, sector);
            if (context.CheckAttribute)
                yield this.Application.AttributeHandler.ResolveAttr(el);
            if (context.CheckModel)
                yield this.ResolveModel(el);
            if (context.CheckClass)
                yield this.Application.ClassHandler.ResolveClass(el, sector);
            if (context.CheckValidation)
                yield this.Application.Validator.RegisterValidation(el, sector);
            if (context.CheckEvent)
                yield this.Application.EventHandler.Attach(el, renderContext);
            if (context.CheckBehavior)
                yield this.Application.BehaviorHandler.ResolveBehavior(el);
            yield this.ResolveMustacheElementVisibility(el);
            yield this.ResolveCloak(el);
        });
    }
    CanRender(el, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const dRender = el.getAttribute('d-render');
            if (dRender == null)
                return (true);
            if (this.Application.Barber.HasMustacheContext(dRender, sector))
                return (true);
            const context = new DrapoContext();
            const expression = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, dRender, null, false);
            const result = yield this.Application.Solver.ResolveConditional(expression);
            el.removeAttribute('d-render');
            return (result);
        });
    }
    ResolveFilter(el, sector, canBind, dataKeyFilter, dataFieldFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.Application.Document.IsElementPreprocessed(el))
                return;
            const children = [].slice.call(el.children);
            const hasChildren = children.length > 0;
            if (!hasChildren) {
                yield this.ResolveMustacheElementLeaf(el, false, true, dataKeyFilter, dataFieldFilter);
            }
            yield this.Application.AttributeHandler.ResolveID(el, sector, canBind, true, dataKeyFilter, dataFieldFilter);
            yield this.Application.AttributeHandler.ResolveAttr(el, canBind, true, dataKeyFilter, dataFieldFilter);
            yield this.ResolveModel(el, canBind, true, dataKeyFilter, dataFieldFilter);
            yield this.Application.ClassHandler.ResolveClass(el, sector, canBind, true, dataKeyFilter, dataFieldFilter);
            yield this.ResolveMustacheElementVisibility(el, canBind);
            yield this.Application.Storage.LoadDataDelayedAndNotify();
            yield this.ResolveCloak(el, canBind);
        });
    }
    ResolveElementDelayed(el, sector, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ResolveMustacheElementLeaf(el, true, false, dataKeyFilter, dataFieldFilter);
            yield this.Application.AttributeHandler.ResolveAttr(el, false, false, dataKeyFilter, dataFieldFilter);
            yield this.Application.ClassHandler.ResolveClass(el, sector, false, false, dataKeyFilter, dataFieldFilter);
        });
    }
    ResolveMustacheElementLeaf(el, canUseModel = false, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = this.Application.Document.GetSector(el);
            const model = canUseModel ? el.getAttribute('d-model') : null;
            let text = model != null ? model : this.Application.Document.GetText(el);
            let updated = false;
            const mustaches = this.Application.Parser.ParseMustaches(text);
            for (let i = 0; i < mustaches.length; i++) {
                const mustache = mustaches[i];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                if ((dataKeyFilter != null) && (dataKey != dataKeyFilter))
                    continue;
                if (!this.Application.Storage.IsMustachePartsDataKey(sector, mustacheParts))
                    continue;
                const dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
                const dataField = dataFields[0];
                if ((dataFieldFilter != null) && (dataField != dataFieldFilter))
                    continue;
                if (yield this.Application.Storage.EnsureDataKeyFieldReady(dataKey, sector, mustacheParts)) {
                    const mustacheData = this.Application.Storage.GetDataKeyField(dataKey, sector, mustacheParts);
                    if (mustacheData == null)
                        continue;
                    text = text.replace(mustache, mustacheData);
                    updated = true;
                }
                else if (canSubscribeDelay) {
                    this.Application.Observer.SubscribeDelay(el, dataKey, dataFields);
                }
            }
            if (updated)
                this.Application.Document.SetText(el, text);
        });
    }
    ResolveModel(el, canBind = true, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = el.getAttribute('d-model');
            if (model == null)
                return;
            const sector = this.Application.Document.GetSector(el);
            if (this.Application.Barber.HasMustacheContext(model, sector))
                return;
            const isMustacheOnly = this.Application.Parser.IsMustacheOnly(model, true);
            if (!isMustacheOnly) {
                const context = new DrapoContext();
                yield this.Application.ModelHandler.ResolveModel(context, null, el, sector, canBind, false);
                return;
            }
            const mustaches = this.Application.Parser.ParseMustaches(model);
            if (mustaches.length != 1)
                return;
            const mustache = mustaches[0];
            const mustacheParts = this.Application.Parser.ParseMustache(mustache);
            const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
            if ((dataKeyFilter != null) && (dataKey != dataKeyFilter))
                return;
            if (!this.Application.Storage.IsDataKey(dataKey, sector))
                return;
            const dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
            const dataField = dataFields[0];
            if ((dataFieldFilter != null) && (dataField != dataFieldFilter))
                return;
            if (yield this.Application.Storage.EnsureDataKeyFieldReady(dataKey, sector, mustacheParts)) {
                const context = new DrapoContext();
                const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
                context.Create(data, el, null, dataKey, dataKey, null, null);
                yield this.Application.ModelHandler.ResolveModel(context, null, el, sector, canBind, false);
            }
            else if (canSubscribeDelay) {
                this.Application.Observer.SubscribeDelay(el, dataKey, dataFields);
            }
        });
    }
    ResolveControlFlowMustacheAttributes(context, element, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ResolveControlFlowMustacheAttribute(context, "value", element, sector);
            yield this.ResolveControlFlowMustacheAttribute(context, "class", element, sector);
        });
    }
    ResolveControlFlowMustacheNodes(context, element, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const childNodes = [].slice.call(element.childNodes);
            for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                if (childNode.nodeType != Node.TEXT_NODE)
                    continue;
                let text = childNode.nodeValue;
                const textOriginal = text;
                const mustaches = this.Application.Parser.ParseMustaches(text);
                if (mustaches.length == 0)
                    continue;
                for (let j = 0; j < mustaches.length; j++) {
                    const mustache = mustaches[j];
                    const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                    if ((context !== null) && (!context.CanResolve(mustacheParts[0])))
                        continue;
                    const mustacheData = yield this.Application.Solver.ResolveDataPath(context, null, element, sector, mustacheParts, true);
                    text = text.replace(mustache, mustacheData);
                }
                if (textOriginal !== text)
                    childNode.nodeValue = text;
            }
        });
    }
    ResolveControlFlowMustacheAttribute(context, attribute, el, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            let hasChanges = false;
            let text = el.getAttribute(attribute);
            if (text == null)
                return;
            const mustaches = this.Application.Parser.ParseMustaches(text);
            for (let j = 0; j < mustaches.length; j++) {
                const mustache = mustaches[j];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                if (!context.CanResolve(mustacheParts[0]))
                    continue;
                const mustacheData = yield this.Application.Solver.ResolveDataPath(context, null, el, sector, mustacheParts, true);
                text = text.replace(mustache, mustacheData);
                hasChanges = true;
            }
            if (context.CanUpdateTemplate) {
                if (this.Application.Parser.HasMustache(text)) {
                    if (hasChanges)
                        el.setAttribute(attribute, text);
                    return;
                }
            }
            if (hasChanges)
                el.setAttribute(attribute, text);
        });
    }
    ResolveControlFlowMustacheStringFunction(sector, context, renderContext, executionContext, expression, element, canBind = true, type = DrapoStorageLinkType.Render) {
        return __awaiter(this, void 0, void 0, function* () {
            const expressionWithoutFunctions = yield this.Application.FunctionHandler.ReplaceFunctionExpressions(sector, context, expression, canBind);
            return (this.ResolveControlFlowMustacheString(context, renderContext, executionContext, expressionWithoutFunctions, element, sector, canBind, type));
        });
    }
    ResolveControlFlowMustacheString(context, renderContext, executionContext, expression, element, sector, canBind = true, type = DrapoStorageLinkType.Render, isForIterator = false, elementForTemplate = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const mustaches = this.Application.Parser.ParseMustaches(expression);
            for (let j = 0; j < mustaches.length; j++) {
                const mustache = mustaches[j];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                const dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
                if ((this.Application.Storage.IsDataKey(dataKey, sector, renderContext)) && (!this.Application.Storage.IsDataKeyExecution(dataKey))) {
                    yield this.Application.Storage.EnsureDataKeyFieldReady(dataKey, sector, mustacheParts);
                    let mustacheData = this.Application.Storage.GetDataKeyField(dataKey, sector, mustacheParts);
                    mustacheData = this.Application.Solver.EnsureString(mustacheData);
                    if (canBind) {
                        if (isForIterator) {
                            this.Application.Observer.SubscribeLink(dataKey, context.GetDataKeyRoot(), dataFields);
                        }
                        else {
                            const contextDataKey = new DrapoContext();
                            const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
                            contextDataKey.Create(data, element, null, dataKey, dataKey, null, null);
                            this.Application.Binder.BindReader(contextDataKey.Item, element, dataFields);
                            if ((context != null) && (context.Item != null) && (dataKey !== context.Item.DataKey))
                                this.Application.Observer.SubscribeStorage(dataKey, dataFields, context.Item.DataKey, type);
                        }
                    }
                    expression = expression.replace(mustache, mustacheData);
                }
                else {
                    let mustacheData = context.Item === null ? '' : yield this.Application.Solver.ResolveDataPath(context, executionContext, element, sector, mustacheParts, canBind);
                    mustacheData = this.Application.Solver.EnsureString(mustacheData);
                    expression = expression.replace(mustache, mustacheData);
                }
            }
            return (expression);
        });
    }
    ResolveMustacheElementVisibility(el, canBind = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const elFor = el.getAttribute('d-for');
            if (elFor != null)
                return;
            const elIF = el.getAttribute('d-if');
            if (elIF == null)
                return;
            const sector = this.Application.Document.GetSector(el);
            if (this.Application.Barber.HasMustacheContext(elIF, sector))
                return;
            const context = new DrapoContext();
            const visibility = yield this.Application.Solver.ResolveConditional(elIF, el, sector, context);
            if (visibility)
                this.Application.Document.Show(el);
            else
                this.Application.Document.Hide(el);
        });
    }
    HasMustacheContext(expression, sector, renderContext = null) {
        const valueCache = this.HasMustacheContextInternal(expression, sector, renderContext);
        return (valueCache);
    }
    HasMustacheContextInternal(expression, sector, renderContext = null) {
        const mustaches = this.Application.Parser.ParseMustaches(expression, true);
        for (let j = 0; j < mustaches.length; j++) {
            const mustache = mustaches[j];
            const mustacheParts = this.Application.Parser.ParseMustache(mustache);
            const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
            const isDataKey = this.Application.Storage.IsDataKey(dataKey, sector, renderContext);
            if (!isDataKey)
                return (true);
        }
        return (false);
    }
    ResolveCloak(el, canBind = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const elCloak = el.getAttribute('d-cloak');
            if (elCloak == null)
                return;
            el.classList.remove(elCloak);
        });
    }
}
//# sourceMappingURL=DrapoBarber.js.map