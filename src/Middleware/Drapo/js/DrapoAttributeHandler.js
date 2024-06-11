"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DrapoAttributeHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    HasContentIDContext(content) {
        return (content.indexOf('d-id') > -1);
    }
    HasContentAttributeContext(content) {
        return (content.indexOf('d-attr') > -1);
    }
    ResolveAttr(el, canBind = true, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = this.ExtractAttr(el);
            if (attributes.length == 0)
                return;
            const sector = this.Application.Document.GetSector(el);
            const context = new DrapoContext();
            for (let i = 0; i < attributes.length; i++) {
                const attribute = attributes[i];
                const attributeName = attribute[0];
                let attributeValue = attribute[1];
                if (this.Application.Barber.HasMustacheContext(attributeValue, sector))
                    continue;
                const attributeType = attribute[2];
                const format = attribute[3];
                const formatResolved = format == null ? null : yield this.Application.ModelHandler.ResolveValueExpression(context, el, sector, format, false);
                const attributeValueOriginal = attributeValue;
                attributeValue = yield this.Application.ModelHandler.ResolveValueExpression(context, el, sector, attributeValue, canBind);
                attributeValue = this.ResolveConversionAttributeValue(attributeName, attributeValue, formatResolved);
                if (attributeValue === attributeValueOriginal)
                    continue;
                if (attributeType == null) {
                    el.setAttribute(attributeName, attributeValue);
                }
                else if (attributeType === 'min') {
                    const isValid = yield this.Application.Solver.ResolveConditional(attributeValue);
                    if (isValid)
                        el.setAttribute(attributeName, '');
                    else
                        el.removeAttribute(attributeName);
                }
            }
        });
    }
    ResolveAttrContext(context, el, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = this.ExtractAttr(el);
            if (attributes.length == 0)
                return;
            const sector = this.Application.Document.GetSector(el);
            for (let i = 0; i < attributes.length; i++) {
                const attribute = attributes[i];
                const attributeName = attribute[0];
                let attributeValue = attribute[1];
                const attributeType = attribute[2];
                const format = attribute[3];
                const formatResolved = format == null ? null : yield this.Application.ModelHandler.ResolveValueExpression(context, el, sector, format, false);
                const attributeValueOriginal = attributeValue;
                attributeValue = yield this.Application.ModelHandler.ResolveValueExpression(context, el, sector, attributeValue, canBind);
                attributeValue = this.ResolveConversionAttributeValue(attributeName, attributeValue, formatResolved);
                if (context.CanUpdateTemplate) {
                    const attributeNameFull = 'd-attr-' + attributeName + (attributeType != null ? ('-' + attributeType) : '');
                    if (this.Application.Parser.HasMustache(attributeValue)) {
                        el.setAttribute(attributeNameFull, attributeValue);
                        continue;
                    }
                    if (this.Application.Parser.IsMustache(attributeValueOriginal)) {
                        const key = this.Application.Parser.ParseMustache(attributeValueOriginal)[0];
                        if (!context.IsParentKey(key))
                            el.removeAttribute(attributeNameFull);
                    }
                    else
                        el.removeAttribute(attributeNameFull);
                }
                if (attributeValue === attributeValueOriginal)
                    continue;
                if (attributeType == null) {
                    el.setAttribute(attributeName, attributeValue);
                }
                else if (attributeType === 'min') {
                    const isValid = yield this.Application.Solver.ResolveConditional(attributeValue);
                    if (isValid)
                        el.setAttribute(attributeName, '');
                    else
                        el.removeAttribute(attributeName);
                }
            }
        });
    }
    ResolveContextValue(context, el, sector, isContext, value, canBind, canSubscribeDelay = false, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const valueOriginal = value;
            const mustaches = this.Application.Parser.ParseMustaches(value);
            for (let j = 0; j < mustaches.length; j++) {
                const mustache = mustaches[j];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                if ((dataKeyFilter != null) && (dataKey != dataKeyFilter))
                    continue;
                const isDataKeyContext = !this.Application.Storage.IsDataKey(dataKey, sector);
                if (isDataKeyContext !== isContext)
                    continue;
                if ((context !== null) && (!context.CanResolve(dataKey)))
                    continue;
                const dataFields = this.Application.Solver.ResolveDataFields(mustacheParts);
                if ((dataFieldFilter != null) && (dataFields[0] != dataFieldFilter))
                    continue;
                if ((isContext) || (yield this.Application.Storage.EnsureDataKeyFieldReady(dataKey, sector, mustacheParts))) {
                    let contextCurrent = context;
                    if (contextCurrent === null) {
                        contextCurrent = new DrapoContext();
                        const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
                        contextCurrent.Create(data, el, null, dataKey, dataKey, null, null);
                    }
                    const valueNew = yield this.Application.Solver.ResolveDataPath(contextCurrent, null, el, sector, mustacheParts, canBind);
                    value = value.replace(mustache, valueNew);
                }
                else if (canSubscribeDelay) {
                    this.Application.Observer.SubscribeDelay(el, dataKey, dataFields);
                }
            }
            if (valueOriginal !== value)
                return (yield this.ResolveContextValue(context, el, sector, isContext, value, canBind, canSubscribeDelay, null, null));
            return (value);
        });
    }
    ExtractAttr(el) {
        const attributes = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const attributeProperty = this.Application.AttributeHandler.ExtractAttrProperty(attribute.nodeName);
            if (attributeProperty == null)
                continue;
            const format = el.getAttribute('d-attr-' + attributeProperty[0] + "-format");
            attributes.push([attributeProperty[0], attribute.nodeValue, attributeProperty[1], format]);
        }
        return (attributes);
    }
    ExtractAttrProperty(property) {
        const parse = this.Application.Parser.ParseProperty(property);
        if (parse.length < 3)
            return (null);
        if (parse[0] != 'd')
            return (null);
        if (parse[1].toLowerCase() != 'attr')
            return (null);
        const name = parse[2];
        const type = parse.length > 3 ? parse[3] : null;
        if (type === 'format')
            return (null);
        return ([name, type]);
    }
    ResolveID(el, sector, canBind = true, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const did = el.getAttribute('d-id');
            if (did == null)
                return;
            if (this.Application.Barber.HasMustacheContext(did, sector))
                return;
            const context = new DrapoContext();
            const expressionCurrent = yield this.Application.Barber.ResolveControlFlowMustacheString(context, null, null, did, el, sector, canBind);
            if (did !== expressionCurrent)
                el.setAttribute('d-id', expressionCurrent);
        });
    }
    ResolveIDContext(context, el, sector, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            const did = el.getAttribute('d-id');
            if (did == null)
                return;
            const expressionCurrent = yield this.Application.Barber.ResolveControlFlowMustacheString(context, null, null, did, el, sector, canBind);
            if (did !== expressionCurrent)
                el.setAttribute('d-id', expressionCurrent);
        });
    }
    ResolveConversionAttributeValue(name, value, format) {
        if (name === 'src')
            return (this.ResolveConversionAttributeSourceValue(value));
        if (format != null)
            value = this.Application.Formatter.Format(value, format);
        return (value);
    }
    ResolveConversionAttributeSourceValue(value) {
        const url = this.Application.Server.ResolveUrl(value);
        const urlEncoded = this.Application.Server.EnsureUrlEncoded(url);
        return (urlEncoded);
    }
}
//# sourceMappingURL=DrapoAttributeHandler.js.map