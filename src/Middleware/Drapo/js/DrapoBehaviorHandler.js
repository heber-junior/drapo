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
class DrapoBehaviorHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    HasContentBehaviorContext(content) {
        return ((content.indexOf('d-dragstart') > -1) || (content.indexOf('d-dragend') > -1) || (content.indexOf('d-resize-location') > -1));
    }
    ResolveBehavior(el, canBind = true, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ResolveBehaviorDragStart(el);
            yield this.ResolveBehaviorDragEnd(el);
            yield this.ResolveBehaviorResize(el, canBind, canSubscribeDelay, dataKeyFilter, dataFieldFilter);
        });
    }
    ResolveBehaviorContext(context, element, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ResolveBehaviorDragStartContext(context, element, canBind);
            yield this.ResolveBehaviorDragEndContext(context, element, canBind);
            yield this.ResolveBehaviorResizeContext(context, element, canBind);
        });
    }
    ResolveBehaviorDragStart(el) {
        const dragStartAttribute = el.getAttribute('d-dragStart');
        if ((dragStartAttribute === null) || (dragStartAttribute === undefined))
            return;
        const dragActionAttribute = el.getAttribute('d-dragAction');
        if (dragActionAttribute !== 'barber')
            return;
        const sector = this.Application.Document.GetSector(el);
        const onBefore = el.getAttribute('d-dragOnBeforeStart');
        const onAfter = el.getAttribute('d-dragOnAfterEnd');
        const application = this.Application;
        const drag = this.CreateDrag(dragActionAttribute, null, null, this.Application.Parser.ParseTags(dragStartAttribute), false, null, sector, onBefore, onAfter);
        el.setAttribute('draggable', 'true');
        const eventType = 'dragstart';
        const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType, 'drag');
        this.Application.EventHandler.DetachEventListener(el, eventNamespace);
        this.Application.EventHandler.AttachEventListener(el, eventType, eventNamespace, (e) => {
            application.BehaviorHandler.SetDrag(drag);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text', drag.Code);
        });
    }
    ResolveBehaviorDragEnd(el) {
        return __awaiter(this, void 0, void 0, function* () {
            const dragEndAttribute = el.getAttribute('d-dragEnd');
            if ((dragEndAttribute === null) || (dragEndAttribute === undefined))
                return;
            const dragActionAttribute = el.getAttribute('d-dragAction');
            if (dragActionAttribute !== 'barber')
                return;
            const notifyText = el.getAttribute('d-dragNotify');
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const onBefore = el.getAttribute('d-dragOnBeforeStart');
            const onAfter = el.getAttribute('d-dragOnAfterEnd');
            const application = this.Application;
            const tags = this.Application.Parser.ParseTags(dragEndAttribute);
            const sector = this.Application.Document.GetSector(el);
            const eventTypeDragover = 'dragover';
            const eventNamespaceDragover = this.Application.EventHandler.CreateEventNamespace(null, null, eventTypeDragover, 'drag');
            this.Application.EventHandler.DetachEventListener(el, eventNamespaceDragover);
            this.Application.EventHandler.AttachEventListener(el, eventTypeDragover, eventNamespaceDragover, (e) => {
                e.preventDefault();
                const drag = application.BehaviorHandler.GetDrag();
                if (!application.BehaviorHandler.IsDragMatch(drag, e.dataTransfer.getData('Text'), tags))
                    return;
                e.dataTransfer.dropEffect = 'move';
            });
            const eventTypeDrop = 'drop';
            const eventNamespaceDrop = this.Application.EventHandler.CreateEventNamespace(null, null, eventTypeDrop, 'drag');
            this.Application.EventHandler.DetachEventListener(el, eventNamespaceDrop);
            this.Application.EventHandler.AttachEventListener(el, eventTypeDrop, eventNamespaceDrop, (e) => {
                application.BehaviorHandler.ResolveBehaviorDragEndDrop(e, null, tags, notify, null, sector, onBefore, onAfter);
            });
        });
    }
    ResolveBehaviorDragStartContext(context, el, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            const dragStartAttribute = el.getAttribute('d-dragStart');
            if ((dragStartAttribute === null) || (dragStartAttribute === undefined))
                return;
            let dragActionAttribute = el.getAttribute('d-dragAction');
            if ((dragActionAttribute === null) || (dragActionAttribute === undefined))
                dragActionAttribute = 'move';
            if (dragActionAttribute === 'barber')
                return;
            let custom = null;
            if (dragActionAttribute === 'custom')
                custom = el.getAttribute('d-dragActionCustom');
            const notifyText = el.getAttribute('d-dragNotify');
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const dataKey = el.getAttribute('d-dragStartDataKey');
            const sector = this.Application.Document.GetSector(el);
            const onBefore = el.getAttribute('d-dragOnBeforeStart');
            const onAfter = el.getAttribute('d-dragOnAfterEnd');
            const application = this.Application;
            const drag = this.CreateDrag(dragActionAttribute, custom, context.Item, this.Application.Parser.ParseTags(dragStartAttribute), notify, dataKey, sector, onBefore, onAfter);
            el.setAttribute('draggable', 'true');
            const eventType = 'dragstart';
            const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType, 'drag');
            this.Application.EventHandler.DetachEventListener(el, eventNamespace);
            this.Application.EventHandler.AttachEventListener(el, eventType, eventNamespace, (e) => {
                application.BehaviorHandler.SetDrag(drag);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text', drag.Code);
            });
        });
    }
    ResolveBehaviorDragEndContext(context, el, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            const dragEndAttribute = el.getAttribute('d-dragEnd');
            if ((dragEndAttribute === null) || (dragEndAttribute === undefined))
                return;
            const dragActionAttribute = el.getAttribute('d-dragAction');
            if (dragActionAttribute === 'barber')
                return;
            const notifyText = el.getAttribute('d-dragNotify');
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const dataKey = el.getAttribute('d-dragEndDataKey');
            const onBefore = el.getAttribute('d-dragOnBeforeStart');
            const onAfter = el.getAttribute('d-dragOnAfterEnd');
            const application = this.Application;
            const item = context.Item;
            const tags = this.Application.Parser.ParseTags(dragEndAttribute);
            const sector = this.Application.Document.GetSector(el);
            const eventTypeDragover = 'dragover';
            const eventNamespaceDragover = this.Application.EventHandler.CreateEventNamespace(null, null, eventTypeDragover, 'drag');
            this.Application.EventHandler.DetachEventListener(el, eventNamespaceDragover);
            this.Application.EventHandler.AttachEventListener(el, eventTypeDragover, eventNamespaceDragover, (e) => {
                e.preventDefault();
                const drag = application.BehaviorHandler.GetDrag();
                if (!application.BehaviorHandler.IsDragMatch(drag, e.dataTransfer.getData('Text'), tags))
                    return;
                e.dataTransfer.dropEffect = 'move';
            });
            const eventTypeDrop = 'drop';
            const eventNamespaceDrop = this.Application.EventHandler.CreateEventNamespace(null, null, eventTypeDrop, 'drag');
            this.Application.EventHandler.DetachEventListener(el, eventNamespaceDrop);
            this.Application.EventHandler.AttachEventListener(el, eventTypeDrop, eventNamespaceDrop, (e) => {
                application.BehaviorHandler.ResolveBehaviorDragEndDrop(e, item, tags, notify, dataKey, sector, onBefore, onAfter);
            });
        });
    }
    ResolveBehaviorDragEndDrop(e, item, tags, notify, dataKey, sector, onBefore, onAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const dragBefore = this.GetDrag();
            if (!this.IsDragMatch(dragBefore, e.dataTransfer.getData('Text'), tags))
                return;
            this.SetDrag(null);
            const dragAfter = this.CreateDrag(null, null, item, tags, notify, dataKey, sector, onBefore, onAfter);
            if (dragBefore.DataKey !== null)
                yield this.Application.Storage.UpdateData(dragBefore.DataKey, sector, dragBefore.Item.Data);
            if (dragAfter.DataKey !== null)
                yield this.Application.Storage.UpdateData(dragAfter.DataKey, sector, dragAfter.Item.Data);
            yield this.ResolveBehaviorDragStartOnBefore(dragBefore, dragAfter);
            if (this.IsMoveDrag(dragBefore, dragAfter)) {
                yield this.MoveDrag(dragBefore, dragAfter);
            }
            else if (this.IsSwapDrag(dragBefore, dragAfter)) {
                this.SwapDrag(dragBefore, dragAfter);
            }
            else if (this.IsCustomDrag(dragBefore, dragAfter)) {
                yield this.CustomDrag(dragBefore, dragAfter);
            }
            yield this.ResolveBehaviorDragEndOnAfter(dragBefore, dragAfter);
        });
    }
    ResolveBehaviorDragStartOnBefore(dragBefore, dragAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dragBefore.OnBefore != null)
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(dragBefore.Sector, dragBefore.Item != null ? dragBefore.Item.Element : null, dragBefore.OnBefore);
            if ((dragAfter.OnBefore != null) && (dragAfter.OnBefore != dragBefore.OnBefore))
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(dragAfter.Sector, dragAfter.Item != null ? dragAfter.Item.Element : null, dragAfter.OnBefore);
        });
    }
    ResolveBehaviorDragEndOnAfter(dragBefore, dragAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dragBefore.OnAfter != null)
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(dragBefore.Sector, dragBefore.Item != null ? dragBefore.Item.Element : null, dragBefore.OnAfter);
            if ((dragAfter.OnAfter != null) && (dragAfter.OnAfter != dragBefore.OnAfter))
                yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(dragAfter.Sector, dragAfter.Item != null ? dragAfter.Item.Element : null, dragAfter.OnAfter);
        });
    }
    GetDrag() {
        return (this._drag);
    }
    SetDrag(drag) {
        this._drag = drag;
    }
    IsDragMatch(drag, code, tags) {
        if (drag === null)
            return (false);
        if (drag.Code !== code)
            return (false);
        if (!drag.IsMatch(tags))
            return (false);
        return (true);
    }
    CreateDrag(action, custom, item, tags, notify, dataKey, sector, onBefore, onAfter) {
        const drag = new DrapoDrag();
        drag.Code = this.Application.Document.CreateGuid();
        drag.Action = action;
        drag.Custom = custom;
        drag.Item = item;
        drag.Tags = tags;
        drag.Notify = notify;
        drag.DataKey = dataKey;
        drag.Sector = sector;
        drag.OnBefore = onBefore;
        drag.OnAfter = onAfter;
        return (drag);
    }
    IsMoveDrag(dragBefore, dragAfter) {
        return (dragBefore.Action === 'move');
    }
    MoveDrag(dragBefore, dragAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsInternalDrag(dragBefore, dragAfter))
                return (this.Application.Storage.MoveDataItem(dragAfter.Item.DataKey, dragAfter.Sector, dragBefore.Item.Data, dragAfter.Item.Data, dragAfter.Notify));
            return (false);
        });
    }
    IsInternalDrag(dragBefore, dragAfter) {
        return (dragBefore.Item.DataKey === dragAfter.Item.DataKey);
    }
    IsSwapDrag(dragBefore, dragAfter) {
        return (dragBefore.Action === 'swap');
    }
    SwapDrag(dragBefore, dragAfter) {
        return (false);
    }
    IsCustomDrag(dragBefore, dragAfter) {
        return (dragBefore.Action === 'custom');
    }
    CustomDrag(dragBefore, dragAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(dragBefore.Sector, dragBefore.Item != null ? dragBefore.Item.Element : null, dragBefore.Custom);
            return (true);
        });
    }
    ResolveBehaviorResizeContext(context, el, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            const resizeLocation = el.getAttribute('d-resize-location');
            if (resizeLocation == null)
                return;
            return (this.ResolveBehaviorResizeInternal(context, el, canBind, resizeLocation));
        });
    }
    ResolveBehaviorResize(el, canBind = true, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const resizeLocation = el.getAttribute('d-resize-location');
            if (resizeLocation == null)
                return;
            const context = new DrapoContext();
            return (yield this.ResolveBehaviorResizeInternal(context, el, canBind, resizeLocation));
        });
    }
    ResolveBehaviorResizeInternal(context, el, canBind, resizeLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const resizeModel = el.getAttribute('d-resize-model');
            const resizeClass = el.getAttribute('d-resize-class');
            let resizeType = el.getAttribute('d-resize-type');
            if (resizeType == null)
                resizeType = 'normal';
            const resizeContainer = this.Application.Parser.ParseNumber(el.getAttribute('d-resize-container'), 2);
            const resizePreview = this.Application.Parser.ParseBoolean(el.getAttribute('d-resize-preview'), false);
            const resizer = this.CreateResize(context.Item, el, resizeModel, resizeLocation, resizeType, resizeClass, resizePreview, resizeContainer);
            const application = this.Application;
            const eventTypeMousedown = 'mousedown';
            const eventTypeMousemove = 'mousemove';
            const eventTypeMouseup = 'mouseup';
            const eventNamespaceMousedown = this.Application.EventHandler.CreateEventNamespace(el, null, eventTypeMousedown, resizer.Code);
            const eventNamespaceMouseMove = this.Application.EventHandler.CreateEventNamespace(el, null, eventTypeMousemove, resizer.Code);
            const eventNamespaceMouseUp = this.Application.EventHandler.CreateEventNamespace(el, null, eventTypeMouseup, resizer.Code);
            this.Application.EventHandler.DetachEventListener(el, eventNamespaceMousedown);
            this.Application.EventHandler.AttachEventListener(el, eventTypeMousedown, eventNamespaceMousedown, (e) => {
                const container = resizer.Container;
                if (resizer.Preview) {
                    application.EventHandler.AttachEventListener(container, eventTypeMousemove, eventNamespaceMouseMove, (ev) => {
                        application.BehaviorHandler.ResolveBehaviorResizeContinue(resizer, ev);
                    });
                }
                application.EventHandler.AttachEventListener(container, eventTypeMouseup, eventNamespaceMouseUp, (ev) => {
                    application.BehaviorHandler.ResolveBehaviorResizeFinish(resizer, ev);
                    if (resizer.Preview)
                        application.EventHandler.DetachEventListener(container, eventNamespaceMouseMove);
                    application.EventHandler.DetachEventListener(container, eventNamespaceMouseUp);
                });
                application.BehaviorHandler.ResolveBehaviorResizeStart(resizer, e);
            });
        });
    }
    CreateResize(item, element, model, location, type, resizeClass, preview, container) {
        const resizer = new DrapoResize();
        resizer.Code = this.Application.Document.CreateGuid();
        resizer.Item = item;
        resizer.Element = element;
        resizer.Model = model;
        resizer.Location = location;
        resizer.Type = type;
        resizer.Class = resizeClass;
        resizer.Preview = preview;
        resizer.Parent = resizer.Element.parentElement;
        resizer.Container = this.Application.EventHandler.GetElementParent(resizer.Element, container);
        return (resizer);
    }
    ResolveBehaviorResizeStart(resizer, e) {
        return __awaiter(this, void 0, void 0, function* () {
            const sizeUnit = this.GetSize(resizer);
            resizer.UnitStart = this.GetSizeUnit(sizeUnit);
            resizer.SizeStart = this.GetSizeValue(resizer.UnitStart, sizeUnit);
            resizer.EventStartValue = this.GetResizerEventValue(resizer, e);
            resizer.EventCurrentValue = null;
            if (resizer.Class !== null)
                resizer.Container.classList.add(resizer.Class);
        });
    }
    ResolveBehaviorResizeContinue(resizer, e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (resizer.EventStartValue == null)
                return;
            resizer.EventCurrentValue = this.GetResizerEventValue(resizer, e);
            this.ApplySizeNew(resizer);
        });
    }
    ResolveBehaviorResizeFinish(resizer, e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (resizer.EventStartValue == null)
                return;
            resizer.EventCurrentValue = this.GetResizerEventValue(resizer, e);
            const sizeNew = this.ApplySizeNew(resizer);
            resizer.EventStartValue = null;
            if (resizer.Class !== null)
                resizer.Container.classList.remove(resizer.Class);
            if (resizer.Model === null)
                return;
            const dataPath = this.Application.Parser.ParseMustache(resizer.Model);
            yield this.Application.Solver.UpdateItemDataPathObject(this.Application.Document.GetSector(resizer.Element), resizer.Item, null, dataPath, sizeNew, true);
        });
    }
    GetSize(resizer) {
        if (resizer.Location == 'bootstrap') {
            const classAttribute = resizer.Parent.getAttribute('class');
            const classesAttribute = this.Application.Parser.Tokenize(classAttribute);
            for (let i = 0; i < classesAttribute.length; i++) {
                const classCurrent = classesAttribute[i];
                if (this.IsClassBootstrap(classCurrent))
                    return (classCurrent);
            }
            return (null);
        }
        else {
            return (this.Application.Stylist.GetElementStyleProperty(resizer.Parent, 'width'));
        }
    }
    GetSizeUnit(size) {
        if (this.EndsWith(size, '%'))
            return ('%');
        if (this.EndsWith(size, 'px'))
            return ('px');
        if (this.IsClassBootstrap(size)) {
            const parts = this.Application.Parser.Tokenize(size, '-');
            if (parts.length < 3)
                return ('');
            return (parts[parts.length - 2]);
        }
        throw new Error('Size unit not supported: ' + size);
    }
    IsClassBootstrap(data) {
        return (data.indexOf('col-') === 0);
    }
    CreateClassBootstrap(type, size) {
        let className = 'col-';
        if (type != '')
            className = className + type + '-';
        className = className + size;
        return (className);
    }
    EndsWith(data, endsWith) {
        const size = endsWith.length;
        const diff = data.length - size;
        for (let i = 0; i < size; i++)
            if (endsWith[i] !== data[i + diff])
                return (false);
        return (true);
    }
    GetSizeValue(unit, sizeUnit) {
        if (this.IsClassBootstrap(sizeUnit)) {
            const parts = this.Application.Parser.Tokenize(sizeUnit, '-');
            return (Number(parts[parts.length - 1]));
        }
        const valueString = sizeUnit.substr(0, sizeUnit.length - (unit.length));
        return (Number(valueString));
    }
    GetSizeStartWithOffset(resizer) {
        const offset = this.GetResizerOffset(resizer);
        return (resizer.SizeStart + offset);
    }
    GetResizerOffset(resizer) {
        const start = resizer.EventStartValue;
        const end = resizer.EventCurrentValue;
        if (resizer.Type === 'reverse')
            return (start - end);
        return (end - start);
    }
    GetResizerEventValue(resizer, event) {
        if (resizer.Location === 'height')
            return (event.pageY);
        return (event.pageX);
    }
    ApplySizeNew(resizer) {
        if (resizer.Location === 'bootstrap') {
            const sizeBase = this.Application.Stylist.GetElementStyleProperty(resizer.Parent, 'width');
            const sizeBaseUnit = this.GetSizeUnit(sizeBase);
            const sizeBaseValue = this.GetSizeValue(sizeBaseUnit, sizeBase);
            const sizeBaseValueOne = sizeBaseValue / resizer.SizeStart;
            const sizeOffset = this.GetResizerOffset(resizer);
            const valueOffset = Math.round(sizeOffset / sizeBaseValueOne);
            if (valueOffset === 0)
                return (0);
            const valueNew = resizer.SizeStart + valueOffset;
            const classRemove = this.CreateClassBootstrap(resizer.UnitStart, resizer.SizeStart);
            const classInsert = this.CreateClassBootstrap(resizer.UnitStart, valueNew);
            resizer.Parent.classList.remove(classRemove);
            resizer.Parent.classList.add(classInsert);
            return (valueNew);
        }
        else {
            const sizeNew = this.GetSizeStartWithOffset(resizer);
            if (sizeNew === null)
                return (null);
            this.Application.Stylist.SetElementStyleProperty(resizer.Parent, resizer.Location, sizeNew + resizer.Unit);
            return (sizeNew);
        }
    }
}
//# sourceMappingURL=DrapoBehaviorHandler.js.map