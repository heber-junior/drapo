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
class DrapoSolver {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    ResolveConditional(expression, el = null, sector = null, context = null, renderContext = null, eljForTemplate = null, executionContext = null, canBind = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof expression === 'boolean')
                return (expression);
            if (typeof expression === 'number')
                return (expression > 0);
            const block = this.Application.Parser.ParseExpression(expression);
            const response = yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind);
            if (this.Application.Parser.HasMustache(response))
                return (yield this.ResolveConditional(response, el, sector, context, renderContext, eljForTemplate, executionContext, canBind));
            const responseBoolean = yield this.ResolveConditionalBoolean(response);
            return (responseBoolean);
        });
    }
    ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.EnsureExpressionItemCurrentLevelResolved(sector, context, renderContext, executionContext, el, block, eljForTemplate, canBind);
            this.JoinTexts(block);
            return (yield this.ResolveConditionalExpressionBlockOperation(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
        });
    }
    ResolveConditionalExpressionBlockOperation(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            if (block.Items.length === 0)
                return ('');
            yield this.EnsureExpressionItemResolved(sector, context, renderContext, executionContext, el, block, 0, eljForTemplate, canBind);
            const itemFirst = block.Items[0];
            if ((itemFirst.Type == DrapoExpressionItemType.Logical) || (itemFirst.Type == DrapoExpressionItemType.Comparator)) {
                const itemEmpty = new DrapoExpressionItem(DrapoExpressionItemType.Text, '');
                block.Items.unshift(itemEmpty);
                return (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
            }
            const resultFirst = itemFirst.Value;
            if (block.Items.length < 2)
                return (resultFirst);
            yield this.EnsureExpressionItemResolved(sector, context, renderContext, executionContext, el, block, 1, eljForTemplate, canBind);
            const itemSecond = block.Items[1];
            const resultSecond = itemSecond.Value;
            if ((resultSecond === '&&') && (!this.ResolveConditionalBoolean(resultFirst)))
                return ('false');
            if (resultFirst === '!') {
                const resultDenySecond = (!this.ResolveConditionalBoolean(resultSecond)).toString();
                const resultDenyItemSecond = new DrapoExpressionItem(DrapoExpressionItemType.Text, resultDenySecond);
                block.Items[0] = resultDenyItemSecond;
                block.Items.splice(1, 1);
                return (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
            }
            let resultThird = '';
            const hasMoreThanTwoTerms = block.Items.length > 2;
            if (hasMoreThanTwoTerms) {
                const itemThird = block.Items[2];
                if ((itemThird.Type == DrapoExpressionItemType.Logical) || (itemThird.Type == DrapoExpressionItemType.Comparator)) {
                    const itemEmpty = new DrapoExpressionItem(DrapoExpressionItemType.Text, '');
                    block.Items.splice(2, 0, itemEmpty);
                    return (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
                }
                yield this.EnsureExpressionItemResolved(sector, context, renderContext, executionContext, el, block, 2, eljForTemplate, canBind);
                resultThird = block.Items[2].Value;
            }
            if (resultThird === '!') {
                let resultFourth = 'false';
                if (block.Items.length > 3) {
                    yield this.EnsureExpressionItemResolved(sector, context, renderContext, executionContext, el, block, 3, eljForTemplate, canBind);
                    resultFourth = block.Items[3].Value;
                }
                const resultDenyFourth = (!this.ResolveConditionalBoolean(resultFourth)).toString();
                const resultDenyItemFourth = new DrapoExpressionItem(DrapoExpressionItemType.Text, resultDenyFourth);
                block.Items[2] = resultDenyItemFourth;
                if (block.Items.length > 3)
                    block.Items.splice(3, 1);
                return (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
            }
            if (this.HasBlockConditionalOperatorsNextResolve(block, 3))
                return (yield this.ResolveBlockConditionalOperatorsNext(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind, 3));
            const result = this.ResolveConditionalOperator(resultFirst, resultSecond, resultThird);
            const resultItem = new DrapoExpressionItem(DrapoExpressionItemType.Text);
            resultItem.Value = result;
            block.Items[0] = resultItem;
            block.Items.splice(1, hasMoreThanTwoTerms ? 2 : 1);
            return (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
        });
    }
    GetBlockConditionalOperatorsNextIndex(block, start) {
        for (let i = start; i < block.Items.length; i++) {
            const item = block.Items[i];
            if (item.Type == DrapoExpressionItemType.Logical)
                return (null);
            if (item.Type == DrapoExpressionItemType.Comparator)
                return (i);
        }
        return (null);
    }
    HasBlockConditionalOperatorsNextResolve(block, start) {
        const index = this.GetBlockConditionalOperatorsNextIndex(block, start);
        return (index !== null);
    }
    GetBlockConditionalOperatorsNextIndexStartingIndex(block, index) {
        if (((index - 2) >= 0) && (block.Items[index - 2].Type == DrapoExpressionItemType.Deny))
            return (index - 2);
        return (index - 1);
    }
    GetBlockConditionalOperatorsNextIndexEndingIndex(block, index) {
        if (index == (block.Items.length - 1))
            return (index);
        if (((index + 1) < block.Items.length) && (block.Items[index + 1].Type == DrapoExpressionItemType.Deny))
            return (index + 2);
        return (index + 1);
    }
    ResolveBlockConditionalOperatorsNext(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind, start) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.GetBlockConditionalOperatorsNextIndex(block, start);
            const startingIndex = this.GetBlockConditionalOperatorsNextIndexStartingIndex(block, index);
            const endingIndex = this.GetBlockConditionalOperatorsNextIndexEndingIndex(block, index);
            const blockConditional = block.CreateBlock(startingIndex, endingIndex);
            const valueConditional = yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, blockConditional, false);
            const itemConditinal = new DrapoExpressionItem(DrapoExpressionItemType.Text, valueConditional);
            block.Items[startingIndex] = itemConditinal;
            block.Items.splice(startingIndex + 1, (endingIndex - startingIndex));
            return (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, block, canBind));
        });
    }
    EnsureExpressionItemCurrentLevelResolved(sector, context, renderContext, executionContext, el, block, eljForTemplate, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < block.Items.length; i++) {
                const item = block.Items[i];
                if (item.Type === DrapoExpressionItemType.Function)
                    block.Items[i] = new DrapoExpressionItem(DrapoExpressionItemType.Text, (yield this.Application.FunctionHandler.ReplaceFunctionExpressionsContext(sector, context, item.Value, canBind, executionContext)));
                else if (item.Type === DrapoExpressionItemType.Mustache)
                    block.Items[i] = new DrapoExpressionItem(DrapoExpressionItemType.Text, (yield this.Application.Barber.ResolveControlFlowMustacheString(context, renderContext, executionContext, item.Value, el, sector, canBind, DrapoStorageLinkType.Render, eljForTemplate != null, eljForTemplate)));
            }
        });
    }
    JoinTexts(block) {
        for (let i = block.Items.length - 1; i > 0; i--) {
            const item = block.Items[i];
            if (item.Type !== DrapoExpressionItemType.Text)
                continue;
            const itemPrevious = block.Items[i - 1];
            if (itemPrevious.Type !== DrapoExpressionItemType.Text)
                continue;
            itemPrevious.Value = itemPrevious.Value + item.Value;
            block.Items.splice(i, 1);
        }
    }
    EnsureExpressionItemResolved(sector, context, renderContext, executionContext, el, block, index, eljForTemplate, canBind) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = block.Items[index];
            if (item.Type === DrapoExpressionItemType.Block)
                block.Items[index] = new DrapoExpressionItem(DrapoExpressionItemType.Text, (yield this.ResolveConditionalExpressionBlock(sector, context, renderContext, executionContext, el, eljForTemplate, item, canBind)).toString());
            else if (item.Type === DrapoExpressionItemType.Function)
                block.Items[index] = new DrapoExpressionItem(DrapoExpressionItemType.Text, (yield this.Application.FunctionHandler.ReplaceFunctionExpressionsContext(sector, context, item.Value, canBind, executionContext)));
            else if (item.Type === DrapoExpressionItemType.Mustache)
                block.Items[index] = new DrapoExpressionItem(DrapoExpressionItemType.Text, (yield this.Application.Barber.ResolveControlFlowMustacheString(context, renderContext, executionContext, item.Value, el, sector, canBind, DrapoStorageLinkType.Render, eljForTemplate != null, eljForTemplate)));
        });
    }
    ResolveConditionalBlock(block) {
        const parts = this.Application.Parser.ParseConditionalLogicalOrComparator(block);
        while (parts.length > 2) {
            const result = this.ResolveConditionalOperator(parts[0], parts[1], parts[2]);
            parts[0] = result;
            parts.splice(1, 2);
        }
        if (parts.length == 0)
            return (false);
        return (this.ResolveConditionalBoolean(parts[0]));
    }
    ResolveConditionalOperator(dataLeft, dataOperation, dataRight) {
        if (dataOperation == "||")
            return (((this.ResolveConditionalBoolean(dataLeft)) || (this.ResolveConditionalBoolean(dataRight))).toString());
        if (dataOperation == "&&")
            return (((this.ResolveConditionalBoolean(dataLeft)) && (this.ResolveConditionalBoolean(dataRight))).toString());
        if (dataOperation == "!=")
            return ((dataLeft !== dataRight).toString());
        if (dataOperation == "=")
            return ((dataLeft === dataRight).toString());
        if (dataOperation == "<")
            return ((this.ResolveConditionalOperatorLessThan(dataLeft, dataRight)).toString());
        if (dataOperation == "<=")
            return ((this.ResolveConditionalOperatorLessOrEqualThan(dataLeft, dataRight)).toString());
        if (dataOperation == ">")
            return ((this.ResolveConditionalOperatorGreaterThan(dataLeft, dataRight)).toString());
        if (dataOperation == ">=")
            return ((this.ResolveConditionalOperatorGreaterOrEqualThan(dataLeft, dataRight)).toString());
        if (dataOperation == "LIKE")
            return ((this.ResolveConditionalOperatorLike(dataLeft, dataRight)).toString());
        if (dataOperation == "+")
            return (this.ResolveOperationArithmeticAddition(dataLeft, dataRight));
        if (dataOperation == "-")
            return (this.ResolveOperationArithmeticSubtraction(dataLeft, dataRight));
        if (dataOperation == "*")
            return (this.ResolveOperationArithmeticMultiplication(dataLeft, dataRight));
        if (dataOperation == "/")
            return (this.ResolveOperationArithmeticDivision(dataLeft, dataRight));
        this.Application.ExceptionHandler.HandleError('Drapo: Conditional Operation {0} is not supported', dataOperation);
        return (dataLeft);
    }
    ResolveConditionalBoolean(data) {
        if ((data != null) && (typeof data === 'string'))
            data = data.toLowerCase();
        if (data == 'true')
            return (true);
        if (data == 'false')
            return (false);
        if (data == '!false')
            return (true);
        if (data == '!true')
            return (false);
        if (data == '!null')
            return (true);
        if (data == 'null')
            return (false);
        if (data == '!')
            return (true);
        return ((data != null) && (data != '') && ((data.length == 1) || (data[0] !== '!')));
    }
    ResolveConditionalOperatorLessThan(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, null);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, null);
        if ((numberLeft !== null) && (numberRight !== null))
            return (numberLeft < numberRight);
        return (dataLeft < dataRight);
    }
    ResolveConditionalOperatorLessOrEqualThan(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, null);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, null);
        if ((numberLeft !== null) && (numberRight !== null))
            return (numberLeft <= numberRight);
        return (dataLeft <= dataRight);
    }
    ResolveConditionalOperatorGreaterThan(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, null);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, null);
        if ((numberLeft !== null) && (numberRight !== null))
            return (numberLeft > numberRight);
        return (dataLeft > dataRight);
    }
    ResolveConditionalOperatorGreaterOrEqualThan(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, null);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, null);
        if ((numberLeft !== null) && (numberRight !== null))
            return (numberLeft >= numberRight);
        return (dataLeft >= dataRight);
    }
    ResolveConditionalOperatorLike(dataLeft, dataRight) {
        if ((dataLeft == null) || (dataLeft == ''))
            return (false);
        if ((dataRight == null) || (dataRight == ''))
            return (false);
        const isAnyLeft = dataRight[0] === '%';
        const isAnyRight = dataRight[dataRight.length - 1] === '%';
        const dataRightClean = ((!isAnyLeft) && (!isAnyRight)) ? dataRight : dataRight.substring((isAnyLeft ? 1 : 0), dataRight.length - (isAnyRight ? 1 : 0));
        const index = dataLeft.toLowerCase().indexOf(dataRightClean.toLowerCase());
        if ((index == null) || (index < 0))
            return (false);
        if ((isAnyLeft) && (isAnyRight))
            return (true);
        if ((isAnyRight) && (index == 0))
            return (true);
        if ((isAnyLeft) && (index == (dataLeft.length - dataRight.length)))
            return (true);
        return (false);
    }
    ResolveOperationArithmeticAddition(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, 0);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, 0);
        const numberResult = numberLeft + numberRight;
        return (numberResult.toString());
    }
    ResolveOperationArithmeticSubtraction(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, 0);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, 0);
        const numberResult = numberLeft - numberRight;
        return (numberResult.toString());
    }
    ResolveOperationArithmeticMultiplication(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, 0);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, 0);
        const numberResult = numberLeft * numberRight;
        return (numberResult.toString());
    }
    ResolveOperationArithmeticDivision(dataLeft, dataRight) {
        const numberLeft = this.Application.Parser.ParseNumberBlock(dataLeft, 0);
        const numberRight = this.Application.Parser.ParseNumberBlock(dataRight, 0);
        const numberResult = numberRight != 0 ? numberLeft / numberRight : 0;
        return (numberResult.toString());
    }
    CreateContextItemFromPath(sector, dataPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = dataPath[0];
            const context = new DrapoContext();
            const data = yield this.Application.Storage.RetrieveData(dataKey, sector);
            return (context.Create(data, null, null, dataKey, dataKey, null, null));
        });
    }
    CreateMustache(dataPath) {
        let mustache = '{{';
        for (let i = 0; i < dataPath.length; i++) {
            if (i > 0)
                mustache = mustache + '.';
            mustache = mustache + dataPath[i];
        }
        return (mustache + '}}');
    }
    CreateMustacheContext(context, mustacheParts, canResolveKey = true) {
        const mustacheContext = [];
        let updated = false;
        for (let i = 0; i < mustacheParts.length; i++) {
            const mustachePart = mustacheParts[i];
            const mustachePartNext = i < (mustacheParts.length - 1) ? mustacheParts[i + 1] : null;
            const mustacheSystem = mustachePartNext != null ? this.GetSystemContextPathValue(null, context, null, [mustachePart, mustachePartNext]) : null;
            if (mustacheSystem !== null) {
                return (mustacheSystem);
            }
            else {
                const mustacheRelative = this.CreateContextAbsoluteArray(context, mustachePart, canResolveKey);
                if (mustacheRelative === null) {
                    mustacheContext.push(mustachePart);
                }
                else {
                    for (let j = 0; j < mustacheRelative.length; j++)
                        mustacheContext.push(mustacheRelative[j]);
                    updated = true;
                }
            }
        }
        if (!updated)
            return (null);
        const mustacheRecursive = this.CreateMustache(mustacheContext);
        const mustacheRecursiveParts = this.Application.Parser.ParseMustache(mustacheRecursive);
        const mustacheRecursiveContext = this.CreateMustacheContext(context, mustacheRecursiveParts, false);
        if (mustacheRecursiveContext !== null)
            return (mustacheRecursiveContext);
        return (mustacheRecursive);
    }
    CreateContextAbsoluteArray(context, mustachePart, canResolveKey) {
        if ((canResolveKey) && (context.Item.Key === mustachePart)) {
            const contextKey = [];
            let hasInsertedContext = false;
            for (let i = 0; i < context.IndexRelatives.length; i++)
                if (this.AppendContextAbsoluteArray(context.Item, context.ItemsCurrentStack[i], context.IndexRelatives[i], contextKey, i === 0))
                    hasInsertedContext = true;
            this.AppendContextAbsoluteArray(context.Item, context.Item, context.IndexRelative, contextKey, !hasInsertedContext);
            return (contextKey);
        }
        for (let i = 0; i < context.ItemsCurrentStack.length; i++) {
            const itemCurrent = context.ItemsCurrentStack[i];
            if (itemCurrent.Key !== mustachePart)
                continue;
            return ([itemCurrent.Iterator, '[' + context.IndexRelatives[i] + ']']);
        }
        return (null);
    }
    AppendContextAbsoluteArray(itemCurrent, item, index, context, checkIndex) {
        if (!this.IsContextItemSameDataKey(itemCurrent, item))
            return (false);
        const iterators = this.Application.Parser.ParseForIterable(item.Iterator);
        if (iterators.length == 1)
            context.push(item.Iterator);
        else
            this.AppendContextAbsoluteIterators(item, context, iterators, checkIndex);
        context.push('[' + index + ']');
        return (true);
    }
    IsContextItemSameDataKey(itemCurrent, item) {
        if (item.DataKey == itemCurrent.DataKey)
            return (true);
        if (item.Key == itemCurrent.DataKey)
            return (true);
        return (false);
    }
    AppendContextAbsoluteIterators(item, context, iterators, checkIndex) {
        const start = ((checkIndex) && (item.DataKey === iterators[0])) ? 0 : 1;
        for (let i = start; i < iterators.length; i++)
            context.push(iterators[i]);
    }
    CreateMustacheReference(sector, contextItem, mustache) {
        return __awaiter(this, void 0, void 0, function* () {
            const mustacheContext = [];
            const mustacheParts = this.Application.Parser.ParseMustache(mustache);
            for (let i = 0; i < mustacheParts.length; i++) {
                const mustachePart = mustacheParts[i];
                if (contextItem != null) {
                    const mustacheRelative = this.GetContextItemAbsolute(contextItem, mustachePart);
                    for (let j = 0; j < mustacheRelative.length; j++)
                        mustacheContext.push(mustacheRelative[j]);
                }
                else {
                    mustacheContext.push(mustachePart);
                }
            }
            const dataKey = mustacheContext[0];
            const storageItem = yield this.Application.Storage.RetrieveDataItem(dataKey, sector);
            if (storageItem == null)
                return ('');
            const sectorStorage = storageItem.Sector != null ? storageItem.Sector : '';
            mustacheContext.splice(0, 0, '@' + sectorStorage);
            const mustacheReference = this.CreateMustache(mustacheContext);
            return (mustacheReference);
        });
    }
    GetContextItemAbsolute(contextItem, mustachePart) {
        if (contextItem.Key !== mustachePart)
            return ([mustachePart]);
        const iteratorParts = this.Application.Parser.ParseForIterable(contextItem.Iterator);
        const mustachePartsAbsolute = iteratorParts.concat('[' + contextItem.Index + ']');
        return (mustachePartsAbsolute);
    }
    ResolveDataPathMustache(context, executionContext, element, sector, mustacheParts) {
        return __awaiter(this, void 0, void 0, function* () {
            let updated = false;
            for (let i = 1; i < mustacheParts.length; i++) {
                const mustachePart = mustacheParts[i];
                if (!this.Application.Parser.IsMustache(mustachePart))
                    continue;
                const mustachePartParts = this.Application.Parser.ParseMustache(mustachePart);
                const dataValue = yield this.ResolveDataPath(context, executionContext, element, sector, mustachePartParts);
                mustacheParts[i] = dataValue;
                updated = true;
            }
            if (!updated)
                return (null);
            return (this.CreateMustache(mustacheParts));
        });
    }
    ExistDataPath(context, sector, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = this.Application.Solver.ResolveDataKey(path);
            const dataFields = this.Application.Solver.ResolveDataFields(path);
            const item = yield this.ResolveDataPathObjectItem(context.Item, dataKey, sector, true, path);
            if (item == null)
                return (false);
            return (this.ExistDataPathObject(item.Data, path));
        });
    }
    ExistDataPathObject(dataObject, dataPath) {
        let data = dataObject;
        for (let i = 1; i < dataPath.length; i++) {
            const currentKey = dataPath[i];
            const index = this.GetDataObjectPathObjectPropertyIndex(data, currentKey);
            if (index === null) {
                if ((data === null) || (data === undefined) || (data[currentKey] === undefined)) {
                    return (false);
                }
                data = data[currentKey];
            }
            else {
                if (!data.length)
                    return (false);
                data = data[index];
            }
        }
        if ((data === null) || (data === undefined))
            return (false);
        return (true);
    }
    ResolveDataPath(context, executionContext, element, sector, path, canBindReader = false, canBindWriter = false, modelEvents = null, modelEventsCancel = null, canNotify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPath = (typeof path === 'string') ? [path] : path;
            for (let i = 1; i < dataPath.length; i++) {
                const mustache = dataPath[i];
                const isMustacheIndexer = this.Application.Parser.IsMustacheIndexer(mustache);
                const mustacheIndexer = isMustacheIndexer ? this.Application.Parser.GetMustacheInsideIndexer(mustache) : mustache;
                if (!this.Application.Parser.IsMustache(mustacheIndexer))
                    continue;
                const mustacheParts = this.Application.Parser.ParseMustache(mustacheIndexer);
                const mustacheValue = yield this.ResolveDataPath(context, executionContext, element, sector, mustacheParts, canBindReader, canBindWriter, modelEvents, modelEventsCancel, canNotify);
                const mustacheValueIndexer = isMustacheIndexer ? this.Application.Parser.CreateMustacheIndexer(mustacheValue) : mustacheValue;
                dataPath[i] = mustacheValueIndexer;
            }
            const dataKey = this.Application.Solver.ResolveDataKey(dataPath);
            const dataFields = this.Application.Solver.ResolveDataFields(dataPath);
            if ((!context.IsKey(dataKey)) && (!this.Application.Storage.IsDataKeyExecution(dataKey)) && (!(yield this.Application.Storage.EnsureDataKeyFieldReady(dataKey, sector, dataPath)))) {
                if ((dataFields.length === 0))
                    return ('');
                if (this.Application.Storage.IsDataKeyDelay(dataKey, sector))
                    this.Application.Observer.SubscribeDelay(element, dataKey, dataFields);
                return (this.CreateMustache(dataPath));
            }
            const data = yield this.ResolveDataPathObject(sector, context, executionContext, dataPath);
            if (canBindWriter)
                this.Application.Binder.BindReaderWriter(yield this.ResolveDataPathObjectItem(context.Item, dataKey, sector), element, dataFields, modelEvents, modelEventsCancel, canNotify);
            else if (canBindReader)
                this.Application.Binder.BindReader(yield this.ResolveDataPathObjectItem(context.Item, dataKey, sector), element, dataFields);
            return (data);
        });
    }
    ResolveDataPathObject(sector, context, executionContext, dataPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.ResolveItemDataPathObject(sector, context.Item, dataPath, false, executionContext));
        });
    }
    ResolveItemDataPathObject(sector, contextItem, dataPath, canForceLoadDataDelay = false, executionContext = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const valueSystem = contextItem !== null ? this.GetSystemContextPathValue(sector, contextItem.Context, executionContext, dataPath) : null;
            if (valueSystem !== null)
                return (valueSystem);
            const valueExecutionContext = executionContext === null ? null : this.GetExecutionContextPathValue(sector, executionContext, dataPath);
            if (valueExecutionContext !== null)
                return (valueExecutionContext);
            const dataKey = dataPath[0];
            const item = yield this.ResolveDataPathObjectItem(contextItem, dataKey, sector, canForceLoadDataDelay, dataPath);
            if (item == null)
                return ('');
            return (this.ResolveDataObjectPathObject(item.Data, dataPath));
        });
    }
    ResolveItemStoragePathObject(item, dataPath) {
        const valueSystem = item !== null ? this.GetSystemPathValue(item, dataPath) : null;
        if (valueSystem !== null)
            return (valueSystem);
        return (this.ResolveDataObjectPathObject(item.Data, dataPath));
    }
    ResolveDataObjectPathObject(dataObject, dataPath, dataEnforce = null) {
        let data = dataObject;
        for (let i = 1; i < dataPath.length; i++) {
            const currentKey = dataPath[i];
            const index = this.GetDataObjectPathObjectPropertyIndex(data, currentKey);
            if (index === null) {
                if ((data === null) || (data === undefined) || (data[currentKey] === undefined)) {
                    if ((dataEnforce !== null) && (i === dataPath.length - 1)) {
                        data[currentKey] = dataEnforce;
                        return (dataEnforce);
                    }
                    return ('');
                }
                data = data[currentKey];
            }
            else {
                if (!data.length)
                    return ('');
                data = data[index];
            }
        }
        if ((data === null) || (data === undefined))
            return ('');
        return (data);
    }
    GetDataObjectPathObjectPropertyIndex(data, property) {
        if (property.length < 3)
            return (null);
        if (property[0] !== '[')
            return (null);
        if (property[property.length - 1] !== ']')
            return (null);
        const isHat = (property[1] === '^');
        const index = this.Application.Parser.ParseNumber(property.substring(isHat ? 2 : 1, property.length - 1));
        return (((isHat) && (data.length)) ? (data.length - index) : index);
    }
    ResolveDataObjectLookupHierarchy(data, searchField, searchValue, searchHierarchyField = null) {
        const dataList = data.length == null ? [data] : data;
        for (let i = 0; i < dataList.length; i++) {
            const dataCurrent = dataList[i];
            if (dataCurrent == null)
                continue;
            if ((searchHierarchyField != null) && (dataCurrent[searchHierarchyField] != null)) {
                const dataCurrentChild = this.ResolveDataObjectLookupHierarchy(dataCurrent[searchHierarchyField], searchField, searchValue, searchHierarchyField);
                if (dataCurrentChild != null)
                    return (dataCurrentChild);
            }
            const itemValue = searchField == '_Index' ? i : dataCurrent[searchField];
            if (itemValue == searchValue)
                return (dataCurrent);
        }
        return (null);
    }
    UpdateDataObjectLookupHierarchy(data, searchField, searchValue, value, searchHierarchyField = null) {
        const dataList = data.length == null ? [data] : data;
        for (let i = 0; i < dataList.length; i++) {
            const dataCurrent = dataList[i];
            if (dataCurrent == null)
                continue;
            if ((searchHierarchyField != null) && (dataCurrent[searchHierarchyField] != null)) {
                const updated = this.UpdateDataObjectLookupHierarchy(dataCurrent[searchHierarchyField], searchField, searchValue, value, searchHierarchyField);
                if (updated != null)
                    return (updated);
            }
            const itemValue = searchField == '_Index' ? i : dataCurrent[searchField];
            if ((itemValue != null) && (itemValue == searchValue)) {
                dataList[i] = value;
                return (true);
            }
        }
        return (null);
    }
    ContainsItemStoragePathObject(item, dataPath) {
        let data = item.Data;
        for (let i = 1; i < dataPath.length; i++) {
            const currentKey = dataPath[i];
            if ((data === null) || (data === undefined) || (data[currentKey] === undefined)) {
                return (false);
            }
            data = data[currentKey];
        }
        return (true);
    }
    ResolveDataPathObjectItem(contextItem, dataKey, sector, canForceLoadDataDelay = false, dataPath = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = contextItem;
            while (item != null) {
                if (item.Key == dataKey)
                    return (item);
                item = item.Parent;
            }
            const dataItem = yield this.Application.Storage.RetrieveDataItem(dataKey, sector, canForceLoadDataDelay, null);
            if (dataItem == null)
                return (null);
            if ((canForceLoadDataDelay) && (dataItem.IsDelay))
                yield this.Application.Storage.EnsureDataDelayLoaded(dataItem, dataPath);
            const context = new DrapoContext();
            return (context.Create(dataItem.Data, null, null, dataKey, null, null, null));
        });
    }
    ResolveSector(mustacheParts, sector) {
        if (mustacheParts.length == 0)
            return (sector);
        const mustacheSector = mustacheParts[0];
        if (mustacheSector === '@')
            return (null);
        if (mustacheSector.indexOf("@") === 0)
            return (mustacheSector.substring(1));
        return (sector);
    }
    HasMustachePartsSector(mustacheParts) {
        if (mustacheParts == null)
            return (false);
        const part = mustacheParts[0];
        if (part == null)
            return (false);
        if (part.length == 0)
            return (false);
        return (part[0] === '@');
    }
    ResolveDataKey(mustacheParts) {
        const index = this.HasMustachePartsSector(mustacheParts) ? 1 : 0;
        return (mustacheParts[index]);
    }
    ResolveDataFields(mustacheParts) {
        const dataFields = [];
        const start = this.HasMustachePartsSector(mustacheParts) ? 2 : 1;
        for (let i = start; i < mustacheParts.length; i++)
            dataFields.push(mustacheParts[i]);
        return (dataFields);
    }
    CreateDataPath(dataKey, dataFields) {
        const path = [];
        path.push(dataKey);
        if (dataFields != null) {
            for (let i = 0; i < dataFields.length; i++)
                path.push(dataFields[i]);
        }
        return (path);
    }
    CombineDataPath(dataPath1, dataPath2) {
        const path = [];
        if (dataPath1 != null)
            for (let i = 0; i < dataPath1.length; i++)
                path.push(dataPath1[i]);
        if (dataPath2 != null)
            for (let i = 0; i < dataPath2.length; i++)
                path.push(dataPath2[i]);
        return (path);
    }
    GetDataPathParent(dataPath) {
        const dataPathParent = [];
        for (let i = 0; i < dataPath.length - 1; i++)
            dataPathParent.push(dataPath[i]);
        return (dataPathParent);
    }
    UpdateItemDataPathObject(sector, contextItem, executionContext, dataPath, value, canNotify = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = dataPath[0];
            if ((executionContext != null) && (this.Application.Storage.IsDataKeyExecution(key))) {
                const data = this.GetExecutionContextPathValueStack(sector, executionContext, dataPath);
                dataPath.splice(1, 1);
                if (this.UpdateDataPathObject(data, dataPath, value))
                    return (true);
                return (false);
            }
            if (contextItem === null || dataPath.length === 1) {
                const storageItem = yield this.Application.Storage.RetrieveDataItem(key, sector);
                if (storageItem === null)
                    return (false);
                if (dataPath.length === 1) {
                    if (storageItem.Data === value)
                        return (false);
                    storageItem.Data = value;
                }
                else {
                    if (!this.UpdateDataPathObject(storageItem.Data, dataPath, value))
                        return (false);
                }
                storageItem.HasChanges = true;
                if (canNotify)
                    yield this.Application.Observer.Notify(key, null, this.ResolveDataFields(dataPath));
                return (true);
            }
            const item = yield this.ResolveDataPathObjectItem(contextItem, key, sector);
            if (item == null)
                return (false);
            if (!this.UpdateDataPathObject(item.Data, dataPath, value))
                return (false);
            if (canNotify)
                yield this.Application.Observer.Notify(item.DataKey, item.Index, this.ResolveDataFields(dataPath));
            return (true);
        });
    }
    UpdateDataPathObject(data, dataPath, value) {
        for (let i = 1; i < dataPath.length - 1; i++) {
            const currentKey = dataPath[i];
            const index = this.GetDataObjectPathObjectPropertyIndex(data, currentKey);
            if (index === null) {
                if ((data === null) || (data === undefined) || (data[currentKey] === undefined)) {
                    return (false);
                }
                data = data[currentKey];
            }
            else {
                if (!data.length)
                    return (false);
                data = data[index];
            }
        }
        if (data == null)
            return (false);
        const dataField = dataPath[dataPath.length - 1];
        const indexDataField = this.GetDataObjectPathObjectPropertyIndex(data, dataField);
        if (indexDataField === null) {
            if (data[dataField] === value)
                return (false);
            data[dataField] = value;
        }
        else {
            if (data[indexDataField] === value)
                return (false);
            data[indexDataField] = value;
        }
        return (true);
    }
    IsPrimitive(object) {
        if (object === null)
            return (true);
        if (typeof object === "string")
            return (true);
        if (typeof object === "number")
            return (true);
        if (typeof object === "boolean")
            return (true);
        if (typeof object === "bigint")
            return (true);
        if (typeof object === "undefined")
            return (true);
        if (typeof object === "symbol")
            return (true);
        return (false);
    }
    Clone(object, deepCopy = false) {
        if (this.IsPrimitive(object))
            return (object);
        if (object instanceof Date)
            return (new Date(object.getTime()));
        if (Array.isArray(object))
            return (this.CloneArray(object, deepCopy));
        return (this.CloneObject(object, deepCopy));
    }
    CloneObject(object, deepCopy) {
        const clone = {};
        for (const property in object) {
            if (!Object.prototype.hasOwnProperty.call(object, property))
                continue;
            if (deepCopy)
                clone[property] = this.Clone(object[property], true);
            else
                clone[property] = object[property];
        }
        return (clone);
    }
    CloneArray(object, deepCopy) {
        const clone = [];
        for (let i = 0; i < object.length; i++) {
            if (deepCopy)
                clone.push(this.Clone(object[i], deepCopy));
            else
                clone.push(object[i]);
        }
        return (clone);
    }
    CloneArrayString(list) {
        if (list == null)
            return (null);
        const clone = [];
        for (let i = 0; i < list.length; i++)
            clone.push(list[i]);
        return (clone);
    }
    CloneArrayElement(list) {
        if (list == null)
            return (null);
        const clone = [];
        for (let i = 0; i < list.length; i++)
            clone.push(list[i]);
        return (clone);
    }
    CloneArrayAny(list) {
        if (list == null)
            return (null);
        const clone = [];
        for (let i = 0; i < list.length; i++)
            clone.push(list[i]);
        return (clone);
    }
    GetSystemContextPathValue(sector, context, executionContext, dataPath) {
        if (this.Application.Storage.IsDataKeyExecution(dataPath[0]))
            return (this.GetExecutionContextPathValueSolved(sector, executionContext, dataPath));
        if (dataPath.length != 2)
            return (null);
        const property = dataPath[1];
        if (property.charAt(0) !== '_')
            return (null);
        if (context.Item === null)
            return (null);
        const propertyLower = property.toLowerCase();
        const key = dataPath[0];
        if (propertyLower === '_index')
            return (this.GetSystemContextPathValueIndex(context, key));
        if (propertyLower === '_indexrelative')
            return (this.GetSystemContextPathValueIndexRelative(context, key));
        if (context.Item.Key !== key)
            return (null);
        if (propertyLower === '_level')
            return (this.GetSystemContextPathValueLevel(context));
        if (propertyLower === '_haschanges')
            return (this.GetSystemContextPathValueHasChanges(sector, context.Item.DataKey));
        return (null);
    }
    GetExecutionContextPathValueSolved(sector, executionContext, dataPath) {
        const data = this.GetExecutionContextPathValueStack(sector, executionContext, dataPath);
        dataPath.splice(1, 1);
        return (this.ResolveDataObjectPathObject(data, dataPath));
    }
    GetExecutionContextPathValue(sector, executionContext, dataPath) {
        if (dataPath.length != 2)
            return (null);
        const obj = dataPath[0];
        if (obj.toLowerCase() === '_stack')
            return (this.GetExecutionContextPathValueStack(sector, executionContext, dataPath));
        return (null);
    }
    GetExecutionContextPathValueStack(sector, executionContext, dataPath) {
        const property = dataPath[1].toLowerCase();
        if (property === 'peek')
            return (executionContext.Stack.Peek());
        if (property === 'pop')
            return (executionContext.Stack.Pop());
        return (null);
    }
    GetSystemPathValue(item, dataPath) {
        if (dataPath.length != 2)
            return (null);
        const property = dataPath[1];
        if (property.charAt(0) !== '_')
            return (null);
        if (item === null)
            return (null);
        const propertyLower = dataPath[1].toLowerCase();
        if (propertyLower === '_haschanges')
            return (item.HasChanges.toString());
        return (null);
    }
    GetSystemContextPathValueIndex(context, key) {
        const index = context.GetIndex(key);
        if (index === null)
            return (null);
        return (index.toString());
    }
    GetSystemContextPathValueIndexRelative(context, key) {
        const indexRelative = context.GetIndexRelative(key);
        if (indexRelative === null)
            return (null);
        return (indexRelative.toString());
    }
    GetSystemContextPathValueLevel(context) {
        return (context.Level.toString());
    }
    GetSystemContextPathValueHasChanges(sector, dataKey) {
        return (this.Application.Storage.HasChanges(sector, dataKey).toString());
    }
    ResolveSystemContextPath(sector, context, expression) {
        if (expression.indexOf('._') < 0)
            return (expression);
        const mustaches = this.Application.Parser.ParseMustaches(expression);
        for (let i = 0; i < mustaches.length; i++) {
            const mustache = mustaches[i];
            const dataPath = this.Application.Parser.ParseMustache(mustache);
            const data = this.GetSystemContextPathValue(sector, context, null, dataPath);
            if (data === null)
                continue;
            expression = expression.replace(mustache, data);
        }
        return (expression);
    }
    TransformObjectIntoArray(object) {
        const array = [];
        for (const property in object) {
            const objectProperty = {};
            objectProperty.Key = property;
            objectProperty.Value = object[property];
            array.push(objectProperty);
        }
        return (array);
    }
    ResolveUrlToAbsolute(urlRelative) {
        if (urlRelative.search(/^\/\//) != -1)
            return (window.location.protocol + urlRelative);
        if (urlRelative.search(/:\/\//) != -1)
            return (urlRelative);
        if (urlRelative.search(/^\//) != -1)
            return window.location.origin + urlRelative;
        const base = window.location.href.match(/(.*\/)/)[0];
        return (base + urlRelative);
    }
    Contains(data, item) {
        for (let i = 0; i < data.length; i++)
            if (data[i] == item)
                return (true);
        return (false);
    }
    Join(list1, list2) {
        const list = [];
        for (let i = 0; i < list1.length; i++)
            list.push(list1[i]);
        for (let i = 0; i < list2.length; i++) {
            const value = list2[i];
            if (!this.Contains(list, value))
                list.push(value);
        }
        return (list);
    }
    Get(dictionary, key) {
        for (let i = 0; i < dictionary.length; i++) {
            const keyValue = dictionary[i];
            if (keyValue[0] === key)
                return (keyValue[1]);
        }
        return (null);
    }
    IsEqualAny(data1, data2) {
        const isData1Null = (data1 == null);
        const isData2Null = (data2 == null);
        if (isData1Null !== isData2Null)
            return (false);
        if (isData1Null)
            return (true);
        const isData1Array = Array.isArray(data1);
        const isData2Array = Array.isArray(data2);
        if (isData1Array !== isData2Array)
            return (false);
        if (isData1Array)
            return (this.IsEqualObjectArray(data1, data2));
        const isData1Object = (typeof data1 == 'object');
        const isData2Object = (typeof data2 == 'object');
        if (isData1Object !== isData2Object)
            return (false);
        if (isData1Object)
            return (this.IsEqualObject(data1, data2));
        return (false);
    }
    IsEqualObject(value1, value2) {
        const value1Properties = this.GetObjectProperties(value1);
        const value2Properties = this.GetObjectProperties(value2);
        if (value1Properties.length !== value2Properties.length)
            return (false);
        for (let i = 0; i < value1Properties.length; i++) {
            const value1Property = value1Properties[i];
            const value2Property = value2Properties[i];
            if (value1Property[0] !== value2Property[0])
                return (false);
            if (value1Property[1] !== value2Property[1])
                return (false);
        }
        return (true);
    }
    GetObjectProperties(value) {
        const valueAsAny = value;
        const properties = [];
        for (const propertyName in value) {
            properties.push([propertyName, valueAsAny[propertyName]]);
        }
        return (properties);
    }
    IsEqualObjectArray(value1, value2) {
        if (value1.length !== value2.length)
            return (false);
        for (let i = 0; i < value1.length; i++) {
            if (!this.IsEqualObject(value1[i], value2[i]))
                return (false);
        }
        return (true);
    }
    IsEqualStringArray(list1, list2) {
        if (list1.length !== list2.length)
            return (false);
        for (let i = 0; i < list1.length; i++)
            if (list1[i] !== list2[i])
                return (false);
        return (true);
    }
    IsEqualString(value1, value2) {
        const value1String = this.EnsureString(value1);
        const value2String = this.EnsureString(value2);
        return (value1String === value2String);
    }
    EnsureString(data) {
        if (data === null)
            return (data);
        if (typeof data === 'object')
            return ('object');
        if (typeof data === 'string')
            return (data);
        return (data.toString());
    }
    Replace(data, from, to) {
        if (from === '.')
            from = '\\.';
        const regex = new RegExp(from, 'g');
        const dataReplaced = data.replace(regex, to);
        return (dataReplaced);
    }
    ResolveMathematicalExpression(data) {
        const tokens = this.Application.Parser.ParseBlockMathematicalExpression(data);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if ((token.length > 2) && (token[0] === '(') && (token[token.length - 1] === ')'))
                tokens[i] = this.ResolveMathematicalExpression(token.substring(1, token.length - 1));
        }
        for (let i = 0; i < tokens.length - 2; i++) {
            const token = tokens[i + 1];
            if (token !== '*')
                continue;
            const blockMultiFirstParameter = tokens[i];
            const blockMultiSecondParameter = tokens[i + 2];
            const blockMultiValue = (this.Application.Parser.ParseNumber(blockMultiFirstParameter) * this.Application.Parser.ParseNumber(blockMultiSecondParameter)).toString();
            tokens[i] = blockMultiValue;
            tokens.splice(i + 1, 2);
            i--;
        }
        for (let i = 0; i < tokens.length - 2; i++) {
            const token = tokens[i + 1];
            if (token !== '/')
                continue;
            const blockDivisionFirstParameter = tokens[i];
            const blockDivisionSecondParameter = tokens[i + 2];
            const numberDividend = this.Application.Parser.ParseNumber(blockDivisionSecondParameter);
            const blockDivisionValue = numberDividend == 0 ? '0' : (this.Application.Parser.ParseNumber(blockDivisionFirstParameter) / numberDividend).toString();
            tokens[i] = blockDivisionValue;
            tokens.splice(i + 1, 2);
            i--;
        }
        for (let i = 0; i < tokens.length - 2; i++) {
            const token = tokens[i + 1];
            if (token !== '+')
                continue;
            const blockPlusFirstParameter = tokens[i];
            const blockPlusSecondParameter = tokens[i + 2];
            const blockPlusValue = (this.Application.Parser.ParseNumber(blockPlusFirstParameter) + this.Application.Parser.ParseNumber(blockPlusSecondParameter)).toString();
            tokens[i] = blockPlusValue;
            tokens.splice(i + 1, 2);
            i--;
        }
        for (let i = 0; i < tokens.length - 2; i++) {
            const token = tokens[i + 1];
            if (token !== '-')
                continue;
            const blockMinusFirstParameter = tokens[i];
            const blockMinusSecondParameter = tokens[i + 2];
            const blockMinusValue = (this.Application.Parser.ParseNumber(blockMinusFirstParameter) - this.Application.Parser.ParseNumber(blockMinusSecondParameter)).toString();
            tokens[i] = blockMinusValue;
            tokens.splice(i + 1, 2);
            i--;
        }
        return (tokens[0]);
    }
}
//# sourceMappingURL=DrapoSolver.js.map