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
class DrapoWindowHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._windows = [];
        this._application = application;
    }
    CreateAndShowWindowDefinition(name, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const windowDefinition = yield this.GetWindowDefinition(name);
            if (windowDefinition === null)
                return;
            const uri = windowDefinition.Path;
            const did = windowDefinition.Did;
            const parametersDefault = windowDefinition.Parameters;
            yield this.CreateAndShowWindow(uri, did, parameters, parametersDefault);
        });
    }
    CreateAndShowWindow(uri, did, parameters, parametersDefault = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const elWindowsDid = this.Application.Searcher.FindByAttributeAndValue('d-id', did);
            if (elWindowsDid == null)
                return;
            const allowMultipleInstanceUrl = (!(elWindowsDid.getAttribute('d-window-allowMultipleInstanceUrl') === 'false'));
            if ((!allowMultipleInstanceUrl) && (this.IsWindowLoaded(uri, did)))
                return;
            const windowContent = yield this.Application.Server.GetViewHTML(uri);
            if (windowContent === null)
                return;
            const elContent = this.Application.Document.CreateHTMLElement(windowContent, true);
            let content = elContent.outerHTML;
            for (let i = 0; i < parameters.length; i++) {
                const parameter = parameters[i];
                content = content.replace(parameter[0], parameter[1]);
            }
            if (parametersDefault != null) {
                for (const parameterCode in parametersDefault) {
                    const parameterValue = parametersDefault[parameterCode];
                    content = content.replace(parameterCode, parameterValue);
                }
            }
            let windowElement = null;
            const attributes = this.Application.Parser.ParseElementAttributes(content);
            const templateUrl = this.Application.Solver.Get(attributes, 'd-templateurl');
            let template = templateUrl === null ? null : this.Application.Solver.Get(attributes, 'd-template');
            if (template === null)
                template = 'template';
            let onLoad = null;
            const templateUrlContent = templateUrl === null ? null : yield this.Application.Server.GetViewHTML(templateUrl);
            const templateContent = templateUrlContent === null ? null : this.Application.Parser.ParseDocumentContent(templateUrlContent);
            if (templateContent !== null) {
                elWindowsDid.append(this.Application.Document.CreateHTMLElement(templateContent));
                windowElement = elWindowsDid.children[elWindowsDid.children.length - 1];
                const windowElementTemplate = this.Application.Searcher.FindByAttributeAndValueFromParent('d-template', template, windowElement);
                if (windowElementTemplate === null) {
                    this.Application.Document.SetHTML(windowElement, content);
                }
                else {
                    this.Application.Document.SetHTML(windowElementTemplate, content);
                    const elTemplate = windowElementTemplate;
                    onLoad = elTemplate.getAttribute('d-on-load');
                }
            }
            else {
                elWindowsDid.append(this.Application.Document.CreateHTMLElement(content));
                windowElement = elWindowsDid.children[elWindowsDid.children.length - 1];
            }
            const elWindow = windowElement;
            const sector = this.Application.Document.GetSectorParent(elWindow);
            let elSector = elWindow.getAttribute('d-sector');
            if (elSector === "@") {
                elSector = this.Application.Document.CreateGuid();
                elWindow.setAttribute('d-sector', elSector);
                yield this.Application.Document.AddSectorHierarchy(elSector, sector);
            }
            const window = new DrapoWindow();
            window.Code = this.Application.Document.CreateGuid();
            window.Did = did;
            window.Uri = uri;
            window.Element = windowElement;
            this._windows.push(window);
            yield this.Application.Document.ResolveWindow(window.Element);
            if (onLoad != null)
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(elSector, elWindow, onLoad);
        });
    }
    IsWindowLoaded(uri, did) {
        for (let i = this._windows.length - 1; i >= 0; i--) {
            const window = this._windows[i];
            if ((window.Did === did) && (window.Uri === uri))
                return (true);
        }
        return (false);
    }
    CloseWindow(did, all, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._windows.length == 0)
                return;
            const isTypeHidden = type === 'hidden';
            for (let i = this._windows.length - 1; i >= 0; i--) {
                const window = this._windows[i];
                if ((did !== null) && (did !== '') && (window.Did !== did) && (window.Code !== did))
                    continue;
                if ((isTypeHidden) && (window.Visible))
                    continue;
                yield this.DestroyWindowElement(window);
                this._windows.splice(i, 1);
                if (!all)
                    break;
            }
        });
    }
    TryClose(window) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = window.Element.parentElement;
            if (parent == null)
                return;
            yield this.DestroyWindowElement(window);
            for (let i = this._windows.length - 1; i >= 0; i--) {
                if (window !== this._windows[i])
                    continue;
                this._windows.splice(i, 1);
                break;
            }
        });
    }
    DestroyWindowElement(window) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Document.RemoveElement(window.Element);
            yield this.Application.ComponentHandler.UnloadComponentInstancesDetachedFullCheck();
        });
    }
    HideWindow(did, all) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._windows.length == 0)
                return;
            let windowHidden = null;
            for (let i = this._windows.length - 1; i >= 0; i--) {
                const window = this._windows[i];
                if ((did !== null) && (did !== '') && (window.Did !== did))
                    continue;
                if (!window.Visible)
                    continue;
                window.Visible = false;
                windowHidden = window;
                this.Application.Document.Hide(window.Element);
                if (!all)
                    break;
            }
            return (windowHidden);
        });
    }
    GetWindowDefinition(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const windows = yield this.Application.Config.GetSector("Windows");
            if (windows === null)
                return (null);
            for (let i = 0; i < windows.length; i++) {
                const window = windows[i];
                if (window.Name === name)
                    return (window);
            }
            return (null);
        });
    }
    GetWindowByElement(el) {
        while (el !== null) {
            for (let i = this._windows.length - 1; i >= 0; i--) {
                const window = this._windows[i];
                if (window.Element === el)
                    return (window);
            }
            el = el.parentElement;
        }
        return (null);
    }
}
//# sourceMappingURL=DrapoWindowHandler.js.map