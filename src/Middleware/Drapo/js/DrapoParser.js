"use strict";
class DrapoParser {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this.MUSTACHE_START = '{{';
        this.MUSTACHE_START_OVERFLOW = '{{{';
        this.MUSTACHE_END = '}}';
        this.MUSTACHE_INDEXER_START = '[';
        this.MUSTACHE_INDEXER_END = ']';
        this.ITERATOR_START = '(';
        this.ITERATOR_END = ')';
        this.CLASS_START = '{';
        this.CLASS_END = '}';
        this._tokensStart = [' ', '{', '=', '!', '<', '>', '&', '|', '-', '+', '*', '/'];
        this._tokensBlock = [['&', '&'], ['|', '|'], ['!', '='], ['>', '='], ['<', '=']];
        this._tokensComparator = ['=', '!=', '>', '>=', '<', '<=', 'LIKE'];
        this._tokensLogical = ['&&', '||'];
        this._tokensArithmetic = ['+', '-', '*', '/'];
        this._canUseRegexGroups = false;
        this._application = application;
    }
    Tokenize(data, splitter = " ") {
        if (data == null)
            return (null);
        return (data.split(splitter));
    }
    ParseFor(data) {
        const parse = this.Tokenize(data);
        if (parse == null)
            return (null);
        if (parse.length != 3) {
            this.Application.ExceptionHandler.HandleError('The for syntax is wrong. Waiting 3 arguments in : {0} ', data);
            return (null);
        }
        if (parse[1] != 'in') {
            this.Application.ExceptionHandler.HandleError('The for syntax is wrong. Expecting "in" in the second argument: {0} ', data);
            return (null);
        }
        return (parse);
    }
    ParseForIterable(data) {
        const parse = this.Tokenize(data, '.');
        return (parse);
    }
    ParseMustaches(data, checkEmbedded = false) {
        const mustaches = this.ParseMustachesInternal(data);
        if (!checkEmbedded)
            return (mustaches);
        for (let i = 0; i < mustaches.length; i++) {
            const mustache = mustaches[i];
            const mustachesEmbedded = this.ParseMustachesInternal(mustache.substr(2, mustache.length - 4));
            for (let j = 0; j < mustachesEmbedded.length; j++)
                mustaches.push(mustachesEmbedded[j]);
        }
        return (mustaches);
    }
    ParseMustachesInternal(data) {
        const mustaches = [];
        let opened = 0;
        const length = data.length - 1;
        let start = 0;
        for (let i = 0; i < length; i++) {
            const block = data.substr(i, 2);
            if (block === this.MUSTACHE_START) {
                if (opened === 0)
                    start = i;
                opened++;
                i++;
            }
            else if (block === this.MUSTACHE_END) {
                opened--;
                i++;
                if (opened !== 0)
                    continue;
                let mustache = data.substring(start, i + 1);
                while (mustache.indexOf(this.MUSTACHE_START_OVERFLOW) === 0)
                    mustache = mustache.substring(1);
                mustaches.push(mustache);
            }
        }
        return (mustaches);
    }
    IsMustache(data) {
        if (data === null)
            return (false);
        if (!((typeof data === 'string') || (data instanceof String)))
            return (false);
        if (data.length < 4)
            return (false);
        return ((data.substr(0, 2) == this.MUSTACHE_START) && (data.substr(data.length - 2, 2) == this.MUSTACHE_END));
    }
    IsMustacheContentValid(data) {
        if (!this.IsMustache(data))
            return (false);
        return ((this.GetMatchs(data, this.MUSTACHE_START)) === (this.GetMatchs(data, this.MUSTACHE_END)));
    }
    IsMustacheIndexer(data) {
        if (data === null)
            return (false);
        if (data.length < 3)
            return (false);
        if (data[0] !== this.MUSTACHE_INDEXER_START)
            return (false);
        if (data[data.length - 1] !== this.MUSTACHE_INDEXER_END)
            return (false);
        return (this.IsMustache(data.substring(this.MUSTACHE_INDEXER_START.length, data.length - this.MUSTACHE_INDEXER_END.length)));
    }
    GetMustacheInsideIndexer(data) {
        return (data.substring(this.MUSTACHE_INDEXER_START.length, data.length - this.MUSTACHE_INDEXER_END.length));
    }
    CreateMustacheIndexer(data) {
        return (this.MUSTACHE_INDEXER_START + data + this.MUSTACHE_INDEXER_END);
    }
    GetMatchs(data, search) {
        let hits = 0;
        let indexStart = 0;
        while ((indexStart = data.indexOf(search, indexStart)) >= 0) {
            hits++;
            indexStart = indexStart + search.length;
        }
        return (hits);
    }
    HasMustache(data) {
        if (data === null)
            return (false);
        if (!((typeof data === 'string') || (data instanceof String)))
            return (false);
        return (data.indexOf(this.MUSTACHE_START) > -1);
    }
    ParseMustache(data) {
        const mustache = data.substr(2, data.length - 4);
        const mustacheFields = [];
        let opened = 0;
        const length = data.length;
        let start = 0;
        for (let i = 0; i < length; i++) {
            const block = mustache.substr(i, 2);
            if (block === this.MUSTACHE_START) {
                opened++;
                i++;
            }
            else if (block === this.MUSTACHE_END) {
                opened--;
                i++;
            }
            else if ((opened === 0) && (mustache[i] === '.')) {
                mustacheFields.push(mustache.substring(start, i));
                start = i + 1;
            }
        }
        if (start !== length)
            mustacheFields.push(mustache.substring(start, length));
        return (mustacheFields);
    }
    ParseProperty(data) {
        return (this.Tokenize(data, '-'));
    }
    ParsePath(data) {
        return (this.Tokenize(data, '.'));
    }
    HasFunction(data) {
        const functions = this.ParseFunctions(data);
        for (let i = 0; i < functions.length; i++)
            if (this.IsFunction(functions[i]))
                return (true);
        return (false);
    }
    IsFunction(data) {
        const functionParsed = this.ParseFunction(data, false);
        return (functionParsed != null);
    }
    ParseFunctionsPartial(data) {
        const functions = [];
        let buffer = '';
        let blockCount = 0;
        for (let i = 0; i < data.length; i++) {
            const chr = data[i];
            if (chr === '(') {
                blockCount++;
                buffer += chr;
            }
            else if (chr === ')') {
                blockCount--;
                buffer += chr;
                if (blockCount === 0) {
                    if (buffer[0] !== '(')
                        functions.push(buffer);
                    buffer = '';
                }
            }
            else if ((blockCount === 0) && (this.IsFunctionPartialDelimiter(chr))) {
                buffer = '';
            }
            else {
                buffer += chr;
            }
        }
        return (functions);
    }
    IsFunctionPartialDelimiter(data) {
        if (data === ' ')
            return (true);
        if (data === ':')
            return (true);
        if (data === ';')
            return (true);
        if (data === '=')
            return (true);
        return (false);
    }
    ParseFunctions(data) {
        const functions = this.ParseBlock(data, ';');
        for (let i = functions.length - 1; i >= 0; i--) {
            const functionText = functions[i];
            const functionStartIndex = this.GetFunctionStart(functionText);
            if (functionStartIndex === 0)
                continue;
            functions[i] = functionText.substring(functionStartIndex);
        }
        return (functions);
    }
    GetFunctionStart(functionText) {
        for (let i = 0; i < functionText.length; i++)
            if (this.IsFunctionStartValid(functionText[i]))
                return (i);
        return (functionText.length);
    }
    IsFunctionStartValid(character) {
        if (character === ' ')
            return (false);
        if (character === '!')
            return (false);
        return (true);
    }
    ParseFunction(data, checkParameters = true) {
        const indexStart = data.indexOf('(');
        if (indexStart <= 0)
            return (null);
        if (data[data.length - 1] !== ')')
            return (null);
        const functionParsed = new DrapoFunction();
        const name = data.substr(0, indexStart).toLowerCase();
        if (!this.IsValidFunctionName(name))
            return (null);
        functionParsed.Name = name;
        functionParsed.Parameters = this.ParseParameters(data.substr(indexStart + 1, (data.length - (indexStart + 2))));
        if (!checkParameters)
            return (functionParsed);
        for (let i = functionParsed.Parameters.length - 1; i >= 0; i--)
            if (!this.IsValidFunctionParameter(functionParsed.Parameters[i]))
                return (null);
        return (functionParsed);
    }
    IsValidFunctionName(name) {
        if (name.length == 0)
            return (false);
        if (name[name.length - 1] === ' ')
            return (false);
        return (true);
    }
    ParseParameters(data) {
        return (this.ParseBlockWithQuotationMark(data, ',', ["'", '"']));
    }
    ParseBlock(data, delimiter) {
        const items = [];
        let buffer = '';
        let blockCount = 0;
        for (let i = 0; i < data.length; i++) {
            const chr = data[i];
            if (chr === '(') {
                blockCount++;
                buffer += chr;
            }
            else if (chr === ')') {
                blockCount--;
                buffer += chr;
            }
            else if (chr === delimiter) {
                if (blockCount === 0) {
                    items.push(buffer);
                    buffer = '';
                }
                else {
                    buffer += chr;
                }
            }
            else {
                buffer += chr;
            }
        }
        if (data.length > 0)
            items.push(buffer);
        return (items);
    }
    ParseBlockWithQuotationMark(data, delimiter, quotations) {
        const items = [];
        let buffer = '';
        let blockCount = 0;
        let quotation = null;
        for (let i = 0; i < data.length; i++) {
            const chr = data[i];
            if (chr === '(') {
                blockCount++;
                buffer += chr;
            }
            else if (chr === ')') {
                blockCount--;
                buffer += chr;
            }
            else if ((buffer.length == 0) && (quotation === null) && (quotations.indexOf(chr) >= 0)) {
                quotation = chr;
            }
            else if (chr === quotation) {
                quotation = null;
            }
            else if ((chr === delimiter) && (quotation === null)) {
                if (blockCount === 0) {
                    items.push(buffer);
                    buffer = '';
                }
                else {
                    buffer += chr;
                }
            }
            else {
                buffer += chr;
            }
        }
        if (data.length > 0)
            items.push(buffer);
        return (items);
    }
    ParseBlockMathematicalExpression(data) {
        const items = [];
        let buffer = '';
        let blockCount = 0;
        for (let i = 0; i < data.length; i++) {
            const chr = data[i];
            if (chr === '(') {
                if (blockCount === 0) {
                    if (buffer.length > 0)
                        items.push(buffer);
                    buffer = '';
                }
                blockCount++;
                buffer += chr;
            }
            else if (chr === ')') {
                blockCount--;
                buffer += chr;
                if (blockCount === 0) {
                    items.push(buffer);
                    buffer = '';
                }
            }
            else if (!this.IsBlockNumber(buffer, chr)) {
                if (blockCount === 0) {
                    if (buffer.length > 0)
                        items.push(buffer);
                    buffer = chr;
                }
                else {
                    buffer += chr;
                }
            }
            else {
                buffer += chr;
            }
        }
        if (buffer.length > 0)
            items.push(buffer);
        return (this.ParseBlockMathematicalExpressionSignals(items));
    }
    IsBlockNumber(buffer, chr) {
        return ((this.IsNumber(buffer + chr)) || ((chr === '.') && (this.IsNumber(buffer))));
    }
    ParseBlockMathematicalExpressionSignals(items) {
        const itemsSignal = [];
        let isLastOperation = true;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (isLastOperation) {
                itemsSignal.push(item);
                isLastOperation = false;
            }
            else if (this.IsMathematicalOperator(item)) {
                itemsSignal.push(item);
                isLastOperation = true;
            }
            else if (item.length > 1) {
                if (this.IsMathematicalOperator(item[0], true)) {
                    itemsSignal.push(item[0]);
                    itemsSignal.push(item.substring(1));
                }
                else {
                    itemsSignal.push(item);
                }
                isLastOperation = false;
            }
        }
        return (itemsSignal);
    }
    IsMathematicalOperator(chr, onlyItemOperator = false) {
        if (chr === '+')
            return (true);
        if (chr === '-')
            return (true);
        if (onlyItemOperator)
            return (false);
        if (chr === '*')
            return (true);
        if (chr === '/')
            return (true);
        return (false);
    }
    IsValidFunctionParameter(parameter) {
        let blockOpen = 0;
        let blockClose = 0;
        for (let i = parameter.length - 1; i >= 0; i--) {
            const chr = parameter[i];
            if (chr === '(')
                blockOpen++;
            else if (chr === ')')
                blockClose++;
        }
        return (blockOpen === blockClose);
    }
    IsIterator(data) {
        if (this.Application.Serializer.IsJson(data))
            return (true);
        return (this.IsIteratorArray(data));
    }
    IsIteratorArray(data) {
        if (data === null)
            return (false);
        if (data.length < 2)
            return (false);
        return ((data.substr != null) && (data.substr(0, 1) == this.ITERATOR_START) && (data.substr(data.length - 1, 1) == this.ITERATOR_END));
    }
    ParseIterator(data) {
        if (this.Application.Serializer.IsJson(data))
            return (this.Application.Serializer.Deserialize(data));
        return (this.ParseIteratorArray(data));
    }
    ParseIteratorArray(data) {
        const dataContent = data.substr(1, data.length - 2);
        const indexInterval = dataContent.indexOf('..');
        if (indexInterval !== -1) {
            const limits = this.Tokenize(dataContent, '..');
            if (limits.length != 2) {
                this.Application.ExceptionHandler.HandleError('Iterator in wrong format: {0}', data);
                return ([]);
            }
            const limitStart = this.ParseNumberBlock(limits[0]);
            const limitEnd = this.ParseNumberBlock(limits[1]);
            const dataIntervals = [];
            for (let i = limitStart; i < limitEnd; i++)
                dataIntervals.push(i.toString());
            return (dataIntervals);
        }
        else {
            return (this.Tokenize(dataContent, ','));
        }
    }
    ParseNumberBlock(data, valueDefault = 0) {
        let dataClean = '';
        for (let i = 0; i < data.length; i++) {
            const character = data.charAt(i);
            if (character == ' ')
                continue;
            dataClean = dataClean + character;
        }
        const dataWithoutDate = this.ReplaceDateWithTimespan(dataClean);
        return (this.ParseNumber(this.Application.Solver.ResolveMathematicalExpression(dataWithoutDate), valueDefault));
    }
    ReplaceDateWithTimespan(data) {
        const dataWithoutISO = this.ReplaceDateWithTimespanISO(data);
        const dataWithoutShort = this.ReplaceDateWithTimespanShort(dataWithoutISO);
        return (dataWithoutShort);
    }
    ReplaceDateWithTimespanISO(data) {
        const matchs = data.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?((\-|\+)\d{2}:\d{2})?/gi);
        if (matchs === null)
            return (data);
        let dataTimespan = data;
        for (let i = 0; i < matchs.length; i++) {
            const match = matchs[i];
            const date = new Date(match);
            const timespan = date.getTime();
            dataTimespan = dataTimespan.replace(match, timespan.toString());
        }
        return (dataTimespan);
    }
    ReplaceDateWithTimespanShort(data) {
        const matchs = data.match(/\d{4}-\d{2}-\d{2}\d{2}:\d{2}:\d{2}:\d{3}/gi);
        if (matchs === null)
            return (data);
        let dataTimespan = data;
        for (let i = 0; i < matchs.length; i++) {
            const match = matchs[i];
            const matchISO = match.substring(0, 10) + 'T' + match.substring(10, 18) + 'Z';
            const date = new Date(matchISO);
            const timespan = date.getTime();
            dataTimespan = dataTimespan.replace(match, timespan.toString());
        }
        return (dataTimespan);
    }
    IsClassArray(data) {
        if (data === null)
            return (false);
        if (data.length < 2)
            return (false);
        return ((data.substr(0, 1) == this.CLASS_START) && (data.substr(data.length - 1, 1) == this.CLASS_END));
    }
    IsMustacheOnly(data, allowInternal = false) {
        if (allowInternal)
            return (this.IsMutacheOnlyInternal(data));
        if (!this.IsMustache(data))
            return (false);
        return (data.indexOf(this.MUSTACHE_START, 2) === -1);
    }
    IsMutacheOnlyInternal(data) {
        if (!this.IsMustache(data))
            return (false);
        let open = 0;
        for (let i = 0; i < data.length - 1; i++) {
            if (data[i] === ' ')
                return (false);
            const current = data.substr(i, 2);
            if (current === this.MUSTACHE_START) {
                open++;
                i++;
            }
            else if (current === this.MUSTACHE_END) {
                open--;
                i++;
            }
        }
        return (open === 0);
    }
    ParseClassArray(data) {
        return (this.ParseBlock(data.substr(1, data.length - 2), ','));
    }
    ParseTags(data) {
        return (this.ParseBlock(data, ','));
    }
    ParseClass(data) {
        const parsed = this.Tokenize(data, ':');
        if (parsed.length == 1)
            return ([parsed[0], 'true', null]);
        return ([parsed[0], parsed[1], parsed.length > 2 ? parsed[2] : null]);
    }
    ParseConditionalBlock(data) {
        if (data.indexOf == null)
            return (data.toString());
        let indexStart = data.indexOf('(');
        if (indexStart < 0)
            return (null);
        let indexStartNext = null;
        let indexEnd = null;
        indexStart++;
        while (((indexStartNext = data.indexOf('(', indexStart)) < (indexEnd = data.indexOf(')', indexStart))) && (indexStartNext != -1)) {
            indexStart = indexStartNext + 1;
        }
        return (data.substring(indexStart, indexEnd));
    }
    ParseConditionalLogicalOrComparator(data) {
        let parsed = this.ParseConditionalLogicalOrComparatorSeparator(data, '||');
        if (parsed != null)
            return (parsed);
        parsed = this.ParseConditionalLogicalOrComparatorSeparator(data, '&&');
        if (parsed != null)
            return (parsed);
        parsed = this.ParseConditionalLogicalOrComparatorSeparator(data, '!=');
        if (parsed != null)
            return (parsed);
        parsed = this.ParseConditionalLogicalOrComparatorSeparator(data, '=');
        if (parsed != null)
            return (parsed);
        parsed = this.ParseConditionalLogicalOrComparatorSeparator(data, '>');
        if (parsed != null)
            return (parsed);
        parsed = this.ParseConditionalLogicalOrComparatorSeparator(data, '<');
        if (parsed != null)
            return (parsed);
        return ([data]);
    }
    ParseConditionalLogicalOrComparatorSeparator(data, separator) {
        const index = data.indexOf(separator);
        if (index > 0)
            return ([data.substring(0, index), separator, data.substring(index + separator.length)]);
        else if (index == 0)
            return (['', separator, data.substring(index + separator.length)]);
        return (null);
    }
    GetStringAsNumber(text) {
        if (text == null)
            return (null);
        return (Number(text));
    }
    ParseEvents(data) {
        if ((data === null) || (data === undefined))
            return ([]);
        const parse = this.Tokenize(data, ',');
        return (parse);
    }
    ParseEventProperty(el, event, value) {
        const parse = this.ParseProperty(event);
        if (parse.length < 3)
            return (null);
        if (parse[0] != 'd')
            return (null);
        if (parse[1].toLowerCase() != 'on')
            return (null);
        const location = this.ParseEventLocation(parse[2]);
        let index = location === null ? 2 : 3;
        const trigger = parse[index++];
        const eventFilter = parse.length > index ? parse[index] : null;
        const validation = el.getAttribute('d-validation-on-' + trigger);
        return ([event, location, trigger, value, eventFilter, validation]);
    }
    ParseEventLocation(value) {
        if (value === 'body')
            return (value);
        return (null);
    }
    ParseEvent(event) {
        const parse = this.ParseProperty(event);
        const eventFilter = parse.length > 1 ? parse[1] : null;
        return ([parse[0], eventFilter]);
    }
    IsUri(data) {
        if (data === null)
            return (false);
        if ((data.length > 0) && (data.substr(0, 1) === '~'))
            return (true);
        if ((data.length > 0) && (data.substr(0, 1) === '/'))
            return (true);
        return (false);
    }
    IsHTML(data) {
        if (data === null)
            return (false);
        if ((data.length > 0) && (data.substr(0, 1) === '<'))
            return (true);
        return (false);
    }
    ParsePipes(data) {
        if (data == null)
            return (null);
        const parse = this.Tokenize(data, ',');
        return (parse);
    }
    ParseDocumentContent(data) {
        const index = data.indexOf('<div');
        if (index >= 0)
            return (data.substr(index));
        return (data);
    }
    ParseElementAttributes(data) {
        const element = this.ParseElement(data);
        return (this.ParseAttributes(element));
    }
    ParseElement(data) {
        const index = data.indexOf('>');
        if (index >= 0)
            return (data.substr(0, index));
        return ('');
    }
    ParseAttributes(data) {
        const attributes = [];
        const block = this.ParseBlockAttribute(data);
        for (let i = 0; i < block.length; i++) {
            const attribute = this.ParseAttribute(block[i]);
            if (attribute !== null)
                attributes.push(attribute);
        }
        return (attributes);
    }
    ParseAttribute(data) {
        const block = this.ParseBlock(data, '=');
        if (block.length !== 2)
            return (null);
        const value = block[1];
        return ([block[0].toLowerCase(), value.substr(1, value.length - 2)]);
    }
    ParseDate(data) {
        const date = new Date(data);
        if ((date == null) || (date.toString() == 'Invalid Date'))
            return (null);
        return (date);
    }
    ParseDateCulture(data, culture = null) {
        if (data === null)
            return (null);
        if (typeof data.getMonth === 'function')
            return data;
        const dateISO = this.GetDateISO(data);
        if (dateISO !== null)
            return (dateISO);
        if (culture === null)
            culture = this.Application.Globalization.GetCulture();
        if (this._canUseRegexGroups)
            return (this.ParseDateCultureRegex(data, culture));
        return (this.ParseDateCultureRegularExpression(data, culture));
    }
    GetDateISO(data) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(data))
            return (null);
        const date = new Date(data);
        if ((date === null) || (!(date instanceof Date)) || (date.toString() == 'Invalid Date') || (date.toISOString() !== data))
            return (null);
        return (date);
    }
    ParseDateCultureRegex(data, culture) {
        const dateFormatRegex = this.Application.Globalization.GetDateFormatsRegex(culture);
        const match = data.match(dateFormatRegex);
        if (match == null)
            return (null);
        const groups = match.groups;
        const year = this.ParseDateGroupNumber(groups.year);
        if (year == null)
            return (null);
        const month = this.ParseDateGroupNumber(groups.month, 12);
        if (month == null)
            return (null);
        const day = this.ParseDateGroupNumber(groups.day, 31);
        if (day == null)
            return (null);
        const hours = 12;
        const date = new Date(Date.UTC(year, month - 1, day, hours, 0, 0, 0));
        if (!this.IsDate(date))
            return (null);
        if (date.getUTCDate() !== day)
            return (null);
        return (date);
    }
    ParseDateCultureRegularExpression(data, culture) {
        const regularExpressions = this.Application.Globalization.GetDateFormatsRegularExpressions(culture);
        for (let i = 0; i < regularExpressions.length; i++) {
            const regularExpression = regularExpressions[i];
            if (!regularExpression.IsValid(data))
                continue;
            const year = this.ParseDateGroupNumber(regularExpression.GetValue('year'));
            if (year == null)
                return (null);
            const month = this.ParseDateGroupNumber(regularExpression.GetValue('month'), 12);
            if (month == null)
                return (null);
            const day = this.ParseDateGroupNumber(regularExpression.GetValue('day'), 31);
            if (day == null)
                return (null);
            const hours = 12;
            const date = new Date(Date.UTC(year, month - 1, day, hours, 0, 0, 0));
            if (!this.IsDate(date))
                return (null);
            if (date.getUTCDate() !== day)
                return (null);
            return (date);
        }
        return (null);
    }
    IsDate(date) {
        return (!((date == null) || (date.toString() == 'Invalid Date')));
    }
    ParseDateGroupNumber(value, max = null) {
        if (value == null)
            return (null);
        const valueNumber = this.ParseNumber(value, null);
        if ((max != null) && (valueNumber > max))
            return (null);
        return (valueNumber);
    }
    ParseNumber(data, valueDefault = 0) {
        if (data == null)
            return (valueDefault);
        const value = Number(data);
        if (Number.NaN === value)
            return (valueDefault);
        return (value);
    }
    ParseNumberPercentageCulture(data, culture = null) {
        if (data == null)
            return (null);
        if (data.endsWith('%'))
            data = data.substr(0, data.length - 1);
        return (this.ParseNumberCulture(data, culture));
    }
    ParseNumberCulture(data, culture = null) {
        if (data == null)
            return (null);
        const delimiterThousands = this.Application.Globalization.GetDelimiterThousands(culture);
        const delimiterDecimal = this.Application.Globalization.GetDelimiterDecimal(culture);
        let valueClean = this.Application.Solver.Replace(data, delimiterThousands, '');
        if (delimiterDecimal !== '.')
            valueClean = valueClean.replace(delimiterDecimal, '.');
        const value = Number(valueClean);
        if (Number.NaN === value)
            return (null);
        return (value);
    }
    ParseBoolean(data, valueDefault = false) {
        if (data == null)
            return (valueDefault);
        return (data.toLowerCase() === 'true');
    }
    ParseQueryString(url) {
        const values = [];
        const indexQueryString = url.indexOf('?');
        if ((indexQueryString == null) || (indexQueryString < 0))
            return (values);
        const queryString = url.substring(indexQueryString + 1);
        const keyValuePairs = this.ParseBlock(queryString, '&');
        for (let i = 0; i < keyValuePairs.length; i++) {
            const keyValuePair = this.ParseBlock(keyValuePairs[i], '=');
            if (keyValuePair.length !== 2)
                continue;
            const key = keyValuePair[0];
            const value = keyValuePair[1];
            values.push([key, value]);
        }
        return (values);
    }
    ParseValidationGroups(data) {
        if (data == null)
            return ([]);
        return (this.ParseBlock(data, ','));
    }
    IsValidatorArray(data) {
        if (data === null)
            return (false);
        if (data.length < 2)
            return (false);
        return ((data.substr(0, 1) == this.CLASS_START) && (data.substr(data.length - 1, 1) == this.CLASS_END));
    }
    ParseValidatorsArray(data) {
        return (this.ParseBlock(data.substr(1, data.length - 2), ','));
    }
    ParseValidator(data) {
        const parsed = this.Tokenize(data, ':');
        if (parsed.length == 1)
            return ([parsed[0], 'true']);
        return ([parsed[0], parsed[1]]);
    }
    ParseHTMLAttributes(data) {
        const attributes = [];
        let indexStart = 0;
        while ((indexStart = data.indexOf('<', indexStart)) >= 0) {
            const indexEnd = data.indexOf('>', indexStart);
            if (indexEnd === -1)
                break;
            const dataElement = data.substring(indexStart, indexEnd);
            const elementAttributes = this.ParseAttributes(dataElement);
            attributes.push.apply(attributes, elementAttributes);
            indexStart = indexEnd;
        }
        return (attributes);
    }
    ParseBlockAttribute(data) {
        const items = [];
        let buffer = '';
        let attributeDelimiter = null;
        const space = ' ';
        for (let i = 0; i < data.length; i++) {
            const chr = data[i];
            if ((attributeDelimiter !== null) && (chr === attributeDelimiter)) {
                attributeDelimiter = null;
                buffer += chr;
            }
            else if ((chr === "'") || (chr === '"')) {
                attributeDelimiter = chr;
                buffer += chr;
            }
            else if (chr === space) {
                if (attributeDelimiter === null) {
                    items.push(buffer);
                    buffer = '';
                }
                else {
                    buffer += chr;
                }
            }
            else {
                buffer += chr;
            }
        }
        if (data.length > 0)
            items.push(buffer);
        return (items);
    }
    ParseExpression(expression) {
        const block = new DrapoExpressionItem(DrapoExpressionItemType.Block);
        this.ParseExpressionInsert(block, expression);
        block.Value = expression;
        return (block);
    }
    ParseExpressionInsert(block, expression) {
        const tokens = this.ParseExpressionTokens(expression);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const item = this.ParseExpressionItem(token);
            block.Items.push(item);
        }
    }
    ParseExpressionTokens(expression) {
        const tokens = [];
        let blockCount = 0;
        let textBlock = null;
        let buffer = '';
        for (let i = 0; i < expression.length; i++) {
            const chr = expression[i];
            if (chr === textBlock) {
                buffer = buffer + chr;
                tokens.push(buffer);
                buffer = '';
                textBlock = null;
                continue;
            }
            if ((chr === '"') || (chr === "'")) {
                this.AddTokenNonEmpty(tokens, buffer);
                buffer = chr;
                textBlock = chr;
                continue;
            }
            if (textBlock !== null) {
                buffer = buffer + chr;
                continue;
            }
            if (chr === '(') {
                if ((blockCount === 0) && (this.ParseExpressionItemType(buffer) !== DrapoExpressionItemType.Text)) {
                    this.AddTokenNonEmpty(tokens, buffer);
                    buffer = '';
                }
                blockCount++;
            }
            else if (chr === ')') {
                blockCount--;
                if ((blockCount === 0) && (buffer !== '')) {
                    buffer = buffer + chr;
                    tokens.push(buffer);
                    buffer = '';
                    continue;
                }
            }
            if ((blockCount === 0) && (this.IsParseExpressionStartingToken(chr)) && (!this.IsParseExpressionMiddleToken(buffer, chr))) {
                this.AddTokenNonEmpty(tokens, buffer);
                buffer = '';
            }
            if ((blockCount === 0) && (buffer !== '') && (this.IsParseExpressionItemTypeComplete(buffer)) && (!this.IsParseExpressionItemTypeComplete(buffer + chr))) {
                this.AddTokenNonEmpty(tokens, buffer);
                buffer = '';
            }
            buffer = buffer + chr;
        }
        this.AddTokenNonEmpty(tokens, buffer);
        return (tokens);
    }
    AddTokenNonEmpty(tokens, token) {
        if (token == null)
            return (false);
        if (this.IsTokenEmpty(token))
            return (false);
        tokens.push(token);
        return (true);
    }
    Trim(token) {
        if (token == null)
            return (token);
        let indexStart = 0;
        for (let i = 0; i < token.length; i++) {
            if (token[i] === ' ')
                continue;
            indexStart = i;
            break;
        }
        let indexEnd = token.length - 1;
        for (let i = indexEnd; i >= 0; i--) {
            if (token[i] === ' ')
                continue;
            indexEnd = i;
            break;
        }
        const tokenTrim = token.substring(indexStart, indexEnd + 1);
        return (tokenTrim);
    }
    IsTokenEmpty(token) {
        if (token == null)
            return (true);
        for (let i = 0; i < token.length; i++)
            if (token[i] != ' ')
                return (false);
        return (true);
    }
    IsParseExpressionStartingToken(chr) {
        return (this.Application.Solver.Contains(this._tokensStart, chr));
    }
    IsParseExpressionMiddleToken(buffer, chr) {
        if (buffer.length == 0)
            return (false);
        for (let i = 0; i < this._tokensBlock.length; i++) {
            const tokenBlock = this._tokensBlock[i];
            const tokenBlockBuffer = tokenBlock[0];
            if (buffer.substr(0, tokenBlockBuffer.length) !== tokenBlockBuffer)
                continue;
            for (let j = 1; j < tokenBlock.length; j++)
                if (tokenBlock[j] === chr)
                    return (true);
            return (false);
        }
        if (buffer[0] === '{')
            return (true);
        return (false);
    }
    IsLetterOrNumber(chr) {
        return (chr.match(/^[a-zA-Z0-9_.-]+$/i) != null);
    }
    IsNumber(chr) {
        if (chr == null)
            return (false);
        if (typeof chr !== 'string')
            chr = chr.toString();
        return (chr.match(/^(\-)?((\d)+)?(\.)?(\d)+$/i) != null);
    }
    IsBoolean(data) {
        if (data == null)
            return (false);
        if (typeof data === 'boolean')
            return (true);
        if (typeof data !== 'string')
            data = data.toString();
        return ((data === 'true') || (data === 'false'));
    }
    ParseExpressionItem(token) {
        const tokenTrim = this.Trim(token);
        const type = this.ParseExpressionItemType(tokenTrim);
        const item = new DrapoExpressionItem(type);
        if (item.Type == DrapoExpressionItemType.Block) {
            const content = tokenTrim.substring(1, tokenTrim.length - 1);
            this.ParseExpressionInsert(item, content);
        }
        item.Value = tokenTrim;
        return (item);
    }
    ParseExpressionItemType(token) {
        const isBlockEnd = token.substr(token.length - 1, 1) == ')';
        if (isBlockEnd) {
            const isBlockStart = token.substr(0, 1) == '(';
            if (isBlockStart)
                return (DrapoExpressionItemType.Block);
            else
                return (DrapoExpressionItemType.Function);
        }
        if (token === '!')
            return (DrapoExpressionItemType.Deny);
        if ((token.length > 1) && (token[0] === "'") && (token[token.length - 1] === "'"))
            return (DrapoExpressionItemType.Text);
        if ((token.length > 1) && (token[0] === '"') && (token[token.length - 1] === '"'))
            return (DrapoExpressionItemType.Text);
        if (this.IsMustache(token))
            return (DrapoExpressionItemType.Mustache);
        if (this.Application.Solver.Contains(this._tokensComparator, token))
            return (DrapoExpressionItemType.Comparator);
        if (this.Application.Solver.Contains(this._tokensLogical, token))
            return (DrapoExpressionItemType.Logical);
        if (this.Application.Solver.Contains(this._tokensArithmetic, token))
            return (DrapoExpressionItemType.Arithmetic);
        return (DrapoExpressionItemType.Text);
    }
    IsParseExpressionItemTypeComplete(token) {
        if (this.Application.Solver.Contains(this._tokensLogical, token))
            return (true);
        if (this.Application.Solver.Contains(this._tokensComparator, token))
            return (true);
        if (this.Application.Solver.Contains(this._tokensArithmetic, token))
            return (true);
        if (this.IsNumber(token))
            return (true);
        if (this.IsMustacheContentValid(token))
            return (true);
        if (this.IsLetterOrNumber(token))
            return (true);
        return (false);
    }
    ParseLines(data) {
        const lines = [];
        const split = data.split('\r\n');
        for (let i = 0; i < split.length; i++) {
            const line = split[i];
            if (line.length === 0)
                continue;
            lines.push(line);
        }
        return (lines);
    }
    ParseHeader(data) {
        const index = data.indexOf(':');
        if (index < 0)
            return (null);
        const key = data.substr(0, index);
        const value = data.substr(index + 2);
        return ([key, value]);
    }
    ParseFormat(format) {
        const tokens = [];
        let buffer = '';
        for (let i = 0; i < format.length; i++) {
            const chr = format[i];
            if (this.IsFormatCharacterCompatible(buffer, chr)) {
                buffer = buffer + chr;
            }
            else {
                if (buffer.length > 0)
                    tokens.push(buffer);
                buffer = chr;
            }
        }
        if (buffer.length > 0)
            tokens.push(buffer);
        return (tokens);
    }
    IsFormatCharacterCompatible(buffer, chr) {
        if (buffer.length == 0)
            return (true);
        if (buffer[buffer.length - 1] === chr)
            return (true);
        if (this.IsNumber(buffer) && (this.IsNumber(chr)))
            return (true);
        return (false);
    }
    ParsePixels(value) {
        if ((value == null) || (value == '') || (value.length < 3))
            return (null);
        const valueNumber = this.ParseNumber(value.substr(0, value.length - 2));
        return (valueNumber);
    }
    ParseQuery(value, options) {
        if ((value == null) || (value === ''))
            return (null);
        const query = new DrapoQuery();
        const projections = this.ParseQueryProjections(value);
        if (projections === null) {
            query.Error = "Can't parse the projections.";
            return (query);
        }
        query.Projections = projections;
        const sources = this.ParseQuerySources(value);
        if (sources === null) {
            query.Error = "Can't parse the sources.";
            return (query);
        }
        query.Sources = sources;
        query.Filter = this.ParseQueryFilter(value);
        const sorts = this.ParseQueryOrderBy(value);
        if (sorts === null) {
            query.Error = "Can't parse the order by.";
            return (query);
        }
        query.Sorts = sorts;
        query.Options = this.ParseQueryOptions(options);
        return (query);
    }
    ParseQueryProjections(value) {
        const tokenProjections = this.ParseSubstring(value, "SELECT", "FROM");
        if (tokenProjections === null)
            return (null);
        const projections = [];
        const tokenProjectionsSplit = this.ParseBlock(tokenProjections, ',');
        for (let i = 0; i < tokenProjectionsSplit.length; i++) {
            const tokenProjection = tokenProjectionsSplit[i];
            const projection = this.ParseQueryProjection(tokenProjection);
            if (projection === null)
                return (null);
            projections.push(projection);
        }
        return (projections);
    }
    ParseQueryProjection(value) {
        const projection = new DrapoQueryProjection();
        const valueTrim = this.Trim(value);
        const valueTrimSplit = this.ParseBlock(valueTrim, ' ');
        const alias = this.ParseQueryProjectionAlias(valueTrimSplit);
        projection.Alias = alias;
        const valueTrimFirst = valueTrimSplit[0];
        const functionName = this.ParseQueryProjectionFunctionName(valueTrimFirst);
        if (functionName !== null) {
            projection.FunctionName = functionName;
            const functionParameters = this.ParseQueryProjectionFunctionParameters(valueTrimFirst);
            projection.FunctionParameters = this.ParseQueryProjectionFunctionParametersBlock(functionParameters);
        }
        else {
            const valueDefinition = valueTrimFirst;
            const isMustache = this.IsMustache(valueDefinition);
            const valueTrimFirstSplit = isMustache ? [valueDefinition] : this.ParseBlock(valueDefinition, '.');
            const source = (valueTrimFirstSplit.length > 1) ? valueTrimFirstSplit[0] : null;
            const column = (valueTrimFirstSplit.length > 1) ? valueTrimFirstSplit[1] : valueTrimFirstSplit[0];
            projection.Source = source;
            projection.Column = column;
        }
        return (projection);
    }
    ParseQueryProjectionFunctionName(value) {
        const index = value.indexOf('(');
        if (index < 0)
            return (null);
        const functionName = value.substr(0, index).toUpperCase();
        return (functionName);
    }
    ParseQueryProjectionFunctionParameters(value) {
        const index = value.indexOf('(');
        if (index < 0)
            return (null);
        const parameters = value.substring(index + 1, value.length - 1);
        return (parameters);
    }
    ParseQueryProjectionFunctionParametersBlock(value) {
        return (this.ParseBlock(value, ','));
    }
    ParseQueryProjectionFunctionParameterValue(value) {
        return (this.ParseBlock(value, '.'));
    }
    ParseQueryProjectionAlias(values) {
        if (values.length != 3)
            return (null);
        if (values[1].toUpperCase() !== 'AS')
            return (null);
        return (values[2]);
    }
    ParseQuerySources(value) {
        const tokenSources = this.ParseSubstring(value, 'FROM', 'WHERE', true);
        const tokenSourcesSplit = this.ParseQuerySourcesSplit(tokenSources);
        const sources = [];
        for (let i = 0; i < tokenSourcesSplit.length; i++) {
            const source = this.ParseQuerySource(tokenSourcesSplit[i]);
            if (source === null)
                return (null);
            sources.push(source);
        }
        return (sources);
    }
    ParseQuerySource(value) {
        const source = new DrapoQuerySource();
        const joinType = this.ParseQuerySourceHeadValue(value, 'JOIN');
        source.JoinType = this.Trim(joinType);
        const sourceToken = joinType === null ? value : this.ParseSubstring(value, 'JOIN', 'ON');
        const sourceProjection = this.ParseQueryProjection(sourceToken);
        source.Source = sourceProjection.Column;
        source.Alias = sourceProjection.Alias;
        if (joinType !== null) {
            const indexOn = value.indexOf('ON');
            if (indexOn < 0)
                return (null);
            const onToken = value.substring(indexOn + 2);
            const onConditional = this.ParseQueryConditional(onToken);
            if (onConditional === null)
                return (null);
            if (onConditional.Comparator !== '=')
                return (null);
            source.JoinConditions.push(onConditional);
        }
        return (source);
    }
    ParseQueryConditional(value) {
        const conditional = new DrapoQueryCondition();
        const item = this.ParseExpression(value);
        const leftProjection = this.ParseQueryProjection(item.Items[0].Value);
        conditional.SourceLeft = leftProjection.Source;
        conditional.ColumnLeft = leftProjection.Column;
        if (conditional.SourceLeft == null)
            conditional.ValueLeft = conditional.ColumnLeft;
        conditional.Comparator = item.Items[1].Value.toUpperCase();
        let index = 2;
        if ((item.Items.length === 4) && (conditional.Comparator === 'IS') && (item.Items[index].Value === 'NOT')) {
            conditional.Comparator = 'IS NOT';
            index++;
        }
        if ((item.Items.length > 3) && (conditional.Comparator === 'LIKE')) {
            if (item.Items[2].Value === '%') {
                index++;
                conditional.IsSearchStartRight = true;
            }
            if (item.Items[item.Items.length - 1].Value === '%')
                conditional.IsSearchEndRight = true;
        }
        const valueRight = item.Items[index].Value;
        if (valueRight.toUpperCase() === 'NULL') {
            conditional.IsNullRight = true;
        }
        else {
            const rightProjection = this.ParseQueryProjection(valueRight);
            conditional.SourceRight = rightProjection.Source;
            conditional.ColumnRight = rightProjection.Column;
            if (conditional.SourceRight == null)
                conditional.ValueRight = conditional.ColumnRight;
        }
        return (conditional);
    }
    ParseSubstring(value, start, end, canMissEnd = false) {
        const indexStart = value.indexOf(start);
        if (indexStart < 0)
            return (null);
        let indexEnd = end === null ? -1 : value.indexOf(end);
        if (indexEnd < 0) {
            if (canMissEnd)
                indexEnd = value.length;
            else
                return (null);
        }
        const substring = value.substring(indexStart + start.length, indexEnd);
        return (substring);
    }
    ParseQuerySourcesSplit(value) {
        value = this.Trim(value);
        const sources = [];
        while (value.length != 0) {
            const source = this.ParseQuerySourceHead(value);
            sources.push(source);
            if (value === source)
                break;
            value = value.substring(source.length, value.length);
            value = this.Trim(value);
        }
        return (sources);
    }
    ParseQuerySourceHead(value) {
        let header = this.ParseQuerySourceHeadValue(value, 'INNER JOIN');
        if (header !== null)
            return (header);
        header = this.ParseQuerySourceHeadValue(value, 'LEFT JOIN');
        if (header !== null)
            return (header);
        header = this.ParseQuerySourceHeadValue(value, 'OUTER JOIN');
        if (header !== null)
            return (header);
        header = this.ParseQuerySourceHeadValue(value, 'RIGHT JOIN');
        if (header !== null)
            return (header);
        return (value);
    }
    ParseQuerySourceHeadValue(value, search) {
        const index = value.indexOf(search, 1);
        if (index < 0)
            return (null);
        const header = value.substring(0, index);
        return (header);
    }
    ParseQueryFilter(value) {
        const whereToken = this.ParseSubstring(value, 'WHERE', 'ORDER BY', true);
        if (whereToken === null)
            return (null);
        const filter = this.ParseQueryConditional(whereToken);
        return (filter);
    }
    ParseQueryOrderBy(value) {
        const sorts = [];
        const token = this.ParseSubstring(value, 'ORDER BY ', null, true);
        if (token === null)
            return (sorts);
        const blocks = this.ParseBlock(token, ',');
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const parts = this.ParseBlock(block, ' ');
            if (parts.length > 2)
                return (null);
            const sort = new DrapoQuerySort();
            sort.Column = parts[0];
            if (parts.length > 1)
                sort.Type = parts[1];
            sorts.push(sort);
        }
        return (sorts);
    }
    ParseQueryOptions(value) {
        const options = new DrapoQueryOptions();
        if (value == null)
            return (options);
        const optionsValues = this.ParseBlock(value, ';');
        for (let i = 0; i < optionsValues.length; i++) {
            const optionsValue = this.ParseBlock(optionsValues[i], '=');
            if (optionsValue[0] === 'list')
                options.List = optionsValue[1];
        }
        return (options);
    }
    ParseSwitch(value) {
        const items = [];
        const switchItems = this.ParseBlock(value, ',');
        for (let i = 0; i < switchItems.length; i++) {
            const switchItem = this.ParseBlock(switchItems[i], ':');
            const item = [switchItem[0], switchItem.length > 1 ? switchItem[1] : null];
            items.push(item);
        }
        return (items);
    }
}
//# sourceMappingURL=DrapoParser.js.map