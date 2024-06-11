"use strict";
class DrapoExpressionItem {
    get Type() {
        return (this._type);
    }
    set Type(value) {
        this._type = value;
    }
    get Value() {
        return (this._value);
    }
    set Value(value) {
        if ((value != null) && (value.length > 1) && (value[0] === "'") && (value[value.length - 1] === "'"))
            this._value = value.substring(1, value.length - 1);
        else if ((value != null) && (value.length > 1) && (value[0] === '"') && (value[value.length - 1] === '"'))
            this._value = value.substring(1, value.length - 1);
        else
            this._value = value;
    }
    get Items() {
        return (this._items);
    }
    set Items(value) {
        this._items = value;
    }
    constructor(type, value = '') {
        this._value = '';
        this._items = [];
        this._type = type;
        this.Value = value;
    }
    GetItemIndex(value) {
        for (let i = 0; i < this._items.length; i++)
            if (this._items[i].Value === value)
                return (i);
        return (null);
    }
    CreateBlock(startingIndex, endingIndex) {
        const block = new DrapoExpressionItem(DrapoExpressionItemType.Block);
        for (let i = startingIndex; i <= endingIndex; i++)
            block.Items.push(this.Items[i]);
        return (block);
    }
}
//# sourceMappingURL=DrapoExpressionItem.js.map