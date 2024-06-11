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
class DrapoConfig {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._url = null;
        this._cacheKeys = null;
        this._cacheDatas = null;
        this._timezone = null;
        this._application = application;
    }
    GetUrl() {
        if (this._url == null)
            this._url = this.GetUrlInternal();
        return (this._url);
    }
    GetUrlInternal() {
        return ('~/drapo.json');
    }
    Load() {
        return __awaiter(this, void 0, void 0, function* () {
            this._cacheKeys = [];
            this._cacheDatas = [];
            const data = yield this.Application.Server.GetJSON(this.GetUrl());
            for (const property in data) {
                this._cacheKeys.push(property);
                this._cacheDatas.push(data[property]);
            }
        });
    }
    IsLoaded() {
        return (this._cacheKeys != null);
    }
    EnsureLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsLoaded())
                return;
            yield this.Load();
        });
    }
    GetSector(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.EnsureLoaded();
            const index = this.GetCacheKeyIndex(name);
            if (index == null)
                return (null);
            return (this.GetCacheData(index));
        });
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
    }
    GetProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.GetSector(name);
            if ((config === undefined) || (config === null))
                return (null);
            return (config);
        });
    }
    GetPropertyBoolean(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.GetProperty(name);
            if (value == null)
                return (false);
            return (value.toString() == 'true');
        });
    }
    GetPropertyArray(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.GetSector(name);
            if ((value === undefined) || (value === null))
                return (null);
            return (value);
        });
    }
    GetUsePipes() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetPropertyBoolean('UsePipes'));
        });
    }
    GetUseRouter() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetPropertyBoolean('UseRouter'));
        });
    }
    GetUseCacheLocalStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetPropertyBoolean('UseCacheLocalStorage'));
        });
    }
    GetUseCacheStatic() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetPropertyBoolean('UseCacheStatic'));
        });
    }
    GetPipeHubName() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('PipeHubName'));
        });
    }
    GetPipeActionRegister() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('PipeActionRegister'));
        });
    }
    GetPipeActionNotify() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('PipeActionNotify'));
        });
    }
    GetPipeActionPolling() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('PipeActionPolling'));
        });
    }
    GetPipeHeaderConnectionId() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('PipeHeaderConnectionId'));
        });
    }
    GetOnAuthorizationRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('OnAuthorizationRequest'));
        });
    }
    GetOnError() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('OnError'));
        });
    }
    GetOnReconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('OnReconnect'));
        });
    }
    GetStorageErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('StorageErrors'));
        });
    }
    GetOnBadRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('OnBadRequest'));
        });
    }
    GetStorageBadRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('StorageBadRequest'));
        });
    }
    GetValidatorUncheckedClass() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('ValidatorUncheckedClass'));
        });
    }
    GetValidatorValidClass() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('ValidatorValidClass'));
        });
    }
    GetValidatorInvalidClass() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('ValidatorInvalidClass'));
        });
    }
    GetApplicationBuild() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('ApplicationBuild'));
        });
    }
    GetHeaderContainerId() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('HeaderContainerId'));
        });
    }
    GetHeaderCSRF() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('HeaderCSRF'));
        });
    }
    GetTimestamp() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetProperty('Timestamp'));
        });
    }
    GetViews() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.GetPropertyArray('Views'));
        });
    }
    GetTimezone() {
        return (this._timezone);
    }
    SetTimezone(value) {
        this._timezone = value;
    }
}
//# sourceMappingURL=DrapoConfig.js.map