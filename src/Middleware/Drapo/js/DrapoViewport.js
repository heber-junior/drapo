"use strict";
class DrapoViewport {
    constructor() {
        this._busy = false;
        this._sector = null;
        this._dataKey = null;
        this._key = null;
        this._dataKeyIteratorRange = null;
        this._data = null;
        this._el = null;
        this._elScroll = null;
        this._elTemplate = null;
        this._elBallonBefore = null;
        this._elBallonAfter = null;
        this._heightScroll = null;
        this._heightScrollScroll = null;
        this._heightBefore = null;
        this._heightAfter = null;
        this._heightItem = null;
        this._heightBallonBefore = null;
        this._heightBallonAfter = null;
        this._dataStart = null;
        this._dataEnd = null;
        this._dataLength = null;
        this._factor = 4;
        this._eventScrollTimeout = null;
        this._scrollTop = null;
        this._isActive = false;
    }
    get Busy() {
        return (this._busy);
    }
    set Busy(value) {
        this._busy = value;
    }
    get Sector() {
        return (this._sector);
    }
    set Sector(value) {
        this._sector = value;
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
    get DataKeyIteratorRange() {
        return (this._dataKeyIteratorRange);
    }
    set DataKeyIteratorRange(value) {
        this._dataKeyIteratorRange = value;
    }
    get Data() {
        return (this._data);
    }
    set Data(value) {
        this._data = value;
    }
    get Element() {
        return (this._el);
    }
    set Element(value) {
        this._el = value;
    }
    get ElementTemplate() {
        return (this._elTemplate);
    }
    set ElementTemplate(value) {
        this._elTemplate = value;
    }
    get ElementBallonBefore() {
        return (this._elBallonBefore);
    }
    set ElementBallonBefore(value) {
        this._elBallonBefore = value;
    }
    get ElementBallonAfter() {
        return (this._elBallonAfter);
    }
    set ElementBallonAfter(value) {
        this._elBallonAfter = value;
    }
    get ElementScroll() {
        return (this._elScroll);
    }
    set ElementScroll(value) {
        this._elScroll = value;
    }
    get HeightScroll() {
        return (this._heightScroll);
    }
    set HeightScroll(value) {
        this._heightScroll = value;
    }
    get HeightScrollScroll() {
        return (this._heightScrollScroll);
    }
    set HeightScrollScroll(value) {
        this._heightScrollScroll = value;
    }
    get HeightBefore() {
        return (this._heightBefore);
    }
    set HeightBefore(value) {
        this._heightBefore = value;
    }
    get HeightAfter() {
        return (this._heightAfter);
    }
    set HeightAfter(value) {
        this._heightAfter = value;
    }
    get HeightItem() {
        return (this._heightItem);
    }
    set HeightItem(value) {
        this._heightItem = value;
    }
    get HeightBallonBefore() {
        return (this._heightBallonBefore);
    }
    set HeightBallonBefore(value) {
        this._heightBallonBefore = value;
    }
    get HeightBallonAfter() {
        return (this._heightBallonAfter);
    }
    set HeightBallonAfter(value) {
        this._heightBallonAfter = value;
    }
    get DataStart() {
        return (this._dataStart);
    }
    set DataStart(value) {
        this._dataStart = value;
    }
    get DataEnd() {
        return (this._dataEnd);
    }
    set DataEnd(value) {
        this._dataEnd = value;
    }
    get DataLength() {
        return (this._dataLength);
    }
    set DataLength(value) {
        this._dataLength = value;
    }
    get Factor() {
        return (this._factor);
    }
    set Factor(value) {
        this._factor = value;
    }
    get EventScrollTimeout() {
        return (this._eventScrollTimeout);
    }
    set EventScrollTimeout(value) {
        this._eventScrollTimeout = value;
    }
    get ScrollTop() {
        return (this._scrollTop);
    }
    set ScrollTop(value) {
        this._scrollTop = value;
    }
    get IsActive() {
        return (this._isActive);
    }
    set IsActive(value) {
        this._isActive = value;
    }
}
//# sourceMappingURL=DrapoViewport.js.map