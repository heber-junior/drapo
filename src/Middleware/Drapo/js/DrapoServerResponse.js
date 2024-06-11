"use strict";
class DrapoServerResponse {
    get Status() {
        return (this._status);
    }
    set Status(value) {
        this._status = value;
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
    constructor(status, headers, body) {
        this._status = null;
        this._headers = [];
        this._body = null;
        this._cookies = null;
        this._status = status;
        this._headers = headers;
        this._body = body;
    }
    IsCacheAllowed() {
        if (this._headers == null)
            return (true);
        for (let i = 0; i < this._headers.length; i++) {
            const entry = this._headers[i];
            const key = entry[0].toLowerCase();
            if (key != 'cache-control')
                continue;
            const value = entry[1].toLowerCase();
            if (value == 'no-store')
                return (false);
            if (value == 'no-cache')
                return (false);
        }
        return (true);
    }
    GetCookieValue(name) {
        const cookies = this.GetCookies();
        for (let i = 0; i < cookies.length; i++)
            if (cookies[i][0] === name)
                return (cookies[i][1]);
        return (null);
    }
    GetCookies() {
        if (this._cookies == null)
            this._cookies = this.GetCookiesInternal();
        return (this._cookies);
    }
    GetCookiesInternal() {
        const cookies = [];
        for (let i = 0; i < this._headers.length; i++) {
            const header = this._headers[i];
            if (header[0].toLowerCase() !== 'set-cookie')
                continue;
            const headerCookies = header[1];
            const cookiesList = headerCookies.split(';');
            for (let j = 0; j < cookiesList.length; j++) {
                const cookie = cookiesList[j];
                const cookieParts = cookie.split('=');
                cookies.push([cookieParts[0], cookieParts[1]]);
            }
        }
        return (cookies);
    }
}
//# sourceMappingURL=DrapoServerResponse.js.map