"use strict";
class DrapoQuerySource {
    constructor() {
        this._joinType = null;
        this._source = null;
        this._alias = null;
        this._joinConditions = [];
    }
    get JoinType() {
        return (this._joinType);
    }
    set JoinType(value) {
        this._joinType = value;
    }
    get Source() {
        return (this._source);
    }
    set Source(value) {
        this._source = value;
    }
    get Alias() {
        return (this._alias);
    }
    set Alias(value) {
        this._alias = value;
    }
    get JoinConditions() {
        return (this._joinConditions);
    }
    set JoinConditions(value) {
        this._joinConditions = value;
    }
}
//# sourceMappingURL=DrapoQuerySource.js.map