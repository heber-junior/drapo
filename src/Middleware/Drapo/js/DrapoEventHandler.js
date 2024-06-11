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
class DrapoEventHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._debounceDefault = 500;
        this._debounceDefaultClick = 200;
        this._debounce = 'debounce';
        this._detach = 'detach';
        this._eventsRunning = [];
        this._application = application;
    }
    HasContentEventContext(content) {
        return (content.indexOf('d-on-') > -1);
    }
    CreateEventNamespace(el, location, eventType, namespace = 'default') {
        if (eventType === 'load')
            return (eventType);
        if (location === null)
            return (eventType + '.' + namespace);
        const did = this.Application.Document.EnsureElementHasID(el);
        return (eventType + '.' + did);
    }
    GetEventPropagation(el, eventType) {
        const propagationValue = el.getAttribute('d-propagation-' + eventType);
        if (propagationValue == null)
            return (true);
        return (this.Application.Solver.ResolveConditionalBoolean(propagationValue));
    }
    RetrieveEventBinder(element, location) {
        if (location == null)
            return (element);
        if (this.IsLocationBody(location))
            return (document.documentElement);
        return (null);
    }
    IsLocationBody(location) {
        return (location === 'body');
    }
    GetElementParent(element, levels = 0) {
        let current = element;
        for (let i = 0; (i < levels) && (current != null); i++)
            current = current.parentElement;
        if (current == null)
            return (null);
        if (current.tagName.toLowerCase() === 'body')
            return (document.body);
        return (current);
    }
    Attach(el, renderContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = this.RetrieveElementEvents(el);
            if (events.length == 0)
                return;
            const application = this.Application;
            const sector = yield this.Application.Document.GetSectorResolved(el);
            const isSectorDynamic = yield this.Application.Document.IsSectorDynamic(el);
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const eventType = event[2];
                if (!this.IsEventTypeValid(eventType))
                    continue;
                const functionsValue = event[3];
                if ((!isSectorDynamic) && (yield this.HasEventContext(sector, renderContext, functionsValue, event[5])))
                    continue;
                const eventFilter = event[4];
                const location = event[1];
                const isLocationBody = this.IsLocationBody(location);
                const eventNamespace = this.CreateEventNamespace(el, location, eventType, 'noContext');
                const binder = this.RetrieveEventBinder(el, location);
                if (binder === null)
                    continue;
                const propagation = this.GetEventPropagation(el, eventType);
                let isDelay = this.IsEventDelay(el, eventType);
                let debounceTimeout = this._debounceDefaultClick;
                const elDebounceTimeout = isDelay ? null : this.GetEventDebounce(el, eventType);
                if (elDebounceTimeout !== null) {
                    isDelay = true;
                    debounceTimeout = elDebounceTimeout;
                }
                let delayTimeout = null;
                const eventsDetach = this.GetEventDetach(el, eventType);
                let eventsDetachActivated = false;
                const eventAttribute = event[0];
                this.DetachEventListener(binder, eventNamespace);
                this.AttachEventListener(binder, eventType, eventNamespace, (e) => __awaiter(this, void 0, void 0, function* () {
                    if (!propagation)
                        e.stopPropagation();
                    if ((isLocationBody) && (!application.Document.Contains(el))) {
                        application.EventHandler.DetachEventListener(binder, eventNamespace);
                        return (true);
                    }
                    if (!application.EventHandler.IsValidEventFilter(e, eventFilter))
                        return (true);
                    const sectorEvent = isSectorDynamic ? yield this.Application.Document.GetSectorResolved(el) : sector;
                    if (!(yield this.Application.Validator.IsValidationEventValid(el, sectorEvent, eventType, location, e, null)))
                        return (true);
                    if (eventsDetachActivated)
                        return (true);
                    if (eventsDetach != null) {
                        for (let j = 0; j < eventsDetach.length; j++) {
                            const eventDetach = eventsDetach[j];
                            const eventDetachNamespace = this.CreateEventNamespace(el, null, eventDetach, 'noContext');
                            application.EventHandler.DetachEventListener(binder, eventNamespace);
                            if (eventDetach === eventType)
                                eventsDetachActivated = true;
                        }
                    }
                    const functionsValueCurrent = el.getAttribute(eventAttribute);
                    if (!isDelay) {
                        application.EventHandler.ExecuteEvent(sector, null, el, e, functionsValueCurrent, isSectorDynamic);
                    }
                    else {
                        if (delayTimeout != null)
                            clearTimeout(delayTimeout);
                        delayTimeout = setTimeout(() => {
                            clearTimeout(delayTimeout);
                            delayTimeout = null;
                            application.EventHandler.ExecuteEvent(sector, null, el, e, functionsValueCurrent, isSectorDynamic);
                        }, debounceTimeout);
                    }
                    return (propagation);
                }));
            }
        });
    }
    AttachContext(context, el, sector, renderContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = this.RetrieveElementEvents(el);
            if (events.length == 0)
                return;
            const application = this.Application;
            const contextItem = context.Item;
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const eventType = event[2];
                if (!this.IsEventTypeValid(eventType))
                    continue;
                const functionsValueOriginal = event[3];
                if (!(yield this.HasEventContext(sector, renderContext, functionsValueOriginal, event[5])))
                    continue;
                const eventFilter = event[4];
                const location = event[1];
                const isLocationBody = this.IsLocationBody(location);
                const functionsValue = this.Application.Solver.ResolveSystemContextPath(sector, context, functionsValueOriginal);
                const eventNamespace = this.CreateEventNamespace(el, location, eventType, 'context');
                const binder = this.RetrieveEventBinder(el, location);
                if (binder === null)
                    continue;
                const propagation = this.GetEventPropagation(el, eventType);
                let isDelay = this.IsEventDelay(el, eventType);
                let debounceTimeout = this._debounceDefaultClick;
                const elDebounceTimeout = isDelay ? null : this.GetEventDebounce(el, eventType);
                if (elDebounceTimeout !== null) {
                    isDelay = true;
                    debounceTimeout = elDebounceTimeout;
                }
                let delayTimeout = null;
                const eventsDetach = this.GetEventDetach(el, eventType);
                let eventsDetachActivated = false;
                this.DetachEventListener(binder, eventNamespace);
                this.AttachEventListener(binder, eventType, eventNamespace, (e) => __awaiter(this, void 0, void 0, function* () {
                    if (!propagation)
                        e.stopPropagation();
                    if ((isLocationBody) && (!application.Document.Contains(el))) {
                        application.EventHandler.DetachEventListener(binder, eventNamespace);
                        return (true);
                    }
                    if (!application.EventHandler.IsValidEventFilter(e, eventFilter))
                        return (true);
                    const sectorLocal = application.Document.GetSector(e.target);
                    if (!(yield this.Application.Validator.IsValidationEventValid(el, sectorLocal, eventType, location, e, contextItem)))
                        return (true);
                    if (eventsDetachActivated)
                        return (true);
                    if (eventsDetach != null) {
                        for (let j = 0; j < eventsDetach.length; j++) {
                            const eventDetach = eventsDetach[j];
                            const eventDetachNamespace = this.CreateEventNamespace(el, null, eventDetach, 'noContext');
                            application.EventHandler.DetachEventListener(binder, eventNamespace);
                            if (eventDetach === eventType)
                                eventsDetachActivated = true;
                        }
                    }
                    if (!isDelay) {
                        application.EventHandler.ExecuteEvent(sectorLocal, contextItem, el, e, functionsValue);
                    }
                    else {
                        if (delayTimeout != null)
                            clearTimeout(delayTimeout);
                        delayTimeout = setTimeout(() => {
                            clearTimeout(delayTimeout);
                            delayTimeout = null;
                            application.EventHandler.ExecuteEvent(sectorLocal, contextItem, el, e, functionsValue);
                        }, debounceTimeout);
                    }
                    return (propagation);
                }));
            }
        });
    }
    HasEventContext(sector, renderContext, functionsValue, validation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.Application.FunctionHandler.HasFunctionMustacheContext(functionsValue, sector, renderContext))
                return (true);
            if ((validation != null) && (yield this.Application.FunctionHandler.HasFunctionMustacheContext(validation, sector, renderContext)))
                return (true);
            return (false);
        });
    }
    AttachEventListener(el, eventType, eventNamespace, callback) {
        const elEventListeners = this.GetElementEventListenerContainer(el);
        const elEventListener = new DrapoEventListener();
        elEventListener.EventType = eventType;
        elEventListener.EventNamespace = eventNamespace;
        elEventListener.Function = callback;
        elEventListeners.push(elEventListener);
        el.addEventListener(eventType, callback);
        this.SetElementEventListenerContainer(el, elEventListeners);
    }
    DetachEventListener(el, eventNamespace) {
        const elEventListeners = this.GetElementEventListenerContainer(el);
        for (let i = elEventListeners.length - 1; i >= 0; i--) {
            const elEventListener = elEventListeners[i];
            if (elEventListener.EventNamespace !== eventNamespace)
                continue;
            elEventListeners.splice(i, 1);
            el.removeEventListener(elEventListener.EventType, elEventListener.Function);
            this.SetElementEventListenerContainer(el, elEventListeners);
            return (true);
        }
        return (false);
    }
    SetElementEventListenerContainer(el, elEventListeners) {
        const elAny = el;
        elAny._events = elEventListeners;
    }
    GetElementEventListenerContainer(el) {
        const elAny = el;
        if (elAny._events == null) {
            const elEventListeners = [];
            elAny._events = elEventListeners;
            return (elEventListeners);
        }
        return elAny._events;
    }
    ExecuteEvent(sector, contextItem, element, event, functionsValue, isSectorDynamic = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isEventSingle = element.getAttribute('d-event-single') === 'true';
                if ((isEventSingle) && (this.IsEventRunning(element)))
                    return;
                let eventSingleClass = null;
                if (isEventSingle) {
                    this.AddEventRunning(element);
                    eventSingleClass = element.getAttribute('d-event-single-class');
                    if (eventSingleClass != null)
                        element.classList.add(eventSingleClass);
                }
                const sectorEvent = isSectorDynamic ? yield this.Application.Document.GetSectorResolved(element) : sector;
                yield this.Application.FunctionHandler.ResolveFunction(sectorEvent, contextItem, element, event, functionsValue);
                if (isEventSingle) {
                    this.RemoveEventRunning(element);
                    if (eventSingleClass != null)
                        element.classList.remove(eventSingleClass);
                }
            }
            catch (e) {
                yield this.Application.ExceptionHandler.Handle(e, 'DrapoEventHandler - ExecuteEvent');
            }
        });
    }
    IsEventRunning(element) {
        for (let i = this._eventsRunning.length - 1; i >= 0; i--) {
            const elementCurrent = this._eventsRunning[i];
            if (elementCurrent === element)
                return (true);
        }
        return (false);
    }
    AddEventRunning(element) {
        this._eventsRunning.push(element);
    }
    RemoveEventRunning(element) {
        for (let i = this._eventsRunning.length - 1; i >= 0; i--) {
            const elementCurrent = this._eventsRunning[i];
            if (elementCurrent === element)
                this._eventsRunning.splice(i, 1);
        }
    }
    IsEventTypeValid(eventType) {
        if (eventType == 'click')
            return (true);
        if (eventType == 'change')
            return (true);
        if (eventType == 'keyup')
            return (true);
        if (eventType == 'blur')
            return (true);
        if (eventType == 'dblclick')
            return (true);
        if (eventType == 'input')
            return (true);
        if (eventType == 'load')
            return (true);
        if (eventType == 'mousedown')
            return (true);
        if (eventType == 'mouseover')
            return (true);
        if (eventType == 'mouseup')
            return (true);
        if (eventType === 'model')
            return (false);
        this.Application.ExceptionHandler.HandleError('DrapoEventHandler - EventType Unknown - {0}', eventType);
        return (false);
    }
    IsEventDelay(el, eventType) {
        if (eventType !== 'click')
            return (false);
        return (this.HasEventDoubleClickInParent(el));
    }
    GetEventDebounce(el, eventType) {
        const elEventTypeDebounce = el.getAttribute('d-on-' + eventType + '-' + this._debounce);
        if ((elEventTypeDebounce == null) || (elEventTypeDebounce == ''))
            return (null);
        if (elEventTypeDebounce === 'true')
            return (this._debounceDefault);
        return (this.Application.Parser.ParseNumber(elEventTypeDebounce, this._debounceDefault));
    }
    GetEventDetach(el, eventType) {
        const elEventTypeDetach = el.getAttribute('d-on-' + eventType + '-' + this._detach);
        if ((elEventTypeDetach == null) || (elEventTypeDetach == ''))
            return (null);
        if (elEventTypeDetach === 'true')
            return ([eventType]);
        return (this.Application.Parser.ParsePipes(elEventTypeDetach));
    }
    HasEventDoubleClickInParent(el) {
        if (el == null)
            return (false);
        const doubleClickEvent = el.getAttribute('d-on-dblclick');
        if ((doubleClickEvent != null) && (doubleClickEvent != ''))
            return (true);
        return (this.HasEventDoubleClickInParent(el.parentElement));
    }
    IsEventTypeKeyboard(eventType) {
        return (eventType == 'keyup');
    }
    IsValidEventFilter(e, eventFilter) {
        if (eventFilter == null)
            return (true);
        if (this.IsEventTypeKeyboard(e.type))
            return (this.IsValidEventFilterKeyboard(e, eventFilter));
        return (true);
    }
    IsValidEventFilterKeyboard(e, eventFilter) {
        return (this.GetKeyboardMapping(e.key) == this.GetKeyboardMapping(eventFilter));
    }
    GetKeyboardMapping(key) {
        if (key == null)
            return (null);
        key = key.toLowerCase();
        if (key === 'esc')
            key = 'escape';
        if (key === 'del')
            key = 'delete';
        return (key);
    }
    RetrieveElementEvents(el) {
        const events = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const event = this.Application.Parser.ParseEventProperty(el, attribute.nodeName, attribute.nodeValue);
            if ((event != null) && (event[4] !== this._debounce) && (event[4] !== this._detach))
                events.push(event);
        }
        return (events);
    }
    TriggerClick(el) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.Trigger(el, 'click'));
        });
    }
    Trigger(el, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Event(type);
            return (yield this.TriggerEvent(el, event));
        });
    }
    TriggerEvent(el, event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (el.dispatchEvent(event));
        });
    }
    SyncNodeEventsDifferences(nodeOld, nodeNew) {
        const eventsOld = this.GetElementEventListenerContainer(nodeOld);
        const eventsNew = this.GetElementEventListenerContainer(nodeNew);
        for (let i = 0; i < eventsNew.length; i++) {
            const eventNew = eventsNew[i];
            const eventOld = this.GetEventListener(eventNew.EventNamespace, eventsOld);
            if (eventOld == null) {
                const elEventListener = new DrapoEventListener();
                elEventListener.EventType = eventNew.EventType;
                elEventListener.EventNamespace = eventNew.EventNamespace;
                elEventListener.Function = eventNew.Function;
                eventsOld.push(elEventListener);
                this.AttachEventListener(nodeOld, elEventListener.EventType, elEventListener.EventNamespace, elEventListener.Function);
            }
            else {
                this.DetachEventListener(nodeOld, eventOld.EventNamespace);
                eventOld.Function = eventNew.Function;
                this.AttachEventListener(nodeOld, eventOld.EventType, eventOld.EventNamespace, eventOld.Function);
            }
        }
        for (let i = eventsOld.length - 1; i >= 0; i--) {
            const eventOld = eventsOld[i];
            const eventNew = this.GetEventListener(eventOld.EventNamespace, eventsNew);
            if (eventNew !== null)
                continue;
            this.DetachEventListener(nodeOld, eventOld.EventNamespace);
        }
        if ((eventsOld.length > 0) || (eventsNew.length > 0))
            this.SetElementEventListenerContainer(nodeOld, eventsOld);
    }
    GetEventListener(eventNamespace, events) {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (event.EventNamespace === eventNamespace)
                return (event);
        }
        return (null);
    }
}
//# sourceMappingURL=DrapoEventHandler.js.map