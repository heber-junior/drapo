"use strict";
class DrapoQueryCondition {
    constructor() {
        this._sourceLeft = null;
        this._columnLeft = null;
        this._valueLeft = null;
        this._comparator = null;
        this._sourceRight = null;
        this._columnRight = null;
        this._valueRight = null;
        this._isNullRight = false;
        this._isSearchStartRight = false;
        this._isSearchEndRight = false;
    }
    get SourceLeft() {
        return (this._sourceLeft);
    }
    set SourceLeft(value) {
        this._sourceLeft = value;
    }
    get ColumnLeft() {
        return (this._columnLeft);
    }
    set ColumnLeft(value) {
        this._columnLeft = value;
    }
    get ValueLeft() {
        return (this._valueLeft);
    }
    set ValueLeft(value) {
        this._valueLeft = value;
    }
    get Comparator() {
        return (this._comparator);
    }
    set Comparator(value) {
        this._comparator = value;
    }
    get SourceRight() {
        return (this._sourceRight);
    }
    set SourceRight(value) {
        this._sourceRight = value;
    }
    get ColumnRight() {
        return (this._columnRight);
    }
    set ColumnRight(value) {
        this._columnRight = value;
    }
    get ValueRight() {
        return (this._valueRight);
    }
    set ValueRight(value) {
        this._valueRight = value;
    }
    get IsNullRight() {
        return (this._isNullRight);
    }
    set IsNullRight(value) {
        this._isNullRight = value;
    }
    get IsSearchStartRight() {
        return (this._isSearchStartRight);
    }
    set IsSearchStartRight(value) {
        this._isSearchStartRight = value;
    }
    get IsSearchEndRight() {
        return (this._isSearchEndRight);
    }
    set IsSearchEndRight(value) {
        this._isSearchEndRight = value;
    }
    Clone() {
        const clone = new DrapoQueryCondition();
        clone.SourceLeft = this.SourceLeft;
        clone.ColumnLeft = this.ColumnLeft;
        clone.ValueLeft = this.ValueLeft;
        clone.Comparator = this.Comparator;
        clone.SourceRight = this.SourceRight;
        clone.ColumnRight = this.ColumnRight;
        clone.ValueRight = this.ValueRight;
        clone.IsNullRight = this.IsNullRight;
        clone.IsSearchStartRight = this.IsSearchStartRight;
        clone.IsSearchEndRight = this.IsSearchEndRight;
        return (clone);
    }
}
//# sourceMappingURL=DrapoQueryCondition.js.map