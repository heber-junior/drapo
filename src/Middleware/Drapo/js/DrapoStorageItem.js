"use strict";
class DrapoStorageItem {
    get DataKey() {
        return (this._dataKey);
    }
    get Type() {
        return (this._type);
    }
    set Type(value) {
        this._type = value;
    }
    get Access() {
        return (this._access);
    }
    set Access(value) {
        this._access = value;
    }
    get Element() {
        return (this._element);
    }
    set Element(value) {
        this._element = value;
    }
    get Data() {
        return (this._data);
    }
    set Data(value) {
        this._data = value;
        this._isFull = false;
        this._isGrowing = false;
    }
    get DataInserted() {
        return (this._dataInserted);
    }
    set DataInserted(value) {
        this._dataInserted = value;
    }
    get DataUpdated() {
        return (this._dataUpdated);
    }
    set DataUpdated(value) {
        this._dataUpdated = value;
    }
    get DataDeleted() {
        return (this._dataDeleted);
    }
    set DataDeleted(value) {
        this._dataDeleted = value;
    }
    get UrlGet() {
        return (this._urlGet);
    }
    set UrlGet(value) {
        this._urlGet = value;
    }
    get UrlSet() {
        return (this._urlSet);
    }
    set UrlSet(value) {
        this._urlSet = value;
    }
    get UrlSetChunk() {
        return (this._urlSetChunk);
    }
    set UrlSetChunk(value) {
        this._urlSetChunk = value;
    }
    get Chunk() {
        return (this._chunk);
    }
    set Chunk(value) {
        this._chunk = value;
    }
    get UrlParameters() {
        return (this._urlParameters);
    }
    get IsUrlParametersRequired() {
        return (this._urlParameters === 'required');
    }
    get PostGet() {
        return (this._postGet);
    }
    set PostGet(value) {
        this._postGet = value;
    }
    get Start() {
        return (this._start);
    }
    set Start(value) {
        this._start = value;
    }
    get Increment() {
        return (this._increment);
    }
    set Increment(value) {
        this._increment = value;
    }
    get IsIncremental() {
        return (this._isIncremental);
    }
    set IsIncremental(value) {
        this._isIncremental = value;
    }
    get IsFull() {
        return (this._isFull);
    }
    set IsFull(value) {
        this._isFull = value;
    }
    get IsGrowing() {
        return (this._isGrowing);
    }
    set IsGrowing(value) {
        this._isGrowing = value;
    }
    get IsUnitOfWork() {
        return (this._isUnitOfWork);
    }
    set IsUnitOfWork(value) {
        this._isUnitOfWork = value;
    }
    get IsDelay() {
        return (this._isDelay);
    }
    set IsDelay(value) {
        this._isDelay = value;
    }
    get CookieName() {
        return (this._cookieName);
    }
    set CookieName(value) {
        this._cookieName = value;
    }
    get IsCookieChange() {
        return (this._isCookieChange);
    }
    set IsCookieChange(value) {
        this._isCookieChange = value;
    }
    get UserConfig() {
        return (this._userConfig);
    }
    set UserConfig(value) {
        this._userConfig = value;
    }
    get IsTypeValue() {
        return (this._type === 'value');
    }
    get IsTypeObject() {
        return (this._type === 'object');
    }
    get IsTypeParent() {
        return (this._type === 'parent');
    }
    get IsTypeArray() {
        return ((this._type === 'array') || (Array.isArray(this.Data)));
    }
    get IsTypeFunction() {
        return (this._type === 'function');
    }
    get IsAccessPublic() {
        return (this._access === 'public');
    }
    get IsAccessPrivate() {
        return (this._access === 'private');
    }
    get IsToken() {
        return (this._isToken);
    }
    set IsToken(value) {
        this._isToken = value;
    }
    get Sector() {
        return (this._sector);
    }
    set Sector(value) {
        this._sector = value;
    }
    get Pipes() {
        return (this._pipes);
    }
    set Pipes(value) {
        this._pipes = value;
    }
    get Channels() {
        return (this._channels);
    }
    set Channels(value) {
        this._channels = value;
    }
    get CanCache() {
        return (this._canCache);
    }
    set CanCache(value) {
        this._canCache = value;
    }
    get CacheKeys() {
        return (this._cacheKeys);
    }
    set CacheKeys(value) {
        this._cacheKeys = value;
    }
    get OnLoad() {
        return (this._onLoad);
    }
    set OnLoad(value) {
        this._onLoad = value;
    }
    get OnAfterLoad() {
        return (this._onAfterLoad);
    }
    set OnAfterLoad(value) {
        this._onAfterLoad = value;
    }
    get OnAfterContainerLoad() {
        return (this._onAfterContainerLoad);
    }
    set OnAfterContainerLoad(value) {
        this._onAfterContainerLoad = value;
    }
    get OnBeforeContainerUnload() {
        return (this._onBeforeContainerUnload);
    }
    set OnBeforeContainerUnload(value) {
        this._onBeforeContainerUnload = value;
    }
    get OnAfterCached() {
        return (this._onAfterCached);
    }
    set OnAfterCached(value) {
        this._onAfterCached = value;
    }
    get OnNotify() {
        return (this._onNotify);
    }
    set OnNotify(value) {
        this._onNotify = value;
    }
    get HeadersGet() {
        return (this._headersGet);
    }
    set HeadersGet(value) {
        this._headersGet = value;
    }
    get HeadersSet() {
        return (this._headersSet);
    }
    set HeadersSet(value) {
        this._headersSet = value;
    }
    get HasChanges() {
        return (this._hasChanges);
    }
    set HasChanges(value) {
        this._hasChanges = value;
    }
    get PollingKey() {
        return (this._pollingKey);
    }
    set PollingKey(value) {
        this._pollingKey = value;
    }
    get PollingTimespan() {
        return (this._pollingTimespan);
    }
    set PollingTimespan(value) {
        this._pollingTimespan = value;
    }
    get PollingDate() {
        return (this._pollingDate);
    }
    set PollingDate(value) {
        this._pollingDate = value;
    }
    get PollingHash() {
        return (this._pollingHash);
    }
    set PollingHash(value) {
        this._pollingHash = value;
    }
    constructor(dataKey, type, access, element, data, urlGet, urlSet, urlSetChunk, chunk, urlParameters, postGet, start, increment, isIncremental, isFull, isUnitOfWork, isDelay, cookieName, isCookieChange, userConfig, isToken, sector, groups, pipes, channels, canCache, cacheKeys, onLoad, onAfterLoad, onAfterContainerLoad, onBeforeContainerUnload, onAfterCached, onNotify, headersGet, headersSet, pollingKey, pollingTimespan) {
        this._dataKey = null;
        this._type = null;
        this._access = null;
        this._data = [];
        this._dataInserted = [];
        this._dataUpdated = [];
        this._dataDeleted = [];
        this._urlGet = null;
        this._urlSet = null;
        this._urlSetChunk = null;
        this._chunk = null;
        this._urlParameters = null;
        this._postGet = null;
        this._start = null;
        this._increment = null;
        this._isIncremental = false;
        this._isFull = false;
        this._isGrowing = false;
        this._isUnitOfWork = false;
        this._isDelay = false;
        this._cookieName = null;
        this._isCookieChange = false;
        this._userConfig = null;
        this._isToken = false;
        this._sector = null;
        this._groups = null;
        this._pipes = null;
        this._channels = null;
        this._canCache = true;
        this._cacheKeys = null;
        this._onLoad = null;
        this._onAfterLoad = null;
        this._onAfterContainerLoad = null;
        this._onBeforeContainerUnload = null;
        this._onAfterCached = null;
        this._onNotify = null;
        this._headersGet = [];
        this._headersSet = [];
        this._hasChanges = false;
        this._pollingKey = null;
        this._pollingTimespan = null;
        this._pollingDate = null;
        this._pollingHash = null;
        this._dataKey = dataKey;
        this._type = type;
        this._access = access;
        this._element = element;
        this._data = data;
        this._urlGet = urlGet;
        this._urlSet = urlSet;
        this._urlSetChunk = urlSetChunk;
        this._chunk = chunk;
        this._urlParameters = urlParameters;
        this._postGet = postGet;
        this._start = start;
        this._increment = increment;
        this._isIncremental = isIncremental;
        this._isFull = isFull;
        this._isUnitOfWork = isUnitOfWork;
        this._isDelay = isDelay;
        this._cookieName = cookieName;
        this._isCookieChange = isCookieChange;
        this._userConfig = userConfig;
        this._isToken = isToken;
        this._sector = sector;
        this._groups = groups;
        this._pipes = pipes;
        this._channels = channels;
        this._canCache = canCache;
        this._cacheKeys = cacheKeys;
        this._onLoad = onLoad;
        this._onAfterLoad = onAfterLoad == null ? null : onAfterLoad;
        this._onAfterContainerLoad = onAfterContainerLoad == null ? null : onAfterContainerLoad;
        this._onBeforeContainerUnload = onBeforeContainerUnload == null ? null : onBeforeContainerUnload;
        this._onAfterCached = onAfterCached == null ? null : onAfterCached;
        this._onNotify = onNotify == null ? null : onNotify;
        this._headersGet = headersGet;
        this._headersSet = headersSet;
        this._pollingKey = pollingKey;
        this._pollingTimespan = pollingTimespan;
        this.Initialize();
    }
    Initialize() {
        if (this._access == null)
            this._access = this.IsTypeParent ? 'private' : 'public';
        this.CheckpointPolling();
    }
    CheckpointPolling() {
        if (this._pollingTimespan === null)
            return;
        const currentDate = new Date();
        currentDate.setMilliseconds(currentDate.getMilliseconds() + this._pollingTimespan);
        this._pollingDate = currentDate;
    }
    ContainsGroup(group) {
        if (this._groups == null)
            return (false);
        for (let i = 0; i < this._groups.length; i++)
            if (this._groups[i] === group)
                return (true);
        return (false);
    }
}
//# sourceMappingURL=DrapoStorageItem.js.map