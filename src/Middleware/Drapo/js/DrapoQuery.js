"use strict";
class DrapoQuery {
    constructor() {
        this._error = null;
        this._projections = [];
        this._sources = [];
        this._filter = null;
        this._sorts = null;
        this._outputArray = null;
        this._options = null;
    }
    get Error() {
        return (this._error);
    }
    set Error(value) {
        this._error = value;
    }
    get Projections() {
        return (this._projections);
    }
    set Projections(value) {
        this._projections = value;
    }
    get Sources() {
        return (this._sources);
    }
    set Sources(value) {
        this._sources = value;
    }
    get Filter() {
        return (this._filter);
    }
    set Filter(value) {
        this._filter = value;
    }
    get Sorts() {
        return (this._sorts);
    }
    set Sorts(value) {
        this._sorts = value;
    }
    get OutputArray() {
        return (this._outputArray);
    }
    set OutputArray(value) {
        this._outputArray = value;
    }
    get Options() {
        return (this._options);
    }
    set Options(value) {
        this._options = value;
    }
}
//# sourceMappingURL=DrapoQuery.js.map