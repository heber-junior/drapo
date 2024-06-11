"use strict";
class DrapoStack {
    constructor() {
        this._data = [];
    }
    Peek() {
        if (this._data.length == 0)
            return (null);
        return (this._data[this._data.length - 1]);
    }
    Push(item) {
        this._data.push(item);
    }
    Pop() {
        const item = this._data.pop();
        return (item !== null && item !== void 0 ? item : null);
    }
}
//# sourceMappingURL=DrapoStack.js.map