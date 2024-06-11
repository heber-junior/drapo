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
class DrapoBinder {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    BindReaderWriter(contextItem, el, dataFields, eventTypes, eventTypesCancel = null, canNotify) {
        if (contextItem === null)
            return;
        if (el === null)
            return;
        this.BindReader(contextItem, el, dataFields);
        this.BindWriter(contextItem, el, dataFields, eventTypes, eventTypesCancel, canNotify);
    }
    BindReader(contextItem, el, dataFields) {
        if ((contextItem === null) || (contextItem.ElementForTemplate !== null))
            return;
        if (el === null)
            return;
        this.Application.Observer.SubscribeBarber(el, contextItem.DataKey, dataFields);
    }
    BindWriter(contextItem, el, dataFields, eventTypes, eventTypesCancel, canNotify) {
        const application = this.Application;
        const contextItemLocal = contextItem;
        const data = contextItem.Data;
        const dataKey = contextItem.DataKey;
        const index = contextItem.Index;
        for (let i = 0; i < eventTypes.length; i++) {
            const event = application.Parser.ParseEvent(eventTypes[i]);
            const eventType = event[0];
            const eventFilter = event[1];
            const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType, 'model');
            const debounceTimeout = this.Application.EventHandler.GetEventDebounce(el, eventType);
            let delayTimeout = null;
            const canNotifyLocal = canNotify;
            this.Application.EventHandler.DetachEventListener(el, eventNamespace);
            this.Application.EventHandler.AttachEventListener(el, eventType, eventNamespace, (e) => {
                if (debounceTimeout == null) {
                    application.Binder.BindWriterEvent(e, eventType, eventFilter, contextItem, el, dataFields, data, dataKey, index, canNotify);
                }
                else {
                    if (delayTimeout != null)
                        clearTimeout(delayTimeout);
                    delayTimeout = setTimeout(() => {
                        clearTimeout(delayTimeout);
                        delayTimeout = null;
                        application.Binder.BindWriterEvent(e, eventType, eventFilter, contextItem, el, dataFields, data, dataKey, index, canNotify);
                    }, debounceTimeout);
                }
            });
        }
        if ((eventTypesCancel) != null) {
            for (let i = 0; i < eventTypesCancel.length; i++) {
                const event = application.Parser.ParseEvent(eventTypesCancel[i]);
                const eventType = event[0];
                const eventFilter = event[1];
                const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType, 'modelCancel');
                this.Application.EventHandler.DetachEventListener(el, eventNamespace);
                this.Application.EventHandler.AttachEventListener(el, eventType, eventNamespace, (e) => {
                    if (!this.Application.EventHandler.IsValidEventFilter(e, eventFilter))
                        return (true);
                    const dataPath = this.Application.Solver.CreateDataPath(dataKey, dataFields);
                    const valueCurrent = this.Application.Solver.ResolveDataObjectPathObject(data, dataPath);
                    const valueBefore = this.Application.Document.GetValue(el);
                    if (valueCurrent == valueBefore)
                        return (true);
                    this.Application.Document.SetValue(el, valueCurrent);
                    return (false);
                });
            }
        }
    }
    BindWriterEvent(e, eventType, eventFilter, contextItem, el, dataFields, data, dataKey, index, canNotify) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Application.EventHandler.IsValidEventFilter(e, eventFilter))
                return (true);
            const value = this.Application.Binder.GetEventValue(eventType, e);
            const dataPath = this.Application.Solver.CreateDataPath(dataKey, dataFields);
            const valueCurrent = this.Application.Solver.ResolveDataObjectPathObject(data, dataPath);
            if (valueCurrent != value) {
                const sector = this.Application.Document.GetSector(el);
                if ((dataPath.length === 1) && (contextItem !== null) && (dataPath[0] === dataKey))
                    yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, value, false);
                else
                    this.Application.Solver.UpdateDataPathObject(data, dataPath, value);
                yield this.Application.Storage.FlagDataItemAsUpdated(dataKey, sector, index, false);
                yield this.Application.ModelHandler.ResolveOnModelChange(contextItem, el);
                if (canNotify)
                    yield this.Application.Observer.Notify(dataKey, index, dataFields);
            }
            yield this.Application.ModelHandler.ResolveOnModelComplete(contextItem, el);
            return (true);
        });
    }
    BindIncremental(el, dataKey, sector, isIncremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el == null)
                return (null);
            const application = this.Application;
            if (!isIncremental)
                application.Observer.SubscribeIncremental(el, dataKey);
            const elParent = this.GetParentElementWithScrollVertical(el);
            if ((elParent === null) || (!this.IsElementScrollVisible(elParent))) {
                if (!(yield this.Application.Storage.CanGrowData(dataKey, sector)))
                    return;
                if (!(yield this.Application.Storage.GrowData(dataKey, sector)))
                    return;
                yield this.Application.Observer.NotifyIncremental(dataKey);
                return;
            }
            const isRoot = (elParent.tagName === 'HTML') || (elParent.tagName === 'BODY');
            const binder = isRoot ? window : elParent;
            const dataKeyLocal = dataKey;
            const sectorLocal = sector;
            const eventType = 'scroll';
            const eventNamespace = this.Application.EventHandler.CreateEventNamespace(el, null, eventType, 'incremental');
            this.Application.EventHandler.DetachEventListener(el, eventNamespace);
            this.Application.EventHandler.AttachEventListener(binder, eventType, eventNamespace, (e) => {
                application.Binder.BindIncrementalScroll(binder, eventNamespace, elParent, dataKeyLocal, sector);
            });
        });
    }
    BindIncrementalScroll(binder, eventNamespace, elParent, dataKey, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((!this.Application.Observer.IsEnabledNotifyIncremental) || (!this.IsElementScrollVerticalAlmostEnd(elParent)))
                return (true);
            if (!(yield this.Application.Storage.CanGrowData(dataKey, sector))) {
                this.Application.EventHandler.DetachEventListener(binder, eventNamespace);
                return (false);
            }
            if (!(yield this.Application.Storage.GrowData(dataKey, sector)))
                return (true);
            yield this.Application.Observer.NotifyIncremental(dataKey);
            return (true);
        });
    }
    GetEventValue(eventType, e) {
        const target = e.target;
        const tag = target.tagName.toLowerCase();
        if (tag == 'input')
            return (this.GetEventValueInput(eventType, e));
        if (tag == 'select')
            return (e.target.value);
        if (tag == 'textarea')
            return (this.Application.Document.GetValue(e.target));
        return (null);
    }
    GetEventValueInput(eventType, e) {
        const el = e.target;
        const type = el.getAttribute('type');
        if (type == 'checkbox')
            return (this.Application.Document.GetProperty(el, 'checked'));
        return (this.Application.Document.GetValue(el));
    }
    GetParentElementWithScrollVertical(el) {
        let elParent = null;
        while ((elParent = el.parentElement) != null) {
            if (this.HasElementVerticalScroll(elParent))
                return (elParent);
            el = elParent;
        }
        return (null);
    }
    IsElementScrollVisible(el) {
        return (el.scrollHeight !== el.clientHeight);
    }
    HasElementVerticalScroll(el) {
        const style = window.getComputedStyle(el);
        const overflow = style.getPropertyValue('overflow');
        if (overflow === 'auto')
            return (true);
        if (el.scrollTop)
            return (true);
        el.scrollTop = 1;
        if (!el.scrollTop)
            return (false);
        el.scrollTop = 0;
        return (true);
    }
    IsElementScrollVerticalAlmostEnd(el) {
        const scrollTop = el.scrollTop;
        if (scrollTop == null)
            return (false);
        const clientHeight = el.clientHeight;
        const scrollHeight = el.scrollHeight;
        const remaining = scrollHeight - (scrollTop + clientHeight);
        return (remaining < 50);
    }
    UnbindControlFlowViewport(viewport) {
        const binder = viewport.ElementScroll;
        const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, 'scroll', 'viewport');
        this.Application.EventHandler.DetachEventListener(binder, eventNamespace);
    }
    BindControlFlowViewport(viewport) {
        const application = this.Application;
        const viewportCurrent = viewport;
        const binder = viewport.ElementScroll;
        const eventType = 'scroll';
        const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType, 'viewport');
        this.Application.EventHandler.DetachEventListener(binder, eventNamespace);
        this.Application.EventHandler.AttachEventListener(binder, eventType, eventNamespace, (e) => {
            application.Binder.BindControlFlowViewportScroll(viewportCurrent);
        });
    }
    BindControlFlowViewportScroll(viewport) {
        return __awaiter(this, void 0, void 0, function* () {
            clearTimeout(viewport.EventScrollTimeout);
            viewport.EventScrollTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                clearTimeout(viewport.EventScrollTimeout);
                try {
                    while (viewport.Busy) {
                        yield this.Application.Document.Sleep(50);
                    }
                    viewport.Busy = true;
                    yield this.Application.ControlFlow.ResolveControlFlowForViewportScroll(viewport);
                    viewport.Busy = false;
                }
                catch (e) {
                    yield this.Application.ExceptionHandler.Handle(e, 'DrapoBinder - BindControlFlowViewportScroll');
                }
            }), 50);
        });
    }
}
//# sourceMappingURL=DrapoBinder.js.map