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
class DrapoStorage {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._cacheItems = [];
        this._isDelayTriggered = false;
        this.CONTENT_TYPE_JSON = 'application/json; charset=utf-8';
        this.CONTENT_TYPE_TEXT = 'text/plain';
        this._lock = false;
        this.CHUNK_SIZE = 3 * 1024 * 1024;
        this._application = application;
    }
    AdquireLock() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this._lock) {
                yield this.Application.Document.Sleep(50);
            }
            this._lock = true;
        });
    }
    ReleaseLock() {
        this._lock = false;
    }
    Retrieve(dataKey, sector, context, dataKeyParts = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dataKeyParts === null)
                dataKeyParts = this.Application.Parser.ParseForIterable(dataKey);
            if ((dataKeyParts.length == 1) || (this.IsDataKey(dataKeyParts[0], sector)))
                return (yield this.RetrieveDataItem(dataKey, sector));
            if ((dataKeyParts.length > 1) && (context.Item != null))
                return (this.RetrieveIterator(dataKey, dataKeyParts, context));
            if ((dataKeyParts.length > 1) && (context.Item === null)) {
                const item = yield this.RetrieveDataItem(dataKey, sector);
                if (item === null)
                    return (null);
                return (this.RetrieveIteratorChild(dataKey, dataKeyParts, item.Data));
            }
            return (null);
        });
    }
    RetrieveDataItemContext(dataKey, sector, executionContext = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((executionContext !== null) && (executionContext.HasSectorContainer(sector))) {
                const dataItemContext = yield this.Application.SectorContainerHandler.GetStorageItem(sector, executionContext.GetSectorContainer(sector), dataKey);
                if (dataItemContext !== null)
                    return (dataItemContext);
            }
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            return (dataItem);
        });
    }
    RetrieveData(dataKey, sector, executionContext = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = ((executionContext !== null) && (executionContext.HasSectorContainer(sector))) ? yield this.Application.SectorContainerHandler.GetStorageItem(sector, executionContext.GetSectorContainer(sector), dataKey) : yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (null);
            return (dataItem.Data);
        });
    }
    RetrieveStorageItemsCached(sector, dataKeyOrDataGroup) {
        const isAllSectors = ((sector === null) || (sector === ''));
        const isAllData = ((dataKeyOrDataGroup === null) || (dataKeyOrDataGroup === ''));
        const list = [];
        for (let i = 0; i < this._cacheItems.length; i++) {
            const item = this._cacheItems[i];
            if (item == null)
                continue;
            if ((!isAllSectors) && (item.Sector !== sector))
                continue;
            const dataKey = item.DataKey;
            if ((!isAllData) && (dataKey !== dataKeyOrDataGroup) && (!item.ContainsGroup(dataKeyOrDataGroup)))
                continue;
            list.push(item);
        }
        return (list);
    }
    RetrieveDataValue(sector, mustache) {
        return __awaiter(this, void 0, void 0, function* () {
            const mustacheFullParts = this.Application.Parser.ParseMustache(mustache);
            const dataSector = this.Application.Solver.ResolveSector(mustacheFullParts, sector);
            const dataKey = this.Application.Solver.ResolveDataKey(mustacheFullParts);
            const mustacheDataFields = this.Application.Solver.ResolveDataFields(mustacheFullParts);
            const mustacheParts = this.Application.Solver.CreateDataPath(dataKey, mustacheDataFields);
            if (yield this.EnsureDataKeyFieldReady(dataKey, dataSector, mustacheParts))
                return (this.Application.Storage.GetDataKeyField(dataKey, dataSector, mustacheParts));
            const item = yield this.RetrieveDataItemInternal(dataKey, dataSector, true, mustacheDataFields);
            if ((item == null) || (item.Data == null))
                return ('');
            const cacheIndex = this.GetCacheKeyIndex(dataKey, dataSector);
            if (cacheIndex == null) {
                yield this.AddCacheData(dataKey, dataSector, item);
            }
            else {
                const cacheItem = this.GetCacheDataItem(cacheIndex);
                for (const dataFieldCurrent in item.Data)
                    cacheItem.Data[dataFieldCurrent] = item.Data[dataFieldCurrent];
            }
            const data = this.Application.Solver.ResolveItemStoragePathObject(item, mustacheParts);
            return (data);
        });
    }
    CanGrowData(dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            return ((dataItem.IsIncremental) && (!dataItem.IsFull));
        });
    }
    GrowData(dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (cacheIndex == null)
                return (false);
            const dataItem = this.GetCacheDataItem(cacheIndex);
            if (dataItem == null)
                return (false);
            if (dataItem.IsFull)
                return (false);
            if (dataItem.IsGrowing)
                return (false);
            dataItem.IsGrowing = true;
            const dataNew = yield this.RetrieveDataKeyUrl(dataKey, sector, dataItem.UrlGet, dataItem.UrlParameters, dataItem.PostGet, (dataItem.Start + dataItem.Data.length).toString(), dataItem.Increment.toString(), dataItem.Type, dataItem.IsToken);
            if (dataNew == null)
                return (false);
            dataItem.IsGrowing = false;
            if (dataNew.length < dataItem.Increment)
                dataItem.IsFull = true;
            for (let i = 0; i < dataNew.length; i++)
                dataItem.Data.push(dataNew[i]);
            return (true);
        });
    }
    UpdateData(dataKey, sector, data, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheIndex = yield this.EnsureDataKeyReady(dataKey, sector);
            if (cacheIndex == null)
                return (false);
            const dataItem = this.GetCacheDataItem(cacheIndex);
            if (dataItem == null)
                return (false);
            if (dataItem.Data == data)
                return (false);
            dataItem.Data = data;
            yield this.NotifyChanges(dataItem, notify, dataKey, null, null, false);
            return (true);
        });
    }
    UpdateDataPath(sector, contextItem, dataPath, value, canNotify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = this.Application.Solver.ResolveDataKey(dataPath);
            const dataItem = yield this.Application.Storage.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            const context = new DrapoContext();
            const item = contextItem == null ? context.Create(dataItem.Data, null, null, dataKey, null, null, null) : contextItem;
            if (item == null)
                return (false);
            if ((dataPath == null) || (dataPath.length == 1)) {
                if (dataItem.Data == value)
                    return (false);
                dataItem.Data = value;
            }
            else {
                if (!this.Application.Solver.UpdateDataPathObject(item.Data, dataPath, value))
                    return (false);
            }
            if (canNotify)
                yield this.Application.Observer.Notify(item.DataKey, item.Index, this.Application.Solver.ResolveDataFields(dataPath));
            yield this.NotifyChanges(dataItem, false, dataKey, null, this.Application.Solver.ResolveDataFields(dataPath), false);
            return (true);
        });
    }
    ReloadData(dataKey, sector, notify = true, canUseDifference = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (dataKeyIndex == null)
                return (true);
            const storageItem = this._cacheItems[dataKeyIndex];
            if (storageItem.UrlGet !== null) {
                const storageItemLoaded = yield this.RetrieveDataItemInternal(dataKey, sector);
                if (storageItemLoaded !== null) {
                    yield this.AdquireLock();
                    this._cacheItems[dataKeyIndex] = storageItemLoaded;
                    this.ReleaseLock();
                }
            }
            else if (storageItem.Type === 'query') {
                const storageItemLoaded = yield this.RetrieveDataItemInternal(dataKey, sector);
                if (storageItemLoaded !== null) {
                    const isEqual = this.Application.Solver.IsEqualAny(storageItem.Data, storageItemLoaded.Data);
                    if (isEqual)
                        return (false);
                    yield this.AdquireLock();
                    this._cacheItems[dataKeyIndex] = storageItemLoaded;
                    this.ReleaseLock();
                }
            }
            else {
                yield this.RemoveCacheData(dataKeyIndex, false);
            }
            if (notify)
                yield this.Application.Observer.Notify(dataKey, null, null, canUseDifference);
            return (true);
        });
    }
    GetSectors(dataKey) {
        const sectors = [];
        for (let i = this._cacheItems.length - 1; i >= 0; i--) {
            const storageItem = this._cacheItems[i];
            if (storageItem == null)
                continue;
            if (storageItem.DataKey === dataKey)
                sectors.push(storageItem.Sector);
        }
        return (sectors);
    }
    GetSectorDataKeys(sector) {
        const dataKeys = [];
        for (let i = this._cacheItems.length - 1; i >= 0; i--) {
            const storageItem = this._cacheItems[i];
            if (storageItem == null)
                continue;
            if (storageItem.Sector === sector)
                dataKeys.push(storageItem.DataKey);
        }
        return (dataKeys);
    }
    ReloadPipe(dataPipe) {
        return __awaiter(this, void 0, void 0, function* () {
            let reloaded = false;
            for (let i = this._cacheItems.length - 1; i >= 0; i--) {
                if (i >= this._cacheItems.length)
                    continue;
                const storageItem = this._cacheItems[i];
                if (storageItem == null)
                    continue;
                if (storageItem.Pipes == null)
                    continue;
                if (!this.Application.Solver.Contains(storageItem.Pipes, dataPipe))
                    continue;
                if (yield this.ReloadData(storageItem.DataKey, null))
                    reloaded = true;
            }
            return (reloaded);
        });
    }
    IsMustachePartsDataKey(sector, mustacheParts) {
        const dataKey = mustacheParts[0];
        if (!this.IsDataKey(dataKey, sector))
            return (false);
        for (let i = 1; i < mustacheParts.length; i++) {
            const mustachePart = mustacheParts[i];
            if (!this.Application.Parser.IsMustache(mustachePart))
                continue;
            const mustachePartParts = this.Application.Parser.ParseMustache(mustachePart);
            if (!this.IsMustachePartsDataKey(sector, mustachePartParts))
                return (false);
        }
        return (true);
    }
    IsDataKey(dataKey, sector, renderContext = null) {
        if (this.Application.Document.IsSystemKey(dataKey))
            return (true);
        const cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
        if (cacheIndex != null)
            return (true);
        return (this.IsDataKeyElement(dataKey, renderContext));
    }
    IsDataKeyExecution(dataKey) {
        return (dataKey === '_stack');
    }
    IsDataKeyDelay(dataKey, sector) {
        const cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
        if (cacheIndex === null)
            return (false);
        const cacheItem = this.GetCacheDataItem(cacheIndex);
        if (cacheItem === null)
            return (false);
        return (cacheItem.IsDelay);
    }
    IsDataKeyElement(dataKey, renderContext) {
        if (renderContext === null)
            return (this.Application.Searcher.HasDataKeyElement(dataKey));
        const hasDataKeyElement = renderContext.HasDataKeyElement(dataKey);
        if (hasDataKeyElement !== null)
            return (hasDataKeyElement);
        const isDataKeyElement = this.Application.Searcher.HasDataKeyElement(dataKey);
        renderContext.AddDataKeyElement(dataKey, isDataKeyElement);
        return (isDataKeyElement);
    }
    EnsureDataKeyReady(dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (cacheIndex == null) {
                const item = yield this.RetrieveDataItemInternal(dataKey, sector);
                if (item == null)
                    return (null);
                cacheIndex = yield this.AddCacheData(dataKey, sector, item);
            }
            return (cacheIndex);
        });
    }
    EnsureDataKeyFieldReady(dataKey, sector, dataPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (cacheIndex == null) {
                const item = yield this.RetrieveDataItemInternal(dataKey, sector);
                if (item == null)
                    return (false);
                cacheIndex = yield this.AddCacheData(dataKey, sector, item);
            }
            const storageItem = this.GetCacheDataItem(cacheIndex);
            if (!storageItem.IsDelay)
                return (true);
            const hasData = this.Application.Solver.ContainsItemStoragePathObject(storageItem, dataPath);
            if (hasData)
                return (true);
            const isLoaded = this.Application.CacheHandler.EnsureLoaded(storageItem, sector, dataKey, dataPath);
            if (!isLoaded)
                return (false);
            return (this.Application.Solver.ContainsItemStoragePathObject(storageItem, dataPath));
        });
    }
    GetData(sector, dataPath) {
        if ((dataPath == null) || (dataPath.length == 0))
            return (null);
        const dataKey = this.Application.Solver.ResolveDataKey(dataPath);
        return (this.GetDataKeyField(dataKey, sector, dataPath));
    }
    GetDataKeyField(dataKey, sector, dataPath, executionContext = null) {
        const storageItem = this.GetCacheStorageItem(dataKey, sector, executionContext);
        if (storageItem === null)
            return (null);
        return (this.Application.Solver.ResolveItemStoragePathObject(storageItem, dataPath));
    }
    SetDataKeyField(dataKey, sector, dataFields, value, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheIndex = yield this.EnsureDataKeyReady(dataKey, sector);
            if (cacheIndex == null)
                return (false);
            const storageItem = this.GetCacheDataItem(cacheIndex);
            if ((dataFields !== null) && (storageItem.IsTypeArray)) {
                const length = storageItem.Data.length;
                let updated = false;
                for (let i = 0; i < length; i++) {
                    const data = storageItem.Data[i];
                    if (this.Application.Solver.UpdateDataPathObject(data, dataFields, value))
                        updated = true;
                }
                if (!updated)
                    return (false);
                yield this.NotifyChanges(storageItem, notify, dataKey, null, dataFields);
            }
            else {
                const path = this.Application.Solver.CreateDataPath(dataKey, dataFields);
                if (path.length === 1) {
                    if (storageItem.Data === value)
                        return (false);
                    storageItem.Data = value;
                    yield this.NotifyChanges(storageItem, notify, dataKey, null, null);
                }
                else {
                    if (!this.Application.Solver.UpdateDataPathObject(storageItem.Data, path, value))
                        return (false);
                    yield this.NotifyChanges(storageItem, notify, dataKey, null, dataFields);
                }
            }
            return (true);
        });
    }
    UpdateDataFieldLookup(dataKey, sector, dataFieldSeek, valueSeek, dataField, value, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheIndex = yield this.EnsureDataKeyReady(dataKey, sector);
            if (cacheIndex == null)
                return (false);
            const dataPath = (typeof dataField === "string") ? [dataField] : dataField;
            const storageItem = this.GetCacheDataItem(cacheIndex);
            if (storageItem.IsTypeArray) {
                const length = storageItem.Data.length;
                let updated = false;
                const context = new DrapoContext();
                for (let i = 0; i < length; i++) {
                    const data = storageItem.Data[i];
                    const dataPathSeek = this.CreateDataPath(dataKey, dataFieldSeek);
                    const contextItem = context.Create(data, null, null, dataKey, dataKey, null, i);
                    const dataPathSeekValue = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPathSeek);
                    if (!this.Application.Solver.IsEqualString(valueSeek, dataPathSeekValue))
                        continue;
                    if (!this.Application.Solver.UpdateDataPathObject(data, dataPath, value))
                        continue;
                    this.FlagAsUpdated(storageItem, i);
                    updated = true;
                }
                if (!updated)
                    return (false);
                yield this.NotifyChanges(storageItem, notify, dataKey, null, null);
            }
            else {
                return (false);
            }
            return (true);
        });
    }
    RemoveDataItemLookup(dataSource, sector, dataFieldSeek, valueSeek, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDataSourceMustache = this.Application.Parser.IsMustache(dataSource);
            if (isDataSourceMustache)
                return (yield this.RemoveDataItemLookupMustache(dataSource, sector, dataFieldSeek, valueSeek, notify));
            return (yield this.RemoveDataItemLookupDataKey(dataSource, sector, dataFieldSeek, valueSeek, notify));
        });
    }
    RemoveDataItemLookupDataKey(dataKey, sector, dataFieldSeek, valueSeek, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheIndex = yield this.EnsureDataKeyReady(dataKey, sector);
            if (cacheIndex == null)
                return (false);
            const dataPath = (typeof dataFieldSeek === "string") ? [dataFieldSeek] : dataFieldSeek;
            const storageItem = this.GetCacheDataItem(cacheIndex);
            if (storageItem.IsTypeArray) {
                const length = storageItem.Data.length;
                const removedArray = [];
                const context = new DrapoContext();
                for (let i = 0; i < length; i++) {
                    const data = storageItem.Data[i];
                    const dataPathSeek = this.Application.Solver.CreateDataPath(dataKey, dataPath);
                    const contextItem = context.Create(data, null, null, dataKey, dataKey, null, i);
                    const dataPathSeekValue = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPathSeek);
                    if (!this.Application.Solver.IsEqualString(valueSeek, dataPathSeekValue))
                        continue;
                    removedArray.push(i);
                }
                for (let i = removedArray.length - 1; i >= 0; i--) {
                    const index = removedArray[i];
                    this.DeleteDataItemIndex(storageItem, index);
                }
                yield this.NotifyChanges(storageItem, ((notify) && (removedArray.length > 0)), dataKey, null, null);
            }
            else {
                return (false);
            }
            return (true);
        });
    }
    RemoveDataItemLookupMustache(dataSource, sector, dataFieldSeek, valueSeek, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataSourcePath = this.Application.Parser.ParseMustache(dataSource);
            const dataKey = this.Application.Solver.ResolveDataKey(dataSourcePath);
            const cacheIndex = yield this.EnsureDataKeyReady(dataKey, sector);
            if (cacheIndex == null)
                return (false);
            const storageItem = this.GetCacheStorageItem(dataKey, sector, null);
            if (storageItem === null)
                return (false);
            const dataBase = this.Application.Solver.ResolveItemStoragePathObject(storageItem, dataSourcePath);
            if ((dataBase == null) || (dataBase.length == 0))
                return (false);
            const dataPath = (typeof dataFieldSeek === "string") ? [dataKey, dataFieldSeek] : this.Application.Solver.CreateDataPath(dataKey, dataFieldSeek);
            const length = dataBase.length;
            const removedArray = [];
            const context = new DrapoContext();
            for (let i = 0; i < length; i++) {
                const data = dataBase[i];
                const dataPathSeekValue = this.Application.Solver.ResolveDataObjectPathObject(data, dataPath);
                if (!this.Application.Solver.IsEqualString(valueSeek, dataPathSeekValue))
                    continue;
                removedArray.push(i);
            }
            for (let i = removedArray.length - 1; i >= 0; i--) {
                const index = removedArray[i];
                dataBase.splice(index, 1);
            }
            yield this.NotifyChanges(storageItem, ((notify) && (removedArray.length > 0)), dataKey, null, null);
            return (true);
        });
    }
    CreatePath(data) {
        return ([data]);
    }
    CreateDataPath(dataKey, dataField) {
        return ([dataKey, dataField]);
    }
    LoadDataDelayedAndNotify() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isDelayTriggered)
                return;
            if (!this.Application.Observer.HasDelayKeys())
                return;
            this._isDelayTriggered = true;
            const dataKeys = this.Application.Observer.GetDelayKeys();
            for (let i = 0; i < dataKeys.length; i++) {
                const dataKey = dataKeys[i];
                const dataFields = this.Application.Observer.GetDelayFields(dataKey);
                if (dataFields.length == 0)
                    continue;
                const item = yield this.RetrieveDataItemInternal(dataKey, null, true, dataFields);
                if ((item == null) || (item.Data == null))
                    continue;
                const cacheIndex = this.GetCacheKeyIndex(dataKey, null);
                if (cacheIndex == null) {
                    yield this.AddCacheData(dataKey, null, item);
                }
                else {
                    const cacheItem = this.GetCacheDataItem(cacheIndex);
                    for (const dataField in item.Data)
                        cacheItem.Data[dataField] = item.Data[dataField];
                }
                for (const dataField in item.Data)
                    yield this.Application.Observer.NotifyDelay(dataKey, [dataField]);
            }
            this._isDelayTriggered = false;
        });
    }
    RetrieveDataItem(dataKey, sector, canLoadDelay = false, dataDelayFields = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (cacheIndex != null)
                return (this.GetCacheDataItem(cacheIndex));
            const item = yield this.RetrieveDataItemInternal(dataKey, sector, canLoadDelay, dataDelayFields);
            if (item === null)
                return (null);
            if (item.OnLoad) {
                const executionContext = this.Application.FunctionHandler.CreateExecutionContext();
                executionContext.HasBreakpoint = yield this.Application.Debugger.HasBreakpoint(sector, dataKey);
                executionContext.Sector = sector;
                executionContext.DataKey = dataKey;
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(sector, item.Element, item.OnLoad, executionContext);
            }
            if (item.CanCache) {
                yield this.AddCacheData(dataKey, item.Sector, item);
                if (item.OnAfterCached != null)
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(sector, item.Element, item.OnAfterCached);
            }
            if (item.OnAfterLoad) {
                const executionContext = this.Application.FunctionHandler.CreateExecutionContext();
                executionContext.HasBreakpoint = yield this.Application.Debugger.HasBreakpoint(sector, dataKey);
                executionContext.Sector = sector;
                executionContext.DataKey = dataKey;
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(sector, item.Element, item.OnAfterLoad, executionContext);
            }
            yield this.Application.Debugger.NotifyStorage(dataKey);
            return (item);
        });
    }
    RetrieveDataItemInternal(dataKey, sector, canLoadDelay = false, dataDelayFields = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemSystem = yield this.RetrieveDataItemInternalSystem(dataKey);
            if (itemSystem !== null)
                return (itemSystem);
            const el = this.Application.Searcher.FindDataKey(dataKey, sector);
            if (el == null) {
                yield this.Application.ExceptionHandler.HandleError('Storage - RetrieveDataItemInternal - Invalid DataKey: {0}', dataKey);
                return (null);
            }
            const dataUrlGet = el.getAttribute('d-dataUrlGet');
            const isDelay = el.getAttribute('d-dataDelay') === 'true';
            if ((isDelay) && (!canLoadDelay))
                return (null);
            let dataUrlParameters = el.getAttribute('d-dataUrlParameters');
            if ((dataUrlParameters == null) || (dataUrlParameters == ''))
                dataUrlParameters = 'optional';
            const dataUrlSet = el.getAttribute('d-dataUrlSet');
            const dataUrlSetChunk = ((dataUrlSet == null) || (dataUrlSet == '')) ? null : el.getAttribute('d-dataUrlSetChunk');
            const chunk = ((dataUrlSetChunk == null) || (dataUrlSetChunk == '')) ? null : el.getAttribute('d-dataChunk');
            const dataPostGet = el.getAttribute('d-dataPostGet');
            const isLazy = el.getAttribute('d-dataLazy') === 'true';
            const dataStart = el.getAttribute('d-dataLazyStart');
            const dataIncrement = el.getAttribute('d-dataLazyIncrement');
            const isUnitOfWork = el.getAttribute('d-dataUnitOfWork') === 'true';
            const cookieName = el.getAttribute('d-dataCookieGet');
            const isCookieChange = el.getAttribute('d-dataCookieChange') === 'true';
            const userConfig = el.getAttribute('d-dataUserConfig');
            const isToken = el.getAttribute('d-dataToken') === 'true';
            let type = el.getAttribute('d-dataType');
            const access = el.getAttribute('d-dataAccess');
            const value = el.getAttribute('d-dataValue');
            const dataSector = this.Application.Document.GetSector(el);
            const groupsAttribute = el.getAttribute('d-dataGroups');
            const groups = ((groupsAttribute == null) || (groupsAttribute == '')) ? null : this.Application.Parser.ParsePipes(groupsAttribute);
            const pipes = this.Application.Parser.ParsePipes(el.getAttribute('d-dataPipes'));
            const channels = yield this.ParseChannels(sector, el.getAttribute('d-dataChannels'));
            const canCache = this.Application.Parser.ParseBoolean(el.getAttribute('d-dataCache'), true);
            const cacheKeys = this.Application.Parser.ParsePipes(el.getAttribute('d-dataCacheKeys'));
            const onLoad = type === 'function' ? value : null;
            const onAfterLoad = el.getAttribute('d-dataOnAfterLoad');
            const onAfterContainerLoad = el.getAttribute('d-dataOnAfterContainerLoad');
            const onBeforeContainerUnload = el.getAttribute('d-dataOnBeforeContainerUnLoad');
            const onAfterCached = el.getAttribute('d-dataOnAfterCached');
            const onNotify = el.getAttribute('d-dataOnNotify');
            const headersGet = this.ExtractDataHeaderGet(el);
            const headersSet = this.ExtractDataHeaderSet(el);
            const headersResponse = ((isCookieChange) || (type === 'file')) ? [] : null;
            const data = yield this.RetrieveDataKey(dataKey, sector, el, dataUrlGet, dataUrlParameters, dataPostGet, dataStart, dataIncrement, isDelay, dataDelayFields, cookieName, type, isToken, cacheKeys, channels, headersGet, headersResponse);
            if (data == null) {
                return (null);
            }
            if (type == null) {
                if (data.length)
                    type = 'array';
                else
                    type = 'object';
            }
            const increment = this.Application.Parser.GetStringAsNumber(dataIncrement);
            const isFull = ((isLazy) && (data.length < increment)) ? true : false;
            const pollingKey = yield this.ResolveValueMustaches(dataKey, sector, el.getAttribute('d-dataPollingKey'));
            const pollingTimespan = yield this.ResolveValueMustachesAsNumber(dataKey, sector, el.getAttribute('d-dataPollingTimespan'));
            const item = new DrapoStorageItem(dataKey, type, access, el, data, dataUrlGet, dataUrlSet, dataUrlSetChunk, chunk, dataUrlParameters, dataPostGet, this.Application.Parser.GetStringAsNumber(dataStart), increment, isLazy, isFull, isUnitOfWork, isDelay, cookieName, isCookieChange, userConfig, isToken, dataSector, groups, pipes, channels, canCache, cacheKeys, onLoad, onAfterLoad, onAfterContainerLoad, onBeforeContainerUnload, onAfterCached, onNotify, headersGet, headersSet, pollingKey, pollingTimespan);
            return (item);
        });
    }
    ResolveValueMustaches(dataKey, sector, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (value == null)
                return (null);
            return (yield this.ResolveDataUrlMustaches(dataKey, sector, value, null, null));
        });
    }
    ResolveValueMustachesAsNumber(dataKey, sector, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (value == null)
                return (null);
            const valueResolved = yield this.ResolveDataUrlMustaches(dataKey, sector, value, null, null);
            const valueAsNumber = this.Application.Parser.ParseNumber(valueResolved, null);
            return (valueAsNumber);
        });
    }
    RetrieveDataKey(dataKey, sector, el, dataUrlGet, dataUrlParameters, dataPostGet, dataStart, dataIncrement, isDelay, dataDelayFields, cookieName, type, isToken, cacheKeys, channels, headersGet, headersResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (channels !== null) {
                const dataChannels = this.RetrieveDataChannels(channels);
                if (dataChannels != null)
                    return (dataChannels);
            }
            if (dataUrlGet != null)
                return (yield this.RetrieveDataKeyUrl(dataKey, sector, dataUrlGet, dataUrlParameters, dataPostGet, dataStart, dataIncrement, type, isToken, cacheKeys, isDelay, dataDelayFields, headersGet, headersResponse));
            if (cookieName != null)
                return (this.RetrieveDataKeyCookie(cookieName));
            if (type != null)
                return (yield this.RetrieveDataKeyInitialize(dataKey, sector, type, el));
            const dataConfig = el.getAttribute('d-dataConfigGet');
            if (dataConfig != null)
                return (yield this.RetrieveDataKeyConfig(dataConfig));
            return (null);
        });
    }
    RetrieveDataKeyUrl(dataKey, sector, dataUrlGet, dataUrlParameters, dataPostGet, dataStart, dataIncrement, type, isToken, cacheKeys = null, isDelay = false, dataDelayFields = null, headersGet = null, headersResponse = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = dataUrlGet;
            if ((false) && (isToken) && (!this.Application.Server.HasToken())) {
                yield this.Application.Document.RequestAuthorization(dataKey, 'notify');
                return ([]);
            }
            if (!isDelay) {
                const cachedData = this.Application.CacheHandler.GetCachedData(cacheKeys, sector, dataKey);
                if (cachedData != null)
                    return (cachedData);
            }
            if ((isDelay) && (dataDelayFields != null) && (dataDelayFields.length === 1)) {
                const cachedData = this.Application.CacheHandler.GetCachedDataPath(cacheKeys, sector, dataKey, [dataKey, dataDelayFields[0]]);
                if (cachedData != null) {
                    const objectCachedData = {};
                    objectCachedData[dataDelayFields[0]] = cachedData;
                    return (objectCachedData);
                }
            }
            if (dataStart != null)
                url = url.replace('{{start}}', dataStart);
            if (dataIncrement != null)
                url = url.replace('{{increment}}', dataIncrement);
            const changes = [];
            url = yield this.ResolveDataUrlMustaches(dataKey, sector, url, null, changes);
            if ((dataUrlParameters === 'required') && (this.HasChangeNullOrEmpty(changes)))
                return ([]);
            let verb = "GET";
            let data = null;
            let contentType = null;
            let headers = [];
            if (isDelay) {
                if (dataDelayFields === null)
                    return ([]);
                verb = "POST";
                data = this.Application.Serializer.Serialize(dataDelayFields);
                contentType = this.CONTENT_TYPE_JSON;
            }
            else if (dataPostGet != null) {
                verb = "POST";
                const dataPostGetKey = this.Application.Parser.IsMustache(dataPostGet) ? yield this.ResolveMustaches(sector, dataPostGet) : dataPostGet;
                const item = yield this.RetrieveDataItem(dataPostGetKey, sector);
                if (item !== null)
                    data = this.Application.Serializer.Serialize(item.Data);
                contentType = this.CONTENT_TYPE_JSON;
                this.Application.Observer.SubscribeStorage(dataPostGetKey, null, dataKey);
            }
            else {
                headers = yield this.ResolveDataHeaders(dataKey, sector, headersGet, null);
            }
            let dataResponse = null;
            if (type === 'file')
                dataResponse = yield this.Application.Server.GetFile(url, verb, data, contentType, dataKey, headers, headersResponse);
            else
                dataResponse = yield this.Application.Server.GetJSON(url, verb, data, contentType, dataKey, headers, headersResponse);
            this.Application.CacheHandler.AppendCacheData(cacheKeys, sector, dataKey, dataResponse, isDelay);
            return (dataResponse);
        });
    }
    ParseChannels(sector, channels) {
        return __awaiter(this, void 0, void 0, function* () {
            if (channels == null)
                return (null);
            const channelsResolved = yield this.ResolveDataUrlMustaches(null, sector, channels, null);
            return (this.Application.Parser.ParsePipes(channelsResolved));
        });
    }
    RetrieveDataChannels(channels) {
        if (channels == null)
            return (null);
        for (let i = 0; i < channels.length; i++) {
            const dataChannel = this.RetrieveDataChannel(channels[i]);
            if (dataChannel !== null)
                return (dataChannel);
        }
        return (null);
    }
    ContainsDataChannel(dataItem, channel) {
        if (dataItem.Channels === null)
            return (false);
        for (let i = 0; i < dataItem.Channels.length; i++) {
            if (channel === dataItem.Channels[i])
                return (true);
        }
        return (false);
    }
    RetrieveDataChannel(channel) {
        for (let i = 0; i < this._cacheItems.length; i++) {
            const dataItem = this._cacheItems[i];
            if (dataItem == null)
                continue;
            if (this.ContainsDataChannel(dataItem, channel))
                return (this.Application.Solver.Clone(dataItem.Data, true));
        }
        return (null);
    }
    PropagateDataChannels(dataItem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dataItem.Channels === null)
                return (false);
            for (let i = 0; i < dataItem.Channels.length; i++) {
                const channel = dataItem.Channels[i];
                for (let j = 0; j < this._cacheItems.length; j++) {
                    const dataItemCurrent = this._cacheItems[j];
                    if (dataItemCurrent == null)
                        continue;
                    if (!this.ContainsDataChannel(dataItemCurrent, channel))
                        continue;
                    if (dataItem.Data === dataItemCurrent.Data)
                        continue;
                    yield this.Application.Storage.UpdateData(dataItemCurrent.DataKey, dataItemCurrent.Sector, dataItem.Data, true);
                }
            }
            return (true);
        });
    }
    HasChangeNullOrEmpty(changes) {
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const value = change[1];
            if ((value === null) || (value === ''))
                return (true);
        }
        return (false);
    }
    ExtractDataHeaderGet(el) {
        const attributes = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const attributeProperty = this.ExtractDataHeaderGetProperty(attribute.nodeName);
            if (attributeProperty != null)
                attributes.push([attributeProperty, attribute.nodeValue]);
        }
        return (attributes);
    }
    ExtractDataHeaderGetProperty(property) {
        const parse = this.Application.Parser.ParseProperty(property);
        if (parse.length != 3)
            return (null);
        if (parse[0] != 'd')
            return (null);
        if (parse[1].toLowerCase() != 'dataheaderget')
            return (null);
        return (parse[2]);
    }
    ExtractDataHeaderSet(el) {
        const attributes = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const attributeProperty = this.ExtractDataHeaderSetProperty(attribute.nodeName);
            if (attributeProperty != null)
                attributes.push([attributeProperty, attribute.nodeValue]);
        }
        return (attributes);
    }
    ExtractDataHeaderSetProperty(property) {
        const parse = this.Application.Parser.ParseProperty(property);
        if (parse.length != 3)
            return (null);
        if (parse[0] != 'd')
            return (null);
        if (parse[1].toLowerCase() != 'dataheaderset')
            return (null);
        return (parse[2]);
    }
    ResolveDataUrlMustaches(dataKey, sector, url, executionContext, changes = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const mustaches = this.Application.Parser.ParseMustaches(url);
            for (let i = 0; i < mustaches.length; i++) {
                const mustache = mustaches[i];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const mustacheDataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                const change = [mustache, null];
                if (changes != null)
                    changes.push(change);
                if (!this.IsDataKey(mustacheDataKey, sector))
                    continue;
                const isSameDataKey = dataKey === mustacheDataKey;
                if ((!isSameDataKey) && (!(yield this.Application.Storage.EnsureDataKeyFieldReady(mustacheDataKey, sector, mustacheParts))))
                    continue;
                const mustacheData = this.Application.Storage.GetDataKeyField(mustacheDataKey, sector, mustacheParts, executionContext);
                if ((!isSameDataKey) && (mustacheData == null))
                    continue;
                const mustacheDataEncoded = this.Application.Server.EnsureUrlComponentEncoded(mustacheData);
                url = url.replace(mustache, mustacheDataEncoded);
                change[1] = mustacheDataEncoded;
                if ((!isSameDataKey) && (dataKey !== null)) {
                    const mustacheDataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
                    this.Application.Observer.SubscribeStorage(mustacheDataKey, mustacheDataFields, dataKey);
                }
            }
            return (url);
        });
    }
    ResolveDataHeaders(dataKey, sector, headers, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const headersData = [];
            if (headers === null)
                return (headersData);
            const isSectorActive = (executionContext === null) || (!executionContext.HasSectorContainer(sector));
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const headerValue = header[1];
                let headerDataKey = null;
                let data = null;
                if (!this.Application.Parser.IsMustache(headerValue)) {
                    headerDataKey = headerValue;
                    data = yield this.RetrieveData(headerDataKey, sector, executionContext);
                    if (isSectorActive)
                        this.Application.Observer.SubscribeStorage(headerDataKey, null, dataKey);
                }
                else {
                    const headerMustacheParts = this.Application.Parser.ParseMustache(headerValue);
                    headerDataKey = this.Application.Solver.ResolveDataKey(headerMustacheParts);
                    const headerDataFields = this.Application.Solver.ResolveDataFields(headerMustacheParts);
                    const dataItem = yield this.RetrieveDataItem(headerDataKey, sector);
                    data = this.Application.Solver.ResolveItemStoragePathObject(dataItem, headerMustacheParts);
                    if (isSectorActive)
                        this.Application.Observer.SubscribeStorage(headerDataKey, headerDataFields, dataKey);
                }
                if (data == null)
                    continue;
                const dataSerialized = this.Application.Serializer.Serialize(data);
                const dataEncoded = this.Application.Serializer.EncodeHeaderFieldValue(dataSerialized);
                headersData.push([header[0], dataEncoded]);
            }
            return (headersData);
        });
    }
    ResolveMustachesRecursive(sector, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataResolved = yield this.ResolveMustaches(sector, data, true);
            if (dataResolved === data)
                return (dataResolved);
            return (yield this.ResolveMustachesRecursive(sector, dataResolved));
        });
    }
    ResolveMustaches(sector, data, canSubscribe = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const mustaches = this.Application.Parser.ParseMustaches(data);
            for (let i = 0; i < mustaches.length; i++) {
                const mustache = mustaches[i];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const dataSector = this.Application.Solver.ResolveSector(mustacheParts, sector);
                const mustacheDataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                if (!this.IsDataKey(mustacheDataKey, dataSector))
                    continue;
                const mustacheDataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
                if (!(yield this.Application.Storage.EnsureDataKeyFieldReady(mustacheDataKey, dataSector, mustacheParts))) {
                    if (!canSubscribe)
                        continue;
                    this.Application.Observer.SubscribeDelay(null, mustacheDataKey, this.Application.Solver.ResolveDataFields(mustacheParts));
                    return (data);
                }
                const mustacheData = this.Application.Storage.GetDataKeyField(mustacheDataKey, dataSector, mustacheParts);
                if (mustacheData == null)
                    continue;
                data = data.replace(mustache, mustacheData);
            }
            return (data);
        });
    }
    ReactivateDataUrlMustache(dataKey, sector, item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (item.UrlGet == null)
                return;
            yield this.ResolveDataUrlMustaches(dataKey, sector, item.UrlGet, null);
        });
    }
    RetrieveDataKeyInitialize(dataKey, sector, type, el) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type == 'object')
                return (this.RetrieveDataKeyInitializeObject(el));
            if (type == 'array')
                return (yield this.RetrieveDataKeyInitializeArray(el, sector, dataKey));
            if (type == 'value')
                return (this.RetrieveDataKeyInitializeValue(el));
            if (type == 'mapping')
                return (yield this.RetrieveDataKeyInitializeMapping(el, sector, dataKey));
            if (type == 'pointer')
                return (yield this.RetrieveDataKeyInitializePointer(el, sector, dataKey));
            if (type == 'function')
                return (yield this.RetrieveDataKeyInitializeFunction(dataKey, el));
            if (type == 'querystring')
                return (this.RetrieveDataKeyInitializeQueryString(el, sector, dataKey));
            if (type == 'query')
                return (this.RetrieveDataKeyInitializeQuery(el, sector, dataKey));
            if (type == 'switch')
                return (this.RetrieveDataKeyInitializeSwitch(el, sector, dataKey));
            if (type == 'parent')
                return (this.RetrieveDataKeyInitializeParent(el, sector));
            return (null);
        });
    }
    RetrieveDataKeyInitializeValue(el) {
        const dataValue = el.getAttribute('d-dataValue');
        if (dataValue != null)
            return (dataValue);
        return ('');
    }
    RetrieveDataKeyInitializeArray(el, sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null)
                return ([]);
            if (this.Application.Parser.IsMustache(dataValue)) {
                const mustacheParts = this.Application.Parser.ParseMustache(dataValue);
                const dataKeyReference = this.Application.Solver.ResolveDataKey(mustacheParts);
                this.Application.Observer.SubscribeStorage(dataKeyReference, null, dataKey, DrapoStorageLinkType.Pointer);
                this.Application.Observer.SubscribeStorage(dataKey, null, dataKeyReference, DrapoStorageLinkType.Pointer);
                const dataValueObject = yield this.RetrieveDataValue(sector, dataValue);
                const dataArray = [];
                dataArray.push(dataValueObject);
                return (dataArray);
            }
            const data = this.Application.Parser.ParseIterator(dataValue);
            if (data.length)
                return (data);
            return ([data]);
        });
    }
    RetrieveDataKeyInitializeMapping(el, sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null)
                return ([]);
            const isReference = el.getAttribute('d-dataLoadType') === 'reference';
            let dataValueResolved = dataValue;
            if (this.Application.Parser.IsMustache(dataValue))
                dataValueResolved = yield this.ResolveMustaches(sector, dataValue);
            if (isReference) {
                el.setAttribute('d-dataValue', dataValueResolved);
                const dataReference = yield this.RetrieveDataValue(sector, dataValueResolved);
                return (this.Application.Solver.Clone(dataReference, true));
            }
            const isSubscribe = el.getAttribute('d-dataMappingSubscribe') === 'true';
            if (isSubscribe)
                this.Application.Observer.SubscribeStorage(dataValueResolved, null, dataKey, DrapoStorageLinkType.Reload);
            const storageItemMapped = yield this.RetrieveDataItem(dataValueResolved, sector);
            if (storageItemMapped === null)
                return (null);
            let data = storageItemMapped.Data;
            const dataMappingField = el.getAttribute('d-dataMappingField');
            if ((dataMappingField != null) && (dataMappingField != '')) {
                const dataMappingFieldResolved = yield this.ResolveMustaches(sector, dataMappingField);
                if ((dataMappingFieldResolved != null) && (dataMappingFieldResolved != '')) {
                    const dataPath = this.Application.Parser.ParsePath(dataMappingFieldResolved);
                    const dataPathFull = this.Application.Solver.CreateDataPath(dataValueResolved, dataPath);
                    data = this.Application.Solver.ResolveDataObjectPathObject(data, dataPathFull);
                    if (data === null)
                        return (null);
                }
            }
            const dataMappingSearchField = el.getAttribute('d-dataMappingSearchField');
            let dataMappingSearchValue = el.getAttribute('d-dataMappingSearchValue');
            const dataMappingSearchHierarchyField = el.getAttribute('d-dataMappingSearchHierarchyField');
            if ((dataMappingSearchField != null) && (dataMappingSearchField != '') && (dataMappingSearchValue != null) && (dataMappingSearchValue != '')) {
                if (this.Application.Parser.IsMustache(dataMappingSearchValue)) {
                    const dataPath = this.Application.Parser.ParseMustache(dataMappingSearchValue);
                    dataMappingSearchValue = yield this.Application.Solver.ResolveItemDataPathObject(sector, null, dataPath);
                }
                data = this.Application.Solver.ResolveDataObjectLookupHierarchy(data, dataMappingSearchField, dataMappingSearchValue, dataMappingSearchHierarchyField);
            }
            return (this.Application.Solver.Clone(data, true));
        });
    }
    RetrieveDataKeyInitializePointer(el, sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null) {
                yield this.Application.ExceptionHandler.HandleError('DrapoStorage - value of a pointer cant be null - {0}', dataKey);
                return ([]);
            }
            if (!this.Application.Parser.IsMustache(dataValue)) {
                yield this.Application.ExceptionHandler.HandleError('DrapoStorage - value of a pointer must be a mustache - {0}', dataKey);
                return ([]);
            }
            let dataMustache = dataValue;
            while (this.Application.Parser.IsMustache(dataMustache)) {
                const dataMustacheResolved = yield this.ResolveMustaches(sector, dataMustache);
                if ((dataMustacheResolved == null) || (dataMustacheResolved === ''))
                    break;
                if (!this.Application.Parser.IsMustache(dataMustacheResolved))
                    break;
                dataMustache = dataMustacheResolved;
            }
            const mustacheParts = this.Application.Parser.ParseMustache(dataMustache);
            const mustacheDataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
            this.Application.Observer.SubscribeStorage(mustacheDataKey, null, dataKey, DrapoStorageLinkType.Pointer);
            this.Application.Observer.SubscribeStorage(dataKey, null, mustacheDataKey, DrapoStorageLinkType.Pointer);
            const dataReference = yield this.RetrieveDataValue(sector, dataMustache);
            return (dataReference);
        });
    }
    UpdatePointerStorageItems(dataKey, dataReferenceKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageItems = this.Application.Storage.RetrieveStorageItemsCached(null, dataKey);
            if (storageItems.length == 0)
                return;
            const storageItem = storageItems[0];
            const storageReferenceItems = this.Application.Storage.RetrieveStorageItemsCached(null, dataReferenceKey);
            if (storageReferenceItems.length == 0)
                return;
            const storageReferenceItem = storageReferenceItems[0];
            if (storageItem.HasChanges)
                storageReferenceItem.HasChanges = true;
            if (storageReferenceItem.Type !== 'pointer')
                return;
            const storageItemLoaded = yield this.RetrieveDataItemInternal(dataReferenceKey, storageReferenceItem.Sector);
            if (storageItemLoaded === null)
                return;
            storageReferenceItem.Data = storageItemLoaded.Data;
        });
    }
    RetrieveDataKeyInitializeFunction(dataKey, el) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null)
                return ([]);
            const isToken = el.getAttribute('d-dataToken') === 'true';
            if (isToken) {
                if ((!this.Application.Server.HasToken()) && (this.Application.Observer.HasPendingAuthorization())) {
                    yield this.Application.Document.RequestAuthorization(dataKey, 'initialize');
                    return (null);
                }
            }
            return ([]);
        });
    }
    RetrieveDataKeyInitializeQueryString(el, sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let object = yield this.RetrieveDataKeyInitializeMapping(el, sector, dataKey);
            if ((object !== null) && (((object.length) && (object.length > 0)) || (Object.keys(object).length > 0)))
                return (object);
            object = {};
            const canUseRouter = yield this.Application.Router.CanUseRouter();
            const dictionary = yield this.Application.Document.ExtractQueryString(canUseRouter);
            for (let i = 0; i < dictionary.length; i++) {
                const keyValuePair = dictionary[i];
                const key = keyValuePair[0];
                const value = keyValuePair[1];
                object[key] = value;
            }
            return (object);
        });
    }
    RetrieveDataKeyInitializeQuery(el, sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null) {
                yield this.Application.ExceptionHandler.HandleError('There is no d-datavalue in: {0}', dataKey);
                return ([]);
            }
            const query = this.Application.Parser.ParseQuery(dataValue, el.getAttribute('d-data-query-options'));
            if (query === null) {
                yield this.Application.ExceptionHandler.HandleError('There is an error in query d-datavalue in: {0}', dataKey);
                return ([]);
            }
            if (query.Error !== null) {
                yield this.Application.ExceptionHandler.HandleError('Error parsing the query in: {0}. {1}', dataKey, query.Error);
                return ([]);
            }
            if (query.Sources.length > 2) {
                yield this.Application.ExceptionHandler.HandleError('Only support for 2 sources in query: {0}', dataKey);
                return ([]);
            }
            const dataQueryArray = el.getAttribute('d-dataQueryArray');
            if (dataQueryArray != null)
                query.OutputArray = dataQueryArray;
            return (yield this.ExecuteQuery(sector, dataKey, query));
        });
    }
    RetrieveDataKeyInitializeSwitch(el, sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null) {
                yield this.Application.ExceptionHandler.HandleError('There is no d-datavalue in: {0}', dataKey);
                return ([]);
            }
            const switchItems = this.Application.Parser.ParseSwitch(dataValue);
            this.Application.Observer.UnsubscribeStorage(dataKey);
            for (let i = 0; i < switchItems.length; i++) {
                const switchItem = switchItems[i];
                const conditional = switchItem[1];
                if (conditional != null) {
                    const mustaches = this.Application.Parser.ParseMustaches(conditional);
                    for (let j = 0; j < mustaches.length; j++) {
                        const mustache = mustaches[j];
                        const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                        const dataKeyConditional = this.Application.Solver.ResolveDataKey(mustacheParts);
                        this.Application.Observer.SubscribeStorage(dataKeyConditional, null, dataKey);
                    }
                    const conditionalResolved = yield this.Application.Solver.ResolveConditional(conditional, null, sector);
                    if (!conditionalResolved)
                        continue;
                }
                const dataKeySwitch = switchItem[0];
                const data = yield this.RetrieveData(dataKeySwitch, sector);
                return (data);
            }
            return ([]);
        });
    }
    RetrieveDataKeyInitializeParent(el, sector) {
        const dataValue = el.getAttribute('d-dataValue');
        const isReference = el.getAttribute('d-dataLoadType') === 'reference';
        let elParent = el.parentElement;
        let elParentAttributes = null;
        while ((elParent !== null) && ((elParentAttributes = this.Application.Document.GetElementAttributesFilteredPrefix(elParent, dataValue)).length == 0))
            elParent = elParent.parentElement;
        return (this.BuildObject(sector, isReference, elParentAttributes));
    }
    BuildObject(sector, isReference, attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const object = {};
            let hasDelay = false;
            for (let i = 0; i < attributes.length; i++) {
                const keyValuePair = attributes[i];
                const key = keyValuePair[0];
                const value = keyValuePair[1];
                const valueResolved = isReference ? yield this.ResolveMustachesRecursive(sector, value) : value;
                if ((isReference) && (this.Application.Parser.IsMustache(valueResolved)))
                    hasDelay = true;
                object[key] = valueResolved;
            }
            if (hasDelay) {
                yield this.Application.Storage.LoadDataDelayedAndNotify();
                for (let i = 0; i < attributes.length; i++) {
                    const keyValuePair = attributes[i];
                    const key = keyValuePair[0];
                    const value = object[key];
                    if (!this.Application.Parser.IsMustache(value))
                        continue;
                    const valueResolved = yield this.ResolveMustachesRecursive(sector, value);
                    object[key] = valueResolved;
                }
            }
            return (object);
        });
    }
    RetrieveDataKeyInitializeObject(el) {
        const dataValue = el.getAttribute('d-dataValue');
        if ((dataValue != null) && (this.Application.Serializer.IsJson(dataValue))) {
            return (this.Application.Serializer.Deserialize(dataValue));
        }
        const object = {};
        const propertyKeys = [];
        const propertyNames = [];
        const propertyValues = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            this.RetrieveDataProperty(object, attribute.nodeName, attribute.nodeValue, propertyKeys, propertyNames, propertyValues);
        }
        return (object);
    }
    RetrieveDataProperty(object, property, value, propertyKeys, propertyNames, propertyValues) {
        const parse = this.Application.Parser.ParseProperty(property);
        if (parse.length < 3)
            return (false);
        if (parse[0] != 'd')
            return (false);
        if (parse[1].toLowerCase() != 'dataproperty')
            return (false);
        if (parse.length == 3) {
            object[parse[2]] = value;
            return (true);
        }
        const key = parse[2];
        const nameOrValue = parse[3];
        let index = this.RetrieveDataPropertyKeyIndex(propertyKeys, key);
        if (nameOrValue == 'name') {
            if (index < 0) {
                index = propertyKeys.push(key);
                propertyNames.push(value);
                propertyValues.push(null);
                return (false);
            }
            else {
                propertyNames[index] = value;
                object[value] = propertyValues[index];
                return (true);
            }
        }
        if (nameOrValue == 'value') {
            if (index < 0) {
                index = propertyKeys.push(key);
                propertyNames.push(null);
                propertyValues.push(value);
                return (false);
            }
            else {
                propertyValues[index] = value;
                object[propertyNames[index]] = value;
                return (true);
            }
        }
        return (false);
    }
    RetrieveDataPropertyKeyIndex(propertyKeys, key) {
        for (let i = propertyKeys.length - 1; i >= 0; i--)
            if (propertyKeys[i] == key)
                return (i);
        return (-1);
    }
    RetrieveDataKeyConfig(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.Application.Config.GetSector(sector));
        });
    }
    RetrieveDataKeyCookie(name) {
        return (this.Application.CookieHandler.RetrieveData(name));
    }
    RetrieveIterator(dataKey, dataKeyParts, context) {
        if (dataKeyParts[0] == context.Item.Key)
            return (this.RetrieveIteratorChild(dataKey, dataKeyParts, context.Item.Data));
        return (null);
    }
    RetrieveIteratorChild(dataKey, dataKeyParts, contextData) {
        let current = contextData;
        for (let i = 1; i < dataKeyParts.length; i++) {
            const dataKeyCurrent = dataKeyParts[i];
            if (current[dataKeyCurrent] === 'undefined')
                return (null);
            current = current[dataKeyCurrent];
        }
        return (new DrapoStorageItem(dataKey, 'array', null, null, current, null, null, null, null, null, null, null, null, false, true, false, false, null, false, null, false, null, null, null, null, false, null, null, null, null, null, null, null, null, null, null, null));
    }
    AddDataItem(dataKey, dataPath, sector, item, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            let data = dataItem.Data;
            if (dataPath != null)
                data = this.Application.Solver.ResolveDataObjectPathObject(data, dataPath, []);
            data.push(item);
            if (dataItem.IsUnitOfWork)
                dataItem.DataInserted.push(item);
            yield this.NotifyChanges(dataItem, notify, dataKey, null, null);
        });
    }
    ToggleData(dataKey, dataPath, sector, item, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            let data = dataItem.Data;
            if (dataPath != null)
                data = this.Application.Solver.ResolveDataObjectPathObject(data, dataPath);
            let found = false;
            for (let i = 0; i < data.length; i++) {
                if (data[i] != item)
                    continue;
                found = true;
                data.splice(i, 1);
            }
            if (!found)
                data.push(item);
            yield this.NotifyChanges(dataItem, notify, dataKey, null, null);
        });
    }
    GetDataItemLast(dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (null);
            if (dataItem.Data.length == 0)
                return (null);
            return (dataItem.Data[dataItem.Data.length - 1]);
        });
    }
    FlagDataItemAsUpdated(dataKey, sector, index, notify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            this.FlagAsUpdated(dataItem, index);
            yield this.NotifyChanges(dataItem, notify, dataKey, null, null);
            return (true);
        });
    }
    NotifyChanges(dataItem, notify, dataKey, dataIndex, dataFields, canUseDifference = true) {
        return __awaiter(this, void 0, void 0, function* () {
            dataItem.HasChanges = true;
            if (notify)
                yield this.Application.Observer.Notify(dataKey, dataIndex, dataFields, canUseDifference);
            yield this.PropagateDataChannels(dataItem);
        });
    }
    NotifyNoChanges(dataItem, notify, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            dataItem.HasChanges = false;
            if (notify)
                yield this.Application.Observer.Notify(dataKey, null, ['_HasChanges']);
        });
    }
    FlagAsUpdated(dataItem, index) {
        if (!dataItem.IsUnitOfWork)
            return (false);
        const dataArray = dataItem.Data;
        if (dataArray.length <= index)
            return (false);
        const data = dataArray[index];
        for (let i = dataItem.DataUpdated.length - 1; i >= 0; i--)
            if (dataItem.DataUpdated[i] === data)
                return (false);
        dataItem.DataUpdated.push(data);
        return (true);
    }
    GetCacheKeyIndex(dataKey, sector) {
        const sectors = this.Application.Document.GetSectorsAllowed(sector);
        for (let i = 0; i < this._cacheItems.length; i++) {
            const storageItem = this._cacheItems[i];
            if (storageItem == null)
                continue;
            const isAccessPublic = storageItem.IsAccessPublic;
            if ((storageItem.DataKey == dataKey) && ((this.Application.Document.IsSystemKey(dataKey)) || (storageItem.Sector === sector) || ((isAccessPublic) && (this.Application.Document.IsSectorAllowed(storageItem.Sector, sectors)))))
                return (i);
        }
        return (null);
    }
    IsDataReady(sector, dataKey) {
        const index = this.GetCacheKeyIndex(dataKey, sector);
        return (index !== null);
    }
    GetCacheStorageItem(dataKey, sector, executionContext) {
        if ((executionContext !== null) && (executionContext.HasSectorContainer(sector)))
            return (this.Application.SectorContainerHandler.GetStorageItem(sector, executionContext.GetSectorContainer(sector), dataKey));
        const index = this.GetCacheKeyIndex(dataKey, sector);
        if (index === null)
            return (null);
        return (this.GetCacheDataItem(index));
    }
    GetCacheDataItem(dataIndex) {
        return (this._cacheItems[dataIndex]);
    }
    AddCacheData(dataKey, sector, dataItem, canFireEventOnAfterCached = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.AdquireLock();
            const index = this._cacheItems.push(dataItem) - 1;
            this.ReleaseLock();
            if ((canFireEventOnAfterCached) && (dataItem.OnAfterCached != null))
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(sector, dataItem.Element, dataItem.OnAfterCached);
            this.Application.Worker.Check();
            return (index);
        });
    }
    FireEventOnNotify(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this._cacheItems.length - 1; i >= 0; i--) {
                if (i >= this._cacheItems.length)
                    continue;
                const storageItem = this._cacheItems[i];
                if (storageItem == null)
                    continue;
                if (storageItem.DataKey != dataKey)
                    continue;
                if (storageItem.OnNotify == null)
                    continue;
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(storageItem.Sector, null, storageItem.OnNotify);
            }
        });
    }
    RemoveCacheData(index, canRemoveObservers = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (canRemoveObservers)
                this.Application.Observer.Unsubscribe(this._cacheItems[index].DataKey);
            yield this.AdquireLock();
            this._cacheItems.splice(index, 1);
            this.ReleaseLock();
            this.Application.Worker.Check();
        });
    }
    AppendCacheDataItemBySector(storageItems, sector) {
        for (let i = this._cacheItems.length - 1; i >= 0; i--) {
            const storageItem = this._cacheItems[i];
            if (storageItem == null)
                continue;
            if (storageItem.Sector !== sector)
                continue;
            storageItems.push(this._cacheItems[i]);
        }
    }
    AddCacheDataItems(storageItems) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.AdquireLock();
            for (let i = storageItems.length - 1; i >= 0; i--) {
                const storageItem = storageItems[i];
                this._cacheItems.push(storageItem);
            }
            this.ReleaseLock();
            this.Application.Worker.Check();
        });
    }
    GetCachedDataItemByDatePolling() {
        let item = null;
        for (let i = this._cacheItems.length - 1; i >= 0; i--) {
            const storageItem = this._cacheItems[i];
            if (storageItem == null)
                continue;
            if (storageItem.PollingDate == null)
                continue;
            if ((item == null) || (item.PollingDate > storageItem.PollingDate))
                item = storageItem;
        }
        return (item);
    }
    ExistCachedDataItem(item) {
        for (let i = this._cacheItems.length - 1; i >= 0; i--) {
            const storageItem = this._cacheItems[i];
            if (storageItem === item)
                return (true);
        }
        return (false);
    }
    ExecuteCachedDataItemPolling(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item.IsTypeValue)
                return;
            yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(item.Sector, item.Element, item.Data);
        });
    }
    RemoveBySector(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.AdquireLock();
            for (let i = this._cacheItems.length - 1; i >= 0; i--) {
                const storageItem = this._cacheItems[i];
                if (storageItem == null)
                    continue;
                if (storageItem.Sector !== sector)
                    continue;
                this._cacheItems.splice(i, 1);
            }
            this.ReleaseLock();
            this.Application.Worker.Check();
        });
    }
    DiscardCacheData(dataKey, sector, canRemoveObservers = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (dataKeyIndex == null)
                return (false);
            yield this.RemoveCacheData(dataKeyIndex, canRemoveObservers);
            return (true);
        });
    }
    DiscardCacheDataBySector(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            let removed = false;
            for (let i = this._cacheItems.length - 1; i >= 0; i--) {
                const item = this._cacheItems[i];
                if (item == null)
                    continue;
                if (item.Sector !== sector)
                    continue;
                const dataKey = item.DataKey;
                if (yield this.DiscardCacheData(dataKey, item.Sector))
                    removed = true;
            }
            return (removed);
        });
    }
    DeleteDataItem(dataKey, dataPath, sector, item, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            let data = dataItem.Data;
            if (data == null)
                return (false);
            if (dataPath != null)
                data = this.Application.Solver.ResolveDataObjectPathObject(data, dataPath);
            const index = this.GetDataItemIndex(data, item);
            if (index == null)
                return (false);
            if (dataItem.IsUnitOfWork)
                dataItem.DataDeleted.push(item);
            data.splice(index, 1);
            yield this.NotifyChanges(dataItem, notify, dataKey, index, dataPath);
            return (true);
        });
    }
    DeleteDataItemArray(dataKey, sector, item, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            const value = this.Application.Parser.IsMustache(item) ? yield this.RetrieveDataValue(sector, item) : item;
            const length = dataItem.Data.length;
            for (let i = 0; i < length; i++) {
                const valueCurrent = dataItem.Data[i];
                if (value != valueCurrent)
                    continue;
                this.DeleteDataItemIndex(dataItem, i);
                yield this.NotifyChanges(dataItem, notify, dataKey, null, null);
                return (true);
            }
            return (false);
        });
    }
    DeleteDataItemIndex(dataItem, index) {
        const data = dataItem.Data;
        if (data == null)
            return (false);
        const item = data[index];
        if (item == null)
            return (false);
        if (dataItem.IsUnitOfWork)
            dataItem.DataDeleted.push(item);
        data.splice(index, 1);
        return (true);
    }
    GetDataItemIndex(data, item) {
        for (let i = 0; i < data.length; i++)
            if (data[i] == item)
                return (i);
        return (null);
    }
    PostData(dataKey, sector, dataKeyResponse, notify, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItemContext(dataKey, sector, executionContext);
            if (dataItem == null)
                return (false);
            if (dataItem.CookieName != null)
                return (this.Application.CookieHandler.SetCookieValue(dataItem));
            if (dataItem.Type === 'mapping')
                return (this.PostDataMapping(dataKey, sector, dataItem, notify, executionContext));
            const dataItemResponse = dataKeyResponse == '' ? null : (dataKey == dataKeyResponse ? dataItem : yield this.RetrieveDataItem(dataKeyResponse, sector));
            const headers = yield this.ResolveDataHeaders(dataKey, sector, dataItem.HeadersSet, executionContext);
            let url = dataItem.UrlSet;
            url = yield this.ResolveDataUrlMustaches(null, sector, url, executionContext);
            const object = {};
            if (dataItem.IsUnitOfWork) {
                if (dataItem.DataInserted.length > 0)
                    object.Inserted = dataItem.DataInserted;
                if (dataItem.DataUpdated.length > 0)
                    object.Updated = dataItem.DataUpdated;
                if (dataItem.DataDeleted.length > 0)
                    object.Deleted = dataItem.DataDeleted;
            }
            else {
                object.Entities = dataItem.Data;
            }
            const headersResponse = dataItem.IsCookieChange ? [] : null;
            const data = yield this.Application.Server.GetJSON(url, "POST", this.Application.Serializer.Serialize(object), this.CONTENT_TYPE_JSON, null, headers);
            if (this.Application.Server.HasBadRequest)
                return (false);
            if ((data != null) && (dataItemResponse != null))
                dataItemResponse.Data = data;
            dataItem.DataInserted = [];
            dataItem.DataUpdated = [];
            dataItem.DataDeleted = [];
            if (dataKey !== dataKeyResponse)
                yield this.NotifyNoChanges(dataItem, notify, dataKey);
            yield this.NotifyChanges(dataItem, ((notify) && (dataItemResponse != null)), dataKeyResponse, null, null);
            return (true);
        });
    }
    PostDataItem(dataKey, sector, dataKeyResponse, notify, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            if (dataItem.CookieName != null)
                return (this.Application.CookieHandler.SetCookieValue(dataItem));
            const dataItemResponse = dataKeyResponse == '' ? null : (dataKey == dataKeyResponse ? dataItem : yield this.RetrieveDataItem(dataKeyResponse, sector));
            const headers = yield this.ResolveDataHeaders(dataKey, sector, dataItem.HeadersSet, executionContext);
            let url = dataItem.UrlSet;
            url = yield this.ResolveDataUrlMustaches(null, sector, url, executionContext);
            const canChunk = dataItem.Chunk != null;
            const chunkMustache = canChunk ? this.Application.Parser.ParseMustache(dataItem.Chunk) : null;
            let dataChunk = canChunk ? this.Application.Solver.ResolveItemStoragePathObject(dataItem, chunkMustache) : "";
            const isChunk = dataChunk.length > this.CHUNK_SIZE;
            const object = isChunk ? this.Application.Solver.Clone(dataItem.Data, true) : dataItem.Data;
            if (isChunk)
                this.Application.Solver.UpdateDataPathObject(object, chunkMustache, dataChunk.substring(0, this.CHUNK_SIZE));
            const headersResponse = dataItem.IsCookieChange ? [] : null;
            const data = yield this.Application.Server.GetJSON(url, "POST", this.Application.Serializer.Serialize(object), this.CONTENT_TYPE_JSON, null, headers, headersResponse);
            if (this.Application.Server.HasBadRequest)
                return (false);
            if (dataItemResponse != null)
                dataItemResponse.Data = data;
            if (isChunk) {
                const urlChunk = yield this.ResolveDataUrlMustaches(null, sector, dataItem.UrlSetChunk, executionContext);
                while (dataChunk.length > this.CHUNK_SIZE) {
                    dataChunk = dataChunk.substring(this.CHUNK_SIZE);
                    const chunkCurrent = dataChunk.substring(0, this.CHUNK_SIZE);
                    yield this.Application.Server.GetJSON(urlChunk, "POST", chunkCurrent, this.CONTENT_TYPE_TEXT, null, headers, null);
                    if (this.Application.Server.HasBadRequest)
                        return (false);
                }
            }
            if (dataKey !== dataKeyResponse)
                yield this.NotifyNoChanges(dataItem, notify, dataKey);
            yield this.NotifyChanges(dataItem, ((notify) && (dataItemResponse != null)), dataKeyResponse, null, null);
            return (true);
        });
    }
    PostDataMapping(dataKey, sector, dataItem, notify, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = this.Application.Searcher.FindDataKey(dataKey, sector);
            if (el === null)
                return (false);
            const dataValue = el.getAttribute('d-dataValue');
            if (dataValue == null)
                return (false);
            let updated = false;
            const isReference = el.getAttribute('d-dataLoadType') === 'reference';
            if (isReference) {
                const mustacheFullPartsReference = this.Application.Parser.ParseMustache(dataValue);
                const dataSectorReference = this.Application.Solver.ResolveSector(mustacheFullPartsReference, sector);
                const dataKeyReference = this.Application.Solver.ResolveDataKey(mustacheFullPartsReference);
                const mustacheDataFieldsReference = this.Application.Solver.ResolveDataFields(mustacheFullPartsReference);
                const mustachePartsReference = this.Application.Solver.CreateDataPath(dataKeyReference, mustacheDataFieldsReference);
                const dataClone = this.Application.Solver.Clone(dataItem.Data, true);
                updated = yield this.UpdateDataPath(dataSectorReference, null, mustachePartsReference, dataClone, notify);
                return (updated);
            }
            let dataValueResolved = dataValue;
            if (this.Application.Parser.IsMustache(dataValue))
                dataValueResolved = yield this.ResolveMustaches(sector, dataValue);
            const storageItemMapped = yield this.RetrieveDataItem(dataValueResolved, sector);
            if (storageItemMapped === null)
                return (null);
            const dataMappingField = el.getAttribute('d-dataMappingField');
            const dataMappingSearchField = el.getAttribute('d-dataMappingSearchField');
            let dataMappingSearchValue = el.getAttribute('d-dataMappingSearchValue');
            const dataMappingSearchHierarchyField = el.getAttribute('d-dataMappingSearchHierarchyField');
            if (((dataMappingField == null) || (dataMappingField == '')) && ((dataMappingSearchField == null) || (dataMappingSearchField == ''))) {
                if (storageItemMapped.Data === dataItem.Data)
                    return (false);
                updated = true;
                storageItemMapped.Data = dataItem.Data;
                storageItemMapped.HasChanges = true;
            }
            if (!updated) {
                let data = storageItemMapped.Data;
                let dataPath = null;
                if ((dataMappingField != null) && (dataMappingField != '')) {
                    const dataMappingFieldResolved = yield this.ResolveMustaches(sector, dataMappingField);
                    if ((dataMappingFieldResolved != null) && (dataMappingFieldResolved != '')) {
                        dataPath = this.Application.Parser.ParsePath(dataMappingFieldResolved);
                        const dataPathFull = this.Application.Solver.CreateDataPath(dataValueResolved, dataPath);
                        data = this.Application.Solver.ResolveDataObjectPathObject(data, dataPathFull);
                        if (data === null)
                            return (false);
                    }
                }
                if ((dataMappingSearchField != null) && (dataMappingSearchField != '') && (dataMappingSearchValue != null) && (dataMappingSearchValue != '')) {
                    if (this.Application.Parser.IsMustache(dataMappingSearchValue)) {
                        const dataPathCurrent = this.Application.Parser.ParseMustache(dataMappingSearchValue);
                        dataMappingSearchValue = yield this.Application.Solver.ResolveItemDataPathObject(sector, null, dataPathCurrent);
                    }
                    const updatedDataObject = this.Application.Solver.UpdateDataObjectLookupHierarchy(data, dataMappingSearchField, dataMappingSearchValue, dataItem.Data, dataMappingSearchHierarchyField);
                    if (updatedDataObject == null)
                        return (false);
                    updated = updatedDataObject;
                }
                else {
                    updated = yield this.SetDataKeyField(dataValueResolved, sector, dataPath, dataItem.Data, false);
                }
            }
            yield this.NotifyChanges(dataItem, ((updated) && (notify)), dataValueResolved, null, null);
            return (true);
        });
    }
    ClearData(dataText, sector, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.Application.Parser.IsMustache(dataText)) {
                const mustacheParts = this.Application.Parser.ParseMustache(dataText);
                const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                const dataItem = yield this.RetrieveDataItem(dataKey, sector);
                if (dataItem == null)
                    return (false);
                const data = this.Application.Solver.ResolveItemStoragePathObject(dataItem, mustacheParts);
                if ((data == null) || (data == undefined) || (data.length == undefined))
                    return (false);
                for (let i = data.length - 1; i >= 0; i--) {
                    const item = data[i];
                    data.splice(i, 1);
                }
                yield this.NotifyChanges(dataItem, notify, dataKey, null, null);
            }
            else {
                const dataKey = dataText;
                const dataItem = yield this.RetrieveDataItem(dataKey, sector);
                if (dataItem == null)
                    return (false);
                for (let i = dataItem.Data.length - 1; i >= 0; i--) {
                    const item = dataItem.Data[i];
                    if (dataItem.IsUnitOfWork)
                        dataItem.DataDeleted.push(item);
                    dataItem.Data.splice(i, 1);
                }
                yield this.NotifyChanges(dataItem, notify, dataKey, null, null);
            }
            return (true);
        });
    }
    UnloadData(dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.DiscardCacheData(dataKey, sector, true));
        });
    }
    ClearDataToken() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this._cacheItems.length; i++) {
                const item = this._cacheItems[i];
                if (item == null)
                    continue;
                if (!item.IsToken)
                    continue;
                item.Data = [];
                item.DataDeleted = [];
                item.DataInserted = [];
                item.DataUpdated = [];
                const dataKey = item.DataKey;
                this.Application.Observer.SubscribeAuthorization(dataKey, 'notify');
                yield this.NotifyChanges(item, true, dataKey, null, null);
            }
        });
    }
    FireEventOnBeforeContainerUnload(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this._cacheItems.length - 1; i >= 0; i--) {
                if (i >= this._cacheItems.length)
                    continue;
                const item = this._cacheItems[i];
                if (item == null)
                    continue;
                if (item.Sector !== sector)
                    continue;
                if (item.OnBeforeContainerUnload === null)
                    continue;
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(item.Sector, item.Element, item.OnBeforeContainerUnload);
            }
        });
    }
    FireEventOnAfterContainerLoad(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this._cacheItems.length - 1; i >= 0; i--) {
                if (i >= this._cacheItems.length)
                    continue;
                const item = this._cacheItems[i];
                if (item == null)
                    continue;
                if (item.Sector !== sector)
                    continue;
                if (item.OnAfterContainerLoad === null)
                    continue;
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(item.Sector, item.Element, item.OnAfterContainerLoad);
            }
        });
    }
    MoveDataItem(dataKey, sector, dataMove, dataPosition, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            let indexBefore = null;
            let indexAfter = null;
            for (let i = 0; i < dataItem.Data.length; i++) {
                const data = dataItem.Data[i];
                if (data === dataMove)
                    indexBefore = i;
                if (data === dataPosition)
                    indexAfter = i;
            }
            if ((indexBefore === null) || (indexAfter === null) || (indexBefore === indexAfter))
                return (false);
            yield this.FlagDataItemAsUpdated(dataKey, sector, indexBefore, false);
            yield this.FlagDataItemAsUpdated(dataKey, sector, indexAfter, false);
            dataItem.Data.splice(indexBefore, 1);
            dataItem.Data.splice(indexAfter, 0, dataMove);
            yield this.NotifyChanges(dataItem, notify, dataKey, null, null, true);
            return (true);
        });
    }
    MoveDataIndex(dataKey, sector, dataMove, index, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItem = yield this.RetrieveDataItem(dataKey, sector);
            if (dataItem == null)
                return (false);
            let indexBefore = null;
            for (let i = 0; i < dataItem.Data.length; i++) {
                const data = dataItem.Data[i];
                if (data === dataMove)
                    indexBefore = i;
            }
            if ((indexBefore === null) || (index === null) || (indexBefore === index))
                return (false);
            yield this.FlagDataItemAsUpdated(dataKey, sector, indexBefore, false);
            yield this.FlagDataItemAsUpdated(dataKey, sector, index, false);
            dataItem.Data.splice(indexBefore, 1);
            dataItem.Data.splice(index, 0, dataMove);
            yield this.NotifyChanges(dataItem, notify, dataKey, null, null, true);
            return (true);
        });
    }
    ResolveData(executeNoCache, el = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el == null)
                el = document.documentElement;
            const children = [].slice.call(el.children);
            for (let i = 0; i < children.length; i++)
                yield this.ResolveDataElement(executeNoCache, children[i]);
        });
    }
    ResolveDataElement(executeNoCache, el) {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = el.getAttribute ? el.getAttribute('d-sector') : null;
            if (sector != null)
                return;
            const children = [].slice.call(el.children);
            const hasChildren = children.length > 0;
            if (hasChildren) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    yield this.ResolveDataElement(executeNoCache, child);
                }
            }
            else {
                yield this.ResolveDataLoadInternal(executeNoCache, el);
            }
        });
    }
    ResolveDataLoadInternal(executeNoCache, el) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataLoadType = el.getAttribute('d-dataLoadType');
            if (dataLoadType == null)
                return;
            if (dataLoadType !== 'startup')
                return;
            const dataKey = el.getAttribute('d-dataKey');
            if (dataKey == null)
                return;
            const sector = this.Application.Document.GetSector(el);
            if (!this.Application.Document.IsSectorReady(sector))
                return;
            const cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
            if (cacheIndex !== null)
                return;
            const canCache = this.Application.Parser.ParseBoolean(el.getAttribute('d-dataCache'), true);
            if ((!executeNoCache) && (!canCache))
                return;
            yield this.RetrieveDataItem(dataKey, sector, true, null);
        });
    }
    CreateErrorForStorage(type = null, message = null, content = null) {
        const object = {};
        object.Type = type;
        object.Message = message;
        object.Content = content;
        object.Date = new Date();
        return (object);
    }
    EnsureDataDelayLoaded(dataItem, dataPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.Application.Solver.ResolveDataObjectPathObject(dataItem.Data, dataPath);
            if (data !== '')
                return;
            const dataKey = dataPath[0];
            const dataField = dataPath[1];
            const item = yield this.RetrieveDataItemInternal(dataKey, null, true, [dataField]);
            for (const dataFieldCurrent in item.Data)
                dataItem.Data[dataFieldCurrent] = item.Data[dataFieldCurrent];
        });
    }
    HasChanges(sector, dataKey) {
        const cacheIndex = this.GetCacheKeyIndex(dataKey, sector);
        if (cacheIndex === null)
            return (false);
        const storageItem = this.GetCacheDataItem(cacheIndex);
        if (storageItem === null)
            return (false);
        return (storageItem.HasChanges);
    }
    RetrieveDataItemInternalSystem(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dataKey === '__debugger')
                return (this.RetrieveDataItemInternalSystemDebugger(dataKey));
            if (dataKey === '__sectors')
                return (this.RetrieveDataItemInternalSystemSectors(dataKey));
            if (dataKey === '__datakeysfunction')
                return (this.RetrieveDataItemInternalSystemDataKeysFunction(dataKey));
            if (dataKey === '__breakpoints')
                return (this.RetrieveDataItemInternalSystemBreakpoints(dataKey));
            if (dataKey === '__notifys')
                return (this.RetrieveDataItemInternalSystemNotifys(dataKey));
            if (dataKey === '__pipes')
                return (this.RetrieveDataItemInternalSystemPipes(dataKey));
            if (dataKey === '__errors')
                return (this.RetrieveDataItemInternalSystemErrors(dataKey));
            if (dataKey === '__functions')
                return (this.RetrieveDataItemInternalSystemFunctions(dataKey));
            if (dataKey === '__components')
                return (this.RetrieveDataItemInternalSystemComponents(dataKey));
            if (dataKey === '__requests')
                return (this.RetrieveDataItemInternalSystemRequests(dataKey));
            if (dataKey === '__sectorsupdate')
                return (this.RetrieveDataItemInternalSystemSectorsUpdate(dataKey));
            if (dataKey === '__runtime')
                return (this.RetrieveDataItemInternalSystemRuntime(dataKey));
            if (dataKey === '__objects')
                return (this.RetrieveDataItemInternalSystemObjects(dataKey));
            if (dataKey === '__objectsexpanded')
                return (this.RetrieveDataItemInternalSystemObjectsExpanded(dataKey));
            if (dataKey === '__objectproperties')
                return (this.RetrieveDataItemInternalSystemObjectProperties(dataKey));
            if (dataKey === '__objectdata')
                return (this.RetrieveDataItemInternalSystemObjectData(dataKey));
            if (dataKey === '__objectwatch')
                return (this.RetrieveDataItemInternalSystemObjectWatch(dataKey));
            if (dataKey === '__objectswatchs')
                return (this.RetrieveDataItemInternalSystemObjectsWatchs(dataKey));
            if (dataKey === '__objectswatchsvalues')
                return (this.RetrieveDataItemInternalSystemObjectsWatchsValues(dataKey));
            if (dataKey === '__browser')
                return (this.RetrieveDataItemInternalSystemBrowser(dataKey));
            if (dataKey === '__debuggerProperties')
                return (this.RetrieveDataItemInternalSystemDebuggerProperties(dataKey));
            return (null);
        });
    }
    CreateDataItemInternal(dataKey, data, canCache = true) {
        const item = new DrapoStorageItem(dataKey, data.length != null ? 'array' : 'object', null, null, data, null, null, null, null, null, null, null, null, false, true, false, false, null, false, null, false, '', null, null, null, canCache, null, null, null, null, null, null, null, null, null, null, null);
        return (item);
    }
    RetrieveDataItemInternalSystemDebugger(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            data.sector = '';
            data.datakey = '';
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemSectors(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.Application.Document.GetSectors();
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemDataKeysFunction(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Observer.SubscribeStorage('__debugger', ['sector'], dataKey);
            const sector = yield this.ResolveMustaches('', '{{__debugger.sector}}');
            const data = [];
            data.push('');
            for (let i = 0; i < this._cacheItems.length; i++) {
                const itemCache = this._cacheItems[i];
                if (itemCache == null)
                    continue;
                if (!this.Application.Document.IsEqualSector(itemCache.Sector, sector))
                    continue;
                const itemDataKey = itemCache.DataKey;
                if (this.Application.Document.IsSystemKey(itemDataKey))
                    continue;
                if ((!itemCache.IsTypeFunction) && ((!itemCache.IsTypeValue)))
                    continue;
                data.push(itemDataKey);
            }
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemBreakpoints(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemNotifys(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemPipes(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemErrors(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemFunctions(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemComponents(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Application.Debugger.GetComponents();
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemRequests(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemSectorsUpdate(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemRuntime(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            data.sector = '';
            data.datakey = '';
            data.label = '';
            data.expression = '';
            data.functionValue = '';
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjects(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Observer.SubscribeStorage('__objectsexpanded', [], dataKey, DrapoStorageLinkType.Reload);
            const data = yield this.Application.Debugger.GetObjects();
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjectsExpanded(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            data.push('sector_null');
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjectProperties(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            data.sector = '';
            data.datakey = '';
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjectData(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Application.Debugger.GetObjectData();
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjectWatch(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            data.Sector = '';
            data.Mustache = '';
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjectsWatchs(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemObjectsWatchsValues(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Application.Debugger.GetWatchsValues();
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    RetrieveDataItemInternalSystemBrowser(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            data.Width = width;
            data.Height = height;
            const item = this.CreateDataItemInternal(dataKey, data);
            item.CanCache = false;
            return (item);
        });
    }
    RetrieveDataItemInternalSystemDebuggerProperties(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            data.left = false;
            data.showobjects = false;
            data.showbreakpoints = false;
            data.shownotifys = false;
            data.showerrors = true;
            data.showpipes = true;
            data.showfunctions = false;
            data.showcomponents = false;
            data.showserver = false;
            data.showsectorsupdate = false;
            data.persist = false;
            const item = this.CreateDataItemInternal(dataKey, data);
            return (item);
        });
    }
    ExecuteQuery(sector, dataKey, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let objects = [];
            const objectsId = [];
            const objectsInformation = [];
            const filters = [];
            const hasFilters = query.Filter !== null;
            yield this.ResolveQueryConditionMustaches(sector, dataKey, query);
            for (let i = 0; i < query.Sources.length; i++) {
                const querySource = query.Sources[i];
                const querySourcePath = querySource.Source;
                const isQuerySourceMustache = this.Application.Parser.IsMustache(querySourcePath);
                let sourceDataKey = querySourcePath;
                let sourceMustache = sourceDataKey;
                if (isQuerySourceMustache) {
                    const mustacheParts = this.Application.Parser.ParseMustache(querySourcePath);
                    const mustacheDataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                    sourceDataKey = mustacheDataKey;
                }
                else {
                    sourceMustache = this.Application.Solver.CreateMustache([sourceDataKey]);
                }
                this.Application.Observer.SubscribeStorage(sourceDataKey, null, dataKey);
                const querySourceData = yield this.RetrieveDataValue(sector, sourceMustache);
                const querySourceObjects = this.GetQuerySourceObjects(query, querySourceData);
                for (let j = 0; j < querySourceObjects.length; j++) {
                    const querySourceObject = querySourceObjects[j];
                    const objectIndexes = this.EnsureQueryObject(query, querySource, i, objects, objectsId, objectsInformation, querySourceObject);
                    if ((objectIndexes === null) || (objectIndexes.length === 0))
                        continue;
                    for (let k = 0; k < objectIndexes.length; k++) {
                        const objectIndex = objectIndexes[k];
                        const object = objects[objectIndex];
                        const objectInformation = objectsInformation[objectIndex];
                        this.InjectQueryObjectProjections(query, querySource, object, objectInformation, querySourceObject);
                        if (hasFilters) {
                            const isAdd = (i === 0);
                            const filter = isAdd ? query.Filter.Clone() : filters[objectIndex];
                            if (isAdd)
                                filters.push(filter);
                            this.ResolveQueryConditionSource(query, querySource, querySourceObject, filter);
                        }
                    }
                }
            }
            const count = query.Sources.length;
            if ((count > 1) && (query.Sources[1].JoinType == 'INNER')) {
                for (let i = objects.length - 1; i >= 0; i--) {
                    if (objectsId[i].length === count)
                        continue;
                    objects.splice(i, 1);
                    objectsInformation.splice(i, 1);
                    if (hasFilters)
                        filters.splice(i, 1);
                }
            }
            if (hasFilters) {
                for (let i = filters.length - 1; i >= 0; i--) {
                    const filter = filters[i];
                    if (this.IsValidQueryCondition(filter))
                        continue;
                    objects.splice(i, 1);
                    objectsInformation.splice(i, 1);
                }
            }
            const objectsAggregations = this.ResolveQueryAggregations(query, objects, objectsInformation);
            if (objectsAggregations !== null)
                return (objectsAggregations);
            this.ResolveQueryFunctions(query, objects, objectsInformation);
            if (query.OutputArray != null) {
                const outputArray = [];
                for (let i = 0; i < objects.length; i++) {
                    const object = objects[i];
                    outputArray.push(object[query.OutputArray]);
                }
                objects = outputArray;
            }
            if (query.Sorts != null)
                objects = this.ResolveQueryOrderBy(query, objects);
            return (objects);
        });
    }
    GetQuerySourceObjects(query, querySourceData) {
        const querySourceObjects = Array.isArray(querySourceData) ? querySourceData : [querySourceData];
        if (query.Options.List != null)
            return (this.GetQuerySourceObjectsList(query, querySourceObjects));
        return (querySourceObjects);
    }
    GetQuerySourceObjectsList(query, querySourceObjects) {
        const items = [];
        for (let i = 0; i < querySourceObjects.length; i++)
            items.push(querySourceObjects[i]);
        for (let i = 0; i < items.length; i++) {
            const querySourceObject = items[i];
            const querySourceObjectIterator = querySourceObject[query.Options.List];
            if (querySourceObjectIterator == null)
                continue;
            const querySourceObjectIteratorObjects = Array.isArray(querySourceObjectIterator) ? querySourceObjectIterator : [querySourceObjectIterator];
            for (let j = 0; j < querySourceObjectIteratorObjects.length; j++)
                items.push(querySourceObjectIteratorObjects[j]);
        }
        return (items);
    }
    EnsureQueryObject(query, querySource, indexSource, objects, objectsIds, objectsInformation, querySourceObject) {
        let object = null;
        if (query.Sources.length == 1) {
            object = {};
            objects.push(object);
            objectsInformation.push({});
            return ([objects.length - 1]);
        }
        const joinCondition = query.Sources[1].JoinConditions[0];
        const column = joinCondition.SourceLeft == querySource.Alias ? joinCondition.ColumnLeft : joinCondition.ColumnRight;
        const isObject = typeof querySourceObject === 'object';
        const id = isObject ? querySourceObject[column] : querySourceObject;
        if (indexSource === 0) {
            object = {};
            objects.push(object);
            const ids = [];
            ids.push(id);
            objectsIds.push(ids);
            objectsInformation.push({});
            return ([objects.length - 1]);
        }
        const indexes = [];
        for (let i = 0; i < objects.length; i++) {
            const objectsId = objectsIds[i];
            if (objectsId.length > 1)
                continue;
            const objectId = objectsId[0];
            if (objectId != id)
                continue;
            objectsId.push(objectId);
            indexes.push(i);
        }
        if ((indexes.length == 0) && (querySource.JoinType === 'OUTER')) {
            object = {};
            objects.push(object);
            const ids = [];
            ids.push(id);
            objectsIds.push(ids);
            objectsInformation.push({});
            return ([objects.length - 1]);
        }
        return (indexes);
    }
    InjectQueryObjectProjections(query, querySource, object, objectInformation, sourceObject) {
        var _a, _b, _c, _d;
        const isObject = typeof sourceObject === 'object';
        for (let i = 0; i < query.Projections.length; i++) {
            const projection = query.Projections[i];
            if (projection.FunctionName !== null) {
                for (let j = 0; j < projection.FunctionParameters.length; j++) {
                    const functionParameter = projection.FunctionParameters[j];
                    const functionParameterName = this.ResolveQueryFunctionParameterName(functionParameter);
                    if (objectInformation[functionParameterName] != null)
                        continue;
                    const functionParameterValues = this.Application.Parser.ParseQueryProjectionFunctionParameterValue(functionParameterName);
                    const source = functionParameterValues[0];
                    if ((query.Sources.length > 1) && (((_a = querySource.Alias) !== null && _a !== void 0 ? _a : querySource.Source) !== source))
                        continue;
                    const value = isObject ? sourceObject[(_b = projection.Column) !== null && _b !== void 0 ? _b : functionParameterName] : sourceObject;
                    objectInformation[functionParameterName] = value;
                }
            }
            else {
                const source = projection.Source;
                if (source !== null) {
                    if ((querySource.Alias !== null) && (source !== querySource.Alias))
                        continue;
                    if ((querySource.Alias === null) && (source !== querySource.Source))
                        continue;
                }
                else {
                    if ((isObject) && (!sourceObject[projection.Column]))
                        continue;
                    if ((!isObject) && (((_c = querySource.Alias) !== null && _c !== void 0 ? _c : querySource.Source) !== projection.Column))
                        continue;
                }
                const value = isObject ? sourceObject[projection.Column] : sourceObject;
                object[(_d = projection.Alias) !== null && _d !== void 0 ? _d : projection.Column] = value;
            }
        }
    }
    ResolveQueryConditionSource(query, querySource, sourceObject, filter) {
        const valueLeft = this.ResolveQueryConditionSourceColumn(query, querySource, sourceObject, filter.SourceLeft, filter.ColumnLeft);
        if (valueLeft !== null)
            filter.ValueLeft = valueLeft;
        if (filter.IsNullRight)
            return;
        const valueRight = this.ResolveQueryConditionSourceColumn(query, querySource, sourceObject, filter.SourceRight, filter.ColumnRight);
        if (valueRight !== null)
            filter.ValueRight = valueRight;
    }
    ResolveQueryConditionSourceColumn(query, querySource, sourceObject, source, column) {
        var _a;
        const isObject = typeof sourceObject === 'object';
        if (source !== null) {
            if ((querySource.Alias !== null) && (source !== querySource.Alias))
                return (null);
            if ((querySource.Alias === null) && (source !== querySource.Source))
                return (null);
        }
        else {
            if ((isObject) && (!(column in sourceObject)))
                return (null);
            if ((!isObject) && (((_a = querySource.Alias) !== null && _a !== void 0 ? _a : querySource.Source) !== column))
                return (null);
        }
        const value = isObject ? sourceObject[column] : sourceObject;
        return (value == null ? null : this.Application.Solver.EnsureString(value));
    }
    ResolveQueryFunctionParameterName(value) {
        value = value.replace('.', '_');
        return (value);
    }
    ResolveQueryAggregations(query, objects, objectsInformation) {
        if (query.Projections[0].FunctionName === 'COUNT') {
            const objectAggregation = {};
            objectAggregation[query.Projections[0].Alias] = objects.length;
            return (objectAggregation);
        }
        if (query.Projections[0].FunctionName === 'MAX') {
            const objectAggregation = {};
            objectAggregation[query.Projections[0].Alias] = this.ResolveQueryAggregationsMax(query, query.Projections[0], objects, objectsInformation);
            return (objectAggregation);
        }
        if (query.Projections[0].FunctionName === 'MIN') {
            const objectAggregation = {};
            objectAggregation[query.Projections[0].Alias] = this.ResolveQueryAggregationsMin(query, query.Projections[0], objects, objectsInformation);
            return (objectAggregation);
        }
        return (null);
    }
    ResolveQueryAggregationsMax(query, projection, objects, objectsInformation) {
        let value = null;
        const functionParameter = projection.FunctionParameters[0];
        const functionParameterName = this.ResolveQueryFunctionParameterName(functionParameter);
        for (let i = 0; i < objectsInformation.length; i++) {
            const objectInformation = objectsInformation[i];
            const valueCurrent = objectInformation[functionParameterName];
            if ((value == null) || (value < valueCurrent))
                value = valueCurrent;
        }
        return (value);
    }
    ResolveQueryAggregationsMin(query, projection, objects, objectsInformation) {
        let value = null;
        const functionParameter = projection.FunctionParameters[0];
        const functionParameterName = this.ResolveQueryFunctionParameterName(functionParameter);
        for (let i = 0; i < objectsInformation.length; i++) {
            const objectInformation = objectsInformation[i];
            const valueCurrent = objectInformation[functionParameterName];
            if ((value == null) || (value > valueCurrent))
                value = valueCurrent;
        }
        return (value);
    }
    ResolveQueryFunctions(query, objects, objectsInformation) {
        for (let i = 0; i < query.Projections.length; i++) {
            const projection = query.Projections[i];
            if (projection.FunctionName !== null)
                this.ResolveQueryFunction(projection.Alias, projection.FunctionName, projection.FunctionParameters, objects, objectsInformation);
        }
    }
    ResolveQueryFunction(projectionAlias, functionName, functionParameters, objects, objectsInformation) {
        if (functionName === 'COALESCE')
            this.ResolveQueryFunctionCoalesce(projectionAlias, functionParameters, objects, objectsInformation);
    }
    ResolveQueryFunctionCoalesce(projectionAlias, functionParameters, objects, objectsInformation) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const objectInformation = objectsInformation[i];
            for (let j = 0; j < functionParameters.length; j++) {
                const functionParameter = functionParameters[j];
                const functionParameterName = this.ResolveQueryFunctionParameterName(functionParameter);
                if (objectInformation[functionParameterName] == null)
                    continue;
                object[projectionAlias] = objectInformation[functionParameterName];
                break;
            }
        }
    }
    ResolveQueryConditionMustaches(sector, dataKey, query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (query.Filter != null)
                yield this.ResolveQueryConditionMustachesFilter(sector, dataKey, query.Filter);
            for (let i = 0; i < query.Sources.length; i++) {
                const source = query.Sources[i];
                if (source.JoinConditions == null)
                    continue;
                for (let j = 0; j < source.JoinConditions.length; j++) {
                    const filter = source.JoinConditions[j];
                    yield this.ResolveQueryConditionMustachesFilter(sector, dataKey, filter);
                }
            }
            if (query.Sorts != null)
                yield this.ResolveQuerySortsMustaches(sector, dataKey, query.Sorts);
        });
    }
    ResolveQueryConditionMustachesFilter(sector, dataKey, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const valueLeft = yield this.ResolveQueryConditionMustachesFilterValue(sector, dataKey, filter.ValueLeft);
            if (valueLeft !== undefined) {
                filter.ColumnLeft = valueLeft;
                filter.ValueLeft = valueLeft;
            }
            const valueRight = yield this.ResolveQueryConditionMustachesFilterValue(sector, dataKey, filter.ValueRight);
            if (valueRight !== undefined) {
                filter.ColumnRight = valueRight;
                filter.ValueRight = valueRight;
            }
        });
    }
    ResolveQueryConditionMustachesFilterValue(sector, dataKey, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Application.Parser.IsMustache(value))
                return (undefined);
            const mustacheParts = this.Application.Parser.ParseMustache(value);
            const mustacheDataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
            this.Application.Observer.SubscribeStorage(mustacheDataKey, null, dataKey);
            const valueResolved = yield this.RetrieveDataValue(sector, value);
            return (valueResolved);
        });
    }
    IsValidQueryCondition(filter) {
        if ((filter.Comparator === '=') && (filter.ValueLeft == filter.ValueRight))
            return (true);
        if ((filter.Comparator === 'IS') && (filter.IsNullRight) && (filter.ValueLeft == null))
            return (true);
        if ((filter.Comparator === 'IS NOT') && (filter.IsNullRight) && (filter.ValueLeft != null))
            return (true);
        if ((filter.Comparator === 'LIKE') && (this.IsValidQueryConditionLike(filter.ValueLeft, filter.ValueRight, filter.IsSearchStartRight, filter.IsSearchEndRight)))
            return (true);
        return (false);
    }
    IsValidQueryConditionLike(valueLeft, valueRight, isSearchStartRight, isSearchEndRight) {
        const valueLeftClean = this.CleanSingleQuote(valueLeft).toLowerCase();
        const valueRightClean = this.CleanSingleQuote(valueRight).toLowerCase();
        if (valueRightClean.length === 0)
            return (false);
        const isRightWildcardStart = (valueRightClean[0] === '%');
        const isRightWildcardEnd = (valueRightClean[valueRightClean.length - 1] === '%');
        const valueRightCleanWithoutWildcard = valueRightClean.substr(isRightWildcardStart ? 1 : 0, valueRightClean.length - (isRightWildcardEnd ? 1 : 0));
        const isEqual = valueLeftClean === valueRightCleanWithoutWildcard;
        if (isEqual)
            return (true);
        const isCheckStart = ((isSearchStartRight) || (isRightWildcardStart));
        const isCheckEnd = ((isSearchEndRight) || (isRightWildcardEnd));
        if ((isCheckStart) && (isCheckEnd) && (valueLeftClean.indexOf(valueRightCleanWithoutWildcard) >= 0))
            return (true);
        if ((isCheckStart) && (valueLeftClean.endsWith(valueRightCleanWithoutWildcard)))
            return (true);
        if ((isCheckEnd) && (valueLeftClean.startsWith(valueRightCleanWithoutWildcard)))
            return (true);
        return (false);
    }
    CleanSingleQuote(value) {
        if (value.length < 2)
            return (value);
        if ((value[0] !== "'") && ((value[value.length - 1] !== "'")))
            return (value);
        return (value.substr(1, value.length - 2));
    }
    ResolveQuerySortsMustaches(sector, dataKey, sorts) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < sorts.length; i++) {
                const sort = sorts[i];
                const column = yield this.ResolveQueryConditionMustachesFilterValue(sector, dataKey, sort.Column);
                if (column !== undefined)
                    sort.Column = column;
                const type = yield this.ResolveQueryConditionMustachesFilterValue(sector, dataKey, sort.Type);
                if (type !== undefined)
                    sort.Type = type;
            }
        });
    }
    ResolveQueryOrderBy(query, objects) {
        if ((query.Sorts == null) || (query.Sorts.length == 0))
            return (objects);
        const sorts = query.Sorts;
        let sorted = true;
        while (sorted) {
            sorted = false;
            for (let i = 0; i < (objects.length - 1); i++) {
                const objectCurrent = objects[i];
                const objectNext = objects[i + 1];
                if (!this.IsSwapQueryOrderBy(sorts, objectCurrent, objectNext))
                    continue;
                sorted = true;
                objects[i] = objectNext;
                objects[i + 1] = objectCurrent;
            }
        }
        return (objects);
    }
    IsSwapQueryOrderBy(sorts, objectCurrent, objectNext) {
        for (let i = 0; i < sorts.length; i++) {
            const sort = sorts[i];
            const value = this.GetSwapQueryOrderBy(sort, objectCurrent, objectNext);
            if (value == 0)
                continue;
            if (value < 0)
                return (true);
            return (false);
        }
        return (false);
    }
    GetSwapQueryOrderBy(sort, objectCurrent, objectNext) {
        const propertyCurrent = objectCurrent[sort.Column];
        const propertyNext = objectNext[sort.Column];
        if (propertyCurrent == propertyNext)
            return (0);
        let value = propertyNext > propertyCurrent ? 1 : -1;
        if (sort.Type == 'DESC')
            value = 0 - value;
        return (value);
    }
}
//# sourceMappingURL=DrapoStorage.js.map