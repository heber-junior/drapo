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
class DrapoFunctionHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    ResolveFunctionWithoutContext(sector, element, functionsValue, executionContext = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.ResolveFunction(sector, null, element, null, functionsValue, executionContext, true));
        });
    }
    CreateExecutionContext(canReset = true) {
        const executionContext = new DrapoExecutionContext(this.Application);
        executionContext.CanReset = canReset;
        if (canReset)
            this.Application.Server.HasBadRequest = false;
        return (executionContext);
    }
    FinalizeExecutionContext(executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const windowsAutoClose = executionContext.GetWindowsAutoClose();
            for (let i = windowsAutoClose.length - 1; i >= 0; i--) {
                const windowAutoClose = windowsAutoClose[i];
                yield this.Application.WindowHandler.TryClose(windowAutoClose);
            }
        });
    }
    IsExecutionBroked(executionContext) {
        if (executionContext.HasError)
            return (true);
        if (!executionContext.CanReset)
            return (false);
        if (this.Application.Server.HasBadRequest) {
            this.Application.Server.HasBadRequest = false;
            executionContext.HasError = true;
            return (true);
        }
        return (false);
    }
    ReplaceFunctionExpressions(sector, context, expression, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.ReplaceFunctionExpressionsContext(sector, context, expression, canBind, this.CreateExecutionContext(false)));
        });
    }
    ReplaceFunctionExpressionsContext(sector, context, expression, canBind, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const functionsParsed = this.Application.Parser.ParseFunctions(expression);
            for (let i = 0; i < functionsParsed.length; i++) {
                let functionParse = functionsParsed[i];
                let functionParsed = this.Application.Parser.ParseFunction(functionParse);
                if (functionParsed === null)
                    continue;
                if (this.Application.Parser.IsMustache(functionParse)) {
                    const dataPath = this.Application.Parser.ParseMustache(functionParse);
                    const data = yield this.Application.Solver.ResolveItemDataPathObject(sector, context.Item, dataPath);
                    if ((data == null) || (data == ''))
                        continue;
                    functionParse = data;
                    const functionInnerParsed = yield this.ReplaceFunctionExpressionsContext(sector, context, functionParse, canBind, executionContext);
                    if (functionInnerParsed === functionParse)
                        continue;
                    functionParse = functionInnerParsed;
                    expression = expression.replace(functionParse, functionInnerParsed);
                }
                functionParsed = this.Application.Parser.ParseFunction(functionParse);
                if (functionParsed == null) {
                    yield this.Application.ExceptionHandler.HandleError('DrapoFunctionHandler - ResolveFunction - Invalid Parse - {0}', functionParse);
                    continue;
                }
                expression = expression.replace(functionParse, yield this.ExecuteFunctionContextSwitch(sector, context.Item, null, null, functionParsed, executionContext));
            }
            return (expression);
        });
    }
    ResolveFunction(sector, contextItem, element, event, functionsValue, executionContext = null, forceFinalizeExecutionContext = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let created = false;
            if (created = executionContext === null) {
                executionContext = this.CreateExecutionContext();
            }
            const result = yield this.ResolveFunctionContext(sector, contextItem, element, event, functionsValue, executionContext);
            if ((created) || (forceFinalizeExecutionContext))
                yield this.FinalizeExecutionContext(executionContext);
            return (result);
        });
    }
    ResolveFunctionContext(sector, contextItem, element, event, functionsValue, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = '';
            if (this.IsExecutionBroked(executionContext))
                return (result);
            const functionsParsed = this.Application.Parser.ParseFunctions(functionsValue);
            for (let i = 0; i < functionsParsed.length; i++) {
                const functionParse = functionsParsed[i];
                if (functionParse == '')
                    continue;
                if (this.Application.Parser.IsMustache(functionParse)) {
                    const dataPath = this.Application.Parser.ParseMustache(functionParse);
                    const data = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
                    if ((data == null) || (data == ''))
                        continue;
                    const dataKey = this.Application.Solver.ResolveDataKey(dataPath);
                    executionContext.HasBreakpoint = yield this.Application.Debugger.HasBreakpoint(sector, dataKey);
                    executionContext.Sector = sector;
                    executionContext.DataKey = dataKey;
                    result = result + (yield this.ResolveFunctionContext(sector, contextItem, element, event, data, executionContext));
                    if (this.IsExecutionBroked(executionContext))
                        return (result);
                    continue;
                }
                const functionParsed = this.Application.Parser.ParseFunction(functionParse);
                if (functionParsed == null) {
                    yield this.Application.ExceptionHandler.HandleError('DrapoFunctionHandler - ResolveFunction - Invalid Parse - {0}', functionParse);
                    continue;
                }
                if (executionContext.HasBreakpoint)
                    yield this.Application.Debugger.ActivateBreakpoint(executionContext.Sector, executionContext.DataKey, functionsValue, functionParse, 'before');
                result = result + (yield this.ExecuteFunctionContextSwitch(sector, contextItem, element, event, functionParsed, executionContext));
                if ((executionContext.HasBreakpoint) && (i == (functionsParsed.length - 1)))
                    yield this.Application.Debugger.ActivateBreakpoint(executionContext.Sector, executionContext.DataKey, functionsValue, functionParse, 'after');
                if (this.IsExecutionBroked(executionContext))
                    return (result);
            }
            yield this.Application.Debugger.CleanRuntime();
            return (result);
        });
    }
    ResolveFunctionParameter(sector, contextItem, element, executionContext, parameter, canForceLoadDataDelay = false, canUseReturnFunction = false, isRecursive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (canUseReturnFunction) {
                const functionParsed = this.Application.Parser.ParseFunction(parameter);
                if (functionParsed != null) {
                    const valueFunction = yield this.ExecuteFunctionContextSwitch(sector, contextItem, element, null, functionParsed, executionContext);
                    if (isRecursive)
                        return (yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, valueFunction));
                    return (valueFunction);
                }
            }
            if (!this.Application.Parser.HasMustache(parameter))
                return (parameter);
            if (this.Application.Parser.HasFunction(parameter))
                return (parameter);
            const mustaches = this.Application.Parser.ParseMustaches(parameter);
            if (mustaches.length == 0)
                return (parameter);
            const mustache = this.Application.Parser.ParseMustache(mustaches[0]);
            const value = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, mustache, canForceLoadDataDelay, executionContext);
            if ((!isRecursive) && (parameter === mustaches[0]))
                return (value);
            const valueReplaceMustache = parameter.replace(mustaches[0], value);
            return (yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, valueReplaceMustache));
        });
    }
    ResolveExecutionContextMustache(sector, executionContext, value) {
        if (executionContext == null)
            return (value);
        if (!this.Application.Parser.HasMustache(value))
            return (value);
        const mustaches = this.Application.Parser.ParseMustaches(value);
        for (let i = 0; i < mustaches.length; i++) {
            const mustache = mustaches[i];
            const dataPath = this.Application.Parser.ParseMustache(mustache);
            const mustacheResolved = this.Application.Solver.GetExecutionContextPathValue(sector, executionContext, dataPath);
            if (mustacheResolved !== null)
                value = value.replace(mustache, mustacheResolved);
        }
        return (value);
    }
    ResolveFunctions(sector, contextItem, element, executionContext, value, checkInvalidFunction = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const functionsParsed = this.Application.Parser.ParseFunctionsPartial(value);
            for (let i = 0; i < functionsParsed.length; i++) {
                const functionText = functionsParsed[i];
                const functionParsed = this.Application.Parser.ParseFunction(functionText);
                if (functionParsed === null)
                    continue;
                const valueFunction = yield this.ExecuteFunctionContextSwitch(sector, contextItem, element, null, functionParsed, executionContext, checkInvalidFunction);
                if ((valueFunction === null) && (!checkInvalidFunction))
                    continue;
                const valueReplaceFunction = value.replace(functionText, valueFunction);
                return (yield this.ResolveFunctions(sector, contextItem, element, executionContext, valueReplaceFunction, checkInvalidFunction));
            }
            if (!this.Application.Parser.HasMustache(value))
                return (value);
            const mustaches = this.Application.Parser.ParseMustaches(value);
            if (mustaches.length == 0)
                return (value);
            const mustache = this.Application.Parser.ParseMustache(mustaches[0]);
            const mustacheValue = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, mustache, true);
            const valueReplaceMustache = value.replace(mustaches[0], mustacheValue);
            return (yield this.ResolveFunctions(sector, contextItem, element, executionContext, valueReplaceMustache, checkInvalidFunction));
        });
    }
    ResolveFunctionParameterDataFields(sector, contextItem, element, parameter, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, parameter);
            if ((value == null) || (value == ''))
                return (null);
            const mustache = '{{' + value + '}}';
            const dataFields = this.Application.Parser.ParseMustache(mustache);
            return (dataFields);
        });
    }
    ExecuteFunctionContextSwitch(sector, contextItem, element, event, functionParsed, executionContext, checkInvalidFunction = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Debugger.AddFunction(functionParsed);
            if (functionParsed.Name === 'external')
                return (this.ExecuteFunctionExternal(contextItem, element, event, functionParsed));
            if (functionParsed.Name === 'toggleitemfield')
                return (yield this.ExecuteFunctionToggleItemField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'toggledata')
                return (yield this.ExecuteFunctionToggleData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'uncheckitemfield')
                return (yield this.ExecuteFunctionUncheckItemField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'clearitemfield')
                return (yield this.ExecuteFunctionClearItemField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updateitemfield')
                return (yield this.ExecuteFunctionUpdateItemField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'checkdatafield')
                return (yield this.ExecuteFunctionCheckDataField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'uncheckdatafield')
                return (yield this.ExecuteFunctionUncheckDataField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'cleardatafield')
                return (yield this.ExecuteFunctionClearDataField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatedatafield')
                return (yield this.ExecuteFunctionUpdateDataField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatedatafieldlookup')
                return (yield this.ExecuteFunctionUpdateDataFieldLookup(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'checkitemfield')
                return (yield this.ExecuteFunctionCheckItemField(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'moveitem')
                return (yield this.ExecuteFunctionMoveItem(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatedataurl')
                return (yield this.ExecuteFunctionUpdateDataUrl(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatedataurlset')
                return (yield this.ExecuteFunctionUpdateDataUrlSet(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'adddataitem')
                return (yield this.ExecuteFunctionAddDataItem(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'removedataitem')
                return (yield this.ExecuteFunctionRemoveDataItem(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'removedataitemlookup')
                return (yield this.ExecuteFunctionRemoveDataItemLookup(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'containsdataitem')
                return (yield this.ExecuteFunctionContainsDataItem(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatesector')
                return (yield this.ExecuteFunctionUpdateSector(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'switchsector')
                return (yield this.ExecuteFunctionSwitchSector(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'reloadsector')
                return (yield this.ExecuteFunctionReloadSector(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'clearsector')
                return (yield this.ExecuteFunctionClearSector(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'loadsectorcontent')
                return (yield this.ExecuteFunctionLoadSectorContent(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'postdata')
                return (yield this.ExecuteFunctionPostData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'postdataitem')
                return (yield this.ExecuteFunctionPostDataItem(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'cleardata')
                return (yield this.ExecuteFunctionClearData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'unloaddata')
                return (yield this.ExecuteFunctionUnloadData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'createdata')
                return (yield this.ExecuteFunctionCreateData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatedata')
                return (yield this.ExecuteFunctionUpdateData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'reloaddata')
                return (yield this.ExecuteFunctionReloadData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'filterdata')
                return (yield this.ExecuteFunctionFilterData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'hasdatachanges')
                return (yield this.ExecuteFunctionHasDataChanges(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'acceptdatachanges')
                return (yield this.ExecuteFunctionAcceptDataChanges(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'reloadpage')
                return (yield this.ExecuteFunctionReloadPage(sector, contextItem, element, event, functionParsed));
            if (functionParsed.Name === 'closepage')
                return (yield this.ExecuteFunctionClosePage(sector, contextItem, element, event, functionParsed));
            if (functionParsed.Name === 'redirectpage')
                return (yield this.ExecuteFunctionRedirectPage(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updateurl')
                return (yield this.ExecuteFunctionUpdateURL(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatetoken')
                return (yield this.ExecuteFunctionUpdateToken(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'cleartoken')
                return (yield this.ExecuteFunctionClearToken(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'hastoken')
                return (this.ExecuteFunctionHasToken(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'updatetokenantiforgery')
                return (yield this.ExecuteFunctionUpdateTokenAntiforgery(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'destroycontainer')
                return (yield this.ExecuteFunctionDestroyContainer(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'if')
                return (yield this.ExecuteFunctionIf(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'async')
                return (yield this.ExecuteFunctionAsync(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'notify')
                return (yield this.ExecuteFunctionNotify(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'focus')
                return (yield this.ExecuteFunctionFocus(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'showwindow')
                return (yield this.ExecuteFunctionShowWindow(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'closewindow')
                return (yield this.ExecuteFunctionCloseWindow(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'hidewindow')
                return (yield this.ExecuteFunctionHideWindow(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getwindow')
                return (yield this.ExecuteFunctionGetWindow(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'setexternal')
                return (yield this.ExecuteFunctionSetExternal(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getexternal')
                return (yield this.ExecuteFunctionGetExternal(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'setexternalframe')
                return (yield this.ExecuteFunctionSetExternalFrame(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getexternalframe')
                return (yield this.ExecuteFunctionGetExternalFrame(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'setexternalframemessage')
                return (yield this.ExecuteFunctionSetExternalFrameMessage(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getexternalframemessage')
                return (yield this.ExecuteFunctionGetExternalFrameMessage(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'createguid')
                return (yield this.ExecuteFunctionCreateGuid(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'createtick')
                return (yield this.ExecuteFunctionCreateTick(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getdate')
                return (yield this.ExecuteFunctionGetDate(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'adddate')
                return (yield this.ExecuteFunctionAddDate(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'pushstack')
                return (yield this.ExecuteFunctionPushStack(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'popstack')
                return (yield this.ExecuteFunctionPopStack(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'peekstack')
                return (yield this.ExecuteFunctionPeekStack(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'execute')
                return (yield this.ExecuteFunctionExecute(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'executedataitem')
                return (yield this.ExecuteFunctionExecuteDataItem(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'executecomponentfunction')
                return (yield this.ExecuteFunctionExecuteComponentFunction(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'executeinstancefunction')
                return (yield this.ExecuteFunctionExecuteInstanceFunction(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'cast')
                return (yield this.ExecuteFunctionCast(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'encodeurl')
                return (yield this.ExecuteFunctionEncodeUrl(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'addrequestheader')
                return (yield this.ExecuteFunctionAddRequestHeader(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getsector')
                return (yield this.ExecuteFunctionGetSector(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getclipboard')
                return (yield this.ExecuteFunctionGetClipboard(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'setclipboard')
                return (yield this.ExecuteFunctionSetClipboard(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'createtimer')
                return (yield this.ExecuteFunctionCreateTimer(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'createreference')
                return (yield this.ExecuteFunctionCreateReference(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'wait')
                return (yield this.ExecuteFunctionWait(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'executevalidation')
                return (yield this.ExecuteFunctionExecuteValidation(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'clearvalidation')
                return (yield this.ExecuteFunctionClearValidation(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'downloaddata')
                return (yield this.ExecuteFunctionDownloadData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'detectview')
                return (yield this.ExecuteFunctionDetectView(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'setconfig')
                return (yield this.ExecuteFunctionSetConfig(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'getconfig')
                return (yield this.ExecuteFunctionGetConfig(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'lockplumber')
                return (yield this.ExecuteFunctionLockPlumber(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'unlockplumber')
                return (yield this.ExecuteFunctionUnlockPlumber(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'lockdata')
                return (yield this.ExecuteFunctionLockData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'unlockdata')
                return (yield this.ExecuteFunctionUnlockData(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'clearplumber')
                return (yield this.ExecuteFunctionClearPlumber(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'clearsubscriptions')
                return (yield this.ExecuteFunctionClearSubscriptions(sector, contextItem, element, event, functionParsed, executionContext));
            if (functionParsed.Name === 'debugger')
                return (yield this.ExecuteFunctionDebugger(sector, contextItem, element, event, functionParsed, executionContext));
            if (!checkInvalidFunction)
                return (null);
            yield this.Application.ExceptionHandler.HandleError('DrapoFunctionHandler - ExecuteFunction - Invalid Function - {0}', functionParsed.Name);
            return ('');
        });
    }
    ExecuteFunctionExternal(contextItem, element, event, functionParsed) {
        return ('');
    }
    ExecuteFunctionSetExternal(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const externalFunction = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const isCloneText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? false : yield this.Application.Solver.ResolveConditional(isCloneText);
            const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
            const windowFunction = window[externalFunction];
            if (typeof windowFunction !== 'function')
                return ('');
            windowFunction(isClone ? this.Application.Solver.Clone(data, true) : data);
        });
    }
    ExecuteFunctionGetExternal(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const externalFunction = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const isCloneText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? false : yield this.Application.Solver.ResolveConditional(isCloneText);
            const windowFunction = window[externalFunction];
            if (typeof windowFunction !== 'function')
                return ('');
            const data = windowFunction();
            yield this.Application.Storage.UpdateData(dataKey, sector, isClone ? this.Application.Solver.Clone(data, true) : data);
            return ('');
        });
    }
    ExecuteFunctionSetExternalFrame(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const frameID = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const externalFunction = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const isCloneText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]);
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? false : yield this.Application.Solver.ResolveConditional(isCloneText);
            const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
            const frame = document.getElementById(frameID);
            if (frame == null)
                return ('');
            const frameContent = (frame.contentWindow || frame.contentDocument);
            const application = this.Application;
            let windowFunction = frameContent[externalFunction];
            if (typeof windowFunction !== 'function') {
                const eventType = 'load';
                const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType);
                const elFrame = frame;
                this.Application.EventHandler.AttachEventListener(elFrame, eventType, eventNamespace, () => {
                    windowFunction = frameContent[externalFunction];
                    if (typeof windowFunction !== 'function')
                        return ('');
                    application.EventHandler.DetachEventListener(elFrame, eventNamespace);
                    windowFunction(isClone ? application.Solver.Clone(data, true) : data);
                });
            }
            else {
                windowFunction(isClone ? this.Application.Solver.Clone(data, true) : data);
            }
        });
    }
    ExecuteFunctionGetExternalFrame(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const frameID = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const externalFunction = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const isCloneText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]);
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? false : yield this.Application.Solver.ResolveConditional(isCloneText);
            const frame = document.getElementById(frameID);
            if (frame == null)
                return ('');
            const frameContent = (frame.contentWindow || frame.contentDocument);
            const windowFunction = frameContent[externalFunction];
            if (typeof windowFunction !== 'function')
                return ('');
            const data = windowFunction();
            yield this.Application.Storage.UpdateData(dataKey, sector, isClone ? this.Application.Solver.Clone(data, true) : data);
            return ('');
        });
    }
    ExecuteFunctionSetExternalFrameMessage(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const frameID = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const externalFunction = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const isCloneText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]);
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? false : yield this.Application.Solver.ResolveConditional(isCloneText);
            const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
            const frame = document.getElementById(frameID);
            if (frame == null)
                return ('');
            const frameContent = (frame.contentWindow || frame.contentDocument);
            const message = new DrapoMessage();
            message.Action = 'set';
            message.DataKey = dataKey;
            message.Tag = externalFunction;
            message.Data = isClone ? this.Application.Solver.Clone(data, true) : data;
            const application = this.Application;
            const eventType = 'load';
            const eventNamespace = this.Application.EventHandler.CreateEventNamespace(null, null, eventType);
            const elFrame = frame;
            this.Application.EventHandler.AttachEventListener(elFrame, eventType, eventNamespace, () => {
                application.EventHandler.DetachEventListener(elFrame, eventNamespace);
                frameContent.postMessage(message, "*");
            });
        });
    }
    ExecuteFunctionGetExternalFrameMessage(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const frameID = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const externalFunction = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const isCloneText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]);
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? false : yield this.Application.Solver.ResolveConditional(isCloneText);
            const frame = document.getElementById(frameID);
            if (frame == null)
                return ('');
            const frameContent = (frame.contentWindow || frame.contentDocument);
            const message = new DrapoMessage();
            message.Action = 'get';
            message.DataKey = dataKey;
            message.Tag = externalFunction;
            message.Data = null;
            this.Application.Document.Message = null;
            frameContent.postMessage(message, "*");
            const messagePost = yield this.Application.Document.WaitForMessage();
            const data = messagePost != null ? messagePost._data : [];
            yield this.Application.Storage.UpdateData(dataKey, sector, isClone ? this.Application.Solver.Clone(data, true) : data);
            return ('');
        });
    }
    ExecuteFunctionToggleItemField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = this.Application.Parser.ParseMustache(functionParsed.Parameters[0]);
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const stateAny = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
            const state = this.Application.Solver.ResolveConditionalBoolean(((stateAny == null) || ((typeof stateAny) === 'string')) ? stateAny : stateAny.toString());
            const stateUpdated = !state;
            yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, stateUpdated, notify);
            return ('');
        });
    }
    ExecuteFunctionToggleData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = functionParsed.Parameters[0];
            const isSourceMustache = this.Application.Parser.IsMustache(source);
            const mustacheParts = isSourceMustache ? this.Application.Parser.ParseMustache(source) : null;
            const dataKey = mustacheParts != null ? this.Application.Solver.ResolveDataKey(mustacheParts) : source;
            const itemText = functionParsed.Parameters[1];
            let item = null;
            if (this.Application.Parser.IsMustache(itemText)) {
                const dataPath = this.Application.Parser.ParseMustache(itemText);
                item = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
            }
            else {
                if (this.Application.Storage.IsDataKey(itemText, sector)) {
                    const dataItem = yield this.Application.Storage.RetrieveDataItem(itemText, sector);
                    if (dataItem != null)
                        item = dataItem.Data;
                }
                else if (contextItem == null) {
                    item = itemText;
                }
                else {
                    const itemPath = [];
                    itemPath.push(itemText);
                    item = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, itemPath);
                }
            }
            if (item == null)
                return (null);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.ToggleData(dataKey, mustacheParts, sector, item, notify);
            return ('');
        });
    }
    ExecuteFunctionUncheckItemField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = this.Application.Parser.ParseMustache(functionParsed.Parameters[0]);
            yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, false);
            return ('');
        });
    }
    ExecuteFunctionClearItemField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = this.Application.Parser.ParseMustache(functionParsed.Parameters[0]);
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, null, notify);
            return ('');
        });
    }
    ExecuteFunctionUpdateItemField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = this.Application.Parser.ParseMustache(functionParsed.Parameters[0]);
            for (let i = 0; i < dataPath.length; i++) {
                const dataPathValue = dataPath[i];
                if (!this.Application.Parser.HasMustache(dataPathValue))
                    continue;
                const dataPathValueResolved = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, dataPathValue);
                if (dataPathValue !== dataPathValueResolved)
                    dataPath[i] = dataPathValueResolved;
            }
            const recursiveText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : null;
            const recursive = ((recursiveText == null) || (recursiveText == '')) ? false : yield this.Application.Solver.ResolveConditional(recursiveText);
            const resolveText = functionParsed.Parameters.length > 4 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[4]) : null;
            const resolve = ((resolveText == null) || (resolveText == '')) ? true : yield this.Application.Solver.ResolveConditional(resolveText);
            const item = resolve ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1], true, true, recursive) : functionParsed.Parameters[1];
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, item, notify);
            return ('');
        });
    }
    ExecuteFunctionCheckDataField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const dataFields = yield this.ResolveFunctionParameterDataFields(sector, contextItem, element, functionParsed.Parameters[1], executionContext);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, true, notify);
            return ('');
        });
    }
    ExecuteFunctionUncheckDataField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const dataFields = yield this.ResolveFunctionParameterDataFields(sector, contextItem, element, functionParsed.Parameters[1], executionContext);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, false, notify);
            return ('');
        });
    }
    ExecuteFunctionClearDataField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const dataFields = yield this.ResolveFunctionParameterDataFields(sector, contextItem, element, functionParsed.Parameters[1], executionContext);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, null, notify);
            return ('');
        });
    }
    ExecuteFunctionUpdateDataField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const dataFields = yield this.ResolveFunctionParameterDataFields(sector, contextItem, element, functionParsed.Parameters[1], executionContext);
            const recursiveText = functionParsed.Parameters.length > 4 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[4]) : null;
            const recursive = ((recursiveText == null) || (recursiveText == '')) ? false : yield this.Application.Solver.ResolveConditional(recursiveText);
            const resolveText = functionParsed.Parameters.length > 5 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[5]) : null;
            const resolve = ((resolveText == null) || (resolveText == '')) ? true : yield this.Application.Solver.ResolveConditional(resolveText);
            const value = resolve ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2], true, true, recursive) : functionParsed.Parameters[2];
            const notifyText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, value, notify);
            return ('');
        });
    }
    ExecuteFunctionUpdateDataFieldLookup(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const dataFieldSeek = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const valueSeek = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const dataField = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]);
            const valueText = functionParsed.Parameters[4];
            let value = null;
            if (this.Application.Parser.IsMustache(valueText)) {
                const dataPath = this.Application.Parser.ParseMustache(valueText);
                value = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
            }
            else {
                value = valueText;
            }
            const notifyText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[5]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.UpdateDataFieldLookup(dataKey, sector, dataFieldSeek, valueSeek, dataField, value, notify);
            return ('');
        });
    }
    ExecuteFunctionCheckItemField(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = this.Application.Parser.ParseMustache(functionParsed.Parameters[0]);
            const notifyText = functionParsed.Parameters[1];
            const nofity = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, true, nofity);
            return ('');
        });
    }
    ExecuteFunctionMoveItem(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const rangeIndex = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const dataItem = yield this.Application.Storage.RetrieveDataItem(contextItem.DataKey, sector);
            if (dataItem == null)
                return ('');
            const index = this.Application.ControlFlow.GetRangeIndex(dataItem.Data, rangeIndex);
            yield this.Application.Storage.MoveDataIndex(contextItem.DataKey, sector, contextItem.Data, index, notify);
            return ('');
        });
    }
    ExecuteFunctionUpdateDataUrl(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const dataUrl = functionParsed.Parameters[1];
            const elDataKey = this.Application.Searcher.FindByAttributeAndValue('d-dataKey', dataKey);
            if (elDataKey == null)
                return ('');
            const dataUrlCurrent = elDataKey.getAttribute('d-dataUrlGet');
            if (dataUrl === dataUrlCurrent)
                return ('');
            elDataKey.setAttribute('d-dataUrlGet', dataUrl);
            yield this.Application.Storage.DiscardCacheData(dataKey, sector);
            yield this.Application.Observer.Notify(dataKey, null, null);
            return ('');
        });
    }
    ExecuteFunctionUpdateDataUrlSet(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const dataUrl = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const elDataKey = this.Application.Searcher.FindByAttributeAndValue('d-dataKey', dataKey);
            if (elDataKey == null)
                return ('');
            const dataUrlCurrent = elDataKey.getAttribute('d-dataUrlSet');
            if (dataUrl === dataUrlCurrent)
                return ('');
            elDataKey.setAttribute('d-dataUrlSet', dataUrl);
            yield this.Application.Storage.DiscardCacheData(dataKey, sector);
            return ('');
        });
    }
    ExecuteFunctionAddDataItem(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = functionParsed.Parameters[0];
            const isSourceMustache = this.Application.Parser.IsMustache(source);
            const mustacheParts = isSourceMustache ? this.Application.Parser.ParseMustache(source) : null;
            const dataKey = mustacheParts != null ? this.Application.Solver.ResolveDataKey(mustacheParts) : source;
            const itemText = functionParsed.Parameters[1];
            let item = null;
            if (this.Application.Parser.IsMustache(itemText)) {
                const dataPath = this.Application.Parser.ParseMustache(itemText);
                item = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
            }
            else {
                if (this.Application.Storage.IsDataKey(itemText, sector)) {
                    const dataItem = yield this.Application.Storage.RetrieveDataItem(itemText, sector);
                    if (dataItem != null)
                        item = dataItem.Data;
                }
                else if (contextItem == null) {
                    item = itemText;
                }
                else {
                    const itemPath = [];
                    itemPath.push(itemText);
                    item = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, itemPath);
                }
            }
            if (item == null)
                return (null);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const isCloneText = functionParsed.Parameters[3];
            const isClone = ((isCloneText == null) || (isCloneText == '')) ? true : yield this.Application.Solver.ResolveConditional(isCloneText);
            yield this.Application.Storage.AddDataItem(dataKey, mustacheParts, sector, isClone ? this.Application.Solver.Clone(item) : item, notify);
        });
    }
    ExecuteFunctionRemoveDataItem(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = functionParsed.Parameters[0];
            const isSourceMustache = this.Application.Parser.IsMustache(source);
            const mustacheParts = isSourceMustache ? this.Application.Parser.ParseMustache(source) : null;
            const dataKey = mustacheParts != null ? this.Application.Solver.ResolveDataKey(mustacheParts) : source;
            const itemText = functionParsed.Parameters[1];
            let itemPath = [];
            if (this.Application.Parser.IsMustache(itemText)) {
                itemPath = this.Application.Parser.ParseMustache(itemText);
            }
            else {
                itemPath.push(itemText);
            }
            const item = contextItem === null ? itemText : yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, itemPath);
            if (item == null)
                return (null);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const deleted = contextItem === null ? yield this.Application.Storage.DeleteDataItemArray(dataKey, sector, item, notify) : yield this.Application.Storage.DeleteDataItem(dataKey, mustacheParts, sector, item, notify);
            if (!deleted)
                return (null);
        });
    }
    ExecuteFunctionRemoveDataItemLookup(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = functionParsed.Parameters[0];
            const dataFieldSeek = yield this.ResolveFunctionParameterDataFields(sector, contextItem, element, functionParsed.Parameters[1], executionContext);
            const valueSeek = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const notifyText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.RemoveDataItemLookup(dataPath, sector, dataFieldSeek, valueSeek, notify);
            return ('');
        });
    }
    ExecuteFunctionContainsDataItem(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataItemText = functionParsed.Parameters[1];
            let dataItemPath = [];
            const isMustache = this.Application.Parser.IsMustache(dataItemText);
            if (isMustache) {
                dataItemPath = this.Application.Parser.ParseMustache(dataItemText);
            }
            else {
                dataItemPath.push(dataItemText);
            }
            const item = ((!isMustache) && (contextItem == null)) ? dataItemText : yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataItemPath);
            const dataContainerText = functionParsed.Parameters[0];
            let dataContainerPath = [];
            if (this.Application.Parser.IsMustache(dataContainerText)) {
                dataContainerPath = this.Application.Parser.ParseMustache(dataContainerText);
            }
            else {
                dataContainerPath.push(dataContainerText);
            }
            const dataKeyContainer = dataContainerPath[0];
            const storageItem = yield this.Application.Storage.RetrieveDataItem(dataKeyContainer, sector);
            if (storageItem == null)
                return ('false');
            const contextContainer = new DrapoContext();
            for (let i = 0; i < storageItem.Data.length; i++) {
                const dataContainer = storageItem.Data[i];
                const containerItem = contextContainer.Create(dataContainer, null, null, dataKeyContainer, dataKeyContainer, null, i);
                const itemContainer = yield this.Application.Solver.ResolveItemDataPathObject(sector, containerItem, dataContainerPath);
                if (item == itemContainer)
                    return ('true');
            }
            return ('false');
        });
    }
    ExecuteFunctionUpdateSector(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let title = null;
            if (functionParsed.Parameters.length >= 3)
                title = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const canRouteText = functionParsed.Parameters[3];
            const canRoute = ((canRouteText == null) || (canRouteText == '')) ? true : yield this.Application.Solver.ResolveConditional(canRouteText);
            const canLoadDefaultSectorsText = functionParsed.Parameters.length >= 4 ? functionParsed.Parameters[4] : null;
            const canLoadDefaultSectors = ((canLoadDefaultSectorsText == null) || (canLoadDefaultSectorsText == '')) ? false : yield this.Application.Solver.ResolveConditional(canLoadDefaultSectorsText);
            const containerText = functionParsed.Parameters.length >= 5 ? functionParsed.Parameters[5] : null;
            let container = null;
            if (containerText !== null) {
                if (this.Application.Parser.IsMustache(containerText)) {
                    const dataPath = this.Application.Parser.ParseMustache(containerText);
                    let item = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
                    if ((item === null) || (item === '')) {
                        item = this.Application.Document.CreateGuid();
                        yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, item);
                    }
                    container = item.toString();
                }
                else {
                    container = containerText;
                }
            }
            const sectorName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const url = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            this.Application.Document.StartUpdate(sectorName);
            yield this.Application.Document.LoadChildSector(sectorName, url, title, canRoute, canLoadDefaultSectors, container);
            return ('');
        });
    }
    ExecuteFunctionSwitchSector(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectorName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const container = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            yield this.Application.SectorContainerHandler.Switch(sectorName, container);
            return ('');
        });
    }
    ExecuteFunctionReloadSector(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectorName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const url = this.Application.Router.GetLastRouteUrlBySector(sectorName);
            if (url == null)
                return ('');
            this.Application.Document.StartUpdate(sectorName);
            yield this.Application.Document.LoadChildSector(sectorName, url);
            return ('');
        });
    }
    ExecuteFunctionClearSector(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectorName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            this.Application.Document.StartUpdate(sectorName);
            yield this.Application.SectorContainerHandler.Switch(sectorName, null);
            return ('');
        });
    }
    ExecuteFunctionLoadSectorContent(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectorName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const content = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const contentText = this.Application.Serializer.SerializeObject(content);
            this.Application.Document.StartUpdate(sectorName);
            yield this.Application.Document.LoadChildSectorContent(sectorName, contentText);
            return ('');
        });
    }
    ExecuteFunctionClearData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.ClearData(dataKey, sector, notify);
            return ('');
        });
    }
    ExecuteFunctionUnloadData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.UnloadData(dataKey, sector);
            return ('');
        });
    }
    ExecuteFunctionCreateData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const object = {};
            for (let i = 2; i < functionParsed.Parameters.length - 1; i = i + 2) {
                const windowParameter = [null, null];
                const key = contextItem != null ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i]) : functionParsed.Parameters[i];
                const value = contextItem != null ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i + 1]) : functionParsed.Parameters[i + 1];
                object[key] = value;
            }
            yield this.Application.Storage.UpdateData(dataKey, sector, object, notify);
            return ('');
        });
    }
    ExecuteFunctionUpdateData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const recursiveText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : null;
            const recursive = ((recursiveText == null) || (recursiveText == '')) ? true : yield this.Application.Solver.ResolveConditional(recursiveText);
            const resolveText = functionParsed.Parameters.length > 4 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[4]) : null;
            const resolve = ((resolveText == null) || (resolveText == '')) ? true : yield this.Application.Solver.ResolveConditional(resolveText);
            const value = functionParsed.Parameters[1];
            const dataSource = resolve ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, value, true, recursive) : value;
            const data = this.Application.Solver.Clone(dataSource, true);
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.UpdateData(dataKey, sector, data, notify);
            return ('');
        });
    }
    ExecuteFunctionReloadData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.ReloadData(dataKey, sector, notify);
            return ('');
        });
    }
    ExecuteFunctionFilterData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (functionParsed.Parameters.length < 3)
                return ('');
            const forText = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const ifText = functionParsed.Parameters[1];
            const dataKeyDestination = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]);
            const notifyText = functionParsed.Parameters[3];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const hasIfText = (ifText != null);
            const parsedFor = this.Application.Parser.ParseFor(forText);
            if (parsedFor == null)
                return ('');
            const context = new DrapoContext();
            const key = parsedFor[0];
            const dataKeyIteratorRange = parsedFor[2];
            const range = this.Application.ControlFlow.GetIteratorRange(dataKeyIteratorRange);
            const dataKeyIterator = range == null ? dataKeyIteratorRange : this.Application.ControlFlow.CleanIteratorRange(dataKeyIteratorRange);
            const dataKey = dataKeyIterator;
            const dataKeyIteratorParts = this.Application.Parser.ParseForIterable(dataKeyIterator);
            const dataItem = yield this.Application.Storage.Retrieve(dataKey, sector, context, dataKeyIteratorParts);
            if (dataItem == null)
                return ('');
            const datasFiltered = [];
            let datas = dataItem.Data;
            if (datas == null)
                return ('');
            if (!datas.length)
                datas = this.Application.Solver.TransformObjectIntoArray(datas);
            if (range !== null)
                datas = this.Application.ControlFlow.ApplyRange(datas, range);
            if ((datas.length !== null) && (datas.length === 0))
                return ('');
            for (let j = 0; j < datas.length; j++) {
                const data = datas[j];
                const item = context.Create(data, null, null, dataKey, key, null, j);
                if (hasIfText) {
                    const conditional = yield this.Application.Solver.ResolveConditional(ifText, null, sector, context);
                    if (!conditional) {
                        context.Pop();
                        continue;
                    }
                }
                datasFiltered.push(data);
            }
            yield this.Application.Storage.UpdateData(dataKeyDestination, sector, datasFiltered, notify);
            return ('');
        });
    }
    ExecuteFunctionHasDataChanges(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let parameterSector = functionParsed.Parameters.length <= 0 ? null : yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            if (parameterSector === '=')
                parameterSector = sector;
            const parameterDataKeyOrDataGroup = functionParsed.Parameters.length <= 1 ? null : yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const storageItems = this.Application.Storage.RetrieveStorageItemsCached(parameterSector, parameterDataKeyOrDataGroup);
            for (let i = 0; i < storageItems.length; i++) {
                const storageItem = storageItems[i];
                if (storageItem.HasChanges)
                    return ('true');
            }
            return ('false');
        });
    }
    ExecuteFunctionAcceptDataChanges(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let parameterSector = functionParsed.Parameters.length <= 0 ? null : yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            if (parameterSector === '=')
                parameterSector = sector;
            const parameterDataKeyOrDataGroup = functionParsed.Parameters.length <= 1 ? null : yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const storageItems = this.Application.Storage.RetrieveStorageItemsCached(parameterSector, parameterDataKeyOrDataGroup);
            for (let i = 0; i < storageItems.length; i++) {
                const storageItem = storageItems[i];
                if (storageItem.HasChanges)
                    storageItem.HasChanges = false;
            }
            return ('');
        });
    }
    ExecuteFunctionPostData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            let dataKeyResponse = functionParsed.Parameters[1];
            if (dataKeyResponse == null)
                dataKeyResponse = dataKey;
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.PostData(dataKey, sector, dataKeyResponse, notify, executionContext);
            return ('');
        });
    }
    ExecuteFunctionPostDataItem(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = functionParsed.Parameters[0];
            let dataKeyResponse = functionParsed.Parameters[1];
            if (dataKeyResponse == null)
                dataKeyResponse = dataKey;
            const notifyText = functionParsed.Parameters[2];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.PostDataItem(dataKey, sector, dataKeyResponse, notify, executionContext);
            return ('');
        });
    }
    ExecuteFunctionReloadPage(sector, contextItem, element, event, functionParsed) {
        window.location.reload();
        return ('');
    }
    ExecuteFunctionClosePage(sector, contextItem, element, event, functionParsed) {
        window.location.href = "about:blank";
        return ('');
    }
    ExecuteFunctionRedirectPage(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const urlResolved = this.Application.Server.ResolveUrl(url);
            window.location.href = urlResolved;
            return ('');
        });
    }
    ExecuteFunctionUpdateURL(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            yield this.Application.Router.UpdateURL(url);
            return ('');
        });
    }
    ExecuteFunctionUpdateToken(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            yield this.Application.Server.SetToken(token);
            return ('');
        });
    }
    ExecuteFunctionClearToken(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Server.SetToken(null);
            return ('');
        });
    }
    ExecuteFunctionHasToken(sector, contextItem, element, event, functionParsed, executionContext) {
        return (this.Application.Server.HasToken().toString());
    }
    ExecuteFunctionUpdateTokenAntiforgery(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            yield this.Application.Server.SetTokenAntiforgery(token);
            return ('');
        });
    }
    ExecuteFunctionDestroyContainer(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemText = functionParsed.Parameters[0];
            let containerCode = null;
            if (this.Application.Parser.IsMustache(itemText)) {
                const dataPath = this.Application.Parser.ParseMustache(itemText);
                containerCode = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath);
            }
            else {
                containerCode = itemText;
            }
            this.Application.SectorContainerHandler.RemoveByContainer(containerCode);
            return ('');
        });
    }
    ExecuteFunctionIf(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const conditional = functionParsed.Parameters[0];
            const context = new DrapoContext(contextItem);
            const conditionalResult = yield this.Application.Solver.ResolveConditional(conditional, element, sector, context, null, null, executionContext, false);
            if (conditionalResult) {
                const statementTrue = functionParsed.Parameters[1];
                yield this.ResolveFunctionContext(sector, contextItem, element, event, statementTrue, executionContext);
            }
            else if (functionParsed.Parameters.length > 2) {
                const statementFalse = functionParsed.Parameters[2];
                yield this.ResolveFunctionContext(sector, contextItem, element, event, statementFalse, executionContext);
            }
            return ('');
        });
    }
    ExecuteFunctionAsync(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = functionParsed.Parameters[0];
            const executionContextContent = this.CreateExecutionContext(false);
            this.ResolveFunctionContext(sector, contextItem, element, event, content, executionContextContent);
            return ('');
        });
    }
    ExecuteFunctionNotify(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const dataIndex = this.Application.Parser.GetStringAsNumber(yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]));
            const dataFields = yield this.ResolveFunctionParameterDataFields(sector, contextItem, element, functionParsed.Parameters[2], executionContext);
            const canUseDifferenceText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : null;
            const canUseDifference = ((canUseDifferenceText == null) || (canUseDifferenceText == '')) ? true : yield this.Application.Solver.ResolveConditional(canUseDifferenceText);
            yield this.Application.Observer.Notify(dataKey, dataIndex, dataFields, canUseDifference);
            return ('');
        });
    }
    ExecuteFunctionFocus(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const did = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            if ((did === null) || (did === '') || (did === undefined)) {
                const elementFocused = document.activeElement;
                elementFocused.blur();
                return ('');
            }
            const elDid = this.Application.Searcher.FindLastByAttributeAndValue('d-id', did);
            if (elDid === null)
                return ('');
            const isSelectText = functionParsed.Parameters[1];
            const isSelect = ((isSelectText == null) || (isSelectText == '')) ? true : yield this.Application.Solver.ResolveConditional(isSelectText);
            elDid.focus();
            if (isSelect)
                this.Application.Document.Select(elDid);
            return ('');
        });
    }
    ExecuteFunctionShowWindow(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const windowParameters = [];
            let windowNameOrUri = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const isUri = this.Application.Parser.IsUri(windowNameOrUri);
            if (isUri)
                windowNameOrUri = yield this.Application.Storage.ResolveDataUrlMustaches(null, sector, windowNameOrUri, executionContext);
            const did = isUri ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : null;
            for (let i = isUri ? 2 : 1; i < functionParsed.Parameters.length - 1; i = i + 2) {
                const windowParameter = [null, null];
                windowParameter[0] = contextItem != null ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i]) : functionParsed.Parameters[i];
                windowParameter[1] = contextItem != null ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i + 1]) : functionParsed.Parameters[i + 1];
                windowParameters.push(windowParameter);
            }
            if (isUri)
                yield this.Application.WindowHandler.CreateAndShowWindow(windowNameOrUri, did, windowParameters);
            else
                yield this.Application.WindowHandler.CreateAndShowWindowDefinition(windowNameOrUri, windowParameters);
            return ('');
        });
    }
    ExecuteFunctionCloseWindow(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const did = functionParsed.Parameters.length > 0 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0], false, true) : null;
            if ((did === '') && (functionParsed.Parameters.length > 0) && (this.Application.Parser.HasFunction(functionParsed.Parameters[0])))
                return ('');
            const allText = functionParsed.Parameters.length > 1 ? functionParsed.Parameters[1] : 'false';
            const all = yield this.Application.Solver.ResolveConditional(allText);
            const type = functionParsed.Parameters.length > 2 ? functionParsed.Parameters[2] : null;
            yield this.Application.WindowHandler.CloseWindow(did, all, type);
            return ('');
        });
    }
    ExecuteFunctionHideWindow(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const did = functionParsed.Parameters.length > 0 ? functionParsed.Parameters[0] : null;
            const allText = functionParsed.Parameters.length > 1 ? functionParsed.Parameters[1] : 'false';
            const all = yield this.Application.Solver.ResolveConditional(allText);
            const type = functionParsed.Parameters.length > 2 ? functionParsed.Parameters[2] : null;
            const window = yield this.Application.WindowHandler.HideWindow(did, all);
            if (window !== null) {
                if (type !== 'noclose')
                    executionContext.AddWindowAutoClose(window);
            }
            return ('');
        });
    }
    ExecuteFunctionGetWindow(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const window = this.Application.WindowHandler.GetWindowByElement(element);
            if (window !== null)
                return (window.Code);
            return ('');
        });
    }
    ExecuteFunctionCreateGuid(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = this.Application.Document.CreateGuid();
            if (functionParsed.Parameters.length == 0)
                return (value);
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const dataField = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const notifyText = functionParsed.Parameters.length > 2 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, [dataField], value, notify);
            return ('');
        });
    }
    ExecuteFunctionCreateTick(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticks = new Date().getTime();
            const value = ticks.toString();
            if (functionParsed.Parameters.length == 0)
                return (value);
            const mustacheText = functionParsed.Parameters[0];
            const mustache = this.Application.Parser.ParseMustache(mustacheText);
            const dataKey = this.Application.Solver.ResolveDataKey(mustache);
            const dataFields = this.Application.Solver.ResolveDataFields(mustache);
            const notifyText = functionParsed.Parameters.length > 1 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, value, notify);
            return (value);
        });
    }
    ExecuteFunctionGetDate(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            const returnType = functionParsed.Parameters.length > 0 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]) : 'date';
            if (returnType.toUpperCase() == 'ISO')
                return (date.toISOString());
            return date;
        });
    }
    ExecuteFunctionAddDate(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dateParameter = functionParsed.Parameters.length > 0 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]) : null;
            const dateParameterParsed = this.Application.Parser.ParseDateCulture(dateParameter);
            const date = (dateParameterParsed != null) ? dateParameterParsed : new Date();
            const typeParameter = functionParsed.Parameters.length > 1 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : 'day';
            const type = typeParameter != null ? typeParameter : 'day';
            const incrementParameter = functionParsed.Parameters.length > 2 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[2]) : '1';
            const increment = this.Application.Parser.ParseNumber(incrementParameter, 1);
            if (type === 'day')
                date.setDate(date.getDate() + increment);
            else if (type === 'month')
                date.setMonth(date.getMonth() + increment);
            if (type === 'year')
                date.setFullYear(date.getFullYear() + increment);
            const returnType = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : 'date';
            if (returnType.toUpperCase() == 'ISO')
                return (date.toISOString());
            return date;
        });
    }
    ExecuteFunctionPushStack(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            executionContext.Stack.Push(value);
            return ('');
        });
    }
    ExecuteFunctionPopStack(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = executionContext.Stack.Pop();
            if (functionParsed.Parameters.length == 0)
                return (value);
            const mustacheText = functionParsed.Parameters[0];
            const mustache = this.Application.Parser.ParseMustache(mustacheText);
            const dataKey = this.Application.Solver.ResolveDataKey(mustache);
            const dataFields = this.Application.Solver.ResolveDataFields(mustache);
            const notifyText = functionParsed.Parameters.length > 1 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, value, notify);
            return (value);
        });
    }
    ExecuteFunctionPeekStack(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = executionContext.Stack.Peek();
            if (functionParsed.Parameters.length == 0)
                return (value);
            const mustacheText = functionParsed.Parameters[0];
            const mustache = this.Application.Parser.ParseMustache(mustacheText);
            const dataKey = this.Application.Solver.ResolveDataKey(mustache);
            const dataFields = this.Application.Solver.ResolveDataFields(mustache);
            const notifyText = functionParsed.Parameters.length > 1 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Storage.SetDataKeyField(dataKey, sector, dataFields, value, notify);
            return (value);
        });
    }
    ExecuteFunctionExecute(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectorFunction = functionParsed.Parameters.length > 1 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : sector;
            const valueFunction = yield this.ResolveFunctionParameter(sectorFunction, contextItem, element, executionContext, functionParsed.Parameters[0]);
            yield this.ResolveFunctionContext(sectorFunction, contextItem, element, event, valueFunction, executionContext);
            return ('');
        });
    }
    ExecuteFunctionExecuteDataItem(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const expression = functionParsed.Parameters[0];
            const forText = yield functionParsed.Parameters[1];
            const ifText = functionParsed.Parameters.length > 2 ? functionParsed.Parameters[2] : null;
            const hasIfText = (ifText != null);
            const allText = functionParsed.Parameters.length > 3 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[3]) : null;
            const all = ((allText == null) || (allText == '')) ? !hasIfText : yield this.Application.Solver.ResolveConditional(allText);
            const parsedFor = this.Application.Parser.ParseFor(forText);
            if (parsedFor == null)
                return ('');
            const forHierarchyText = yield functionParsed.Parameters[4];
            const context = new DrapoContext();
            const key = parsedFor[0];
            const dataKeyIteratorRange = parsedFor[2];
            const range = this.Application.ControlFlow.GetIteratorRange(dataKeyIteratorRange);
            const dataKeyIterator = range == null ? dataKeyIteratorRange : this.Application.ControlFlow.CleanIteratorRange(dataKeyIteratorRange);
            const dataKeyIteratorParts = this.Application.Parser.ParseForIterable(dataKeyIterator);
            const dataKey = dataKeyIteratorParts[0];
            const dataItem = yield this.Application.Storage.Retrieve(dataKey, sector, context, dataKeyIteratorParts);
            if (dataItem == null)
                return ('');
            let datas = (dataKeyIteratorParts.length > 1) ? this.Application.Solver.ResolveDataObjectPathObject(dataItem.Data, dataKeyIteratorParts) : dataItem.Data;
            if (datas == null)
                return ('');
            if (!datas.length)
                datas = this.Application.Solver.TransformObjectIntoArray(datas);
            if (range !== null)
                datas = this.Application.ControlFlow.ApplyRange(datas, range);
            if ((datas.length !== null) && (datas.length === 0))
                return ('');
            const ifTextResolved = this.ResolveExecutionContextMustache(sector, executionContext, ifText);
            yield this.Application.ControlFlow.ExecuteDataItem(sector, context, expression, dataKeyIterator, forHierarchyText, ifTextResolved, all, datas, dataKey, key, executionContext);
            return ('');
        });
    }
    ExecuteFunctionExecuteComponentFunction(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const did = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            if (did == null)
                return ('');
            const instance = this.Application.ComponentHandler.GetComponentInstance(sector, did);
            if (instance == null)
                return ('');
            const functionName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const instanceFunction = instance[functionName];
            if (instanceFunction == null)
                return ('');
            const parameters = [];
            for (let i = 2; i < functionParsed.Parameters.length; i++)
                parameters.push(yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i]));
            const result = instanceFunction.apply(instance, parameters);
            if (Promise.resolve(result) == result) {
                const resultPromise = result;
                yield resultPromise;
                return ('');
            }
            return ('');
        });
    }
    ExecuteFunctionExecuteInstanceFunction(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const instanceSectorParameter = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const instanceSector = ((instanceSectorParameter == null) || (instanceSectorParameter == '')) ? sector : instanceSectorParameter;
            const instance = this.Application.ComponentHandler.GetComponentInstance(instanceSector);
            if (instance == null)
                return ('');
            const functionName = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const instanceFunction = instance[functionName];
            if (instanceFunction == null)
                return ('');
            const parameters = [];
            for (let i = 3; i < functionParsed.Parameters.length; i++)
                parameters.push(yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i]));
            const result = instanceFunction.apply(instance, parameters);
            let value = result;
            if (Promise.resolve(result) == result) {
                const resultPromise = result;
                value = yield resultPromise;
            }
            const mustacheReturn = functionParsed.Parameters[2];
            if ((mustacheReturn !== null) && (mustacheReturn !== '')) {
                const dataPath = this.Application.Parser.ParseMustache(mustacheReturn);
                if (dataPath.length === 1)
                    yield this.Application.Storage.UpdateData(dataPath[0], sector, value, true);
                else
                    yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, value, true);
            }
            return ('');
        });
    }
    ExecuteFunctionCast(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = contextItem != null ? contextItem.Context : new DrapoContext();
            const value = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, executionContext, functionParsed.Parameters[0], null, false);
            const type = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            if (type === 'number')
                return (this.Application.Parser.ParseNumberBlock(value));
            return (value);
        });
    }
    ExecuteFunctionEncodeUrl(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = contextItem != null ? contextItem.Context : new DrapoContext();
            const value = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, executionContext, functionParsed.Parameters[0], null, false);
            const valueEncoded = this.Application.Server.EnsureUrlComponentEncoded(value);
            return (valueEncoded);
        });
    }
    ExecuteFunctionAddRequestHeader(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = new DrapoContext();
            const name = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const value = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            this.Application.Server.AddNextRequestHeader(name, value);
            return ('');
        });
    }
    ExecuteFunctionSetClipboard(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            yield this.Application.Document.SetClipboard(value);
            return ('');
        });
    }
    ExecuteFunctionCreateTimer(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = functionParsed.Parameters[0];
            const time = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const loopText = functionParsed.Parameters[2];
            const loop = ((loopText == null) || (loopText == '')) ? false : yield this.Application.Solver.ResolveConditional(loopText);
            const timeAsNumber = this.Application.Parser.ParseNumber(time, 0);
            const executionContextContent = this.CreateExecutionContext(false);
            const timerFunction = () => {
                this.ResolveFunctionContext(sector, contextItem, element, event, content, executionContextContent);
                if (loop)
                    setTimeout(timerFunction, timeAsNumber);
            };
            setTimeout(timerFunction, timeAsNumber);
            return ('');
        });
    }
    ExecuteFunctionCreateReference(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = functionParsed.Parameters[0];
            const mustacheReference = yield this.Application.Solver.CreateMustacheReference(sector, contextItem, value);
            return (mustacheReference);
        });
    }
    ExecuteFunctionWait(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const timeAsNumber = this.Application.Parser.ParseNumber(time, 0);
            yield this.Application.Document.Sleep(timeAsNumber);
            return ('');
        });
    }
    ExecuteFunctionDownloadData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyFile = functionParsed.Parameters[0];
            const storageItem = yield this.Application.Storage.RetrieveDataItemContext(dataKeyFile, sector, executionContext);
            if (storageItem === null)
                return ('');
            const namePath = this.Application.Solver.CreateDataPath(dataKeyFile, ['filename']);
            const name = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, namePath, true);
            const dataPath = this.Application.Solver.CreateDataPath(dataKeyFile, ['body']);
            const data = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, dataPath, true);
            const contentTypePath = this.Application.Solver.CreateDataPath(dataKeyFile, ['contenttype']);
            const contentType = yield this.Application.Solver.ResolveItemDataPathObject(sector, contextItem, contentTypePath, true);
            this.DownloadData(name, data, contentType);
            return ('');
        });
    }
    DownloadData(name, data, contentType) {
        const blob = this.CreateBlob(data, contentType);
        const navigator = window.navigator;
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, name);
        }
        else {
            const elDownloader = document.createElement('a');
            elDownloader.href = window.URL.createObjectURL(blob);
            elDownloader.download = name;
            elDownloader.style.display = 'none';
            document.body.appendChild(elDownloader);
            elDownloader.click();
            document.body.removeChild(elDownloader);
        }
    }
    CreateBlob(data, contentType) {
        if (data instanceof Blob)
            return (data);
        const dataCharacters = atob(data);
        const dataBytes = new Array(dataCharacters.length);
        for (let i = 0; i < dataCharacters.length; i++) {
            dataBytes[i] = dataCharacters.charCodeAt(i);
        }
        const bytes = new Uint8Array(dataBytes);
        const blob = new Blob([bytes], { type: contentType });
        return (blob);
    }
    ExecuteFunctionDetectView(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const views = yield this.Application.Config.GetViews();
            if (views == null)
                return ('');
            const context = new DrapoContext();
            for (let i = 0; i < views.length; i++) {
                const view = views[i];
                if (view.Condition == null)
                    return (view.Tag);
                if (yield this.Application.Solver.ResolveConditional(view.Condition, null, sector, context))
                    return (view.Tag);
            }
            return ('');
        });
    }
    ExecuteFunctionSetConfig(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const value = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]);
            const valueAsNumber = this.Application.Parser.ParseNumber(value, 0);
            const keyLower = key.toLowerCase();
            if (keyLower === 'timezone')
                this.Application.Config.SetTimezone(valueAsNumber);
            return ('');
        });
    }
    ExecuteFunctionGetConfig(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const keyLower = key.toLowerCase();
            if (keyLower === 'timezone') {
                const timeZone = this.Application.Config.GetTimezone();
                if (timeZone != null)
                    return (timeZone.toString());
            }
            return ('');
        });
    }
    ExecuteFunctionLockPlumber(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Plumber.Lock();
            return ('');
        });
    }
    ExecuteFunctionUnlockPlumber(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Plumber.Unlock();
            return ('');
        });
    }
    ExecuteFunctionLockData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            this.Application.Observer.Lock(dataKey);
            return ('');
        });
    }
    ExecuteFunctionUnlockData(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            const notifyText = functionParsed.Parameters.length > 1 ? yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[1]) : null;
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            yield this.Application.Observer.Unlock(dataKey, notify);
            return ('');
        });
    }
    ExecuteFunctionClearPlumber(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.Plumber.Clear();
            return ('');
        });
    }
    ExecuteFunctionClearSubscriptions(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[0]);
            this.Application.Observer.Unsubscribe(dataKey);
            return ('');
        });
    }
    ExecuteFunctionDebugger(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = [];
            for (let i = 0; i < functionParsed.Parameters.length; i++)
                parameters.push(yield this.ResolveFunctionParameter(sector, contextItem, element, executionContext, functionParsed.Parameters[i], true, true, true));
            yield this.Application.Debugger.ExecuteFunctionDebugger(parameters);
            return ('');
        });
    }
    ExecuteFunctionGetSector(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.Application.Document.GetSector(element));
        });
    }
    ExecuteFunctionGetClipboard(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = this.Application.Parser.ParseMustache(functionParsed.Parameters[0]);
            const notifyText = functionParsed.Parameters[1];
            const notify = ((notifyText == null) || (notifyText == '')) ? true : yield this.Application.Solver.ResolveConditional(notifyText);
            const value = yield this.Application.Document.GetClipboard();
            yield this.Application.Solver.UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, value, notify);
            return ('');
        });
    }
    ExecuteFunctionExecuteValidation(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const validation = functionParsed.Parameters[0];
            const isValid = yield this.Application.Validator.IsValidationExpressionValid(element, sector, validation, contextItem);
            return (isValid ? 'true' : 'false');
        });
    }
    ExecuteFunctionClearValidation(sector, contextItem, element, event, functionParsed, executionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const validation = functionParsed.Parameters[0];
            yield this.Application.Validator.UncheckValidationExpression(element, sector, validation, contextItem);
            return ('');
        });
    }
    HasFunctionMustacheContext(functionsValue, sector, renderContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let hasContext = renderContext.HasExpressionContext(sector, functionsValue);
            if (hasContext !== null)
                return (hasContext);
            hasContext = yield this.HasFunctionMustacheContextInternal(functionsValue, sector);
            renderContext.AddExpressionContext(sector, functionsValue, hasContext);
            return (hasContext);
        });
    }
    HasFunctionMustacheContextInternal(functionsValue, sector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.HasFunctionsContext(functionsValue))
                return (true);
            if (!this.Application.Parser.IsMustache(functionsValue))
                return (this.Application.Barber.HasMustacheContext(functionsValue, sector));
            const mustaches = this.Application.Parser.ParseMustaches(functionsValue);
            for (let j = 0; j < mustaches.length; j++) {
                const mustache = mustaches[j];
                const mustacheParts = this.Application.Parser.ParseMustache(mustache);
                const dataKey = this.Application.Solver.ResolveDataKey(mustacheParts);
                if (!this.Application.Storage.IsDataKey(dataKey, null))
                    return (true);
                const value = this.Application.Storage.GetDataKeyField(dataKey, sector, mustacheParts);
                if (value == null) {
                    yield this.Application.ExceptionHandler.HandleError('DrapoFunctionHandler - HasFunctionMustacheContext - Null Mustache - {0}', mustache);
                    return (false);
                }
                if (yield this.HasFunctionMustacheContextInternal(value, sector))
                    return (true);
            }
            return (false);
        });
    }
    HasFunctionsContext(functionsValue) {
        const functionsParsed = this.Application.Parser.ParseFunctions(functionsValue);
        for (let i = 0; i < functionsParsed.length; i++) {
            const functionParse = functionsParsed[i];
            const functionParsed = this.Application.Parser.ParseFunction(functionParse);
            if (functionParsed === null)
                continue;
            if (this.IsFunctionContext(functionParsed))
                return (true);
        }
        return (false);
    }
    GetFunctionsContext() {
        const functions = [];
        functions.push('removedataitem');
        return (functions);
    }
    IsFunctionContext(functionParsed) {
        const functions = this.GetFunctionsContext();
        if (this.Application.Solver.Contains(functions, functionParsed.Name))
            return (true);
        return (false);
    }
}
//# sourceMappingURL=DrapoFunctionHandler.js.map