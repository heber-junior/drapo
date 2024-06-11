"use strict";
class DrapoContextItem {
    get Context() {
        return (this._context);
    }
    get Parent() {
        return (this._parent);
    }
    get Children() {
        return (this._children);
    }
    get Data() {
        return (this._data);
    }
    set Data(value) {
        this._data = value;
    }
    get DataKey() {
        return (this._dataKey);
    }
    set DataKey(value) {
        this._dataKey = value;
    }
    get Key() {
        return (this._key);
    }
    set Key(value) {
        this._key = value;
    }
    get Iterator() {
        return (this._iterator);
    }
    set Iterator(value) {
        this._iterator = value;
    }
    get Index() {
        return (this._index);
    }
    set Index(value) {
        this._index = value;
    }
    get Element() {
        return (this._element);
    }
    set Element(value) {
        this._element = value;
    }
    get ElementForTemplate() {
        return (this._elementForTemplate);
    }
    set ElementForTemplate(value) {
        this._elementForTemplate = value;
    }
    get ElementOld() {
        return (this._elementOld);
    }
    set ElementOld(value) {
        this._elementOld = value;
    }
    get RootItem() {
        if (this.Parent != null)
            return (this.Parent.RootItem);
        return (this);
    }
    get RootElement() {
        return (this.RootItem.Element);
    }
    constructor(context, parent = null) {
        this._context = null;
        this._parent = null;
        this._children = [];
        this._data = null;
        this._dataKey = null;
        this._key = null;
        this._iterator = null;
        this._index = null;
        this._element = null;
        this._elementForTemplate = null;
        this._elementOld = null;
        this._context = context;
        this._parent = parent;
    }
}
//# sourceMappingURL=DrapoContextItem.js.map