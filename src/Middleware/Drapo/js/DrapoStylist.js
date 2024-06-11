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
class DrapoStylist {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    Create(values, name = null) {
        const styleName = ((name === null) || (name === '')) ? this.CreateStyleName() : name;
        const elStyle = document.createElement('style');
        elStyle.id = styleName;
        elStyle.type = 'text/css';
        const style = this.StringfyValues(values);
        elStyle.innerHTML = '.' + styleName + ' \n{\n ' + style + ' }';
        document.head.appendChild(elStyle);
        return (styleName);
    }
    CreateStyleName() {
        return ('s-' + this.Application.Document.CreateGuid());
    }
    StringfyValues(values) {
        let valueText = '';
        for (let i = 0; i < values.length; i++) {
            const entry = values[i];
            const valueEntry = entry[0] + ':' + entry[1] + ';\n';
            valueText += valueEntry;
        }
        return (valueText);
    }
    ReloadStyles() {
        return __awaiter(this, void 0, void 0, function* () {
            const reloaded = [];
            const length = document.head.childNodes.length;
            for (let i = 0; i < length; i++) {
                const childNode = document.head.childNodes[i];
                if (childNode.nodeName.toLowerCase() !== 'link')
                    continue;
                const link = childNode;
                const url = link.href;
                if (reloaded.indexOf(url) >= 0)
                    continue;
                reloaded.push(url);
                document.head.removeChild(childNode);
                yield this.AddStyleToDocument(url);
                if (i === length - 1)
                    break;
                i--;
            }
        });
    }
    AddStyleToDocument(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        });
    }
    GetElementStyleProperty(el, name) {
        const elStyle = window.getComputedStyle(el);
        const value = elStyle.getPropertyValue(name);
        return (value);
    }
    SetElementStyleProperty(el, name, value) {
        el.style.setProperty(name, value);
    }
}
//# sourceMappingURL=DrapoStylist.js.map