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
class DrapoCacheHandler {
    get Application() {
        return (this._application);
    }
    get CanUseLocalStorage() {
        return ((this._hasLocalStorage) && (this._useLocalStorage));
    }
    constructor(application) {
        this._hasLocalStorage = null;
        this._useLocalStorage = false;
        this._applicationBuild = null;
        this._cacheKeysView = null;
        this._cacheKeysComponentView = null;
        this._cacheKeysComponentStyle = null;
        this._cacheKeysComponentScript = null;
        this.TYPE_DATA = "d";
        this.TYPE_COMPONENTVIEW = "cv";
        this.TYPE_COMPONENTSTYLE = "cs";
        this.TYPE_COMPONENTSCRIPT = "cj";
        this.TYPE_VIEW = "v";
        this._application = application;
        this._hasLocalStorage = window.localStorage != null;
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._useLocalStorage = yield this.Application.Config.GetUseCacheLocalStorage();
            this._applicationBuild = yield this.Application.Config.GetApplicationBuild();
            this._cacheKeysView = yield this.GetConfigurationKeys('CacheKeysView');
            this._cacheKeysComponentView = yield this.GetConfigurationKeys('CacheKeysComponentView');
            this._cacheKeysComponentStyle = yield this.GetConfigurationKeys('CacheKeysComponentStyle');
            this._cacheKeysComponentScript = yield this.GetConfigurationKeys('CacheKeysComponentScript');
            return (true);
        });
    }
    EnsureLoaded(storageItem, sector, dataKey, dataPath = null) {
        if (!this.CanUseLocalStorage)
            return (false);
        const cacheKey = this.CreateCacheKey(this.TYPE_DATA, storageItem.CacheKeys, sector, dataKey, dataPath, null);
        if (cacheKey == null)
            return (false);
        const valueCached = this.GetClientDataCache(cacheKey);
        if (valueCached == null)
            return (false);
        const appended = this.AppendStorageDataCache(storageItem, dataPath, valueCached);
        return (appended);
    }
    GetCachedData(cacheKeys, sector, dataKey) {
        if (!this.CanUseLocalStorage)
            return (null);
        const cacheKey = this.CreateCacheKey(this.TYPE_DATA, cacheKeys, sector, dataKey, null, null);
        if (cacheKey == null)
            return (null);
        const valueCached = this.GetClientDataCache(cacheKey);
        return (valueCached);
    }
    GetCachedDataPath(cacheKeys, sector, dataKey, dataPath) {
        if (!this.CanUseLocalStorage)
            return (null);
        const cacheKey = this.CreateCacheKey(this.TYPE_DATA, cacheKeys, sector, dataKey, dataPath, null);
        if (cacheKey == null)
            return (null);
        const valueCached = this.GetClientDataCache(cacheKey);
        return (valueCached);
    }
    AppendCacheData(cacheKeys, sector, dataKey, value, isDelay = false) {
        if (!this.CanUseLocalStorage)
            return (false);
        if ((cacheKeys == null) || (cacheKeys.length == 0))
            return (null);
        let appended = false;
        if (isDelay) {
            for (const dataField in value) {
                const dataPath = [dataKey, dataField];
                const dataPathValue = value[dataField];
                if (this.AppendCacheDataEntry(cacheKeys, sector, dataKey, dataPath, dataPathValue))
                    appended = true;
            }
        }
        else {
            appended = this.AppendCacheDataEntry(cacheKeys, sector, dataKey, null, value);
        }
        return (appended);
    }
    GetCachedView(url) {
        if (!this.CanUseLocalStorage)
            return (null);
        const cacheKey = this.CreateCacheKey(this.TYPE_VIEW, this._cacheKeysView, null, null, null, url);
        if (cacheKey == null)
            return (null);
        const value = this.GetClientDataCache(cacheKey);
        return (value);
    }
    SetCachedView(url, value) {
        if (!this.CanUseLocalStorage)
            return (false);
        const cacheKey = this.CreateCacheKey(this.TYPE_VIEW, this._cacheKeysView, null, null, null, url);
        if (cacheKey == null)
            return (false);
        this.SetClientDataCache(cacheKey, value);
        return (true);
    }
    GetCachedComponentView(url) {
        if (!this.CanUseLocalStorage)
            return (null);
        const cacheKey = this.CreateCacheKey(this.TYPE_COMPONENTVIEW, this._cacheKeysView, null, null, null, url);
        if (cacheKey == null)
            return (null);
        const value = this.GetClientDataCache(cacheKey);
        return (value);
    }
    SetCachedComponentView(url, value) {
        if (!this.CanUseLocalStorage)
            return (false);
        const cacheKey = this.CreateCacheKey(this.TYPE_COMPONENTVIEW, this._cacheKeysView, null, null, null, url);
        if (cacheKey == null)
            return (false);
        this.SetClientDataCache(cacheKey, value);
        return (true);
    }
    GetConfigurationKeys(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.Application.Config.GetProperty(name);
            if ((value == null) || (value == ''))
                return (null);
            const values = this.Application.Parser.ParsePipes(value);
            if ((values == null) || (values.length == 0))
                return (null);
            return (values);
        });
    }
    AppendCacheDataEntry(cacheKeys, sector, dataKey, dataPath, value) {
        const cacheKey = this.CreateCacheKey(this.TYPE_DATA, cacheKeys, sector, dataKey, dataPath, null);
        if (cacheKey == null)
            return (false);
        this.SetClientDataCache(cacheKey, value);
        return (true);
    }
    CreateCacheKey(type, cacheKeys, sector, dataKey, dataPath, url) {
        if ((cacheKeys == null) || (cacheKeys.length == 0))
            return (null);
        let key = type;
        for (let i = 0; i < cacheKeys.length; i++) {
            const cacheKey = cacheKeys[i];
            const cacheKeyValue = this.GetKey(cacheKey, sector, dataKey, dataPath, url);
            if (cacheKeyValue == null)
                return (null);
            key = key + '_' + cacheKeyValue;
        }
        return (key);
    }
    GetKey(cacheKey, sector, dataKey, dataPath, url) {
        const key = cacheKey.toLowerCase();
        if (key == 'datakey')
            return (dataKey);
        if (key == 'url')
            return (url);
        if (key == 'datapath') {
            if ((dataPath == null) || (dataPath.length <= 1))
                return (dataKey);
            let dataPathValue = dataPath[0];
            for (let i = 1; i < dataPath.length; i++)
                dataPathValue = dataPathValue + '.' + dataPath[i];
            return (dataPathValue);
        }
        if (key == 'culture')
            return (this.Application.Globalization.GetCulture());
        if (key == 'applicationbuild')
            return (this._applicationBuild);
        if (key == 'view')
            return (this.Application.CookieHandler.GetView());
        if (key == 'theme')
            return (this.Application.CookieHandler.GetTheme());
        return (null);
    }
    AppendStorageDataCache(storageItem, dataPath, valueCached) {
        if (storageItem.IsDelay) {
            const data = storageItem.Data;
            const dataField = dataPath[1];
            data[dataField] = valueCached;
        }
        else {
            storageItem.Data = valueCached;
        }
        return (true);
    }
    GetClientDataCache(cacheKey) {
        let value = null;
        try {
            value = window.localStorage.getItem(cacheKey);
            if (value == null)
                return (null);
        }
        catch (e) {
            this._useLocalStorage = false;
            this.Application.ExceptionHandler.Handle(e, 'DrapoCacheHandler - GetClientDataCache :' + cacheKey);
        }
        try {
            return (this.Application.Serializer.Deserialize(value));
        }
        catch (_a) {
            return (null);
        }
    }
    SetClientDataCache(cacheKey, value) {
        try {
            const valueSerialized = this.Application.Serializer.SerializeObject(value);
            window.localStorage.setItem(cacheKey, valueSerialized);
        }
        catch (e) {
            this._useLocalStorage = false;
            this.Application.ExceptionHandler.Handle(e, 'DrapoCacheHandler - SetClientDataCache');
        }
    }
}
//# sourceMappingURL=DrapoCacheHandler.js.map