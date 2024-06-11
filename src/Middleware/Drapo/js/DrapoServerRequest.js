"use strict";
class DrapoServerRequest {
    get Verb() {
        return (this._verb);
    }
    set Verb(value) {
        this._verb = value;
    }
    get Url() {
        return (this._url);
    }
    set Url(value) {
        this._url = value;
    }
    get Headers() {
        return (this._headers);
    }
    set Headers(value) {
        this._headers = value;
    }
    get Body() {
        return (this._body);
    }
    set Body(value) {
        this._body = value;
    }
    get ExtractHeaders() {
        return (this._extractHeaders);
    }
    set ExtractHeaders(value) {
        this._extractHeaders = value;
    }
    set Binary(value) {
        this._binary = value;
    }
    get Binary() {
        return (this._binary);
    }
    constructor(verb, url, headers, body, extractHeaders, binary = false) {
        this._verb = 'GET';
        this._url = null;
        this._headers = [];
        this._body = null;
        this._extractHeaders = false;
        this._binary = false;
        this._verb = verb;
        this._url = url;
        this._headers = headers;
        this._body = body;
        this._extractHeaders = extractHeaders;
        this._binary = binary;
    }
}
//# sourceMappingURL=DrapoServerRequest.js.map