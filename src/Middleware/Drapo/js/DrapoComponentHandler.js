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
class DrapoComponentHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._dataSectors = [];
        this._dataTags = [];
        this._dataElements = [];
        this._dataInstances = [];
        this._application = application;
    }
    ResolveComponents(el = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el == null)
                el = document.documentElement;
            yield this.ResolveComponentsElement(el, null, true, true);
        });
    }
    ResolveComponentsElement(el, context, checkSectorReady, handleDynamicSectors) {
        return __awaiter(this, void 0, void 0, function* () {
            if (handleDynamicSectors)
                yield this.Application.Document.ResolveComponentDynamicSector(el);
            if (checkSectorReady) {
                const sector = this.Application.Document.GetSector(el);
                if (sector === '@')
                    return;
            }
            if (this.Application.ControlFlow.IsElementControlFlowTemplate(el))
                return;
            const tagName = el.tagName.toLowerCase();
            const children = [].slice.call(el.children);
            const hasChildren = children.length > 0;
            if (this.IsComponent(tagName)) {
                const isContext = context != null;
                const isInsideContext = this.Application.Document.IsElementInsideControlFlow(el);
                if (isContext !== isInsideContext)
                    return;
                yield this.ResolveComponentElement(el, tagName, context, checkSectorReady, handleDynamicSectors);
            }
            else if (hasChildren) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    yield this.ResolveComponentsElement(child, context, checkSectorReady, handleDynamicSectors);
                }
            }
            else {
                const contentUrl = el.getAttribute('d-contenturl');
                if (contentUrl != null)
                    yield this.ResolveContentElement(el, context, contentUrl, checkSectorReady, handleDynamicSectors);
            }
        });
    }
    ResolveComponentElement(el, tagName, context, checkSectorReady, handleDynamicSectors) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.Application.Register.IsRegisteredComponent(tagName))) {
                yield this.Application.ExceptionHandler.HandleError('There is no component: {0}', tagName);
                return;
            }
            if (!this.Application.Register.IsActiveComponent(tagName))
                yield this.Application.Register.ActivateComponent(tagName);
            const html = yield this.Application.Register.GetRegisteredComponentViewContent(tagName);
            if (html == null) {
                yield this.Application.ExceptionHandler.HandleError('There is no html for the component: {0}', tagName);
                return;
            }
            const eljNew = this.Application.Document.CreateHTMLElement(html);
            const attributes = this.Application.Document.GetElementAttributes(el);
            const content = this.Application.Document.GetHTML(el);
            if (context != null)
                this.Application.ControlFlow.InitializeContext(context, content);
            const sector = this.GetSectorContext(el, context);
            this.Application.Document.ReplaceElement(el, eljNew);
            this.Application.Document.SetElementAttributes(eljNew, attributes);
            const elNew = eljNew;
            const elContent = ((content != null) && (content != '')) ? this.GetElementContent(elNew) : null;
            if (elContent !== null)
                this.Application.Document.SetHTML(elContent, content);
            let isSectorContext = false;
            let elSector = elNew.getAttribute('d-sector');
            if (elSector === "@") {
                elSector = this.CreateGuidContext(elNew, context);
                elNew.setAttribute('d-sector', elSector);
                yield this.Application.Document.AddSectorHierarchy(elSector, sector);
                yield this.Application.Document.AddSectorFriends(sector, elNew.getAttribute('d-sector-friend'));
            }
            else if (elSector == null) {
                isSectorContext = ((context != null) && (context.Sector != null));
                if (isSectorContext)
                    elNew.setAttribute('d-sector', context.Sector);
            }
            try {
                const instance = yield this.Application.Register.CreateInstanceComponent(tagName, elNew);
                if (instance != null)
                    this.SubscribeComponentInstance(sector, tagName, elNew, instance);
            }
            catch (e) {
                yield this.Application.ExceptionHandler.HandleError('There is an error in component: {0} contructor. {1}', tagName, e.toString());
            }
            yield this.Application.Document.ResolveComponentUpdate(elNew, context);
            if (isSectorContext)
                elNew.removeAttribute('d-sector');
            yield this.Application.Debugger.NotifyComponents();
        });
    }
    GetSectorContext(el, context) {
        if ((context != null) && (context.Item != null) && (context.Item.ElementOld != null))
            return (this.Application.Document.GetSector(context.Item.ElementOld));
        if ((context != null) && (context.Sector != null))
            return (context.Sector);
        return (this.Application.Document.GetSector(el));
    }
    CreateGuidContext(el, context) {
        const guid = this.CreateGuidContextHierarchy(el, context);
        if (guid !== null)
            return (guid);
        return (this.Application.Document.CreateGuid());
    }
    CreateGuidContextHierarchy(el, context) {
        if ((context === null) || (context.Item === null) || (context.Item.ElementOld === null))
            return (null);
        const hierarchy = this.CreateElementHierarchy(el);
        if (hierarchy.length === 0)
            return (null);
        const elHierarchy = this.GetElementByHierarchy(context.Item.ElementOld, hierarchy);
        if (elHierarchy === null)
            return (null);
        const sector = elHierarchy.getAttribute('d-sector');
        if (sector == "@")
            return (null);
        return (sector);
    }
    CreateElementHierarchy(el) {
        const hierarchy = [];
        this.InsertElementHierarchy(hierarchy, el);
        hierarchy.reverse();
        return (hierarchy);
    }
    InsertElementHierarchy(hierarchy, el) {
        if (el == null)
            return;
        const elParent = el.parentElement;
        if (elParent == null)
            return;
        const index = this.GetElementIndex(elParent, el);
        if (index == null)
            return;
        hierarchy.push(index);
        this.InsertElementHierarchy(hierarchy, elParent);
    }
    GetElementIndex(elParent, el) {
        for (let i = 0; i < elParent.children.length; i++)
            if (elParent.children[i] === el)
                return (i);
        return (null);
    }
    GetElementByHierarchy(el, hierarchy) {
        let elCurrent = el;
        for (let i = 0; i < hierarchy.length; i++) {
            if (elCurrent == null)
                return (null);
            const index = hierarchy[i];
            if (elCurrent.children.length <= index)
                return (null);
            elCurrent = elCurrent.children[index];
        }
        return (elCurrent);
    }
    GetElementContent(el) {
        const elContent = el.getAttribute('d-content');
        if (elContent === 'internal')
            return (el);
        const children = [].slice.call(el.children);
        for (let i = 0; i < children.length; i++) {
            const elContentChild = this.GetElementContent(children[i]);
            if (elContentChild !== null)
                return (elContentChild);
        }
        return (null);
    }
    ResolveContentElement(el, context, contentUrl, checkSectorReady, handleDynamicSectors) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.Application.Server.GetViewHTML(contentUrl);
            if (html == null) {
                yield this.Application.ExceptionHandler.HandleError('There is an error getting html for the contenturl: {0}', contentUrl);
                return;
            }
            const content = this.Application.Parser.ParseDocumentContent(html);
            const elNew = this.Application.Document.CreateHTMLElement(content);
            if (elNew == null) {
                yield this.Application.ExceptionHandler.HandleError('There is no html container for the contenturl: {0}', contentUrl);
                return;
            }
            el.innerHTML = elNew.innerHTML;
            yield this.Application.Document.ResolveComponentUpdate(el, context);
        });
    }
    IsComponent(tagName) {
        return (this.IsStartsWith(tagName, "d-"));
    }
    IsStartsWith(text, value) {
        const length = value.length;
        if (text.length < length)
            return (false);
        return (text.substr(0, length) === value);
    }
    SubscribeComponentInstance(sector, tag, el, instance) {
        let index = this.GetComponentInstanceIndex(sector);
        if (index == null)
            index = this.CreateComponentInstanceIndex(sector);
        const tags = this._dataTags[index];
        tags.push(tag);
        const elements = this._dataElements[index];
        elements.push(el);
        const instances = this._dataInstances[index];
        instances.push(instance);
        return (true);
    }
    GetComponentInstanceIndex(sector) {
        for (let i = 0; i < this._dataSectors.length; i++)
            if (this._dataSectors[i] == sector)
                return (i);
        return (null);
    }
    CreateComponentInstanceIndex(sector) {
        const index = this._dataSectors.push(sector);
        this._dataTags.push([]);
        this._dataElements.push([]);
        this._dataInstances.push([]);
        return (index - 1);
    }
    GetComponentInstance(sector, did = null) {
        if (did === null)
            return (this.GetComponentInstanceByElementSector(sector));
        const sectors = this.Application.Document.GetSectorsAllowed(sector);
        if (sectors == null)
            return (this.GetComponentInstanceInternal(sector, did));
        for (let i = 0; i < sectors.length; i++) {
            const sectorCurrent = sectors[i];
            const instance = this.GetComponentInstanceInternal(sectorCurrent, did);
            if (instance != null)
                return (instance);
        }
        return (null);
    }
    GetComponentInstanceByElementSector(sector) {
        for (let i = 0; i < this._dataElements.length; i++) {
            const dataElements = this._dataElements[i];
            for (let j = 0; j < dataElements.length; j++) {
                const el = dataElements[j];
                const elSector = el.getAttribute('d-sector');
                if (elSector === sector)
                    return (this._dataInstances[i][j]);
            }
        }
        return (null);
    }
    GetComponentInstanceInternal(sector, did) {
        const index = this.GetComponentInstanceIndex(sector);
        if (index === null)
            return (null);
        const elements = this._dataElements[index];
        const instances = this._dataInstances[index];
        for (let j = elements.length - 1; j >= 0; j--) {
            const element = elements[j];
            if (element.parentElement == null)
                continue;
            const elementDid = element.getAttribute('d-id');
            if (did !== elementDid)
                continue;
            return (instances[j]);
        }
        return (null);
    }
    UnloadComponentInstances(sector) {
        const index = this.GetComponentInstanceIndex(sector);
        if (index === null)
            return (false);
        this._dataSectors.splice(index, 1);
        this._dataTags.splice(index, 1);
        this._dataElements.splice(index, 1);
        this._dataInstances.splice(index, 1);
        return (true);
    }
    UnloadComponentInstancesDetached(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.GetComponentInstanceIndex(sector);
            if (index === null)
                return (false);
            let updated = false;
            const dataTags = this._dataTags[index];
            const dataElements = this._dataElements[index];
            const dataInstances = this._dataInstances[index];
            for (let i = dataElements.length - 1; i >= 0; i--) {
                const dataElement = dataElements[i];
                if (this.Application.Document.IsElementAlive(dataElement))
                    continue;
                dataTags.splice(i, 1);
                dataElements.splice(i, 1);
                dataInstances.splice(i, 1);
                updated = true;
            }
            if (updated)
                yield this.Application.Debugger.NotifyComponents();
            return (true);
        });
    }
    UnloadComponentInstancesDetachedFullCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            let updated = false;
            for (let index = this._dataSectors.length - 1; index >= 0; index--) {
                const dataTags = this._dataTags[index];
                const dataElements = this._dataElements[index];
                const dataInstances = this._dataInstances[index];
                for (let i = dataElements.length - 1; i >= 0; i--) {
                    const dataElement = dataElements[i];
                    if (this.Application.Document.IsElementAlive(dataElement))
                        continue;
                    dataTags.splice(i, 1);
                    dataElements.splice(i, 1);
                    dataInstances.splice(i, 1);
                    updated = true;
                }
                if (dataTags.length === 0) {
                    this._dataSectors.splice(index, 1);
                    this._dataTags.splice(index, 1);
                    this._dataElements.splice(index, 1);
                    this._dataInstances.splice(index, 1);
                    updated = true;
                }
            }
            if (updated)
                yield this.Application.Debugger.NotifyComponents();
            return (true);
        });
    }
    HasContentComponent(content) {
        return ((content.indexOf('<d-') > -1));
    }
    ResolveComponentContext(sector, context, el, renderContext, canResolveComponents) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagName = el.tagName.toLowerCase();
            if (!this.IsComponent(tagName))
                return;
            const elAttributes = this.Application.Document.GetElementAttributes(el);
            for (let i = 0; i < elAttributes.length; i++) {
                const elAttribute = elAttributes[i];
                let elAttributeValue = elAttribute[1];
                let updated = false;
                const mustaches = this.Application.Parser.ParseMustaches(elAttributeValue);
                for (let j = 0; j < mustaches.length; j++) {
                    const mustache = mustaches[j];
                    const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                    const mustacheContext = this.Application.Solver.CreateMustacheContext(context, mustacheParts);
                    if ((mustacheContext === null) || (mustacheContext === mustache))
                        continue;
                    updated = true;
                    elAttributeValue = elAttributeValue.replace(mustache, mustacheContext);
                }
                if (updated)
                    el.setAttribute(elAttribute[0], elAttributeValue);
            }
            if ((canResolveComponents) && (((context != null) && (context.HasContextItemBefore)) || (this.Application.Document.IsElementAlive(el))))
                yield this.Application.Document.ResolveComponentUpdate(el, context);
        });
    }
    Retrieve() {
        const list = [];
        for (let i = 0; i < this._dataSectors.length; i++) {
            const sector = this._dataSectors[i];
            const tags = this._dataTags[i];
            const elements = this._dataElements[i];
            const instances = this._dataInstances[i];
            for (let j = 0; j < tags.length; j++)
                list.push([sector, tags[j], elements[j], instances[j]]);
        }
        return (list);
    }
    AppendInstances(sector, componentSectors, componentTags, componentElements, componentInstances) {
        const index = this.GetComponentInstanceIndex(sector);
        if (index === null)
            return;
        componentSectors.push(sector);
        componentTags.push(this.Application.Solver.CloneArrayString(this._dataTags[index]));
        componentElements.push(this.Application.Solver.CloneArrayElement(this._dataElements[index]));
        componentInstances.push(this.Application.Solver.CloneArrayAny(this._dataInstances[index]));
    }
    AddInstances(container) {
        return __awaiter(this, void 0, void 0, function* () {
            this._dataSectors.push.apply(this._dataSectors, container.ComponentSectors);
            this._dataTags.push.apply(this._dataTags, container.ComponentTags);
            this._dataElements.push.apply(this._dataElements, container.ComponentElements);
            this._dataInstances.push.apply(this._dataInstances, container.ComponentInstances);
            yield this.Application.Debugger.NotifyComponents();
        });
    }
}
//# sourceMappingURL=DrapoComponentHandler.js.map