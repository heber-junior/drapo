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
class DrapoControlFlow {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    ResolveControlFlowDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            const els = this.Application.Searcher.FindAllByAttribute('d-for');
            yield this.ResolveControlFlowForArray(els);
        });
    }
    ResolveControlFlowSector(el, canResolveComponents = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el == null)
                return;
            const els = this.Application.Searcher.FindAllByAttributeFromParent('d-for', el);
            yield this.ResolveControlFlowForArray(els, false, true, DrapoStorageLinkType.Render, canResolveComponents);
        });
    }
    ResolveControlFlowForParent(forElement) {
        let forElementParent = null;
        while ((forElementParent = forElement.parentElement) != null) {
            if (forElementParent.getAttribute('d-for') != null)
                return (forElementParent);
            forElement = forElementParent;
        }
        return (null);
    }
    ResolveControlFlowForRoot(forElement) {
        let forElementParent = null;
        while ((forElementParent = this.ResolveControlFlowForParent(forElement)) != null) {
            forElement = forElementParent;
        }
        return (forElement);
    }
    ResolveControlFlowForElement(forElement, isIncremental = false, canUseDifference = true, type = DrapoStorageLinkType.Render, canResolveComponents = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const forElements = [];
            forElements.push(forElement);
            return (yield this.ResolveControlFlowForArray(forElements, isIncremental, canUseDifference, type, canResolveComponents));
        });
    }
    ResolveControlFlowForArray(forElements, isIncremental = false, canUseDifference = true, type = DrapoStorageLinkType.Render, canResolveComponents = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const forElementsInserted = [];
            for (let i = 0; i < forElements.length; i++) {
                const forElement = forElements[i];
                const forElementRoot = this.ResolveControlFlowForRoot(forElement);
                if (!this.Application.Document.IsElementInserted(forElementsInserted, forElementRoot))
                    continue;
                if (this.Application.Document.IsElementPreprocessed(forElement))
                    continue;
                if (this.Application.Document.IsElementInsideComponent(forElement))
                    continue;
                const context = new DrapoContext();
                const sector = this.Application.Document.GetSector(forElementRoot);
                context.Sector = sector;
                if (!this.Application.Document.IsSectorReady(sector))
                    continue;
                const renderContext = new DrapoRenderContext();
                yield this.ResolveControlFlowForInternal(sector, context, renderContext, forElementRoot, isIncremental, canUseDifference, type, canResolveComponents);
            }
        });
    }
    InitializeContext(context, content) {
        if (this.Application.Barber.HasContentMustacheNodesContext(content))
            context.CheckMustacheNodes = true;
        if (this.Application.ModelHandler.HasContentModelContext(content))
            context.CheckModel = true;
        if (this.Application.Barber.HasContentMustacheAttributeContext(content))
            context.CheckMustacheAttributes = true;
        if (this.Application.AttributeHandler.HasContentIDContext(content))
            context.CheckID = true;
        if (this.Application.AttributeHandler.HasContentAttributeContext(content))
            context.CheckAttribute = true;
        if (this.Application.ClassHandler.HasContentClassContext(content))
            context.CheckClass = true;
        if (this.Application.EventHandler.HasContentEventContext(content))
            context.CheckEvent = true;
        if (this.Application.BehaviorHandler.HasContentBehaviorContext(content))
            context.CheckBehavior = true;
        if (this.Application.ComponentHandler.HasContentComponent(content))
            context.CheckComponent = true;
        if (this.Application.Validator.HasContentValidation(content))
            context.CheckValidation = true;
        context.Checkpoint();
    }
    IsElementControlFlowTemplate(el) {
        const forText = el.getAttribute('d-for');
        if (forText === null)
            return (false);
        return (el.style.display === 'none');
    }
    ResolveControlFlowForInternal(sector, context, renderContext, elFor, isIncremental, canUseDifference = true, type = DrapoStorageLinkType.Render, canResolveComponents = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let forText = elFor.getAttribute('d-for');
            let ifText = null;
            let forIfText = null;
            let wasWrapped = false;
            let viewportBeforeScrollPosition = 0;
            if (forText == null) {
                const wrapper = this.Application.Document.GetWrapper(elFor);
                forText = wrapper != null ? wrapper.getAttribute('d-for') : null;
                if (forText == null)
                    return (false);
                wasWrapped = true;
                ifText = wrapper.getAttribute('d-if');
                forIfText = wrapper.getAttribute('d-for-if');
            }
            const parsedFor = this.Application.Parser.ParseFor(forText);
            if (parsedFor == null)
                return (false);
            const key = parsedFor[0];
            const dataKeyIteratorRange = parsedFor[2];
            const forElementRecursive = isIncremental ? null : context.GetElementTemplate(key);
            const elementForTemplate = forElementRecursive != null ? forElementRecursive : elFor;
            if (ifText == null)
                ifText = elementForTemplate.getAttribute('d-if');
            const hasIfText = (ifText != null);
            if (forIfText == null)
                forIfText = elementForTemplate.getAttribute('d-for-if');
            const hasForIfText = (forIfText != null);
            let conditionalForIfResult = true;
            const isContextRoot = context.IsEmpty;
            const elAnchor = (isContextRoot) ? this.Application.Document.Hide(elFor) : elFor;
            const content = isContextRoot ? elFor.outerHTML : null;
            if (isContextRoot)
                this.InitializeContext(context, content);
            const dForRender = elementForTemplate.getAttribute('d-for-render');
            const dForRenders = ((dForRender == null) || (dForRender == '')) ? [] : this.Application.Parser.ParseBlock(dForRender, ',');
            const isHTML = this.Application.Solver.Contains(dForRenders, 'html');
            const isViewport = this.Application.Solver.Contains(dForRenders, 'viewport');
            let hasViewPortBefore = (isViewport) && (this.Application.ViewportHandler.HasElementViewport(elementForTemplate));
            const hasViewPortbeforeRecycle = ((hasViewPortBefore) && ((!canUseDifference) || (isViewport)));
            if (hasViewPortbeforeRecycle) {
                hasViewPortBefore = false;
                const viewportBefore = this.Application.ViewportHandler.GetElementViewport(elementForTemplate);
                viewportBeforeScrollPosition = viewportBefore.ElementScroll.scrollTop;
                this.Application.ViewportHandler.DestroyViewportControlFlow(viewportBefore);
                const itemsViewport = this.Application.Document.GetNextAll(elAnchor);
                this.RemoveList(itemsViewport);
            }
            let isDifference = ((canUseDifference) && ((!isViewport) || (hasViewPortBefore)) && (!isIncremental) && (!hasIfText));
            const isLastChild = this.Application.Document.IsLastChild(elAnchor);
            if ((isDifference) && (isContextRoot) && (isLastChild))
                isDifference = false;
            const isContextRootFull = ((isContextRoot) && (!isDifference));
            const isFirstChild = this.Application.Document.IsFirstChild(elAnchor);
            const isContextRootFullExclusive = ((isContextRootFull) && (isFirstChild) && (!wasWrapped));
            const elForParent = elAnchor.parentElement;
            if (hasForIfText)
                conditionalForIfResult = yield this.Application.Solver.ResolveConditional(forIfText, null, sector, context, renderContext);
            const items = isContextRootFullExclusive ? null : this.Application.Document.GetNextAll(elAnchor);
            let dataItem = null;
            let datas = null;
            const range = this.GetIteratorRange(dataKeyIteratorRange);
            const dataKeyIterator = range == null ? dataKeyIteratorRange : this.CleanIteratorRange(dataKeyIteratorRange);
            let dataKey = dataKeyIterator;
            if (this.IsControlFlowDataKeyIterator(dataKeyIterator)) {
                datas = yield this.GetControlFlowDataKeyIterators(context, renderContext, elementForTemplate, dataKeyIterator);
            }
            else {
                const dataKeyIteratorParts = this.Application.Parser.ParseForIterable(dataKeyIterator);
                dataKey = dataKeyIteratorParts[0];
                const isDataKey = this.Application.Storage.IsDataKey(dataKey, sector);
                if (isDataKey) {
                    const dataKeyRoot = context.GetDataKeyRoot();
                    if (dataKeyRoot === null) {
                        this.Application.Observer.UnsubscribeFor(dataKey, elementForTemplate);
                        this.Application.Observer.SubscribeFor(elementForTemplate, dataKey);
                    }
                    else if (dataKeyRoot !== dataKey) {
                        this.Application.Observer.SubscribeLink(dataKey, dataKeyRoot);
                    }
                    if (hasForIfText)
                        this.Application.Observer.SubscribeLinkMustache(forIfText, dataKey);
                }
                if (conditionalForIfResult) {
                    if (this.HasContextIterators(context, dataKeyIteratorParts)) {
                        datas = this.GetContextIteratorsData(context, dataKeyIteratorParts);
                    }
                    else {
                        dataItem = yield this.Application.Storage.Retrieve(dataKey, sector, context, dataKeyIteratorParts);
                        if (dataItem == null)
                            return (false);
                        if ((isDataKey) && (dataKeyIteratorParts.length > 1)) {
                            datas = this.Application.Solver.ResolveDataObjectPathObject(dataItem.Data, dataKeyIteratorParts);
                        }
                        else {
                            datas = dataItem.Data;
                        }
                    }
                }
                else {
                    datas = [];
                }
            }
            if (datas == null)
                return (false);
            if (!datas.length)
                datas = this.Application.Solver.TransformObjectIntoArray(datas);
            if (range !== null)
                datas = this.ApplyRange(datas, range);
            let lastInserted = elAnchor;
            let start = 0;
            if (isIncremental) {
                const nextElements = this.Application.Document.GetNextAll(elAnchor);
                start = this.Application.Document.GetIndex(elAnchor) + nextElements.length;
                if (nextElements.length > 0)
                    lastInserted = nextElements[nextElements.length - 1];
            }
            if ((!isDifference) && (type == DrapoStorageLinkType.RenderClass))
                type = DrapoStorageLinkType.Render;
            if ((!isIncremental) && (!isDifference) && (!isContextRootFullExclusive) && (!isViewport))
                this.RemoveList(items);
            if (isDifference) {
                const dataLength = datas.length;
                for (let i = items.length - 1; i >= dataLength; i--) {
                    this.RemoveListIndex(items, i);
                }
            }
            if ((datas.length !== null) && (datas.length === 0)) {
                if (isIncremental)
                    return (false);
                if (isContextRootFullExclusive) {
                    this.Application.Observer.UnsubscribeFor(dataKey, elementForTemplate);
                    if (!isLastChild)
                        this.Application.Document.SetHTML(elForParent, content);
                    const template = elForParent.children[0];
                    this.Application.Observer.SubscribeFor(template, dataKey);
                }
                return (false);
            }
            this.Application.Observer.IsEnabledNotifyIncremental = false;
            let forReferenceTemplate = this.Application.Document.Clone(elementForTemplate);
            if ((isContextRoot) || (context.IsInsideRecursion))
                forReferenceTemplate = this.Application.Document.Show(forReferenceTemplate);
            forReferenceTemplate.removeAttribute('d-for');
            if (ifText != null)
                forReferenceTemplate.removeAttribute('d-if');
            const isHash = this.Application.Solver.Contains(dForRenders, 'hash');
            const hashTemplate = isHash ? this.GetElementHashTemplate(elementForTemplate) : null;
            const useHash = hashTemplate !== null;
            const length = datas.length;
            const canCreateViewport = ((isContextRoot) && (isFirstChild) && (!wasWrapped) && (!hasIfText) && (range === null));
            const viewport = (canCreateViewport && isViewport) ? this.Application.ViewportHandler.CreateViewportControlFlow(sector, elementForTemplate, forReferenceTemplate, dataKey, key, dataKeyIteratorRange, datas) : null;
            const isViewportActive = ((viewport != null) && (viewport.IsActive));
            if (dForRender != null)
                forReferenceTemplate.removeAttribute('d-for-render');
            lastInserted = this.Application.ViewportHandler.CreateViewportControlFlowBallonBefore(viewport, lastInserted);
            let canFragmentElements = viewport == null;
            const fragment = document.createDocumentFragment();
            const canUseTemplate = isContextRootFullExclusive && (type == DrapoStorageLinkType.Render) && (datas.length > 3);
            const templateVariables = canUseTemplate ? (yield this.GetTemplateVariables(sector, context, dataKey, key, forReferenceTemplate)) : null;
            let nodesRemovedCount = 0;
            const startViewport = this.Application.ViewportHandler.GetViewportControlFlowStart(viewport, start);
            let endViewport = this.Application.ViewportHandler.GetViewportControlFlowEnd(viewport, length);
            if (isViewportActive)
                context.Initialize(startViewport - 1);
            for (let j = startViewport; j < endViewport; j++) {
                const data = datas[j];
                const templateKey = templateVariables !== null ? yield this.CreateTemplateKey(sector, context, dataKey, templateVariables, data, key, j) : null;
                let templateData = templateKey !== null ? yield this.GetTemplateFromTemplateKey(context, templateKey) : null;
                if ((templateKey !== null) && (templateData === null)) {
                    templateData = yield this.CreateTemplate(sector, context, renderContext, this.Application.Document.Clone(forReferenceTemplate), dataKey, key, j, data);
                    this.AddTemplate(context, templateKey, templateData);
                }
                const template = templateData !== null ? this.Application.Document.Clone(templateData) : this.Application.Document.Clone(forReferenceTemplate);
                const viewportIndexDifference = (isViewportActive ? (1 - startViewport) : 0);
                const nodeIndex = j - nodesRemovedCount + viewportIndexDifference;
                const oldNode = ((items !== null) && (nodeIndex < items.length)) ? items[nodeIndex] : null;
                const item = context.Create(data, template, elementForTemplate, dataKey, key, dataKeyIterator, j, oldNode);
                if ((hasIfText) && (!(yield this.Application.Solver.ResolveConditional(ifText, template, sector, context, renderContext, elementForTemplate)))) {
                    if ((isDifference) && (oldNode !== null))
                        this.RemoveListIndex(items, nodeIndex);
                    nodesRemovedCount++;
                    context.Pop();
                    continue;
                }
                if (type == DrapoStorageLinkType.Render) {
                    const hashValueBefore = ((useHash) && (oldNode != null)) ? oldNode.getAttribute('d-hash') : null;
                    const hashValueCurrent = hashTemplate === null ? null : yield this.GetElementHashValue(sector, context, template, hashTemplate);
                    const applyHash = ((!useHash) || (hashValueCurrent !== hashValueBefore));
                    if (applyHash)
                        yield this.ResolveControlFlowForIterationRender(sector, context, template, renderContext, true, canResolveComponents);
                    if (((isDifference) || (isViewportActive)) && (oldNode != null)) {
                        if (applyHash)
                            this.Application.Document.ApplyNodeDifferences(oldNode.parentElement, oldNode, template, isHTML);
                        if (hashValueCurrent !== null)
                            oldNode.setAttribute('d-hash', hashValueCurrent);
                        lastInserted = oldNode;
                    }
                    else if (canFragmentElements) {
                        if (hashValueCurrent !== null)
                            template.setAttribute('d-hash', hashValueCurrent);
                        fragment.appendChild(template);
                    }
                    else {
                        lastInserted.after(template);
                        lastInserted = template;
                        if (hashValueCurrent !== null)
                            template.setAttribute('d-hash', hashValueCurrent);
                        if (!this.Application.ViewportHandler.HasHeightChanged(viewport)) {
                            this.Application.ViewportHandler.UpdateHeightItem(viewport, template);
                            endViewport = this.Application.ViewportHandler.GetViewportControlFlowEnd(viewport, length);
                            canFragmentElements = true;
                        }
                    }
                }
                else if (type == DrapoStorageLinkType.RenderClass) {
                    yield this.ResolveControlFlowForIterationRenderClass(context, renderContext, template, sector);
                    if (oldNode != null)
                        this.Application.Document.ApplyNodeDifferencesRenderClass(oldNode, template);
                }
            }
            this.Application.ViewportHandler.AppendViewportControlFlowBallonAfter(viewport, fragment);
            if ((viewport == null) && (isContextRootFullExclusive) && (!isIncremental)) {
                this.Application.Observer.UnsubscribeFor(dataKey, elementForTemplate);
                if (elForParent.children.length !== 1)
                    this.Application.Document.SetHTML(elForParent, content);
                const template = elForParent.children[0];
                this.Application.Observer.SubscribeFor(template, dataKey);
                elForParent.append(fragment);
                elFor = template;
            }
            else {
                if (fragment.childNodes.length > 0)
                    lastInserted.after(fragment);
            }
            this.Application.ViewportHandler.ActivateViewportControlFlow(viewport, lastInserted);
            this.Application.Observer.IsEnabledNotifyIncremental = true;
            if ((context.IsInsideRecursion) && (!context.IsElementTemplateRoot(key)))
                yield this.Application.Document.RemoveElement(elementForTemplate, false);
            if ((dataItem != null) && (dataItem.IsIncremental))
                yield this.Application.Binder.BindIncremental(elFor, dataKeyIterator, sector, isIncremental);
            if (isContextRoot) {
                yield this.Application.ComponentHandler.UnloadComponentInstancesDetached(sector);
                yield this.Application.Document.CollectSector(sector);
            }
            if (hasViewPortbeforeRecycle) {
                viewport.ElementScroll.scrollTop = viewportBeforeScrollPosition;
                yield this.ResolveControlFlowForViewportScroll(viewport);
            }
        });
    }
    ResolveControlFlowForIterationRender(sector, context, element, renderContext, isStart, canResolveComponents) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.CheckMustacheNodes)
                yield this.Application.Barber.ResolveControlFlowMustacheNodes(context, element, sector);
            const children = [].slice.call(element.children);
            const hasChildren = children.length > 0;
            if (hasChildren) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    const forText = child.getAttribute('d-for');
                    if (forText != null) {
                        const ifText = child.getAttribute('d-if');
                        const hasIfText = (ifText != null);
                        const applyConditional = ((hasIfText) && (this.CanApplyConditional(context, forText, ifText)));
                        if ((!applyConditional) || (yield this.Application.Solver.ResolveConditional(ifText, null, sector, context, renderContext))) {
                            context.Down();
                            yield this.ResolveControlFlowForInternal(sector, context, renderContext, child, false, true, DrapoStorageLinkType.Render);
                            context.Up();
                        }
                        yield this.Application.Document.RemoveElement(child);
                        children.splice(i, 1);
                        i--;
                    }
                    else {
                        if (!(yield this.IsControlFlowForIterationVisible(sector, context, child, renderContext))) {
                            yield this.Application.Document.RemoveElement(child);
                            children.splice(i, 1);
                            i--;
                            continue;
                        }
                        if (context.CheckMustacheAttributes)
                            yield this.Application.Barber.ResolveControlFlowMustacheAttributes(context, child, sector);
                        yield this.ResolveControlFlowForIterationRender(sector, context, child, renderContext, false, canResolveComponents);
                        if (context.CheckID)
                            yield this.Application.AttributeHandler.ResolveIDContext(context, child, sector, true);
                        if (context.CheckAttribute)
                            yield this.Application.AttributeHandler.ResolveAttrContext(context, child, true);
                        if (context.CheckModel)
                            yield this.Application.ModelHandler.ResolveModel(context, renderContext, child, sector, true, true);
                        if (context.CheckClass)
                            yield this.Application.ClassHandler.ResolveClassContext(context, renderContext, child, sector, true, DrapoStorageLinkType.Render);
                        if (context.CheckEvent)
                            yield this.Application.EventHandler.AttachContext(context, child, sector, renderContext);
                        if (context.CheckBehavior)
                            yield this.Application.BehaviorHandler.ResolveBehaviorContext(context, child, true);
                        if (context.CheckComponent)
                            yield this.Application.ComponentHandler.ResolveComponentContext(sector, context, child, renderContext, canResolveComponents);
                        if (context.CheckValidation)
                            yield this.Application.Validator.RegisterValidation(child, sector, context);
                    }
                }
            }
            if ((isStart) || (!hasChildren)) {
                if (context.CheckID)
                    yield this.Application.AttributeHandler.ResolveIDContext(context, element, sector, true);
                if (context.CheckAttribute)
                    yield this.Application.AttributeHandler.ResolveAttrContext(context, element, true);
                if (context.CheckModel)
                    yield this.Application.ModelHandler.ResolveModel(context, renderContext, element, sector, true, true);
                if (context.CheckClass)
                    yield this.Application.ClassHandler.ResolveClassContext(context, renderContext, element, sector, true, DrapoStorageLinkType.RenderClass);
                if (context.CheckEvent)
                    yield this.Application.EventHandler.AttachContext(context, element, sector, renderContext);
                if (context.CheckBehavior)
                    yield this.Application.BehaviorHandler.ResolveBehaviorContext(context, element, true);
                if (context.CheckComponent)
                    yield this.Application.ComponentHandler.ResolveComponentContext(sector, context, element, renderContext, canResolveComponents);
                if (context.CheckValidation)
                    yield this.Application.Validator.RegisterValidation(element, sector, context);
                if ((!hasChildren) && (context.CheckMustacheAttributes))
                    yield this.Application.Barber.ResolveControlFlowMustacheAttributes(context, element, sector);
            }
        });
    }
    CanApplyConditional(context, forText, ifText) {
        const parsedFor = this.Application.Parser.ParseFor(forText);
        if (parsedFor == null)
            return (true);
        const key = parsedFor[0];
        if (context.IsKey(key))
            return (true);
        const index = ifText.indexOf('{{' + key);
        return (index < 0);
    }
    ResolveControlFlowForIterationRenderClass(context, renderContext, element, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.ClassHandler.ResolveClassContext(context, renderContext, element, sector, true, DrapoStorageLinkType.RenderClass);
        });
    }
    IsControlFlowForIterationVisible(sector, context, el, renderContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const ifText = el.getAttribute('d-if');
            if (ifText == null)
                return (true);
            if (!(yield this.Application.FunctionHandler.HasFunctionMustacheContext(ifText, sector, renderContext)))
                return (true);
            const value = yield this.Application.Solver.ResolveConditional(ifText, null, sector, context, renderContext);
            if (value)
                el.removeAttribute('d-if');
            return (value);
        });
    }
    RemoveList(els) {
        if (els === null)
            return;
        for (let i = els.length - 1; i >= 0; i--)
            this.RemoveListIndex(els, i);
    }
    RemoveListIndex(els, index) {
        const node = els[index];
        if (node.parentElement != null)
            node.parentElement.removeChild(node);
        els.splice(index, 1);
    }
    IsControlFlowDataKeyIterator(dataKey) {
        return (this.Application.Parser.IsIterator(dataKey));
    }
    GetControlFlowDataKeyIterators(context, renderContext, elementForTemplate, expression) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = this.Application.Document.GetSector(elementForTemplate);
            const mustaches = this.Application.Parser.ParseMustaches(expression);
            for (let i = 0; i < mustaches.length; i++) {
                const mustache = mustaches[i];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                if (!this.Application.Storage.IsDataKey(dataKey, sector, renderContext))
                    continue;
                this.Application.Observer.UnsubscribeFor(dataKey, elementForTemplate);
                this.Application.Observer.SubscribeFor(elementForTemplate, dataKey);
            }
            const data = yield this.Application.Barber.ResolveControlFlowMustacheString(context, renderContext, null, expression, elementForTemplate, sector, true, null, true, elementForTemplate);
            return (this.Application.Parser.ParseIterator(data));
        });
    }
    GetElementHashTemplate(el) {
        const content = el.outerHTML;
        const mustaches = this.Application.Parser.ParseMustaches(content);
        let template = '';
        for (let i = 0; i < mustaches.length; i++) {
            if (i > 0)
                template = template + '_';
            template = template + mustaches[i];
        }
        return (template);
    }
    GetElementHashValue(sector, context, el, hashTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashValue = yield this.Application.ModelHandler.ResolveValueExpression(context, el, sector, hashTemplate, false);
            return (hashValue);
        });
    }
    GetTemplateVariables(sector, context, dataKey, key, template) {
        return __awaiter(this, void 0, void 0, function* () {
            const elsFor = this.Application.Searcher.FindAllByAttributeFromParent('d-for', template);
            if (elsFor.length < 1)
                return (null);
            const dataKeys = yield this.GetControlFlowExpressionsDataKey(sector, elsFor);
            if ((dataKeys == null) || (dataKeys.length < 1))
                return (null);
            const elIfs = this.Application.Searcher.FindAllByAttributeFromParent('d-if', template);
            if (elIfs.length < 1)
                return ([]);
            return (this.GetControlFlowConditionsDataKey(sector, dataKey, key, elIfs));
        });
    }
    GetControlFlowExpressionsDataKey(sector, elsFor) {
        const dataKeys = [];
        for (let i = 0; i < elsFor.length; i++) {
            const elForCurrent = elsFor[i];
            const forText = elForCurrent.getAttribute('d-for');
            const parsedFor = this.Application.Parser.ParseFor(forText);
            if (parsedFor == null)
                continue;
            const dataKey = parsedFor[2];
            const dataKeyIteratorParts = this.Application.Parser.ParseForIterable(dataKey);
            if (dataKeyIteratorParts.length !== 1)
                return (null);
            const isDataKey = this.Application.Storage.IsDataKey(dataKey, sector);
            if (!isDataKey)
                return (null);
            dataKeys.push(dataKey);
        }
        return (dataKeys);
    }
    GetControlFlowConditionsDataKey(sector, dataKey, key, elIfs) {
        const dataPaths = [];
        for (let i = 0; i < elIfs.length; i++) {
            const elIfCurrent = elIfs[i];
            const ifText = elIfCurrent.getAttribute('d-if');
            const mustaches = this.Application.Parser.ParseMustaches(ifText);
            for (let j = 0; j < mustaches.length; j++) {
                const mustache = mustaches[j];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                if (mustacheParts[0] !== key)
                    continue;
                dataPaths.push(mustacheParts);
            }
        }
        return (dataPaths);
    }
    CreateTemplateKey(sector, context, dataKey, templateVariables, data, key, index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (templateVariables.length === 0)
                return ('_');
            let templateKey = '';
            context.Create(data, null, null, dataKey, key, null, index);
            for (let i = 0; i < templateVariables.length; i++) {
                const mustacheParts = templateVariables[i];
                const mustacheResolved = yield this.Application.Solver.ResolveDataPath(context, null, null, sector, mustacheParts);
                templateKey = templateKey + '_' + mustacheResolved;
            }
            context.Pop();
            return (templateKey);
        });
    }
    CreateTemplate(sector, context, renderContext, el, dataKey, key, index, data) {
        return __awaiter(this, void 0, void 0, function* () {
            context.CanUpdateTemplate = true;
            context.Create(data, el, null, dataKey, key, null, index);
            yield this.ResolveControlFlowForIterationRender(sector, context, el, renderContext, true, false);
            context.Pop();
            context.CanUpdateTemplate = false;
            return (el);
        });
    }
    GetTemplateFromTemplateKey(context, templateKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return (context.GetTemplate(templateKey));
        });
    }
    AddTemplate(context, templateKey, template) {
        context.AddTemplate(templateKey, template);
    }
    GetIteratorRange(iterator) {
        const rangeString = this.GetIteratorRangeString(iterator);
        if (rangeString === null)
            return (null);
        const range = this.GetIteratorRangeInternal(rangeString);
        if (!this.IsValidRange(range)) {
            this.Application.ExceptionHandler.HandleError('DrapoFunctionHandler - GetIteratorRange - Invalid Iterator Range - {0}', iterator);
        }
        return (range);
    }
    GetIteratorRangeInternal(rangeString) {
        const index = rangeString.indexOf('..');
        if (index === -1)
            return (new DrapoRange(rangeString, rangeString));
        if (index === 0)
            return (new DrapoRange(null, rangeString.substr(2)));
        if (index === rangeString.length - 2)
            return (new DrapoRange(rangeString.substr(0, rangeString.length - 2)));
        return (new DrapoRange(rangeString.substr(0, index), rangeString.substr(index + 2)));
    }
    GetIteratorRangeString(iterator) {
        if (iterator[iterator.length - 1] !== ']')
            return (null);
        const index = iterator.lastIndexOf('[');
        if (index < 1)
            return (null);
        if (iterator[0] === '{')
            return (null);
        return (iterator.substring(index + 1, iterator.length - 1));
    }
    CleanIteratorRange(iterator) {
        const index = iterator.lastIndexOf('[');
        if (index === -1)
            return (iterator);
        return (iterator.substring(0, index));
    }
    IsValidRange(range) {
        if (!this.IsValidRangeIndex(range.Start))
            return (false);
        if (!this.IsValidRangeIndex(range.End))
            return (false);
        return (true);
    }
    IsValidRangeIndex(rangeIndex) {
        if (rangeIndex === null)
            return (true);
        const isHat = rangeIndex[0] === '^';
        if (isHat)
            return (this.Application.Parser.IsNumber(rangeIndex.substr(1)));
        return (this.Application.Parser.IsNumber(rangeIndex));
    }
    ApplyRange(data, range) {
        const start = range.Start == null ? 0 : this.GetRangeIndex(data, range.Start);
        const end = range.End === null ? data.length : this.GetRangeIndex(data, range.End);
        const isCrescent = end > start;
        const dataRange = [];
        for (let i = start; ((isCrescent) && (i < end)) || ((!isCrescent) && (i >= end)); isCrescent ? i++ : i--) {
            if (i < 0)
                continue;
            if (i >= data.length)
                continue;
            dataRange.push(data[i]);
        }
        return (dataRange);
    }
    GetRangeIndex(data, rangeIndex) {
        const isHat = rangeIndex[0] === '^';
        const number = this.Application.Parser.ParseNumber(isHat ? rangeIndex.substr(1) : rangeIndex);
        const numberHat = isHat ? data.length - number : number;
        if (numberHat < 0)
            return (0);
        if (numberHat > data.length)
            return (data.length);
        return (numberHat);
    }
    HasContextIterators(context, dataKeyIteratorParts) {
        if (dataKeyIteratorParts.length != 1)
            return (false);
        const key = dataKeyIteratorParts[0];
        const item = this.GetContextItemByKey(context, key);
        return (item != null);
    }
    GetContextIteratorsData(context, dataKeyIteratorParts) {
        if (dataKeyIteratorParts.length < 1)
            return ([]);
        const key = dataKeyIteratorParts[0];
        const item = this.GetContextItemByKey(context, key);
        const datas = this.Application.Solver.ResolveDataObjectPathObject(item.Data, dataKeyIteratorParts);
        return (datas);
    }
    GetContextItemByKey(context, key) {
        for (let i = 0; i < context.ItemsCurrentStack.length; i++) {
            const item = context.ItemsCurrentStack[i];
            if (item.Key == key)
                return (item);
        }
        return (null);
    }
    ExecuteDataItem(sector, context, expression, iterator, forText, ifText, all, datas, dataKey, key, executionContext = null) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let j = 0; j < datas.length; j++) {
                const data = datas[j];
                const item = context.Create(data, null, null, dataKey, key, iterator, j);
                let execute = true;
                if (ifText != null) {
                    const conditionalText = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, executionContext, ifText, null);
                    const conditional = yield this.Application.Solver.ResolveConditional(conditionalText);
                    if (!conditional) {
                        context.Pop();
                        execute = false;
                    }
                }
                if (execute) {
                    yield this.Application.FunctionHandler.ResolveFunction(sector, context.Item, null, null, expression, executionContext);
                    if (!all)
                        return (true);
                }
                if (forText == null)
                    continue;
                const parsedFor = this.Application.Parser.ParseFor(forText);
                if (parsedFor == null)
                    continue;
                const keyChildren = parsedFor[0];
                const dataKeyIteratorRange = parsedFor[2];
                const range = this.GetIteratorRange(dataKeyIteratorRange);
                const dataKeyIterator = range == null ? dataKeyIteratorRange : this.CleanIteratorRange(dataKeyIteratorRange);
                const dataKeyChildren = dataKeyIterator;
                const dataKeyIteratorParts = this.Application.Parser.ParseForIterable(dataKeyIterator);
                let datasChildren = this.Application.Solver.ResolveDataObjectPathObject(data, dataKeyIteratorParts);
                if (range !== null)
                    datasChildren = this.Application.ControlFlow.ApplyRange(datasChildren, range);
                if (datasChildren.length === 0)
                    continue;
                const childExecuted = yield this.ExecuteDataItem(sector, context, expression, dataKeyIterator, forText, ifText, all, datasChildren, dataKeyChildren, keyChildren, executionContext);
                if ((childExecuted) && (!all))
                    return (true);
            }
            return (false);
        });
    }
    ResolveControlFlowForViewportScroll(viewport) {
        return __awaiter(this, void 0, void 0, function* () {
            const view = this.Application.ViewportHandler.GetView(viewport);
            if (view === null)
                return;
            const dForRender = viewport.Element.getAttribute('d-for-render');
            const dForRenders = (dForRender == null) || (dForRender == '') ? [] : this.Application.Parser.ParseBlock(dForRender, ',');
            const isHash = this.Application.Solver.Contains(dForRenders, 'hash');
            const hashTemplate = isHash ? this.GetElementHashTemplate(viewport.Element) : null;
            const rowsBeforeRemove = view[0];
            const rowsBeforeInsertStart = view[1];
            const rowsBeforeInsertEnd = view[2];
            const rowsAfterRemove = view[3];
            const rowsAfterInsertStart = view[4];
            const rowsAfterInsertEnd = view[5];
            if (rowsBeforeRemove !== null) {
                if (rowsBeforeRemove === -1) {
                    let rowRemove = viewport.ElementBallonBefore.nextElementSibling;
                    const elBallonAfter = viewport.ElementBallonAfter;
                    while ((rowRemove != null) && (rowRemove !== elBallonAfter)) {
                        const rowNext = rowRemove.nextElementSibling;
                        rowRemove.remove();
                        rowRemove = rowNext;
                    }
                }
                else {
                    let rowRemove = viewport.ElementBallonBefore.nextElementSibling;
                    if (rowRemove != null) {
                        for (let i = 0; i < rowsBeforeRemove; i++) {
                            const rowNext = rowRemove.nextElementSibling;
                            rowRemove.remove();
                            rowRemove = rowNext;
                        }
                    }
                }
            }
            const fragmentBefore = yield this.CreateControlFlowForViewportFragment(viewport, rowsBeforeInsertStart, rowsBeforeInsertEnd, hashTemplate);
            if (fragmentBefore !== null) {
                viewport.ElementBallonBefore.after(fragmentBefore);
            }
            if (rowsAfterRemove !== null) {
                let rowRemove = viewport.ElementBallonAfter.previousElementSibling;
                for (let i = 0; i < rowsAfterRemove; i++) {
                    const rowPrevious = rowRemove.previousElementSibling;
                    rowRemove.remove();
                    rowRemove = rowPrevious;
                }
            }
            const fragmentAfter = yield this.CreateControlFlowForViewportFragment(viewport, rowsAfterInsertStart, rowsAfterInsertEnd, hashTemplate);
            if (fragmentAfter !== null) {
                const elementAfterPrevious = viewport.ElementBallonAfter.previousElementSibling;
                elementAfterPrevious.after(fragmentAfter);
            }
            this.Application.ViewportHandler.UpdateElementsBallon(viewport);
            yield this.Application.ComponentHandler.UnloadComponentInstancesDetached(viewport.Sector);
            yield this.Application.Document.CollectSector(viewport.Sector);
        });
    }
    CreateControlFlowForViewportFragment(viewport, start, end, hashTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((start === null) || (end == start))
                return (null);
            const fragment = document.createDocumentFragment();
            const context = new DrapoContext();
            context.Sector = viewport.Sector;
            context.Index = start - 1;
            context.IndexRelative = context.Index;
            const content = viewport.ElementTemplate.outerHTML;
            this.InitializeContext(context, content);
            const renderContext = new DrapoRenderContext();
            for (let i = start; i < end; i++) {
                const data = viewport.Data[i];
                const template = this.Application.Document.Clone(viewport.ElementTemplate);
                const item = context.Create(data, template, template, viewport.DataKey, viewport.Key, viewport.DataKeyIteratorRange, i, null);
                yield this.ResolveControlFlowForIterationRender(viewport.Sector, context, template, renderContext, true, true);
                const hashValueCurrent = hashTemplate === null ? null : yield this.GetElementHashValue(viewport.Sector, context, template, hashTemplate);
                if (hashValueCurrent !== null)
                    template.setAttribute('d-hash', hashValueCurrent);
                fragment.appendChild(template);
            }
            return (fragment);
        });
    }
}
//# sourceMappingURL=DrapoControlFlow.js.map