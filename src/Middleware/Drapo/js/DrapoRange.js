"use strict";
class DrapoRange {
    get Start() {
        return (this._start);
    }
    set Start(value) {
        this._start = value;
    }
    get End() {
        return (this._end);
    }
    set End(value) {
        this._end = value;
    }
    constructor(start = null, end = null) {
        this._start = null;
        this._end = null;
        this._start = start;
        this._end = end;
    }
}
//# sourceMappingURL=DrapoRange.js.map