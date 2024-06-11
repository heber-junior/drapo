"use strict";
class DrapoEventListener {
    constructor() {
        this._eventType = null;
        this._eventNamespace = null;
        this._function = null;
    }
    get EventType() {
        return (this._eventType);
    }
    set EventType(value) {
        this._eventType = value;
    }
    get EventNamespace() {
        return (this._eventNamespace);
    }
    set EventNamespace(value) {
        this._eventNamespace = value;
    }
    get Function() {
        return (this._function);
    }
    set Function(value) {
        this._function = value;
    }
}
//# sourceMappingURL=DrapoEventListener.js.map