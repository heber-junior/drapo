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
class DrapoCookieHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    RetrieveData(name = 'drapo') {
        const data = this.CreateStructure(name);
        const values = this.GetCookieValues(name);
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            data[value[0]] = value[1];
        }
        return (data);
    }
    CreateStructure(name) {
        const object = {};
        if (name.toLowerCase() == 'drapo') {
            object.theme = '';
            object.view = '';
            object.culture = '';
        }
        return (object);
    }
    GetCookieValues(name = 'drapo') {
        const values = [];
        const cookieValue = this.GetCookieValue(name);
        if (cookieValue == null)
            return (values);
        return (this.CreateCookieValues(cookieValue));
    }
    GetCookieValue(name) {
        const nameEqual = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(nameEqual) == 0) {
                return (cookie.substring(nameEqual.length, cookie.length));
            }
        }
        return (null);
    }
    CreateCookieValues(value) {
        const valueDecoded = this.Application.Serializer.EnsureUrlDecoded(value);
        const values = [];
        const keyValues = valueDecoded.split('&');
        for (let i = 0; i < keyValues.length; i++) {
            const keyValue = keyValues[i];
            const index = keyValue.indexOf('=');
            if (index < 0)
                continue;
            values.push([keyValue.substring(0, index), keyValue.substring(index + 1)]);
        }
        return (values);
    }
    SetCookieValue(dataItem) {
        if (dataItem.Data == null)
            return (false);
        const data = this.CreateCookieValue(dataItem.Data);
        return (this.SetDocumentCookie(dataItem.CookieName, data));
    }
    CreateCookieValue(object) {
        let data = '';
        for (const name in object) {
            const value = object[name];
            if (value == null)
                continue;
            if (data.length > 0)
                data = data + '&';
            data = data + name + '=' + value;
        }
        return (data);
    }
    SetDocumentCookie(name, value) {
        document.cookie = name + "=" + value + ";expires=Thu, 03 Jun 2980 00:00:00 UTC;path=/";
        return (true);
    }
    HandleCookieValuesChanges(cookieValuesBefore) {
        return __awaiter(this, void 0, void 0, function* () {
            const cookieValues = this.GetCookieValues();
            const namesChanged = this.GetCookieValuesNamedChanged(cookieValuesBefore, cookieValues);
            for (let i = 0; i < namesChanged.length; i++)
                yield this.HandleCookieValueChange(namesChanged[i]);
            return (namesChanged.length > 0);
        });
    }
    HandleCookieValueChange(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name === 'culture')
                yield this.Application.Globalization.ReloadCulture();
            else if (name === 'theme')
                yield this.Application.Stylist.ReloadStyles();
        });
    }
    GetCookieValuesNamedChanged(cookieValuesBefore, cookieValues) {
        const changesNames = [];
        for (let i = 0; i < cookieValues.length; i++) {
            const cookieValue = cookieValues[i];
            const name = cookieValue[0];
            const value = cookieValue[1];
            if (this.HasCookieValueChanged(cookieValuesBefore, name, value))
                changesNames.push(name);
        }
        return (changesNames);
    }
    HasCookieValueChanged(cookieValues, name, value) {
        for (let i = 0; i < cookieValues.length; i++) {
            const cookieValue = cookieValues[i];
            const nameCurrent = cookieValue[0];
            if (name !== nameCurrent)
                continue;
            const valueCurrent = cookieValue[1];
            return (value !== valueCurrent);
        }
        return (true);
    }
    GetTheme() {
        const cookieData = this.Application.CookieHandler.RetrieveData();
        if (cookieData == null)
            return ('');
        return (cookieData.theme);
    }
    GetView() {
        const cookieData = this.Application.CookieHandler.RetrieveData();
        if (cookieData == null)
            return ('');
        return (cookieData.view);
    }
}
//# sourceMappingURL=DrapoCookieHandler.js.map