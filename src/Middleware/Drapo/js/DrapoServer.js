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
class DrapoServer {
    get Application() {
        return (this._application);
    }
    get HasBadRequest() {
        return (this._hasBadRequest);
    }
    set HasBadRequest(value) {
        this._hasBadRequest = value;
    }
    constructor(application) {
        this._token = null;
        this._tokenAntiforgery = null;
        this._requestHeaders = [];
        this._requestHeadersNext = [];
        this._hasBadRequest = false;
        this._headerContainerIdKey = null;
        this._headerContainerIdValue = null;
        this._isInsideTimestamp = false;
        this._application = application;
        this.InitializeServer();
    }
    InitializeServer() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const source = script.src;
            const index = source.indexOf('/drapo.js');
            if ((index == null) || (index < 0))
                continue;
            this._url = source.substr(0, index);
            return;
        }
        this._url = '';
    }
    ResolveUrl(url) {
        if (url.substr(0, 1) == '~')
            return (this._url + url.substr(1));
        return (url);
    }
    AppendUrlQueryStringCacheStatic(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const useCacheStatic = yield this.Application.Config.GetUseCacheStatic();
            if (!useCacheStatic)
                return ('');
            const applicationBuild = yield this.Application.Config.GetApplicationBuild();
            if (applicationBuild == '')
                return ('');
            if (url.indexOf('ab=') >= 0)
                return ('');
            return ((url.indexOf('?') >= 0 ? '&' : '?') + 'ab=' + applicationBuild);
        });
    }
    AppendUrlQueryStringTimestamp(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = new Date().getTime();
            const timestampConfig = yield this.Application.Config.GetTimestamp();
            const timestampMustache = ((timestampConfig == null) || (timestampConfig == '') || (this._isInsideTimestamp)) ? '{{ts}}' : timestampConfig;
            const timestampMustacheTimestamp = timestampMustache.replace('{{ts}}', timestamp.toString());
            this._isInsideTimestamp = true;
            const timestampResolved = yield this.Application.Storage.ResolveMustachesRecursive(null, timestampMustacheTimestamp);
            this._isInsideTimestamp = false;
            return (url + (url.indexOf('?') >= 0 ? '&' : '?') + 'ts=' + timestampResolved);
        });
    }
    GetViewHTML(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlCached = this.Application.CacheHandler.GetCachedView(url);
            if (htmlCached != null)
                return (htmlCached);
            const response = yield this.Application.Server.GetHTML(url);
            if (response == null)
                return (null);
            const html = response[0];
            const allowCache = response[1];
            if (allowCache)
                this.Application.CacheHandler.SetCachedView(url, html);
            return (html);
        });
    }
    GetHTML(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestHeaders = [];
            this.InsertHeader(requestHeaders, 'X-Requested-With', 'XMLHttpRequest');
            if (this._headerContainerIdValue !== null)
                requestHeaders.push([this._headerContainerIdKey, this._headerContainerIdValue]);
            let urlResolved = this.ResolveUrl(url);
            urlResolved += yield this.AppendUrlQueryStringCacheStatic(url);
            const request = new DrapoServerRequest('GET', urlResolved, requestHeaders, null, true);
            const response = yield this.Request(request);
            const responseText = response.Body;
            const responseStatus = response.Status;
            if (responseStatus == 200) {
                return ([responseText, response.IsCacheAllowed()]);
            }
            return (null);
        });
    }
    GetJSON(url, verb = "GET", data = null, contentType = null, dataKey = null, headers = null, headersResponse = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestHeaders = [];
            this.InsertHeaders(requestHeaders, this.GetRequestHeaders());
            this.InsertHeaders(requestHeaders, headers);
            if (contentType != null)
                this.InsertHeader(requestHeaders, 'Content-Type', contentType);
            this.InsertHeader(requestHeaders, 'X-Requested-With', 'XMLHttpRequest');
            this.InsertHeader(requestHeaders, 'Cache-Control', 'no-cache, no-store, must-revalidate');
            if (this._headerContainerIdValue !== null)
                requestHeaders.push([this._headerContainerIdKey, this._headerContainerIdValue]);
            if ((this._tokenAntiforgery != null))
                this.InsertHeader(requestHeaders, yield this.Application.Config.GetHeaderCSRF(), this._tokenAntiforgery);
            const urlResolved = this.ResolveUrl(url);
            const urlResolvedTimestamp = yield this.AppendUrlQueryStringTimestamp(urlResolved);
            const cookieValues = this.Application.CookieHandler.GetCookieValues();
            const request = new DrapoServerRequest(verb, urlResolvedTimestamp, requestHeaders, data, true);
            const response = yield this.Request(request);
            if ((200 <= response.Status) && (response.Status < 400)) {
                const location = this.GetHeaderValue(response.Headers, 'Location');
                if (location !== null)
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, 'RedirectPage(' + location + ')', this.Application.FunctionHandler.CreateExecutionContext(false));
            }
            if (response.Status == 200) {
                yield this.Application.CookieHandler.HandleCookieValuesChanges(cookieValues);
                if (response.Body == '')
                    return (null);
                if (headersResponse !== null) {
                    this.InsertHeaders(headersResponse, response.Headers);
                    return response.Body;
                }
                let dataResponse;
                dataResponse = this.Application.Serializer.Deserialize(response.Body);
                return (dataResponse);
            }
            else if (response.Status == 204) {
                return (null);
            }
            else if (response.Status == 400) {
                this.HasBadRequest = true;
                const onBadRequest = yield this.Application.Config.GetOnBadRequest();
                if (onBadRequest !== null) {
                    const storageBadRequest = yield this.Application.Config.GetStorageBadRequest();
                    if (storageBadRequest !== null) {
                        const dataResponse = this.Application.Serializer.Deserialize(response.Body);
                        yield this.Application.Storage.UpdateData(storageBadRequest, null, dataResponse);
                    }
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, onBadRequest, this.Application.FunctionHandler.CreateExecutionContext(false));
                    return ([]);
                }
                return ([]);
            }
            else if (response.Status == 401) {
                if (dataKey !== null)
                    yield this.Application.Document.RequestAuthorization(dataKey, 'notify');
            }
            else if (response.Status == 500) {
                this.HasBadRequest = true;
                const onError = yield this.Application.Config.GetOnError();
                if (onError !== null) {
                    const storageErrors = yield this.Application.Config.GetStorageErrors();
                    if (storageErrors !== null) {
                        const error = this.Application.Serializer.IsJson(response.Body) ? this.Application.Serializer.Deserialize(response.Body) : response.Body;
                        yield this.Application.Storage.AddDataItem(storageErrors, null, null, this.Application.Storage.CreateErrorForStorage('DataRequest', 'Error requesting data for :' + url, error));
                    }
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, onError, this.Application.FunctionHandler.CreateExecutionContext(false));
                    return ([]);
                }
                return ([]);
            }
            return ([]);
        });
    }
    GetFile(url, verb, data, contentType = null, dataKey = null, headers = null, headersResponse = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestHeaders = [];
            this.InsertHeaders(requestHeaders, this.GetRequestHeaders());
            this.InsertHeaders(requestHeaders, headers);
            this.InsertHeader(requestHeaders, 'X-Requested-With', 'XMLHttpRequest');
            this.InsertHeader(requestHeaders, 'Cache-Control', 'no-cache, no-store, must-revalidate');
            if (this._headerContainerIdValue !== null)
                requestHeaders.push([this._headerContainerIdKey, this._headerContainerIdValue]);
            if (contentType != null)
                this.InsertHeader(requestHeaders, 'Content-Type', contentType);
            if ((this._tokenAntiforgery != null))
                this.InsertHeader(requestHeaders, yield this.Application.Config.GetHeaderCSRF(), this._tokenAntiforgery);
            const urlResolved = this.ResolveUrl(url);
            const urlResolvedTimestamp = yield this.AppendUrlQueryStringTimestamp(urlResolved);
            const request = new DrapoServerRequest(verb, urlResolvedTimestamp, requestHeaders, data, true, true);
            const response = yield this.Request(request);
            if ((200 <= response.Status) && (response.Status < 400)) {
                const location = this.GetHeaderValue(response.Headers, 'Location');
                if (location !== null)
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, 'RedirectPage(' + location + ')', this.Application.FunctionHandler.CreateExecutionContext(false));
            }
            if (response.Status == 200) {
                if (response.Body == '')
                    return (null);
                if (headersResponse !== null) {
                    this.InsertHeaders(headersResponse, response.Headers);
                    return (this.CreateFileObject(headersResponse, response.Body));
                }
                let dataResponse;
                dataResponse = this.Application.Serializer.Deserialize(response.Body);
                return (dataResponse);
            }
            else if (response.Status == 204) {
                return (null);
            }
            else if (response.Status == 400) {
                this.HasBadRequest = true;
                const onBadRequest = yield this.Application.Config.GetOnBadRequest();
                if (onBadRequest !== null) {
                    const storageBadRequest = yield this.Application.Config.GetStorageBadRequest();
                    if (storageBadRequest !== null) {
                        const dataResponse = this.Application.Serializer.Deserialize(response.Body);
                        yield this.Application.Storage.UpdateData(storageBadRequest, null, dataResponse);
                    }
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, onBadRequest, this.Application.FunctionHandler.CreateExecutionContext(false));
                    return ([]);
                }
                return ([]);
            }
            else if (response.Status == 401) {
                if (dataKey !== null)
                    yield this.Application.Document.RequestAuthorization(dataKey, 'notify');
            }
            else if (response.Status == 500) {
                this.HasBadRequest = true;
                const onError = yield this.Application.Config.GetOnError();
                if (onError !== null) {
                    const storageErrors = yield this.Application.Config.GetStorageErrors();
                    if (storageErrors !== null) {
                        const error = this.Application.Serializer.IsJson(response.Body) ? this.Application.Serializer.Deserialize(response.Body) : response.Body;
                        yield this.Application.Storage.AddDataItem(storageErrors, null, null, this.Application.Storage.CreateErrorForStorage('DataRequest', 'Error requesting data for :' + url, error));
                    }
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, onError, this.Application.FunctionHandler.CreateExecutionContext(false));
                    return ([]);
                }
                return ([]);
            }
            return ([]);
        });
    }
    CreateFileObject(headers, body) {
        const object = {};
        object.body = body;
        object.length = body.size;
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const key = header[0].toLowerCase();
            const keyClean = key.replace('-', '');
            const value = header[1];
            object[keyClean] = value;
            if (keyClean !== 'contentdisposition')
                continue;
            const contentDispositionValues = value.split(';');
            for (let j = 0; j < contentDispositionValues.length; j++) {
                const contentDispositionValue = contentDispositionValues[j];
                const contentDispositionValueClean = contentDispositionValue[0] === ' ' ? contentDispositionValue.substring(1) : contentDispositionValue;
                const index = contentDispositionValueClean.indexOf('=');
                if (index < 0)
                    continue;
                const contentDispositionValueCleanKey = contentDispositionValueClean.substring(0, index);
                if (contentDispositionValueCleanKey === 'filename') {
                    let contentDispositionKeyValue = contentDispositionValueClean.substring(index + 1);
                    if ((contentDispositionKeyValue.length > 2) && (contentDispositionKeyValue[0] === '"') && (contentDispositionKeyValue[contentDispositionKeyValue.length - 1] === '"'))
                        contentDispositionKeyValue = contentDispositionKeyValue.substring(1, contentDispositionKeyValue.length - 1);
                    if ((contentDispositionKeyValue.length > 2) && (contentDispositionKeyValue[0] === "'") && (contentDispositionKeyValue[contentDispositionKeyValue.length - 1] === "'"))
                        contentDispositionKeyValue = contentDispositionKeyValue.substring(1, contentDispositionKeyValue.length - 1);
                    object.filename = contentDispositionKeyValue;
                }
                if (contentDispositionValueCleanKey === 'filename*') {
                    let contentDispositionKeyValue = contentDispositionValueClean.substring(index + 1);
                    if (contentDispositionKeyValue.indexOf('UTF-8\'\'') === 0)
                        contentDispositionKeyValue = contentDispositionKeyValue.substring('UTF-8\'\''.length, contentDispositionKeyValue.length);
                    if ((contentDispositionKeyValue.length > 2) && (contentDispositionKeyValue[0] === '"') && (contentDispositionKeyValue[contentDispositionKeyValue.length - 1] === '"'))
                        contentDispositionKeyValue = contentDispositionKeyValue.substring(1, contentDispositionKeyValue.length - 1);
                    if ((contentDispositionKeyValue.length > 2) && (contentDispositionKeyValue[0] === "'") && (contentDispositionKeyValue[contentDispositionKeyValue.length - 1] === "'"))
                        contentDispositionKeyValue = contentDispositionKeyValue.substring(1, contentDispositionKeyValue.length - 1);
                    object.filename = decodeURI(contentDispositionKeyValue);
                    break;
                }
            }
        }
        return (object);
    }
    ConvertFileBody(body) {
        if ((body.length > 2) && (body[0] === '"') && (body[body.length - 1] === '"'))
            return (body.substring(1, body.length - 1));
        if ((body.length > 2) && (body[0] === "'") && (body[body.length - 1] === "'"))
            return (body.substring(1, body.length - 1));
        return (btoa(body));
    }
    Request(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestDebbuger = yield this.Application.Debugger.CreateRequest(request.Url);
            const response = yield this.RequestInternal(request);
            yield this.SetContainerId(response);
            yield this.Application.Debugger.FinishRequest(requestDebbuger);
            return (response);
        });
    }
    RequestInternal(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = this.Application;
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.withCredentials = true;
                xhr.onload = () => {
                    resolve(application.Server.CreateResponse(request, xhr));
                };
                xhr.open(request.Verb, request.Url, true);
                if (request.Headers != null) {
                    for (let i = 0; i < request.Headers.length; i++) {
                        const header = request.Headers[i];
                        xhr.setRequestHeader(header[0], application.Serializer.EnsureASCII(header[1]));
                    }
                }
                if (request.Binary)
                    xhr.responseType = 'blob';
                xhr.send(request.Body);
            });
        });
    }
    CreateResponse(request, xhr) {
        const headers = [];
        if (request.ExtractHeaders)
            this.ExtractHeaders(xhr, headers);
        let body = null;
        if (request.Binary)
            body = xhr.response;
        else
            body = xhr.responseText;
        return (new DrapoServerResponse(xhr.status, headers, body));
    }
    ExtractHeaders(xhr, headers) {
        const responseHeaders = xhr.getAllResponseHeaders();
        const lines = this.Application.Parser.ParseLines(responseHeaders);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const header = this.Application.Parser.ParseHeader(line);
            if (header != null)
                headers.push(header);
        }
    }
    InsertHeaders(headers, headersInsert) {
        if (headersInsert == null)
            return;
        for (let i = 0; i < headersInsert.length; i++) {
            const header = headersInsert[i];
            this.InsertHeader(headers, header[0], header[1]);
        }
    }
    InsertHeader(headers, name, value) {
        headers.push([name, value]);
    }
    GetHeaderValue(headers, name) {
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header[0].toLowerCase() === name.toLowerCase())
                return (header[1]);
        }
        return (null);
    }
    SetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._token === token)
                return (false);
            this._token = token;
            if (this._token === null) {
                yield this.Application.Storage.ClearDataToken();
            }
            else {
                yield this.Application.Observer.NotifyAuthorization();
            }
            return (true);
        });
    }
    HasToken() {
        return (this._token != null);
    }
    SetTokenAntiforgery(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._tokenAntiforgery === token)
                return (false);
            const headerCSRF = yield this.Application.Config.GetHeaderCSRF();
            if ((headerCSRF == null) || (headerCSRF == ''))
                return;
            this._tokenAntiforgery = token;
            return (true);
        });
    }
    GetRequestHeaders() {
        if (this._requestHeadersNext.length === 0)
            return (this._requestHeaders);
        const headers = [];
        this.AddHeader(headers, this._requestHeaders);
        this.AddHeader(headers, this._requestHeadersNext);
        this._requestHeadersNext = [];
        return (headers);
    }
    AddHeader(headers, headersInsert) {
        for (let i = 0; i < headersInsert.length; i++)
            headers.push(headersInsert[i]);
    }
    AddRequestHeader(key, value) {
        for (let i = this._requestHeaders.length - 1; i >= 0; i--) {
            const requestHeader = this._requestHeaders[i];
            if (requestHeader[0] !== key)
                continue;
            requestHeader[1] = value;
            return;
        }
        this._requestHeaders.push([key, value]);
    }
    GetRequestHeader(key) {
        for (let i = this._requestHeaders.length - 1; i >= 0; i--) {
            const header = this._requestHeaders[i];
            if (header[0] === key)
                return (header[1]);
        }
        return (null);
    }
    AddNextRequestHeader(key, value) {
        this._requestHeadersNext.push([key, value]);
    }
    EnsureUrlEncoded(url) {
        if ((url == null) || (url == ''))
            return (url);
        if (this.IsUrlEncoded(url))
            return (url);
        let urlEncoded = encodeURI(url);
        urlEncoded = urlEncoded.replace(/[+]/g, '%2B');
        urlEncoded = urlEncoded.replace(/[$]/g, '%24');
        urlEncoded = urlEncoded.replace(/[#]/g, '%23');
        urlEncoded = urlEncoded.replace(/[,]/g, '%2C');
        urlEncoded = urlEncoded.replace(/[;]/g, '%3B');
        return (urlEncoded);
    }
    EnsureUrlComponentEncoded(url) {
        if ((url == null) || (url == ''))
            return (url);
        if (this.IsUrlEncoded(url))
            return (url);
        return (encodeURIComponent(url));
    }
    IsUrlEncoded(url) {
        if ((url == null) || (url == '') || (url.indexOf == null))
            return (false);
        const hasPercentage = url.indexOf('%') >= 0;
        if (!hasPercentage)
            return (false);
        const hasPercentageEncoded = url.indexOf('%25') >= 0;
        if (hasPercentageEncoded)
            return (true);
        const hasAndEncoded = url.indexOf('%26') >= 0;
        if (hasAndEncoded)
            return (true);
        const hasSpacedEncoded = url.indexOf('%20') >= 0;
        if (hasSpacedEncoded)
            return (true);
        const hasPlusEncoded = url.indexOf('%2B') >= 0;
        if (hasPlusEncoded)
            return (true);
        const hasCedilhaLCase = url.indexOf('%C3%A7') >= 0;
        if (hasCedilhaLCase)
            return (true);
        const hasCedilhaUCase = url.indexOf('%C3%87') >= 0;
        if (hasCedilhaUCase)
            return (true);
        const hasATilLCase = (url.indexOf('%C3%A3') >= 0 || url.indexOf('%C3%B5') >= 0 || url.indexOf('%C3%B1') >= 0);
        if (hasATilLCase)
            return (true);
        const hasATilUCase = (url.indexOf('%C3%83') >= 0 || url.indexOf('%C3%95') >= 0 || url.indexOf('%C3%91') >= 0);
        if (hasATilUCase)
            return (true);
        const hasAcuteAccentUCase = (url.indexOf('%C3%81') >= 0 || url.indexOf('%C3%89') >= 0 || url.indexOf('%C3%8D') >= 0 || url.indexOf('%C3%93') >= 0 || url.indexOf('%C3%9A') >= 0);
        if (hasAcuteAccentUCase)
            return (true);
        const hasAcuteAccentLCase = (url.indexOf('%C3%A1') >= 0 || url.indexOf('%C3%A9') >= 0 || url.indexOf('%C3%AD') >= 0 || url.indexOf('%C3%B3') >= 0 || url.indexOf('%C3%BA') >= 0);
        if (hasAcuteAccentLCase)
            return (true);
        const hasCircumflexAccentUCase = (url.indexOf('%C3%82') >= 0 || url.indexOf('%C3%8A') >= 0 || url.indexOf('%C3%94') >= 0);
        if (hasCircumflexAccentUCase)
            return (true);
        const hasCircumflexAccentLCase = (url.indexOf('%C3%A2') >= 0 || url.indexOf('%C3%AA') >= 0 || url.indexOf('%C3%B4') >= 0);
        if (hasCircumflexAccentLCase)
            return (true);
        return (false);
    }
    SetContainerId(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._headerContainerIdKey == null)
                this._headerContainerIdKey = yield this.Application.Config.GetHeaderContainerId();
            if ((this._headerContainerIdKey == null) || (this._headerContainerIdKey == ''))
                return;
            for (let i = 0; i < response.Headers.length; i++) {
                const header = response.Headers[i];
                if (header[0].toLowerCase() !== this._headerContainerIdKey.toLowerCase())
                    continue;
                this._headerContainerIdValue = header[1];
                break;
            }
        });
    }
}
//# sourceMappingURL=DrapoServer.js.map