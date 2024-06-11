"use strict";
class DrapoDrag {
    get Code() {
        return (this._code);
    }
    set Code(value) {
        this._code = value;
    }
    get Action() {
        return (this._action);
    }
    set Action(value) {
        this._action = value;
    }
    get Item() {
        return (this._contextItem);
    }
    set Item(value) {
        this._contextItem = value;
    }
    get Tags() {
        return (this._tags);
    }
    set Tags(value) {
        this._tags = value;
    }
    get Notify() {
        return (this._notify);
    }
    set Notify(value) {
        this._notify = value;
    }
    get OnBefore() {
        return (this._onBefore);
    }
    set OnBefore(value) {
        this._onBefore = value;
    }
    get OnAfter() {
        return (this._onAfter);
    }
    set OnAfter(value) {
        this._onAfter = value;
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
    get Custom() {
        return (this._custom);
    }
    set Custom(value) {
        this._custom = value;
    }
    constructor() {
        this._action = 'move';
        this._tags = [];
    }
    IsMatch(tags) {
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            for (let j = 0; j < this._tags.length; j++) {
                if (this._tags[j] === tag)
                    return (true);
            }
        }
        return (false);
    }
}
//# sourceMappingURL=DrapoDrag.js.map