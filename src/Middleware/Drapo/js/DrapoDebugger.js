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
class DrapoDebugger {
    get Application() {
        return (this._application);
    }
    get Visible() {
        return (this._visible);
    }
    get Active() {
        return (this._active);
    }
    constructor(application) {
        this._visible = false;
        this._active = false;
        this._sector = '__debugger';
        this.SESSION_STORAGE_KEY = 'drapoDebugger';
        this._application = application;
    }
    ConnectDebugger() {
        return __awaiter(this, void 0, void 0, function* () {
            const application = this.Application;
            const elDocument = document.documentElement;
            this.Application.EventHandler.AttachEventListener(elDocument, 'keyup', 'keyup.debugger', (e) => {
                if (!e.ctrlKey)
                    return;
                if (e.key !== 'F2')
                    return;
                application.Debugger.ToogleDebugger();
            });
        });
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const debuggerPropertiesText = window.sessionStorage.getItem(this.SESSION_STORAGE_KEY);
            if (debuggerPropertiesText == null)
                return;
            const debuggerProperties = this.Application.Serializer.Deserialize(debuggerPropertiesText);
            yield this.Application.Storage.UpdateData('__debuggerProperties', null, debuggerProperties);
            this._active = true;
        });
    }
    ToogleDebugger() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._visible)
                return (this.CloseDebugger());
            else
                return (this.ShowDebugger());
        });
    }
    ShowDebugger() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._visible)
                return (false);
            yield this.Application.Storage.UnloadData('__objects', '');
            const elSector = this.Application.Searcher.FindByAttributeAndValue('d-sector', this._sector);
            if (elSector == null) {
                const fragment = document.createDocumentFragment();
                const elSectorNew = document.createElement('div');
                elSectorNew.setAttribute('d-sector', this._sector);
                elSectorNew.setAttribute('style', 'position:relative;z-index:99999');
                fragment.appendChild(elSectorNew);
                document.body.appendChild(fragment);
            }
            this.Application.Document.StartUpdate(this._sector);
            yield this.Application.Document.LoadChildSectorContent(this._sector, '<d-debugger></d-debugger>');
            this._visible = true;
            this._active = true;
            return (true);
        });
    }
    CloseDebugger() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._visible)
                return (false);
            this.Application.Document.StartUpdate(this._sector);
            yield this.Application.Document.LoadChildSectorContent(this._sector, '');
            const elSector = this.Application.Searcher.FindByAttributeAndValue('d-sector', this._sector);
            yield this.Application.Document.RemoveElement(elSector, false);
            this._visible = false;
            this._active = false;
            return (true);
        });
    }
    HasBreakpoint(sector, dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return (false);
            const breakpoints = yield this.Application.Storage.RetrieveData('__breakpoints', '');
            for (let i = 0; i < breakpoints.length; i++) {
                const breakpoint = breakpoints[i];
                if ((this.Application.Document.IsEqualSector(breakpoint.sector, sector)) && (breakpoint.datakey === dataKey))
                    return (true);
            }
            return (false);
        });
    }
    ActivateBreakpoint(sector, dataKey, functionsValue, functionValue, label) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['sector'], sector, false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['datakey'], dataKey, false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['expression'], functionsValue, false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['functionValue'], functionValue, false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['label'], label, false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['running'], false, false);
            yield this.Application.Observer.Notify('__runtime', null, null);
            while (true) {
                const isRunning = yield this.Application.Storage.ResolveMustaches('', '{{__runtime.running}}');
                if (yield this.Application.Solver.ResolveConditional(isRunning))
                    break;
                yield this.Application.Document.Sleep(1000);
            }
        });
    }
    CleanRuntime() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['sector'], '', false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['datakey'], '', false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['expression'], '', false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['functionValue'], '', false);
            yield this.Application.Storage.SetDataKeyField('__runtime', '', ['label'], '', false);
            yield this.Application.Observer.Notify('__runtime', null, null);
        });
    }
    NotifySectors() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            yield this.Application.Storage.ReloadData('__sectors', '');
            yield this.Application.Storage.ReloadData('__objects', '');
            yield this.Application.Storage.ReloadData('__objectswatchsvalues', '');
        });
    }
    NotifyStorage(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            if (this.Application.Document.IsHiddenKey(dataKey))
                return;
            yield this.Application.Storage.ReloadData('__objects', '');
            yield this.Application.Storage.ReloadData('__objectswatchsvalues', '');
        });
    }
    NotifyComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            yield this.Application.Storage.ReloadData('__components', '');
        });
    }
    AddNotify(dataKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            if (this.Application.Document.IsHiddenKey(dataKey))
                return;
            yield this.Application.Storage.AddDataItem('__notifys', null, '', dataKey);
            yield this.Application.Storage.ReloadData('__objectswatchsvalues', '');
        });
    }
    AddPipe(pipe) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            if (this.Application.Document.IsHiddenKey(pipe))
                return;
            yield this.Application.Storage.AddDataItem('__pipes', null, '', pipe);
        });
    }
    AddFunction(functionParsed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            if (this.Application.Document.IsHiddenKey(functionParsed.Name))
                return;
            let functionText = functionParsed.Name + '(';
            for (let i = 0; i < functionParsed.Parameters.length; i++) {
                if (i != 0)
                    functionText += ',';
                functionText += functionParsed.Parameters[i];
            }
            functionText += ')';
            yield this.Application.Storage.AddDataItem('__functions', null, '', functionText);
        });
    }
    AddError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return;
            const lastError = yield this.Application.Storage.GetDataItemLast('__errors', '');
            if (lastError == error)
                return;
            yield this.Application.Storage.AddDataItem('__errors', null, '', error);
        });
    }
    GetObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            const objectsExpanded = yield this.Application.Storage.RetrieveData('__objectsexpanded', null);
            const objects = [];
            yield this.CreateObjectSector(objectsExpanded, objects, null, 'root');
            return (objects);
        });
    }
    CreateObject(type, key, name, sector, objectsExpanded) {
        return __awaiter(this, void 0, void 0, function* () {
            const object = {};
            object.Type = type;
            object.Key = key;
            object.Code = type + '_' + key;
            object.Name = name != null ? name : key;
            object.Children = [];
            object.Sector = sector;
            object.Action = this.CreateObjectAction(type, key, name, sector);
            object.IsExpanded = false;
            if (objectsExpanded != null) {
                for (let i = 0; i < objectsExpanded.length; i++) {
                    if (objectsExpanded[i] != object.Code)
                        continue;
                    object.IsExpanded = true;
                    break;
                }
            }
            return (object);
        });
    }
    CreateObjectAction(type, key, name, sector) {
        if (type === 'sector')
            return ('UpdateDataField(__objectproperties,datakey,);UpdateDataField(__objectproperties,sector,' + sector + ');Debugger(highlight,sector,dbgDebuggerHighlight,' + sector + ')');
        if (type === 'data')
            return ('UpdateDataField(__objectproperties,sector,' + sector + ',false);UpdateDataField(__objectproperties,datakey,' + key + ');Debugger(highlight,sector,dbgDebuggerHighlight,);ReloadData(__objectdata)');
        return ('');
    }
    CreateObjectSector(objectsExpanded, objects, sector, name = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((sector != null) && (sector[0] == '_'))
                return;
            const object = yield this.CreateObject('sector', sector, name != null ? name : sector, sector, objectsExpanded);
            objects.push(object);
            yield this.InsertObjectSectorChildrenSectors(objectsExpanded, object.Children, sector);
            yield this.InsertObjectSectorChildrenData(object.Children, sector);
        });
    }
    InsertObjectSectorChildrenSectors(objectsExpanded, objects, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectors = this.Application.Document.GetSectorChildren(sector);
            for (let i = 0; i < sectors.length; i++) {
                yield this.CreateObjectSector(objectsExpanded, objects, sectors[i]);
            }
        });
    }
    InsertObjectSectorChildrenData(objects, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeys = this.Application.Storage.GetSectorDataKeys(sector);
            for (let i = 0; i < dataKeys.length; i++) {
                const dataKey = dataKeys[i];
                if (dataKey[0] == '_')
                    return;
                const object = yield this.CreateObject('data', dataKey, dataKey, sector, null);
                objects.push(object);
            }
        });
    }
    CreateObjectData(sector, name, value, mustache) {
        const object = {};
        object.Name = name != null ? name : 'data';
        object.Value = value;
        object.Mustache = mustache;
        object.__objectdata = [];
        object.Action = 'UpdateDataField(__objectwatch,Sector,' + sector + ');UpdateDataField(__objectwatch,Mustache,' + object.Mustache + ');AddDataItem(__objectswatchs,__objectwatch);ReloadData(__objectswatchsvalues)';
        object.IsExpanded = name == null;
        return (object);
    }
    GetObjectData() {
        return __awaiter(this, void 0, void 0, function* () {
            const sector = yield this.Application.Storage.RetrieveDataValue(null, '{{__objectproperties.sector}}');
            const dataKey = yield this.Application.Storage.RetrieveDataValue(null, '{{__objectproperties.datakey}}');
            const objects = [];
            if (dataKey == '')
                return (objects);
            const data = yield this.GetObjectDataItem(dataKey, sector);
            yield this.InsertObjectData(sector, objects, dataKey, null, data);
            return (objects);
        });
    }
    GetObjectDataItem(dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageItem = yield this.Application.Storage.RetrieveDataItem(dataKey, sector);
            if (storageItem == null)
                return (null);
            if ((storageItem.Type == 'function') && (storageItem.OnLoad != null))
                return (storageItem.OnLoad);
            return (storageItem.Data);
        });
    }
    InsertObjectData(sector, objects, mustachePrefix, name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data == null)
                return;
            if (name !== null)
                mustachePrefix = mustachePrefix + '.' + name;
            if (Array.isArray(data))
                yield this.InsertObjectDataArray(sector, objects, mustachePrefix, name, data);
            else if (data instanceof Object)
                yield this.InsertObjectDataObject(sector, objects, mustachePrefix, name, data);
            else if ((typeof data === 'string') || (data instanceof String))
                yield this.InsertObjectDataString(sector, objects, mustachePrefix, name, data);
            else
                yield this.InsertObjectDataString(sector, objects, mustachePrefix, name, data.toString());
        });
    }
    InsertObjectDataObject(sector, objects, mustache, name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const object = this.CreateObjectData(sector, name, '', mustache);
            objects.push(object);
            for (const property in data) {
                const propertyName = property;
                const propertyData = data[property];
                yield this.InsertObjectData(sector, object.__objectdata, mustache, propertyName, propertyData);
            }
        });
    }
    InsertObjectDataArray(sector, objects, mustache, name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const object = this.CreateObjectData(sector, name, '', mustache);
            objects.push(object);
            yield this.InsertObjectDataString(sector, object.__objectdata, mustache + '.length', 'length', data.length.toString());
            for (let i = 0; i < data.length; i++)
                yield this.InsertObjectData(sector, object.__objectdata, mustache, '[' + i + ']', data[i]);
        });
    }
    InsertObjectDataString(sector, objects, mustache, name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            objects.push(this.CreateObjectData(sector, name, data, mustache));
        });
    }
    CreateWatchValue(sector, mustache, value, index) {
        const object = {};
        object.Sector = sector == null ? 'root' : sector;
        object.Mustache = mustache;
        object.Value = value;
        object.ActionRemove = 'RemoveDataItemLookup(__objectswatchs,_Index,' + index + ');ReloadData(__objectswatchsvalues)';
        return (object);
    }
    GetWatchsValues() {
        return __awaiter(this, void 0, void 0, function* () {
            const objects = [];
            const watchs = yield this.Application.Storage.RetrieveData('__objectswatchs', null);
            for (let i = 0; i < watchs.length; i++) {
                const watch = watchs[i];
                const sector = watch.Sector;
                const mustache = watch.Mustache;
                const value = yield this.Application.Storage.RetrieveDataValue(sector, '{{' + mustache + '}}');
                objects.push(this.CreateWatchValue(sector, mustache, value, i));
            }
            return (objects);
        });
    }
    ExecuteFunctionDebugger(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = parameters[0].toLowerCase();
            if (command == 'highlight')
                yield this.ExecuteFunctionDebuggerHighligh(parameters);
            else if (command == 'reload')
                yield this.ExecuteFunctionDebuggerReload();
            else if (command == 'persist')
                yield this.ExecuteFunctionDebuggerPersist();
        });
    }
    ExecuteFunctionDebuggerHighligh(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = parameters[1].toLowerCase();
            if (location == 'sector')
                yield this.ExecuteFunctionDebuggerHighlighSector(parameters);
            else if (location == 'component')
                yield this.ExecuteFunctionDebuggerHighlighComponent(parameters);
        });
    }
    ExecuteFunctionDebuggerHighlighSector(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const classHighlight = parameters[2];
            const sector = parameters[3];
            const elBeforeList = document.getElementsByClassName(classHighlight);
            const elBefore = elBeforeList.length > 0 ? elBeforeList[0] : null;
            const elAfter = ((sector != '') && (sector != 'null')) ? this.Application.Searcher.FindByAttributeAndValue('d-sector', sector) : null;
            if (elBefore != null)
                elBefore.classList.remove(classHighlight);
            if (elBefore != elAfter)
                elAfter.classList.add(classHighlight);
        });
    }
    ExecuteFunctionDebuggerHighlighComponent(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const classHighlight = parameters[2];
            const index = Number(parameters[3]);
            const elBeforeList = document.getElementsByClassName(classHighlight);
            const elBefore = elBeforeList.length > 0 ? elBeforeList[0] : null;
            const components = this.Application.ComponentHandler.Retrieve();
            const elAfter = components[index][2];
            if (elBefore != null)
                elBefore.classList.remove(classHighlight);
            if (elBefore != elAfter)
                elAfter.classList.add(classHighlight);
        });
    }
    GetComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            const objectsExpanded = yield this.Application.Storage.RetrieveData('__objectsexpanded', null);
            const objects = [];
            const components = this.Application.ComponentHandler.Retrieve();
            for (let i = 0; i < components.length; i++) {
                const component = components[i];
                objects.push(this.CreateComponentData(component[1], i));
            }
            return (objects);
        });
    }
    CreateRequest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return (null);
            const request = {};
            request.Url = url;
            request.Start = new Date(Date.now()).toJSON();
            yield this.Application.Storage.AddDataItem('__requests', null, '', request, false);
            return (request);
        });
    }
    FinishRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request == null)
                return (null);
            request.End = new Date(Date.now()).toJSON();
            const lastRequest = yield this.Application.Storage.GetDataItemLast('__requests', '');
            request.Last = request === request;
            yield this.Application.Observer.Notify('__requests', null, null);
        });
    }
    CreateComponentData(tag, index) {
        const object = {};
        object.Tag = tag;
        object.Action = 'Debugger(highlight,component,dbgDebuggerHighlight, ' + index + ')';
        return (object);
    }
    AddSectorUpdate(name, parent, url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Active)
                return (null);
            const sectorUpdate = {};
            sectorUpdate.Name = name;
            sectorUpdate.Parent = parent;
            sectorUpdate.Url = url;
            yield this.Application.Storage.AddDataItem('__sectorsupdate', null, '', sectorUpdate);
        });
    }
    ExecuteFunctionDebuggerReload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!window.sessionStorage)
                return;
            const debuggerConfiguration = yield this.Application.Storage.RetrieveData('__debuggerProperties', null);
            window.sessionStorage.setItem(this.SESSION_STORAGE_KEY, this.Application.Serializer.Serialize(debuggerConfiguration));
            window.location.reload();
        });
    }
    ExecuteFunctionDebuggerPersist() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!window.sessionStorage)
                return;
            const debuggerConfiguration = yield this.Application.Storage.RetrieveData('__debuggerProperties', null);
            if (debuggerConfiguration == null)
                return;
            const persist = this.Application.Solver.ResolveConditionalBoolean(debuggerConfiguration.persist);
            if (persist)
                window.sessionStorage.setItem(this.SESSION_STORAGE_KEY, this.Application.Serializer.Serialize(debuggerConfiguration));
            else
                window.sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
        });
    }
}
//# sourceMappingURL=DrapoDebugger.js.map