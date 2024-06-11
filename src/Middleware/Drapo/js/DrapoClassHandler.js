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
class DrapoClassHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    HasContentClassContext(content) {
        return (content.indexOf('d-class') > -1);
    }
    ResolveClass(el, sector, canBind = true, canSubscribeDelay = true, dataKeyFilter = null, dataFieldFilter = null, type = DrapoStorageLinkType.Render) {
        return __awaiter(this, void 0, void 0, function* () {
            const dClassMustache = el.getAttribute('d-class');
            if (dClassMustache == null)
                return;
            if (this.Application.Barber.HasMustacheContext(dClassMustache, sector))
                return;
            const context = new DrapoContext();
            const dClass = this.Application.Parser.IsMustacheOnly(dClassMustache) ? yield this.Application.Barber.ResolveControlFlowMustacheString(context, null, null, dClassMustache, el, sector, canBind) : dClassMustache;
            if (this.Application.Barber.HasMustacheContext(dClass, sector))
                return;
            const classesExpressions = this.ExtractClasses(dClass);
            for (let i = 0; i < classesExpressions.length; i++) {
                const classExpression = classesExpressions[i];
                const classMustachesTrue = classExpression[0];
                const classTrue = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, classMustachesTrue, el, canBind, type);
                const classFalse = classExpression[2] != null ? yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, classExpression[2], el, canBind, type) : null;
                const expressionMustaches = classExpression[1];
                const expressionCurrent = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, expressionMustaches, el, canBind, type);
                const addClass = yield this.Application.Solver.ResolveConditional(expressionCurrent);
                if (addClass) {
                    this.AddClass(el, classTrue);
                    if (classFalse != null)
                        this.RemoveClass(el, classFalse);
                }
                else {
                    this.RemoveClass(el, classTrue);
                    if (classFalse != null)
                        this.AddClass(el, classFalse);
                }
            }
        });
    }
    ResolveClassContext(context, renderContext, el, sector, canBind, type = DrapoStorageLinkType.Render) {
        return __awaiter(this, void 0, void 0, function* () {
            const dClassMustache = el.getAttribute('d-class');
            if (dClassMustache == null)
                return;
            const dClass = this.Application.Parser.IsMustacheOnly(dClassMustache) ? yield this.Application.Barber.ResolveControlFlowMustacheString(context, renderContext, null, dClassMustache, el, sector, canBind) : dClassMustache;
            const classesExpressions = this.ExtractClasses(dClass);
            for (let i = 0; i < classesExpressions.length; i++) {
                const classExpression = classesExpressions[i];
                const classMustachesTrue = classExpression[0];
                const classTrue = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, renderContext, null, classMustachesTrue, el, canBind, type);
                const classFalse = classExpression[2] != null ? yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, renderContext, null, classExpression[2], el, canBind, type) : null;
                const expressionMustaches = classExpression[1];
                const expressionCurrent = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, renderContext, null, expressionMustaches, el, canBind, type);
                const addClass = yield this.Application.Solver.ResolveConditional(expressionCurrent);
                if (addClass) {
                    this.AddClass(el, classTrue);
                    if (classFalse != null)
                        this.RemoveClass(el, classFalse);
                }
                else {
                    this.RemoveClass(el, classTrue);
                    if (classFalse != null)
                        this.AddClass(el, classFalse);
                }
            }
        });
    }
    ExtractClasses(dClass) {
        const classes = [];
        if (!this.Application.Parser.IsClassArray(dClass))
            return (classes);
        const parsedClasses = this.Application.Parser.ParseClassArray(dClass);
        for (let i = 0; i < parsedClasses.length; i++) {
            const parsedClass = parsedClasses[i];
            const parseClass = this.Application.Parser.ParseClass(parsedClass);
            if (parseClass != null)
                classes.push(parseClass);
        }
        return (classes);
    }
    AddClass(el, value) {
        const values = this.GetClassValues(value);
        for (let i = 0; i < values.length; i++)
            el.classList.add(values[i]);
    }
    RemoveClass(el, value) {
        const values = this.GetClassValues(value);
        for (let i = 0; i < values.length; i++)
            el.classList.remove(values[i]);
    }
    GetClassValues(value) {
        const valuesClass = [];
        const values = this.Application.Parser.ParseBlock(value, ' ');
        for (let i = 0; i < values.length; i++) {
            const valueCurrent = values[i];
            if (valueCurrent == null)
                continue;
            const valueTrim = valueCurrent.trim();
            if (valueTrim == '')
                continue;
            valuesClass.push(valueTrim);
        }
        return (valuesClass);
    }
}
//# sourceMappingURL=DrapoClassHandler.js.map