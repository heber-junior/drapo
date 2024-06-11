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
class DrapoObserver {
    get Application() {
        return (this._application);
    }
    get IsEnabledNotifyIncremental() {
        return (this._IsEnabledNotifyIncremental);
    }
    set IsEnabledNotifyIncremental(value) {
        this._IsEnabledNotifyIncremental = value;
    }
    constructor(application) {
        this._dataBarberDataKeys = [];
        this._dataBarberFields = [];
        this._dataBarberElements = [];
        this._dataForDataKey = [];
        this._dataForElement = [];
        this._dataIncrementalKey = [];
        this._dataIncrementalElements = [];
        this._IsEnabledNotifyIncremental = true;
        this._dataDelayKey = [];
        this._dataDelayField = [];
        this._dataDelayElements = [];
        this._dataStorageKey = [];
        this._dataStorageKeyFields = [];
        this._dataStorageKeyReferenceKey = [];
        this._dataStorageType = [];
        this._dataAuthorizationKey = [];
        this._dataAuthorizationType = [];
        this._dataLinkDataKey = [];
        this._dataLinkReferenceKey = [];
        this._dataLinkDataFields = [];
        this._dataComponentKey = [];
        this._dataComponentField = [];
        this._dataComponentElements = [];
        this._dataComponentFunction = [];
        this._dataComponentElementsFocus = [];
        this._lockedData = [];
        this._application = application;
    }
    GetBarberDataKeyIndex(dataKey) {
        for (let i = 0; i < this._dataBarberDataKeys.length; i++) {
            if (this._dataBarberDataKeys[i] == dataKey)
                return (i);
        }
        return (null);
    }
    GetForDataKeyIndex(dataKey) {
        for (let i = 0; i < this._dataForDataKey.length; i++) {
            if (this._dataForDataKey[i] == dataKey)
                return (i);
        }
        return (null);
    }
    GetDataIncrementalKeyIndex(dataKey) {
        for (let i = 0; i < this._dataIncrementalKey.length; i++) {
            if (this._dataIncrementalKey[i] == dataKey)
                return (i);
        }
        return (null);
    }
    CreateBarberDataKeyIndex(dataKey) {
        const index = this._dataBarberDataKeys.push(dataKey);
        this._dataBarberFields.push([]);
        this._dataBarberElements.push([]);
        return (index - 1);
    }
    CreateForDataKeyIndex(dataKey) {
        const index = this._dataForDataKey.push(dataKey);
        this._dataForElement.push([]);
        return (index - 1);
    }
    CreateDataIncrementalKeyIndex(dataKey) {
        const index = this._dataIncrementalKey.push(dataKey);
        this._dataIncrementalElements.push([]);
        return (index - 1);
    }
    SubscribeBarber(element, dataKey, dataFields) {
        let dataKeyIndex = this.GetBarberDataKeyIndex(dataKey);
        if (dataKeyIndex == null)
            dataKeyIndex = this.CreateBarberDataKeyIndex(dataKey);
        const dataBarberFields = this._dataBarberFields[dataKeyIndex];
        const elements = this._dataBarberElements[dataKeyIndex];
        for (let i = 0; i < dataBarberFields.length; i++) {
            if (!this.IsEqualDataFields(dataBarberFields[i], dataFields))
                continue;
            if (elements[i] !== element)
                continue;
            return (false);
        }
        dataBarberFields.push(dataFields);
        elements.push(element);
        return (true);
    }
    UnsubscribeBarber(dataKey) {
        const dataKeyIndex = this.GetBarberDataKeyIndex(dataKey);
        if (dataKeyIndex === null)
            return;
        this._dataBarberDataKeys.splice(dataKeyIndex, 1);
        this._dataBarberElements.splice(dataKeyIndex, 1);
        this._dataBarberFields.splice(dataKeyIndex, 1);
    }
    SubscribeFor(elementForTemplate, dataKey) {
        let dataKeyIndex = this.GetForDataKeyIndex(dataKey);
        if (dataKeyIndex == null)
            dataKeyIndex = this.CreateForDataKeyIndex(dataKey);
        this._dataForElement[dataKeyIndex].push(elementForTemplate);
    }
    SubscribeStorage(dataKey, dataFields, dataReferenceKey, type = DrapoStorageLinkType.Reload) {
        const dataField = ((dataFields != null) && (dataFields.length > 0)) ? dataFields[0] : null;
        let dataKeyIndex = this.GetStorageKeyIndex(dataKey);
        if (dataKeyIndex == null)
            dataKeyIndex = this.CreateStorageDataKeyIndex(dataKey);
        const dataStorageFields = this._dataStorageKeyFields[dataKeyIndex];
        const dataReferenceKeys = this._dataStorageKeyReferenceKey[dataKeyIndex];
        const dataTypes = this._dataStorageType[dataKeyIndex];
        for (let i = 0; i < dataStorageFields.length; i++) {
            if ((dataStorageFields[i] === dataField) && (dataReferenceKeys[i] === dataReferenceKey))
                return;
        }
        dataStorageFields.push(dataField);
        dataReferenceKeys.push(dataReferenceKey);
        dataTypes.push(type);
    }
    UnsubscribeStorage(dataKey) {
        this.UnsubscribeStorageReferenceKey(dataKey);
        const dataKeyIndex = this.GetStorageKeyIndex(dataKey);
        if (dataKeyIndex === null)
            return;
        this._dataStorageKey.splice(dataKeyIndex, 1);
        this._dataStorageKeyFields.splice(dataKeyIndex, 1);
        this._dataStorageKeyReferenceKey.splice(dataKeyIndex, 1);
        this._dataStorageType.splice(dataKeyIndex, 1);
    }
    UnsubscribeStorageReferenceKey(dataKey) {
        for (let i = this._dataStorageKey.length - 1; i >= 0; i--) {
            const references = this._dataStorageKeyReferenceKey[i];
            for (let j = references.length - 1; j >= 0; j--) {
                if (references[j] !== dataKey)
                    continue;
                this._dataStorageKeyFields[i].splice(j, 1);
                this._dataStorageKeyReferenceKey[i].splice(j, 1);
                this._dataStorageType[i].splice(j, 1);
            }
            if (references.length !== 0)
                continue;
            this._dataStorageKey.splice(i, 1);
            this._dataStorageKeyFields.splice(i, 1);
            this._dataStorageKeyReferenceKey.splice(i, 1);
            this._dataStorageType.splice(i, 1);
        }
    }
    UnsubscribeFor(dataKey, elementForTemplate = null) {
        const dataKeyIndex = this.GetForDataKeyIndex(dataKey);
        if (dataKeyIndex == null)
            return;
        if (elementForTemplate === null) {
            this._dataForDataKey.splice(dataKeyIndex, 1);
            this._dataForElement.splice(dataKeyIndex, 1);
            return;
        }
        const dataElements = this._dataForElement[dataKeyIndex];
        for (let i = dataElements.length - 1; i >= 0; i--) {
            const dataElementParent = dataElements[i];
            if (dataElementParent != elementForTemplate)
                continue;
            this._dataForElement[dataKeyIndex].splice(i, 1);
        }
    }
    Notify(dataKey, dataIndex, dataFields, canUseDifference = true, canNotifyStorage = true, notifyStorageDataKey = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsLocked(dataKey))
                return;
            yield this.Application.Debugger.AddNotify(dataKey);
            if (canNotifyStorage)
                yield this.NotifyStorage(dataKey, dataFields, notifyStorageDataKey);
            yield this.NotifyFor(dataKey, dataIndex, dataFields, canUseDifference);
            yield this.NotifyBarber(dataKey, dataFields);
            yield this.NotifyLink(dataKey, dataFields);
            yield this.NotifyComponent(dataKey, dataFields);
            yield this.Application.Storage.FireEventOnNotify(dataKey);
        });
    }
    NotifyFor(dataKey, dataIndex, dataFields, canUseDifference = true, type = DrapoStorageLinkType.Render) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.GetForDataKeyIndex(dataKey);
            if (index === null)
                return;
            const dataElements = this._dataForElement[index];
            for (let i = dataElements.length - 1; i >= 0; i--) {
                const dataElement = dataElements[i];
                if (dataElement.parentElement === null) {
                    dataElements.splice(i, 1);
                }
                else if (!this.Application.SectorContainerHandler.IsElementContainerized(dataElement)) {
                    const elParent = dataElement.parentElement;
                    yield this.Application.ControlFlow.ResolveControlFlowForElement(dataElement, false, canUseDifference, type);
                    yield this.Application.ComponentHandler.ResolveComponents(elParent);
                }
            }
        });
    }
    NotifyBarber(dataKey, dataFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyIndex = this.GetBarberDataKeyIndex(dataKey);
            if (dataKeyIndex === null)
                return;
            const dataField = ((dataFields != null) && (dataFields.length > 0)) ? dataFields[0] : null;
            const dataElements = this._dataBarberElements[dataKeyIndex];
            const dataBarberFields = this._dataBarberFields[dataKeyIndex];
            for (let i = dataElements.length - 1; i >= 0; i--) {
                const element = dataElements[i];
                if (this.Application.Document.IsElementAttached(element)) {
                    const dataBarberFieldsCurrent = dataBarberFields[i];
                    if (!this.IsCompatibleDataFields(dataFields, dataBarberFieldsCurrent))
                        continue;
                    const sector = this.Application.Document.GetSector(element);
                    yield this.Application.Barber.ResolveFilter(element, sector, dataField == null, dataKey, dataField);
                }
                else if (!this.Application.SectorContainerHandler.IsElementContainerized(element)) {
                    dataElements.splice(i, 1);
                    dataBarberFields.splice(i, 1);
                }
            }
        });
    }
    NotifyStorage(dataKey, dataFields, notifyStorageDataKey = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyIndex = this.GetStorageKeyIndex(dataKey);
            if (dataKeyIndex == null)
                return;
            const dataField = ((dataFields != null) && (dataFields.length > 0)) ? dataFields[0] : null;
            const dataStorageFields = this._dataStorageKeyFields[dataKeyIndex];
            const dataReferenceKeys = this._dataStorageKeyReferenceKey[dataKeyIndex];
            const dataTypes = this._dataStorageType[dataKeyIndex];
            for (let i = 0; i < dataStorageFields.length; i++) {
                if ((dataField != null) && (dataStorageFields[i] != null) && (dataStorageFields[i] !== dataField))
                    continue;
                const dataReferenceKey = dataReferenceKeys[i];
                if ((notifyStorageDataKey != null) && (dataReferenceKey === notifyStorageDataKey))
                    continue;
                const type = dataTypes[i];
                if (type == DrapoStorageLinkType.Reload) {
                    const sectors = this.Application.Storage.GetSectors(dataReferenceKey);
                    for (let j = 0; j < sectors.length; j++)
                        yield this.Application.Storage.ReloadData(dataReferenceKey, sectors[j], true, false);
                }
                else if (type == DrapoStorageLinkType.RenderClass) {
                    yield this.NotifyStorageRenderClass(dataReferenceKey);
                }
                else if (type == DrapoStorageLinkType.Pointer) {
                    yield this.Application.Storage.UpdatePointerStorageItems(dataKey, dataReferenceKey);
                    yield this.Application.Observer.Notify(dataReferenceKey, null, null, true, true, dataKey);
                }
                else {
                    yield this.Application.Observer.Notify(dataReferenceKey, null, null);
                }
            }
        });
    }
    NotifyStorageRenderClass(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.NotifyFor(dataKey, null, null, true, DrapoStorageLinkType.RenderClass);
        });
    }
    SubscribeIncremental(el, dataKey) {
        let dataKeyIndex = this.GetDataIncrementalKeyIndex(dataKey);
        if (dataKeyIndex == null)
            dataKeyIndex = this.CreateDataIncrementalKeyIndex(dataKey);
        this._dataIncrementalElements[dataKeyIndex].push(el);
    }
    NotifyIncremental(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.IsEnabledNotifyIncremental)
                return;
            const dataKeyIndex = this.GetDataIncrementalKeyIndex(dataKey);
            if (dataKeyIndex == null)
                return;
            const elements = this._dataIncrementalElements[dataKeyIndex];
            for (let i = elements.length - 1; i >= 0; i--) {
                if (i >= elements.length)
                    continue;
                const element = elements[i];
                if (element.parentElement === null)
                    elements.splice(i, 1);
                else
                    yield this.Application.ControlFlow.ResolveControlFlowForElement(element, true);
            }
        });
    }
    SubscribeDelay(el, dataKey, dataFields) {
        let dataKeyIndex = this.GetDelayKeyIndex(dataKey);
        if (dataKeyIndex == null) {
            dataKeyIndex = this._dataDelayKey.push(dataKey) - 1;
            this._dataDelayField.push([]);
            this._dataDelayElements.push([]);
        }
        const dataField = ((dataFields != null) && (dataFields.length > 0)) ? dataFields[0] : null;
        let dataFieldIndex = this.GetDelayFieldKeyIndex(dataKeyIndex, dataField);
        if (dataFieldIndex == null) {
            dataFieldIndex = this._dataDelayField[dataKeyIndex].push(dataField) - 1;
            this._dataDelayElements[dataKeyIndex].push([]);
        }
        this._dataDelayElements[dataKeyIndex][dataFieldIndex].push(el);
    }
    NotifyDelay(dataKey, dataFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyIndex = this.GetDelayKeyIndex(dataKey);
            if (dataKeyIndex == null)
                return;
            const dataField = ((dataFields != null) && (dataFields.length > 0)) ? dataFields[0] : null;
            const dataFieldIndex = this.GetDelayFieldKeyIndex(dataKeyIndex, dataField);
            if (dataFieldIndex == null)
                return;
            const elements = this._dataDelayElements[dataKeyIndex][dataFieldIndex];
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (element === null)
                    continue;
                this.SubscribeBarber(element, dataKey, dataFields);
                const sector = this.Application.Document.GetSector(element);
                yield this.Application.Barber.ResolveElementDelayed(element, sector, dataKey, dataField);
            }
            this._dataDelayField[dataKeyIndex].splice(dataFieldIndex, 1);
            this._dataDelayElements[dataKeyIndex].splice(dataFieldIndex, 1);
        });
    }
    SubscribeAuthorization(dataKey, type) {
        if (this.HasDataKeyAuthorization(dataKey))
            return;
        this._dataAuthorizationKey.push(dataKey);
        this._dataAuthorizationType.push(type);
    }
    HasDataKeyAuthorization(dataKey) {
        return (this.GetDataKeyAuthorizationIndex(dataKey) >= 0);
    }
    GetDataKeyAuthorizationIndex(dataKey) {
        for (let i = 0; i < this._dataAuthorizationKey.length; i++)
            if (this._dataAuthorizationKey[i] == dataKey)
                return (i);
        return (-1);
    }
    NotifyAuthorization() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = this._dataAuthorizationKey.length - 1; i >= 0; i--) {
                const dataKey = this._dataAuthorizationKey[i];
                const type = this._dataAuthorizationType[i];
                this._dataAuthorizationKey.splice(i, 1);
                this._dataAuthorizationType.splice(i, 1);
                this.Application.Document.ResetPendingAuthorizations(this.GetPendingAuthorization());
                if (type === 'notify')
                    yield this.Application.Storage.ReloadData(dataKey, null);
                else if (type === 'initialize')
                    yield this.Application.Storage.RetrieveDataItem(dataKey, null);
            }
            this.Application.Document.ResetPendingAuthorizations();
        });
    }
    HasPendingAuthorization() {
        return (this.GetPendingAuthorization() > 0);
    }
    GetPendingAuthorization() {
        return (this._dataAuthorizationKey.length);
    }
    HasDelayKeys() {
        return (this._dataDelayKey.length > 0);
    }
    GetDelayKeys() {
        return (this._dataDelayKey);
    }
    GetDelayFields(dataKey) {
        const dataKeyIndex = this.GetDelayKeyIndex(dataKey);
        if (dataKeyIndex == null)
            return (null);
        return (this._dataDelayField[dataKeyIndex]);
    }
    GetDelayKeyIndex(dataKey) {
        const data = this._dataDelayKey;
        for (let i = 0; i < data.length; i++) {
            if (data[i] == dataKey)
                return (i);
        }
        return (null);
    }
    GetDelayFieldKeyIndex(dataKeyIndex, dataField) {
        const data = this._dataDelayField[dataKeyIndex];
        for (let i = 0; i < data.length; i++) {
            if (data[i] == dataField)
                return (i);
        }
        return (null);
    }
    GetStorageKeyIndex(dataKey) {
        const data = this._dataStorageKey;
        for (let i = 0; i < data.length; i++) {
            if (data[i] == dataKey)
                return (i);
        }
        return (null);
    }
    CreateStorageDataKeyIndex(dataKey) {
        const index = this._dataStorageKey.push(dataKey);
        this._dataStorageKeyFields.push([]);
        this._dataStorageKeyReferenceKey.push([]);
        this._dataStorageType.push([]);
        return (index - 1);
    }
    SubscribeLink(dataKey, referenceKey, dataFields = null) {
        if (referenceKey === null)
            return (false);
        const index = this.GetLinkIndex(dataKey, referenceKey);
        if (index !== null) {
            const linkDataFields = this._dataLinkDataFields[index];
            if (linkDataFields == null)
                return (false);
            if (this.IsEqualDataFields(linkDataFields, dataFields))
                return (false);
            this._dataLinkDataFields[index] = null;
            return (true);
        }
        if (this.GetLinkIndex(referenceKey, dataKey) !== null)
            return (false);
        this._dataLinkDataKey.push(dataKey);
        this._dataLinkReferenceKey.push(referenceKey);
        this._dataLinkDataFields.push(dataFields);
        return (true);
    }
    SubscribeLinkMustache(mustache, referenceKey) {
        let inserted = false;
        const mustaches = this.Application.Parser.ParseMustaches(mustache);
        for (let i = 0; i < mustaches.length; i++) {
            const mustacheCurrent = mustaches[i];
            const mustacheParts = this.Application.Parser.ParseMustache(mustacheCurrent);
            const mustacheDataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
            const mustacheDataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
            if (this.SubscribeLink(mustacheDataKey, referenceKey, mustacheDataFields))
                inserted = true;
        }
        return (inserted);
    }
    UnsubscribeLink(dataKey, referenceKey = null) {
        if (referenceKey === null) {
            let unsubscribed = false;
            for (let i = 0; i < this._dataLinkDataKey.length; i++) {
                let remove = false;
                if (this._dataLinkDataKey[i] === dataKey)
                    remove = true;
                if ((!remove) && (this._dataLinkReferenceKey[i] === dataKey))
                    remove = true;
                if (!remove)
                    continue;
                unsubscribed = true;
                this._dataLinkDataKey.splice(i, 1);
                this._dataLinkReferenceKey.splice(i, 1);
                this._dataLinkDataFields.splice(i, 1);
            }
            return (unsubscribed);
        }
        else {
            const index = this.GetLinkIndex(dataKey, referenceKey);
            if (index === null)
                return (false);
            this._dataLinkDataKey.splice(index, 1);
            this._dataLinkReferenceKey.splice(index, 1);
            this._dataLinkDataFields.splice(index, 1);
            return (true);
        }
    }
    GetLinkIndex(dataKey, referenceKey) {
        for (let i = 0; i < this._dataLinkDataKey.length; i++) {
            const dataKeyLink = this._dataLinkDataKey[i];
            if (dataKeyLink !== dataKey)
                continue;
            const referenceKeyLink = this._dataLinkReferenceKey[i];
            if (referenceKeyLink === referenceKey)
                return (i);
        }
        return (null);
    }
    NotifyLink(dataKey, dataFields) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this._dataLinkDataKey.length; i++) {
                const dataKeyLink = this._dataLinkDataKey[i];
                if ((dataKeyLink !== dataKey) || (!this.IsCompatibleDataFields(dataFields, this._dataLinkDataFields[i])))
                    continue;
                const referenceKeyLink = this._dataLinkReferenceKey[i];
                yield this.Notify(referenceKeyLink, null, null);
            }
        });
    }
    Unsubscribe(dataKey) {
        this.UnsubscribeStorage(dataKey);
        this.UnsubscribeFor(dataKey);
        this.UnsubscribeBarber(dataKey);
        this.UnsubscribeLink(dataKey);
        this.UnsubscribeComponent(dataKey);
    }
    UnsubscribeDetached(sector) {
        this.UnsubscribeComponentDetached(sector);
    }
    GetComponentDataKeyIndex(dataKey) {
        const data = this._dataComponentKey;
        for (let i = 0; i < data.length; i++) {
            if (data[i] == dataKey)
                return (i);
        }
        return (null);
    }
    CreateComponentDataKeyIndex(dataKey) {
        const index = this._dataComponentKey.push(dataKey);
        this._dataComponentField.push([]);
        this._dataComponentElements.push([]);
        this._dataComponentFunction.push([]);
        this._dataComponentElementsFocus.push([]);
        return (index - 1);
    }
    SubscribeComponent(value, el, notifyFunction, elFocus = null) {
        let dataKey = null;
        let dataFields = null;
        let elComponentFocus = null;
        if (this.Application.Parser.IsMustache(value)) {
            const mustacheParts = this.Application.Parser.ParseMustache(value);
            dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
            dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
            elComponentFocus = elFocus;
        }
        else {
            dataKey = value;
        }
        let dataKeyIndex = this.GetComponentDataKeyIndex(dataKey);
        if (dataKeyIndex == null)
            dataKeyIndex = this.CreateComponentDataKeyIndex(dataKey);
        this._dataComponentField[dataKeyIndex].push(dataFields);
        this._dataComponentElements[dataKeyIndex].push(el);
        this._dataComponentFunction[dataKeyIndex].push(notifyFunction);
        this._dataComponentElementsFocus[dataKeyIndex].push(elComponentFocus);
    }
    UnsubscribeComponent(dataKey) {
        const dataKeyIndex = this.GetComponentDataKeyIndex(dataKey);
        if (dataKeyIndex == null)
            return;
        this._dataComponentKey.splice(dataKeyIndex, 1);
        this._dataComponentField.splice(dataKeyIndex, 1);
        this._dataComponentElements.splice(dataKeyIndex, 1);
        this._dataComponentFunction.splice(dataKeyIndex, 1);
        this._dataComponentElementsFocus.splice(dataKeyIndex, 1);
    }
    UnsubscribeComponentDetached(sector) {
        for (let i = this._dataComponentKey.length - 1; i >= 0; i--) {
            const dataComponentElements = this._dataComponentElements[i];
            for (let j = dataComponentElements.length - 1; j >= 0; j--) {
                const dataComponentElement = dataComponentElements[j];
                if (this.Application.Document.IsElementAttached(dataComponentElement))
                    continue;
                dataComponentElements.splice(j, 1);
                this._dataComponentField[i].splice(j, 1);
                this._dataComponentFunction[i].splice(j, 1);
                this._dataComponentElementsFocus[i].splice(j, 1);
            }
            if (dataComponentElements.length > 0)
                continue;
            this._dataComponentKey.splice(i, 1);
            this._dataComponentField.splice(i, 1);
            this._dataComponentElements.splice(i, 1);
            this._dataComponentFunction.splice(i, 1);
            this._dataComponentElementsFocus.splice(i, 1);
        }
    }
    NotifyComponent(dataKey, dataFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyIndex = this.GetComponentDataKeyIndex(dataKey);
            if (dataKeyIndex == null)
                return;
            const dataComponentElements = this._dataComponentElements[dataKeyIndex];
            const dataComponentFunctions = this._dataComponentFunction[dataKeyIndex];
            for (let i = dataComponentElements.length - 1; i >= 0; i--) {
                const dataComponentElement = dataComponentElements[i];
                if ((this.Application.Document.IsElementAttached(dataComponentElement)) && (!this.Application.Document.IsElementDetached(dataComponentElement))) {
                    const dataComponentFunction = dataComponentFunctions[i];
                    const result = yield dataComponentFunction.apply(null, [dataComponentElement, this.Application, dataFields]);
                    if ((result == null) || (result == true))
                        yield this.Application.Document.ResolveComponentUpdate(dataComponentElement, null);
                }
                else if (!this.Application.SectorContainerHandler.IsElementContainerized(dataComponentElement)) {
                    this._dataComponentField[dataKeyIndex].splice(i, 1);
                    this._dataComponentElements[dataKeyIndex].splice(i, 1);
                    this._dataComponentFunction[dataKeyIndex].splice(i, 1);
                    this._dataComponentElementsFocus[dataKeyIndex].splice(i, 1);
                }
            }
        });
    }
    GetElementByModel(sector, model) {
        if (!this.Application.Parser.IsMustacheOnly(model))
            return (null);
        const mustacheParts = this.Application.Parser.ParseMustache(model);
        const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
        const dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
        const el = this.GetElementByModelComponent(sector, model, dataKey, dataFields);
        if (el !== null)
            return (el);
        return (this.GetElementByModelBarber(sector, model, dataKey, dataFields));
    }
    GetElementByModelComponent(sector, model, dataKey, dataFields) {
        const dataKeyIndex = this.GetComponentDataKeyIndex(dataKey);
        if (dataKeyIndex === null)
            return (null);
        const componentDataFields = this._dataComponentField[dataKeyIndex];
        const els = this._dataComponentElementsFocus[dataKeyIndex];
        for (let i = els.length - 1; i >= 0; i--) {
            const el = els[i];
            if (el === null)
                continue;
            if (el.parentElement == null)
                continue;
            const componentDataField = componentDataFields[i];
            if (componentDataField == null)
                continue;
            const isEqual = this.Application.Solver.IsEqualStringArray(dataFields, componentDataField);
            if (isEqual)
                return (el);
        }
        return (null);
    }
    GetElementByModelBarber(sector, model, dataKey, dataFields) {
        const dataKeyIndex = this.GetBarberDataKeyIndex(dataKey);
        if (dataKeyIndex === null)
            return;
        const dataBarberElements = this._dataBarberElements[dataKeyIndex];
        const dataBarberFields = this._dataBarberFields[dataKeyIndex];
        for (let i = 0; i < dataBarberElements.length; i++) {
            const element = dataBarberElements[i];
            const sectorElement = this.Application.Document.GetSector(element);
            if (sectorElement !== sector)
                continue;
            const barberFields = dataBarberFields[i];
            const isEqual = this.IsEqualDataFields(barberFields, dataFields);
            if (!isEqual)
                continue;
            return (element);
        }
        return (null);
    }
    IsCompatibleDataFields(dataFields1, dataFields2) {
        if (dataFields1 == null)
            return (true);
        if (dataFields2 == null)
            return (true);
        for (let i = 0; (i < dataFields1.length) && (i < dataFields2.length); i++)
            if (dataFields1[i] != dataFields2[i])
                return (false);
        return (true);
    }
    IsEqualDataFields(dataFields1, dataFields2) {
        const isNull1 = dataFields1 == null;
        const isNull2 = dataFields2 == null;
        if (isNull1 != isNull2)
            return (false);
        if (isNull1)
            return (true);
        const length = dataFields1.length;
        if (length != dataFields2.length)
            return (false);
        for (let i = 0; i < length; i++)
            if (dataFields1[i] != dataFields2[i])
                return (false);
        return (true);
    }
    Lock(dataKey) {
        for (let i = 0; i < this._lockedData.length; i++) {
            const locked = this._lockedData[i];
            if (locked[0] == dataKey)
                return (false);
        }
        this._lockedData.push([dataKey, false]);
        return (true);
    }
    Unlock(dataKey, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this._lockedData.length; i++) {
                const locked = this._lockedData[i];
                if (locked[0] !== dataKey)
                    continue;
                this._lockedData.splice(i, 1);
                if ((locked[1]) && (notify))
                    yield this.Notify(dataKey, null, null);
                return (true);
            }
            return (false);
        });
    }
    IsLocked(dataKey) {
        for (let i = 0; i < this._lockedData.length; i++) {
            const locked = this._lockedData[i];
            if (locked[0] !== dataKey)
                continue;
            locked[1] = true;
            return (true);
        }
        return (false);
    }
}
//# sourceMappingURL=DrapoObserver.js.map