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
class DrapoDocument {
    get Application() {
        return (this._application);
    }
    get Message() {
        return (this._message);
    }
    set Message(value) {
        this._message = value;
    }
    constructor(application) {
        this._pendingAuthorizations = 0;
        this._sectorsLoaded = [];
        this._message = null;
        this._sectorHierarchy = [];
        this._sectorFriends = [];
        this._lastGuid = null;
        this._application = application;
    }
    ResetPendingAuthorizations(count = 0) {
        this._pendingAuthorizations = count;
    }
    StartUpdate(sector) {
        if (sector == null) {
            this.InitializeSectorsLoaded();
        }
        else {
            for (let i = this._sectorsLoaded.length - 1; i >= 0; i--)
                if (this._sectorsLoaded[i] === sector)
                    this._sectorsLoaded.splice(i, 1);
        }
    }
    Resolve() {
        return __awaiter(this, void 0, void 0, function* () {
            this.StartUpdate(null);
            yield this.ResolveInternal();
        });
    }
    ResolveInternal() {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Log.WriteVerbose('Document - ResolveInternal - Started');
            if (!(yield this.ResolveParent()))
                yield this.ResolveChildren(null);
            this.Application.Log.WriteVerbose('Document - ResolveInternal - Finished');
            yield this.Application.Storage.ResolveData(false);
            yield this.Application.ControlFlow.ResolveControlFlowDocument();
            yield this.Application.ComponentHandler.ResolveComponents();
            yield this.Application.Storage.ResolveData(true);
            yield this.Application.Barber.ResolveMustaches();
            yield this.TryOnAuthorizationRequest();
        });
    }
    ResolveParent() {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Log.WriteVerbose('Document - ResolveParent - Started');
            const divElement = this.Application.Searcher.FindByTagName('div');
            if (divElement == null) {
                this.Application.Log.WriteVerbose('Document - ResolveParent - Finished - NoDiv');
                return (false);
            }
            const parent = divElement.getAttribute('d-sector-parent-url');
            if (parent == null) {
                this.Application.Log.WriteVerbose('Document - ResolveParent - Finished - NoParent');
                return (false);
            }
            const parentSector = divElement.getAttribute('d-sector-parent');
            if (parentSector == null) {
                this.Application.Log.WriteVerbose('Document - ResolveParent - Finished - NoParentSector');
                return (false);
            }
            const sectors = this.ExtractSectors(divElement);
            this.Application.Log.WriteVerbose('Document - ResolveParent - parent = {0}, parentSector = {1}', parent, parentSector);
            const html = yield this.Application.Server.GetViewHTML(parent);
            yield this.ResolveParentResponse(html, parent, parentSector, divElement.outerHTML, sectors);
            this.Application.Log.WriteVerbose('Document - ResolveParent - Finished');
            return (true);
        });
    }
    ResolveParentResponse(data, parent, parentSector, childHtml, sectors) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Log.WriteVerbose('Document - ResolveParentResponse - Started');
            if (this.Application.Log.ShowHTML)
                this.Application.Log.WriteVerbose('Document - ResolveParentResponse - data - {0}', data);
            this.ReplaceDocument(data);
            this.Application.Log.WriteVerbose('Document - ResolveParentResponse - parent = {0}, parentSector = {1}', parent, parentSector);
            const elChildSector = this.Application.Searcher.FindByAttributeAndValue('d-sector', parentSector);
            if (elChildSector != null) {
                yield this.AddSectorFriends(parentSector, elChildSector.getAttribute('d-sector-friend'));
                this.SetHTML(elChildSector, childHtml);
            }
            for (let i = 0; i < sectors.length; i++) {
                const sector = sectors[i];
                const sectorName = sector[0];
                const url = sector[1];
                const container = sector[2];
                yield this.AddSectorHierarchy(sectorName, parentSector);
                this.StartUpdate(sectorName);
                yield this.LoadChildSector(sectorName, url, null, true, false, container);
            }
            this.Application.Log.WriteVerbose('Document - ResolveParentResponse - Finished');
            yield this.ResolveInternal();
        });
    }
    ExtractSectors(el) {
        const attributes = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const attributeSectorProperty = this.ExtractSectorProperty(attribute.nodeName);
            if (attributeSectorProperty != null)
                attributes.push([attributeSectorProperty, attribute.nodeValue, el.getAttribute('d-sector-container-' + attributeSectorProperty)]);
        }
        return (attributes);
    }
    ExtractSectorProperty(property) {
        const parse = this.Application.Parser.ParseProperty(property);
        if (parse.length != 4)
            return (null);
        if (parse[0] != 'd')
            return (null);
        if ((parse[1].toLowerCase() != 'sector') || (parse[2] != 'default'))
            return (null);
        return (parse[3]);
    }
    ResolveChildren(elStart) {
        return __awaiter(this, void 0, void 0, function* () {
            const elsSector = elStart == null ? this.Application.Searcher.FindAllByAttribute('d-sector') : this.Application.Searcher.FindAllByAttributeFromParent('d-sector', elStart);
            if (elsSector.length === 0)
                return;
            const sector = this.GetSector(elStart);
            const sectorChildren = [];
            for (let i = 0; i < elsSector.length; i++) {
                const elSector = elsSector[i];
                const sectorChildParent = this.GetSectorParent(elSector);
                if (sector === sectorChildParent)
                    sectorChildren.push(elSector);
            }
            for (let i = 0; i < sectorChildren.length; i++) {
                const elChild = sectorChildren[i];
                let childSector = elChild.getAttribute('d-sector');
                if (childSector == "@") {
                    childSector = this.CreateGuid();
                    elChild.setAttribute('d-sector', childSector);
                }
                if (this.IsSectorAlreadyLoaded(childSector))
                    continue;
                this.MarkSectorAsLoaded(childSector);
                const url = elChild.getAttribute('d-sector-url');
                if ((url != null) && (elChild.children.length > 0))
                    continue;
                const urlSector = this.GetSectorParent(elChild);
                const urlResolved = url != null ? yield this.Application.Storage.ResolveDataUrlMustaches(null, urlSector, url, null) : null;
                let container = null;
                let childContainer = elChild.getAttribute('d-container');
                if (childContainer !== null) {
                    if (this.Application.Parser.IsMustache(childContainer)) {
                        const dataPath = this.Application.Parser.ParseMustache(childContainer);
                        const contextItem = yield this.Application.Solver.CreateContextItemFromPath(childSector, dataPath);
                        let item = yield this.Application.Solver.ResolveItemDataPathObject(childSector, contextItem, dataPath);
                        if ((item === null) || (item === '')) {
                            item = this.Application.Document.CreateGuid();
                            yield this.Application.Solver.UpdateItemDataPathObject(childSector, contextItem, null, dataPath, item);
                        }
                        container = item.toString();
                    }
                    else {
                        if (childContainer == "@") {
                            childContainer = this.CreateGuid();
                            elChild.setAttribute('d-container', childContainer);
                        }
                        container = childContainer;
                    }
                }
                const html = urlResolved != null ? yield this.Application.Server.GetViewHTML(urlResolved) : null;
                yield this.LoadChildSectorInternal(urlResolved, html, childSector, elChild, null, true, false, container);
            }
        });
    }
    LoadChildSectorInternal(url, data, sector, elSector, title = null, canRoute = true, canLoadDefaultSectors = false, container = null) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Log.WriteVerbose('Document - ResolveChildResponse - Started - Sector {0}', sector);
            if (container !== null) {
                if (yield this.Application.SectorContainerHandler.Switch(sector, container))
                    return;
                const content = this.Application.Parser.ParseDocumentContent(data);
                const elContentParent = document.createElement('div');
                elContentParent.innerHTML = this.EnsureHTML(content);
                elSector.appendChild(elContentParent.children[0]);
            }
            else {
                if (data != null)
                    yield this.ReplaceSectorData(elSector, data);
            }
            const route = ((canRoute) && (url != null)) ? elSector.getAttribute('d-route') : 'false';
            if ((route == null) || (route != 'false'))
                yield this.Application.Router.Route(url, sector, title);
            const sectorParent = this.GetSectorParent(elSector);
            yield this.Application.Debugger.AddSectorUpdate(sector, sectorParent, url);
            yield this.AddSectorHierarchy(sector, sectorParent);
            yield this.AddSectorFriends(sector, elSector.getAttribute('d-sector-friend'));
            if (canLoadDefaultSectors) {
                const divChildSectorLoaded = elSector.children;
                const divElement = divChildSectorLoaded.length > 0 ? divChildSectorLoaded[0] : null;
                const sectors = divElement != null ? this.ExtractSectors(divElement) : [];
                for (let i = 0; i < sectors.length; i++) {
                    const sectorInfo = sectors[i];
                    const sectorName = sectorInfo[0];
                    const sectorUrl = sectorInfo[1];
                    const sectorContainer = sectorInfo[2];
                    yield this.AddSectorHierarchy(sectorName, sector);
                    this.StartUpdate(sectorName);
                    yield this.LoadChildSector(sectorName, sectorUrl, null, true, false, sectorContainer);
                }
            }
            if (data == '')
                return;
            const elSectorContent = container !== null ? elSector.children[elSector.children.length - 1] : elSector;
            yield this.Application.Storage.ResolveData(false, elSectorContent);
            yield this.Application.ControlFlow.ResolveControlFlowSector(elSectorContent);
            yield this.Application.ComponentHandler.ResolveComponents(elSectorContent);
            yield this.Application.Storage.ResolveData(true, elSectorContent);
            yield this.Application.Barber.ResolveMustaches(elSectorContent);
            yield this.ResolveChildren(elSectorContent);
            yield this.Application.Storage.LoadDataDelayedAndNotify();
            const onload = elSector.getAttribute("d-on-load");
            if (onload != null)
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(sector, elSector, onload);
            yield this.TryOnAuthorizationRequest();
            if (container !== null)
                this.InitializeSectorElementDetach(elSectorContent);
            yield this.Application.ComponentHandler.UnloadComponentInstancesDetached(sector);
        });
    }
    ReplaceSectorData(elChildSector, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data === null) {
                this.SetHTML(elChildSector, '');
                return (false);
            }
            const content = this.Application.Parser.ParseDocumentContent(data);
            const attributes = this.Application.Parser.ParseElementAttributes(content);
            const templateUrl = this.Application.Solver.Get(attributes, 'd-templateurl');
            if (templateUrl === null) {
                this.SetHTML(elChildSector, content);
                return (true);
            }
            let template = this.Application.Solver.Get(attributes, 'd-template');
            if (template === null)
                template = 'template';
            const templateUrlContent = yield this.Application.Server.GetViewHTML(templateUrl);
            const templateContent = this.Application.Parser.ParseDocumentContent(templateUrlContent);
            this.SetHTML(elChildSector, templateContent);
            const elSectorTemplate = this.Application.Searcher.FindByAttributeAndValueFromParent('d-template', template, elChildSector);
            if (elSectorTemplate == null)
                this.SetHTML(elChildSector, content);
            else
                this.SetHTML(elSectorTemplate, content);
            return (true);
        });
    }
    ResolveWindow(elWindow) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = this.Application.Document.GetSector(elWindow);
            this.Application.Document.StartUpdate(sector);
            yield this.Application.Storage.ResolveData(false, elWindow);
            yield this.Application.ControlFlow.ResolveControlFlowSector(elWindow, false);
            yield this.Application.ComponentHandler.ResolveComponents(elWindow);
            yield this.Application.Storage.ResolveData(true, elWindow);
            yield this.Application.Barber.ResolveMustaches(elWindow);
        });
    }
    ResolveComponentDynamicSector(el) {
        return __awaiter(this, void 0, void 0, function* () {
            const elSector = el.getAttribute('d-sector');
            if (elSector == null)
                return;
            const isSectorGuid = elSector == '@';
            if ((!isSectorGuid) && (this.Application.Document.IsSectorReady(elSector)))
                return;
            const sectorParent = this.GetSectorParent(el);
            const sector = isSectorGuid ? this.CreateGuid() : elSector;
            if (isSectorGuid)
                el.setAttribute('d-sector', sector);
            yield this.AddSectorHierarchy(sector, sectorParent);
            yield this.AddSectorFriends(sector, el.getAttribute('d-sector-friend'));
            this.MarkSectorAsLoaded(sector);
            yield this.Application.Storage.ResolveData(true, el);
        });
    }
    ResolveComponentUpdate(el, context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Storage.ResolveData(false, el);
            yield this.Application.ControlFlow.ResolveControlFlowSector(el);
            yield this.Application.ComponentHandler.ResolveComponentsElement(el, context, true, true);
            yield this.Application.Storage.ResolveData(true, el);
            yield this.Application.Barber.ResolveMustaches(el, null, false);
        });
    }
    RemoveElement(el, checkSector = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el.parentNode)
                el.parentNode.removeChild(el);
            if (checkSector)
                yield this.RemoveElementIteration(el);
        });
    }
    RemoveElementIteration(el) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = el.getAttribute('d-sector');
            if (sector != null) {
                yield this.RemoveSectorData(sector);
            }
            else {
                const children = [].slice.call(el.children);
                for (let i = 0; i < children.length; i++)
                    yield this.RemoveElementIteration(children[i]);
            }
        });
    }
    RemoveSectorData(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectors = this.GetSectorChildren(sector);
            for (let i = 0; i < sectors.length; i++)
                yield this.RemoveSectorData(sectors[i]);
            this.CleanSectorMetadataInternal(sector);
            yield this.Application.Storage.RemoveBySector(sector);
            this.Application.SectorContainerHandler.RemoveBySector(sector);
            this.Application.ComponentHandler.UnloadComponentInstances(sector);
        });
    }
    LoadChildSector(sectorName, url, title = null, canRoute = true, canLoadDefaultSectors = false, container = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsSectorAlreadyLoaded(sectorName))
                return (false);
            this.MarkSectorAsLoaded(sectorName);
            const elsSector = this.Application.Searcher.FindAllByAttributeAndValue('d-sector', sectorName);
            let elSector = null;
            for (let i = elsSector.length - 1; i >= 0; i--) {
                const el = elsSector[i];
                if (this.IsElementDetached(el))
                    continue;
                elSector = el;
                break;
            }
            if (elSector == null) {
                this.Application.Log.WriteVerbose('Document - LoadChildSector - Missing Sector - {0}', sectorName);
                return (false);
            }
            const urlResolved = ((url === null) || (url === '')) ? '' : yield this.Application.Storage.ResolveDataUrlMustaches(null, null, url, null);
            const html = ((urlResolved === null) || (urlResolved === '')) ? '' : yield this.Application.Server.GetViewHTML(urlResolved);
            yield this.LoadChildSectorInternal(url, html, sectorName, elSector, title, canRoute, canLoadDefaultSectors, container);
            return (true);
        });
    }
    LoadChildSectorContent(sectorName, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsSectorAlreadyLoaded(sectorName))
                return (false);
            this.MarkSectorAsLoaded(sectorName);
            const elSector = this.Application.Searcher.FindByAttributeAndValue('d-sector', sectorName);
            if (elSector == null) {
                this.Application.Log.WriteVerbose('Document - LoadChildSectorContent - Missing Sector - {0}', sectorName);
                return (false);
            }
            yield this.LoadChildSectorInternal(null, content, sectorName, elSector, null, false, false, null);
            return (true);
        });
    }
    LoadChildSectorDefault(sectorName) {
        return __awaiter(this, void 0, void 0, function* () {
            const elSector = this.Application.Searcher.FindByAttributeAndValue('d-sector', sectorName);
            if (elSector == null) {
                this.Application.Log.WriteVerbose('Document - LoadChildSectorDefault - Missing Sector - {0}', sectorName);
                return (false);
            }
            if (elSector.children.length == 0)
                return (false);
            let url = elSector.getAttribute('d-sector-url');
            if ((url === null))
                url = '';
            const urlSector = this.GetSectorParent(elSector);
            const urlResolved = yield this.Application.Storage.ResolveDataUrlMustaches(null, urlSector, url, null);
            return (yield this.LoadChildSector(sectorName, urlResolved, null, false, false));
        });
    }
    ReplaceDocument(data) {
        this.Application.Log.WriteVerbose('Document - ReplaceDocument - Data - {0}', data);
        const head = this.ExtractHeadInnerHtml(data);
        if (head != null)
            this.SetHTML(document.head, head);
        const body = this.ExtractBodyInnerHtml(data);
        if (body != null)
            this.SetHTML(document.body, body);
    }
    ReplaceElement(el, elNew) {
        const parent = el.parentElement;
        if (parent != null)
            parent.replaceChild(elNew, el);
    }
    Show(el) {
        let elCurrent = el;
        if ((elCurrent.tagName === 'SPAN') && (el.children.length == 1)) {
            const elChild = el.children[0];
            if ((elChild.tagName === 'OPTION') || (elChild.tagName === 'OPTGROUP'))
                elCurrent = elChild;
        }
        this.ShowInternal(elCurrent);
        return (elCurrent);
    }
    ShowInternal(el) {
        const display = el.style.display;
        if (display === 'none')
            el.style.display = '';
        const style = el.getAttribute('style');
        if (style === '')
            el.removeAttribute('style');
    }
    Hide(el) {
        const isOption = el.tagName === 'OPTION';
        const isOptGroup = ((!isOption) && (el.tagName === 'OPTGROUP'));
        const elParent = el.parentElement;
        const hasParent = elParent != null;
        const isParentOptGroup = ((isOption) && (hasParent) && (elParent.tagName === 'OPTGROUP'));
        if (((isOption) && (!isParentOptGroup)) || (isOptGroup)) {
            const elWrap = ((hasParent) && (elParent.tagName === 'SPAN')) ? elParent : this.Wrap(el, 'SPAN');
            this.HideInternal(elWrap);
            return (elWrap);
        }
        else {
            this.HideInternal(el);
            return (el);
        }
    }
    HideInternal(el) {
        el.style.display = 'none';
    }
    GetWrapper(el) {
        if (el.tagName !== 'span')
            return (null);
        if (el.children.length !== 1)
            return (null);
        return el.children[0];
    }
    Wrap(el, tagName) {
        const wrapper = document.createElement(tagName);
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        return (wrapper);
    }
    GetElementAttributes(el) {
        const attributes = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            attributes.push([attribute.nodeName, attribute.nodeValue]);
        }
        return (attributes);
    }
    GetElementAttributesFilteredPrefix(el, prefix) {
        if ((prefix === null) || (prefix === ''))
            return (this.GetElementAttributes(el));
        const attributes = [];
        const length = prefix.length;
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const name = attribute.nodeName;
            if (name.length < length)
                continue;
            if (name.substring(0, length) !== prefix)
                continue;
            attributes.push([name.substring(length), attribute.nodeValue]);
        }
        return (attributes);
    }
    SetElementAttributes(el, attributes) {
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            el.setAttribute(attribute[0], attribute[1]);
        }
    }
    ExtractHeadInnerHtml(data) {
        const index = data.indexOf('<head>');
        if (index < 0)
            return (null);
        const indexEnd = data.indexOf('</head>');
        const head = data.substr(index + 6, indexEnd - (index + 6));
        const headWithoutFramework = this.RemoveFramework(head);
        return (headWithoutFramework);
    }
    RemoveFramework(data) {
        let indexScript = 0;
        while ((indexScript = data.indexOf('<script', indexScript)) >= 0) {
            const indexScriptEnd = data.indexOf('</script>', indexScript);
            if (indexScriptEnd > indexScript) {
                const script = data.substring(indexScript, indexScriptEnd + 9);
                if (script.indexOf('drapo.js') >= 0)
                    return (data.replace(script, ''));
            }
            indexScript = indexScriptEnd;
        }
        return (data);
    }
    ExtractBodyInnerHtml(data) {
        let index = data.indexOf('<body>');
        if (index >= 0) {
            const indexEnd = data.indexOf('</body>');
            return (data.substr(index + 6, indexEnd - (index + 6)));
        }
        index = data.indexOf('<div');
        if (index >= 0) {
            return (data.substr(index));
        }
        return (null);
    }
    IsElementInserted(list, itemInsert) {
        for (let i = 0; i < list.length; i++) {
            if (list[i] == itemInsert)
                return (false);
        }
        list.push(itemInsert);
        return (true);
    }
    IsElementAttached(el) {
        let elc = el;
        while (elc != null) {
            if (elc.tagName === 'BODY')
                return (true);
            elc = elc.parentElement;
        }
        return (false);
    }
    IsElementInsideControlFlow(el) {
        if (el.getAttribute == null)
            return (false);
        if (el.tagName === 'BODY')
            return (false);
        const dfor = el.getAttribute('d-for');
        if (dfor != null)
            return (true);
        const elParent = el.parentElement;
        if (elParent == null)
            return (true);
        return (this.IsElementInsideControlFlow(elParent));
    }
    IsElementInsideControlFlowOrContext(el) {
        if (el.getAttribute == null)
            return (false);
        if (el.tagName === 'BODY')
            return (false);
        const dfor = el.getAttribute('d-for');
        if (dfor != null)
            return (true);
        const elPrevious = el.previousElementSibling;
        if (elPrevious != null)
            return (this.IsElementInsideControlFlowOrContext(elPrevious));
        const elParent = el.parentElement;
        if (elParent == null)
            return (true);
        return (this.IsElementInsideControlFlowOrContext(elParent));
    }
    IsElementPreprocessed(el) {
        if (el.getAttribute == null)
            return (false);
        const pre = el.getAttribute('d-pre');
        if (pre === 'true')
            return (true);
        const elParent = el.parentElement;
        if (elParent == null)
            return (false);
        return (this.IsElementPreprocessed(elParent));
    }
    RequestAuthorization(dataKey, type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Observer.SubscribeAuthorization(dataKey, type);
            yield this.TryOnAuthorizationRequest();
        });
    }
    TryOnAuthorizationRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingAuthorizations = this.Application.Observer.GetPendingAuthorization();
            if (this._pendingAuthorizations === pendingAuthorizations)
                return (false);
            this._pendingAuthorizations = pendingAuthorizations;
            yield this.OnAuthorizationRequest();
            return (true);
        });
    }
    OnAuthorizationRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const onAuthorizationRequest = yield this.Application.Config.GetOnAuthorizationRequest();
            if ((onAuthorizationRequest === null) || (onAuthorizationRequest === ''))
                return;
            yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, onAuthorizationRequest);
        });
    }
    IsSectorAlreadyLoaded(sector) {
        for (let i = 0; i < this._sectorsLoaded.length; i++)
            if (this._sectorsLoaded[i] === sector)
                return (true);
        return (false);
    }
    MarkSectorAsLoaded(sector) {
        this._sectorsLoaded.push(sector);
    }
    InitializeSectorsLoaded() {
        this._sectorsLoaded = [];
    }
    GetSectorParent(el) {
        return (this.GetSector(el.parentElement));
    }
    GetSector(el) {
        if (el == null)
            return (null);
        const sector = el.getAttribute('d-sector');
        if (sector != null)
            return (sector);
        return (this.GetSector(el.parentElement));
    }
    GetSectorElement(sector) {
        return (this.Application.Searcher.FindByAttributeAndValue('d-sector', sector));
    }
    GetSectorElementInner(sector) {
        const elSector = this.GetSectorElement(sector);
        if ((elSector == null) || (elSector.children.length == 0))
            return (null);
        for (let i = elSector.children.length - 1; i >= 0; i--) {
            const elSectorChild = elSector.children[i];
            const detach = elSectorChild.getAttribute('d-detach');
            if ((detach === null) || (detach === '') || (detach === 'active'))
                return (elSectorChild);
        }
        return (null);
    }
    SetSectorElementInner(sector, el, canDetach) {
        const elSector = this.GetSectorElement(sector);
        if (elSector == null)
            return (null);
        for (let i = elSector.children.length - 1; i >= 0; i--) {
            const elSectorChild = elSector.children[i];
            const detach = elSectorChild.getAttribute('d-detach');
            if (detach == null) {
                elSector.removeChild(elSectorChild);
            }
            else {
                if (detach === 'active') {
                    const elSectorChildDisplay = elSectorChild.style.display;
                    const detachValue = ((elSectorChildDisplay != null) && (elSectorChildDisplay != '')) ? elSectorChildDisplay : 'empty';
                    elSectorChild.style.display = 'none';
                    elSectorChild.setAttribute('d-detach', detachValue);
                }
            }
        }
        if (el === null)
            return;
        if (canDetach) {
            elSector.appendChild(el);
        }
        else {
            el.style.display = '';
            el.setAttribute('d-detach', 'active');
            if (el.parentElement == null)
                elSector.appendChild(el);
        }
    }
    CreateHTMLElement(html, onlyLast = false) {
        if (html == null)
            return (null);
        const elContainer = document.createElement('div');
        elContainer.innerHTML = this.EnsureHTML(html);
        if (onlyLast)
            return elContainer.children[elContainer.children.length - 1];
        return elContainer.children[0];
    }
    InitializeSectorElementDetach(el) {
        if (this.CanDetachElement(el))
            return;
        el.setAttribute('d-detach', 'active');
    }
    CanDetachElement(el) {
        if (this.HasElementIframe(el))
            return (false);
        if (this.HasElementCantDetach(el))
            return (false);
        return (true);
    }
    IsElementDetached(el) {
        if (el.tagName === 'BODY')
            return (false);
        const detach = el.getAttribute('d-detach');
        if ((detach !== null) && (detach !== '') && (detach != 'active'))
            return (true);
        if (el.parentElement == null)
            return (true);
        return (this.IsElementDetached(el.parentElement));
    }
    IsElementAlive(el) {
        if (el === null)
            return (false);
        if (el.tagName === 'BODY')
            return (true);
        if (this.Application.SectorContainerHandler.IsElementContainerized(el))
            return (true);
        return (this.IsElementAlive(el.parentElement));
    }
    IsElementInsideComponent(el) {
        if (el === null)
            return (false);
        if (el.tagName === 'BODY')
            return (false);
        if (this.Application.ComponentHandler.IsComponent(el.tagName.toLowerCase()))
            return (true);
        return (this.IsElementInsideComponent(el.parentElement));
    }
    HasElementIframe(el) {
        if (el == null)
            return (false);
        if (el.tagName.toLowerCase() === 'iframe')
            return (true);
        const children = [].slice.call(el.children);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const hasChildIframe = this.HasElementIframe(child);
            if (hasChildIframe)
                return (true);
        }
        return (false);
    }
    HasElementCantDetach(el) {
        if (el == null)
            return (false);
        const detachable = el.getAttribute('d-detachable');
        if (detachable === 'false')
            return (true);
        const children = [].slice.call(el.children);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const hasElementCantDetach = this.HasElementCantDetach(child);
            if (hasElementCantDetach)
                return (true);
        }
        return (false);
    }
    GetSectorImpersonate(el) {
        if (el == null)
            return (null);
        const sector = el.getAttribute('d-sector');
        if (sector != null)
            return (null);
        const sectorImpersonate = el.getAttribute('d-sector-impersonate');
        if (sectorImpersonate != null)
            return (sectorImpersonate);
        return (this.GetSectorImpersonate(el.parentElement));
    }
    IsSectorDynamic(el) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = yield this.GetSectorImpersonate(el);
            return (this.Application.Parser.IsMustache(sector));
        });
    }
    GetSectorResolved(el) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = this.GetSector(el);
            const sectorImpersonate = this.GetSectorImpersonate(el);
            if (sectorImpersonate == null)
                return (sector);
            const sectorResolved = yield this.Application.Storage.ResolveDataUrlMustaches(null, sector, sectorImpersonate, null);
            return (sectorResolved);
        });
    }
    Clone(el) {
        if (el == null)
            return (null);
        return el.cloneNode(true);
    }
    Select(el) {
        const eli = el;
        if (eli.select != null)
            eli.select();
    }
    GetValue(el) {
        const eli = el;
        if (eli.value)
            return (eli.value);
        return ('');
    }
    SetValue(el, value) {
        const eli = el;
        if (eli.value)
            eli.value = value;
    }
    GetText(el) {
        if (el.children.length > 0)
            return ('');
        const eli = el;
        if (eli.textContent)
            return (eli.textContent);
        return (eli.innerText);
    }
    SetText(el, value) {
        if (el.children.length > 0)
            return;
        const eli = el;
        if (eli.textContent)
            eli.textContent = value;
        else
            eli.innerText = value;
    }
    GetHTML(el) {
        return (el.innerHTML);
    }
    GetHTMLEncoded(html) {
        const div = document.createElement('div');
        const text = document.createTextNode(html);
        div.appendChild(text);
        const contentEncoded = div.innerHTML;
        return (contentEncoded);
    }
    EnsureHTML(value) {
        const valueHTML = value.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi, "<$1></$2>");
        return (valueHTML);
    }
    SetHTML(el, value) {
        const valueHTML = this.EnsureHTML(value);
        el.innerHTML = valueHTML;
    }
    GetProperty(el, propertyName) {
        const elAny = el;
        return (elAny[propertyName]);
    }
    CreateGuid(isShort = true) {
        if (isShort)
            return (this.CreateGuidShort());
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    CreateGuidShort() {
        let guid = this.CreateGuidShortInternal();
        while (guid === this._lastGuid)
            guid = this.CreateGuidShortInternal();
        this._lastGuid = guid;
        return (guid);
    }
    CreateGuidShortInternal() {
        const date = new Date();
        const hexa = date.getTime().toString(16);
        if (hexa.length <= 8)
            return (hexa);
        return (hexa.substr(hexa.length - 8));
    }
    EnsureElementHasID(el) {
        let id = el.getAttribute('d-id');
        if (id != null)
            return (id);
        id = this.CreateGuid();
        el.setAttribute('d-id', id);
        return (id);
    }
    ApplyNodeDifferences(parent, nodeOld, nodeNew, isHTML) {
        if (!nodeOld) {
            parent.appendChild(nodeNew);
        }
        else if (!nodeNew) {
            parent.removeChild(nodeOld);
        }
        else if (this.IsNodeDifferentType(nodeOld, nodeNew)) {
            parent.replaceChild(nodeNew, nodeOld);
        }
        else {
            if ((isHTML) && (nodeOld.outerHTML == nodeNew.outerHTML))
                return;
            this.ApplyNodeEventsDifferences(nodeOld, nodeNew);
            this.ApplyNodeSpecialDifferences(nodeOld, nodeNew);
            this.ApplyNodeAttributesDifferences(nodeOld, nodeNew);
            const childrenOld = nodeOld != null ? [].slice.call(nodeOld.children) : [];
            const childrenNew = nodeNew != null ? [].slice.call(nodeNew.children) : [];
            const lengthOld = childrenOld.length;
            const lengthNew = childrenNew.length;
            if ((lengthOld === 0) && (lengthNew === 0)) {
                if (nodeOld.textContent !== nodeNew.textContent)
                    nodeOld.textContent = nodeNew.textContent;
            }
            else {
                for (let i = 0; i < lengthNew || i < lengthOld; i++) {
                    this.ApplyNodeDifferences(nodeOld, childrenOld[i], childrenNew[i], isHTML);
                }
            }
        }
    }
    ApplyNodeDifferencesRenderClass(nodeOld, nodeNew) {
        const className = nodeNew.className;
        if (nodeOld.className !== className)
            nodeOld.className = className;
    }
    IsNodeDifferentType(nodeOld, nodeNew) {
        if ((typeof nodeOld) !== (typeof nodeNew))
            return (true);
        if ((nodeOld.nodeType) !== (nodeNew.nodeType))
            return (true);
        if ((nodeOld.tagName) !== (nodeNew.tagName))
            return (true);
        return (false);
    }
    ApplyNodeEventsDifferences(nodeOld, nodeNew) {
        this.Application.EventHandler.SyncNodeEventsDifferences(nodeOld, nodeNew);
    }
    ApplyNodeSpecialDifferences(nodeOld, nodeNew) {
        const tag = nodeOld.tagName.toLowerCase();
        if (tag === "input")
            this.ApplyNodeSpecialDifferencesInput(nodeOld, nodeNew);
        else if (tag === "select")
            this.ApplyNodeSpecialDifferencesSelect(nodeOld, nodeNew);
        else if (tag === "textarea")
            this.ApplyNodeSpecialDifferencesTextarea(nodeOld, nodeNew);
    }
    ApplyNodeSpecialDifferencesInput(nodeOld, nodeNew) {
        const type = nodeOld.type;
        if (((type == 'checkbox')) && (nodeOld.checked !== nodeNew.checked))
            nodeOld.checked = nodeNew.checked;
        if (((type == 'text') || (type == 'password')) && (nodeOld.value !== nodeNew.value))
            nodeOld.value = nodeNew.value;
    }
    ApplyNodeSpecialDifferencesSelect(nodeOld, nodeNew) {
        if (nodeOld.value !== nodeNew.value)
            nodeOld.value = nodeNew.value;
    }
    ApplyNodeSpecialDifferencesTextarea(nodeOld, nodeNew) {
        if (nodeOld.value !== nodeNew.value)
            nodeOld.value = nodeNew.value;
    }
    ApplyNodeAttributesDifferences(nodeOld, nodeNew) {
        const attributesOld = this.ExtactNodeAttributes(nodeOld);
        const attributesNew = this.ExtactNodeAttributes(nodeNew);
        for (let i = 0; i < attributesNew.length; i++) {
            const attribute = attributesNew[i];
            const name = attribute[0];
            const valueNew = attribute[1];
            const valueOld = this.ExtractNodeAttributeValue(attributesOld, name);
            if (valueNew === valueOld)
                continue;
            if ((name === 'class') && (this.Application.Validator.IsValidatorInterface(nodeOld)))
                continue;
            nodeOld.setAttribute(name, valueNew);
        }
        for (let i = 0; i < attributesOld.length; i++) {
            const attribute = attributesOld[i];
            const name = attribute[0];
            const valueNew = this.ExtractNodeAttributeValue(attributesNew, name);
            if (valueNew !== null)
                continue;
            nodeOld.removeAttribute(name);
        }
    }
    ExtactNodeAttributes(node) {
        const attributes = [];
        const nodeAttributes = node.attributes;
        const length = nodeAttributes.length;
        for (let i = 0; i < length; i++) {
            const nodeAttribute = nodeAttributes[i];
            attributes.push([nodeAttribute.name, nodeAttribute.value]);
        }
        return (attributes);
    }
    ExtractNodeAttributeValue(attributes, name) {
        for (let i = attributes.length - 1; i >= 0; i--)
            if (attributes[i][0] === name)
                return (attributes[i][1]);
        return (null);
    }
    Contains(element) {
        return (document.documentElement.contains(element));
    }
    ExtractQueryString(canUseRouter) {
        let url = canUseRouter ? document.location.href : this.Application.Router.GetLastRouteUrl();
        if (url == null)
            url = document.location.href;
        return (this.Application.Parser.ParseQueryString(url));
    }
    Sleep(timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, timeout));
        });
    }
    WaitForMessage(retry = 1000, interval = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < retry; i++) {
                if (this.Message != null)
                    return (this.Message);
                yield this.Application.Document.Sleep(interval);
            }
            return (null);
        });
    }
    AddSectorHierarchy(sector, sectorParent) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this._sectorHierarchy.length; i++) {
                const sectorHierarchyCurrent = this._sectorHierarchy[i];
                if (sectorHierarchyCurrent[0] !== sector)
                    continue;
                sectorHierarchyCurrent[1] = sectorParent;
                yield this.Application.Debugger.NotifySectors();
                return;
            }
            const sectorHierarchy = [sector, sectorParent];
            this._sectorHierarchy.push(sectorHierarchy);
            yield this.Application.Debugger.NotifySectors();
        });
    }
    GetSectorAndChildren(sector) {
        const sectors = [];
        sectors.push(sector);
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchy = this._sectorHierarchy[i];
            if (sectorHierarchy[1] !== sector)
                continue;
            const sectorChild = sectorHierarchy[0];
            sectors.push(sectorChild);
            const sectorChildren = this.GetSectorHierarchyChildren(sectorChild);
            for (let j = 0; j < sectorChildren.length; j++)
                sectors.push(sectorChildren[j]);
        }
        return (sectors);
    }
    GetSectorChildren(sector) {
        const sectors = [];
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchy = this._sectorHierarchy[i];
            if (sectorHierarchy[1] !== sector)
                continue;
            const sectorChild = sectorHierarchy[0];
            sectors.push(sectorChild);
        }
        return (sectors);
    }
    GetSectorHierarchyChildren(sector) {
        const sectors = [];
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchy = this._sectorHierarchy[i];
            if (sectorHierarchy[1] !== sector)
                continue;
            const sectorChild = sectorHierarchy[0];
            sectors.push(sectorChild);
            const sectorChildren = this.GetSectorHierarchyChildren(sectorChild);
            for (let j = 0; j < sectorChildren.length; j++)
                sectors.push(sectorChildren[j]);
        }
        return (sectors);
    }
    IsSectorReady(sector) {
        if (sector == null)
            return (true);
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchy = this._sectorHierarchy[i];
            if (sectorHierarchy[0] === sector)
                return (true);
        }
        return (false);
    }
    GetSectorHierarchyParents(sector) {
        const sectors = [sector];
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchy = this._sectorHierarchy[i];
            if (sectorHierarchy[0] !== sector)
                continue;
            const sectorParent = sectorHierarchy[1];
            if (sectorParent == null)
                continue;
            const sectorParents = this.GetSectorHierarchyParents(sectorParent);
            for (let j = 0; j < sectorParents.length; j++)
                sectors.push(sectorParents[j]);
        }
        return (sectors);
    }
    AppendSectorHierarchyBySector(sectorHierarchy, sector) {
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchyCurrent = this._sectorHierarchy[i];
            if (sectorHierarchyCurrent[0] !== sector)
                continue;
            sectorHierarchy.push([sector, sectorHierarchyCurrent[1]]);
            break;
        }
    }
    AddSectorHierarchys(sectorHierarchys) {
        for (let i = 0; i < sectorHierarchys.length; i++)
            this._sectorHierarchy.push(sectorHierarchys[i]);
    }
    AppendSectorFriendsBySector(sectorFriends, sector) {
        for (let i = 0; i < this._sectorFriends.length; i++) {
            const sectorFriend = this._sectorFriends[i];
            if (sectorFriend[0] !== sector)
                continue;
            sectorFriends.push([sector, this.Application.Solver.CloneArrayString(sectorFriend[1])]);
            break;
        }
    }
    AddSectorFriendsRange(sectorFriends) {
        for (let i = 0; i < sectorFriends.length; i++)
            this._sectorFriends.push(sectorFriends[i]);
    }
    IsSystemKey(key) {
        return ((key.length > 2) && (key[0] == '_') && (key[1] == '_'));
    }
    IsHiddenKey(key) {
        return ((key.length > 1) && (key[0] == '_'));
    }
    GetSectors() {
        const sectors = [];
        sectors.push('');
        for (let i = 0; i < this._sectorHierarchy.length; i++) {
            const sectorHierarchy = this._sectorHierarchy[i];
            const sector = sectorHierarchy[0];
            if (this.IsSystemKey(sector))
                continue;
            sectors.push(sector);
        }
        return (sectors);
    }
    IsEqualSector(sector1, sector2) {
        const sector1Root = this.IsSectorRoot(sector1);
        const sector2Root = this.IsSectorRoot(sector2);
        if ((sector1Root) && (sector2Root))
            return (true);
        if ((sector1Root) || (sector2Root))
            return (false);
        return (sector1 === sector2);
    }
    IsSectorRoot(sector) {
        return ((sector === null) || (sector === ''));
    }
    CleanSectorMetadata(sector) {
        if (sector == null)
            return;
        const sectorChildren = this.GetSectorAndChildren(sector);
        for (let i = 0; i < sectorChildren.length; i++)
            this.CleanSectorMetadataInternal(sectorChildren[i]);
    }
    CleanSectorMetadataInternal(sector) {
        for (let i = this._sectorFriends.length - 1; i >= 0; i--) {
            const sectorFriends = this._sectorFriends[i];
            if (sectorFriends[0] !== sector)
                continue;
            this._sectorFriends.splice(i, 1);
            break;
        }
        for (let i = this._sectorHierarchy.length - 1; i >= 0; i--) {
            const sectorHierarchy = this._sectorHierarchy[i];
            if (sectorHierarchy[0] !== sector)
                continue;
            this._sectorHierarchy.splice(i, 1);
        }
    }
    GetSectorsAllowed(sector) {
        if (sector == null)
            return (null);
        const sectors = this.GetSectorHierarchyParents(sector);
        for (let i = 0; i < sectors.length; i++) {
            const sectorCurrent = sectors[i];
            const sectorCurrentFriends = this.GetSectorFriends(sectorCurrent);
            if (sectorCurrentFriends == null)
                continue;
            for (let j = 0; j < sectorCurrentFriends.length; j++) {
                const sectorCurrentFriend = sectorCurrentFriends[j];
                if (this.Application.Solver.Contains(sectors, sectorCurrentFriend))
                    continue;
                sectors.push(sectorCurrentFriend);
                const sectorCurrentFriendChildren = this.GetSectorHierarchyChildren(sectorCurrentFriend);
                for (let k = 0; k < sectorCurrentFriendChildren.length; k++) {
                    const sectorCurrentFriendChild = sectorCurrentFriendChildren[k];
                    if (this.Application.Solver.Contains(sectors, sectorCurrentFriendChild))
                        continue;
                    sectors.push(sectorCurrentFriendChild);
                }
            }
        }
        return (sectors);
    }
    IsSectorAllowed(sector, sectors) {
        if (sector == null)
            return (true);
        if (sectors == null)
            return (true);
        for (let i = 0; i < sectors.length; i++)
            if (sectors[i] == sector)
                return (true);
        return (false);
    }
    AddSectorFriends(sector, sectorFriendsText) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sectorFriendsText == null)
                return;
            const friends = this.Application.Parser.ParseTags(sectorFriendsText);
            for (let i = 0; i < friends.length; i++) {
                if (this.Application.Parser.IsMustache(friends[i])) {
                    const sectorFriend = yield this.Application.Storage.RetrieveDataValue(sector, friends[i]);
                    friends.splice(i, 1);
                    friends.push(sectorFriend);
                }
            }
            for (let i = 0; i < this._sectorFriends.length; i++) {
                const sectorFriendsCurrent = this._sectorFriends[i];
                if (sectorFriendsCurrent[0] !== sector)
                    continue;
                sectorFriendsCurrent[1] = friends;
                return;
            }
            const sectorFriends = [sector, friends];
            this._sectorFriends.push(sectorFriends);
        });
    }
    GetSectorFriends(sector) {
        for (let i = 0; i < this._sectorFriends.length; i++) {
            const sectorFriends = this._sectorFriends[i];
            if (sectorFriends[0] === sector)
                return (sectorFriends[1]);
        }
        return (null);
    }
    CollectSector(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this._sectorHierarchy.length - 1; i >= 0; i--) {
                const sectorHierarchy = this._sectorHierarchy[i];
                if (sectorHierarchy[1] !== sector)
                    continue;
                const sectorCurrent = sectorHierarchy[0];
                yield this.CollectSector(sectorCurrent);
                if (this.Application.Searcher.FindByAttributeAndValue('d-sector', sectorCurrent) !== null)
                    continue;
                yield this.Application.SectorContainerHandler.UnloadSector(sectorCurrent);
            }
        });
    }
    IsFirstChild(el) {
        return (this.GetIndex(el) === 0);
    }
    IsLastChild(el) {
        return (this.GetNextAll(el).length === 0);
    }
    GetIndex(el) {
        const elParent = el.parentElement;
        if (elParent == null)
            return (-1);
        for (let i = 0; i < elParent.children.length; i++)
            if (el === elParent.children[i])
                return (i);
        return (-1);
    }
    GetNextAll(el) {
        const elParent = el.parentElement;
        if (elParent == null)
            return ([]);
        const els = [];
        let found = false;
        for (let i = 0; i < elParent.children.length; i++) {
            const elChild = elParent.children[i];
            if (el === elChild)
                found = true;
            else if (found)
                els.push(elChild);
        }
        return (els);
    }
    ReceiveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.Action === 'execute')
                yield this.ExecuteMessage(message);
            else if (message.Action === 'update')
                yield this.UpdateMessage(message);
            else
                this.Message = message;
        });
    }
    ExecuteMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this.Application.IsLoaded)
                yield this.Sleep(50);
            const storageItem = yield this.Application.Storage.RetrieveDataItem(message.DataKey, message.Sector);
            if (storageItem === null)
                return;
            if (!storageItem.IsTypeValue)
                return;
            const valueFunction = storageItem.Data;
            yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(message.Sector, null, valueFunction);
        });
    }
    UpdateMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Storage.UpdateData(message.DataKey, message.Sector, message.Data);
        });
    }
    GetClipboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = yield this.GetClipboardValueAsync();
                if (value !== null)
                    return (value);
                return (this.GetClipboardValueExecCommand());
            }
            catch (_a) {
                return ('');
            }
        });
    }
    GetClipboardValueAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const clipboard = navigator.clipboard;
            if (clipboard == null)
                return (null);
            if (!clipboard.readText)
                return (null);
            const value = yield clipboard.readText();
            return (value);
        });
    }
    GetClipboardValueExecCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            const el = document.createElement('textarea');
            document.body.appendChild(el);
            el.select();
            document.execCommand('paste');
            const value = el.value;
            document.body.removeChild(el);
            return (value);
        });
    }
    SetClipboard(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.SetClipboardEvent(value))
                return (true);
            return (yield this.SetClipboardTextArea(value));
        });
    }
    SetClipboardEvent(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = false;
            const listener = (ev) => {
                if (!ev.clipboardData)
                    return (false);
                ev.preventDefault();
                ev.clipboardData.setData('text/plain', value);
                result = true;
                return (true);
            };
            try {
                document.addEventListener('copy', listener);
                document.execCommand('copy');
            }
            catch (_a) {
                return (false);
            }
            finally {
                document.removeEventListener('copy', listener);
            }
            return (result);
        });
    }
    SetClipboardTextArea(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = document.createElement('textarea');
            el.setAttribute('style', 'width:1px;height:0px;border:0;opacity:0;');
            el.value = value;
            document.body.appendChild(el);
            el.select();
            const result = document.execCommand('copy');
            document.body.removeChild(el);
            return (result);
        });
    }
    StartUnitTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const elUnitTest = this.Application.Searcher.FindByAttributeAndValue('d-id', '__drapoUnitTest');
            if ((elUnitTest == null))
                return;
            yield this.Application.EventHandler.TriggerClick(elUnitTest);
        });
    }
}
//# sourceMappingURL=DrapoDocument.js.map