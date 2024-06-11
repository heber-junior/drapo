"use strict";
class DrapoQueryProjection {
    constructor() {
        this._source = null;
        this._column = null;
        this._alias = null;
        this._functionName = null;
        this._functionParameters = null;
    }
    get Source() {
        return (this._source);
    }
    set Source(value) {
        this._source = value;
    }
    get Column() {
        return (this._column);
    }
    set Column(value) {
        this._column = value;
    }
    get Alias() {
        return (this._alias);
    }
    set Alias(value) {
        this._alias = value;
    }
    get FunctionName() {
        return (this._functionName);
    }
    set FunctionName(value) {
        this._functionName = value;
    }
    get FunctionParameters() {
        return (this._functionParameters);
    }
    set FunctionParameters(value) {
        this._functionParameters = value;
    }
}
//# sourceMappingURL=DrapoQueryProjection.js.map