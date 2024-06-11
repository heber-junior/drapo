"use strict";
class DrapoRenderContext {
    constructor() {
        this._sectorExpressionContexts = {};
        this._dataKeyElements = {};
    }
    GetKey(sector, expression) {
        return (sector + '_' + expression);
    }
    HasExpressionContext(sector, expression) {
        const key = this.GetKey(sector, expression);
        const value = this._sectorExpressionContexts[key];
        if (value == null)
            return (null);
        return value;
    }
    AddExpressionContext(sector, expression, hasContext) {
        const key = this.GetKey(sector, expression);
        this._sectorExpressionContexts[key] = hasContext;
    }
    HasDataKeyElement(dataKey) {
        const value = this._dataKeyElements[dataKey];
        if (value == null)
            return (null);
        return value;
    }
    AddDataKeyElement(dataKey, hasElement) {
        this._dataKeyElements[dataKey] = hasElement;
    }
}
//# sourceMappingURL=DrapoRenderContext.js.map