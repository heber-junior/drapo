"use strict";
class DrapoMessage {
    constructor() {
        this._action = null;
        this._dataKey = null;
        this._sector = null;
        this._tag = null;
        this._data = null;
    }
    get Action() {
        return (this._action);
    }
    set Action(value) {
        this._action = value;
    }
    get DataKey() {
        return (this._dataKey);
    }
    set DataKey(value) {
        this._dataKey = value;
    }
    get Sector() {
        return (this._sector);
    }
    set Sector(value) {
        this._sector = value;
    }
    get Tag() {
        return (this._tag);
    }
    set Tag(value) {
        this._tag = value;
    }
    get Data() {
        return (this._data);
    }
    set Data(value) {
        this._data = value;
    }
}
//# sourceMappingURL=DrapoMessage.js.map