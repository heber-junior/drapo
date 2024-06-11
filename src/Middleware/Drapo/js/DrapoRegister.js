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
class DrapoRegister {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._components = [];
        this._cacheKeys = [];
        this._cacheDatas = [];
        this._application = application;
    }
    GetRegisteredComponent(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            const components = yield this.Application.Config.GetSector("Components");
            if (components == null)
                return (null);
            for (let i = 0; i < components.length; i++) {
                const component = components[i];
                if (component.Tag == tagName)
                    return (component);
            }
            return (null);
        });
    }
    IsRegisteredComponent(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield this.GetRegisteredComponent(tagName)) != null);
        });
    }
    IsActiveComponent(tagName) {
        for (let i = 0; i < this._components.length; i++)
            if (this._components[i] === tagName)
                return (true);
        return (false);
    }
    ActivateComponent(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            const component = yield this.GetRegisteredComponent(tagName);
            this._components.push(tagName);
            for (let i = 0; i < component.Files.length; i++) {
                const file = component.Files[i];
                if (file.Type === 2)
                    yield this.ActivateComponentFileScript(component, file);
                else if (file.Type === 1)
                    yield this.ActivateComponentFileStyle(component, file);
            }
        });
    }
    ActivateComponentFileScript(component, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const relatedUrl = yield this.GetComponentFileUrl(component, file);
            const url = this.Application.Server.ResolveUrl(relatedUrl);
            const script = document.createElement('script');
            script.src = url;
            script.async = false;
            document.head.appendChild(script);
        });
    }
    ActivateComponentFileStyle(component, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const relatedUrl = yield this.GetComponentFileUrl(component, file);
            const url = this.Application.Server.ResolveUrl(relatedUrl);
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        });
    }
    CreateInstanceComponent(tagName, el) {
        return __awaiter(this, void 0, void 0, function* () {
            const component = yield this.GetRegisteredComponent(tagName);
            if ((component.Constructor == null) || (component.Constructor == ''))
                return;
            yield this.WaitForFunction(component.Constructor);
            const constructor = window[component.Constructor];
            if (constructor == null)
                return;
            const result = constructor(el, this.Application);
            if (Promise.resolve(result) == result) {
                const resultPromise = result;
                return (yield resultPromise);
            }
            return (null);
        });
    }
    WaitForFunction(functionName, retry = 1000, interval = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < retry; i++) {
                const functionReference = window[functionName];
                if (functionReference != null)
                    return;
                yield this.Application.Document.Sleep(interval);
            }
        });
    }
    GetRegisteredComponentViewContent(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            const component = yield this.GetRegisteredComponent(tagName);
            if (component == null)
                return (null);
            for (let i = 0; i < component.Files.length; i++) {
                const file = component.Files[i];
                if (file.Type === 0)
                    return (yield this.GetRegisteredComponentFileContent(component, file));
            }
            return (null);
        });
    }
    GetRegisteredComponentFileContent(component, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.CreateKeyComponentFile(component, file);
            let index = this.GetCacheKeyIndex(key);
            if (index == null)
                index = this.AddCacheData(key, yield this.GetRegisteredComponentFileContentInternal(component, file));
            return (this.GetCacheData(index));
        });
    }
    GetComponentFileUrl(component, file) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = file.ResourceType === 1 ? file.Path : '~/components/' + component.Name + '/' + file.Name;
            url += yield this.Application.Server.AppendUrlQueryStringCacheStatic(url);
            return (url);
        });
    }
    GetRegisteredComponentFileContentInternal(component, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.GetComponentFileUrl(component, file);
            const htmlCached = this.Application.CacheHandler.GetCachedComponentView(url);
            if (htmlCached != null)
                return (htmlCached);
            const response = yield this.Application.Server.GetHTML(url);
            if (response == null)
                return (null);
            const html = response[0];
            const allowCache = response[1];
            if (allowCache)
                this.Application.CacheHandler.SetCachedComponentView(url, html);
            return (html);
        });
    }
    CreateKeyComponentFile(component, file) {
        return (component.Name + ':' + file.Name);
    }
    GetCacheKeyIndex(dataKey) {
        for (let i = 0; i < this._cacheKeys.length; i++) {
            if (this._cacheKeys[i] == dataKey)
                return (i);
        }
        return (null);
    }
    GetCacheData(dataIndex) {
        return (this._cacheDatas[dataIndex]);
    }
    AddCacheData(dataKey, data) {
        this._cacheKeys.push(dataKey);
        this._cacheDatas.push(data);
        return (this._cacheKeys.length - 1);
    }
    IsEndsWith(text, value) {
        const length = value.length;
        if (text.length < length)
            return (false);
        return (text.substr(text.length - length) === value);
    }
}
//# sourceMappingURL=DrapoRegister.js.map