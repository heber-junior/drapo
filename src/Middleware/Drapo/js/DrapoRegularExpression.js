"use strict";
class DrapoRegularExpression {
    constructor() {
        this._items = [];
    }
    get Expression() {
        return (this._expression);
    }
    set Expression(value) {
        this._expression = value;
    }
    get Items() {
        return (this._items);
    }
    CreateItem(expression, name = null) {
        const item = new DrapoRegularExpressionItem();
        item.Expression = expression;
        item.Name = name;
        this._items.push(item);
        return (item);
    }
    IsValid(value) {
        const regex = new RegExp(this.Expression);
        if (!regex.test(value))
            return (false);
        let valueCurrent = value;
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            const match = valueCurrent.match(item.Expression);
            if (match == null)
                return (null);
            const matchValue = match[0];
            if (valueCurrent.indexOf(matchValue) != 0)
                return (null);
            item.Value = matchValue;
            valueCurrent = valueCurrent.substring(matchValue.length);
        }
        return (true);
    }
    GetValue(name) {
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (item.Name === name)
                return (item.Value);
        }
        return (null);
    }
}
//# sourceMappingURL=DrapoRegularExpression.js.map