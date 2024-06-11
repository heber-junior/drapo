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
class DrapoValidator {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._sectors = [];
        this._sectorsValidationRuleIDs = [];
        this._sectorsValidationRuleTypes = [];
        this._sectorsValidationRuleValues = [];
        this._sectorsValidationRuleTags = [];
        this._sectorsValidationRuleContexts = [];
        this._sectorsValidationGroupGroups = [];
        this._sectorsValidationGroupRules = [];
        this._sectorsValidationGroupContexts = [];
        this._sectorsValidationInterfaceIDs = [];
        this._sectorsValidationInterfaceElements = [];
        this._sectorsValidationInterfaceContexts = [];
        this._application = application;
    }
    HasContentValidation(content) {
        return (content.indexOf('d-validation') > -1);
    }
    UnloadSectorHierarchy(sector) {
        const sectorChildren = this.Application.Document.GetSectorAndChildren(sector);
        for (let i = 0; i < sectorChildren.length; i++)
            this.UnloadSector(sectorChildren[i]);
    }
    UnloadSector(sector) {
        const index = this.GetSectorIndex(sector);
        if (index === null)
            return;
        this._sectors.splice(index, 1);
        this._sectorsValidationRuleIDs.splice(index, 1);
        this._sectorsValidationRuleTypes.splice(index, 1);
        this._sectorsValidationRuleValues.splice(index, 1);
        this._sectorsValidationRuleTags.splice(index, 1);
        this._sectorsValidationRuleContexts.splice(index, 1);
        this._sectorsValidationGroupGroups.splice(index, 1);
        this._sectorsValidationGroupRules.splice(index, 1);
        this._sectorsValidationGroupContexts.splice(index, 1);
        this._sectorsValidationInterfaceIDs.splice(index, 1);
        this._sectorsValidationInterfaceElements.splice(index, 1);
        this._sectorsValidationInterfaceContexts.splice(index, 1);
    }
    RegisterValidation(el, sector, context = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const validations = this.ExtractValidations(el);
            if (validations.length === 0)
                return;
            if ((context == null) && (this.Application.Document.IsElementInsideControlFlowOrContext(el)))
                return;
            const contextItem = context != null ? context.Item : null;
            const validationID = this.Application.Solver.Get(validations, 'id');
            const validationIDResolved = yield this.ResolveValidationID(sector, validationID, contextItem);
            if (validationIDResolved != null) {
                const validationType = this.Application.Solver.Get(validations, 'type');
                const validationValue = this.Application.Solver.Get(validations, 'value');
                const validationGroup = this.Application.Solver.Get(validations, 'group');
                const validationGroups = this.Application.Parser.ParseValidationGroups(validationGroup);
                const validationTag = this.GetValidationTag(validations, validationType);
                this.AddValidationRule(sector, validationIDResolved, validationType, validationValue, validationTag, contextItem);
                this.AddValidationGroups(sector, validationIDResolved, validationGroups, contextItem);
            }
            const validation = this.Application.Solver.Get(validations, '');
            const validationResolved = yield this.ResolveValidationID(sector, validation, contextItem);
            if (validationResolved != null) {
                this.AddValidationInterface(sector, validationResolved, el, contextItem);
                const validatorUncheckedClass = yield this.Application.Config.GetValidatorUncheckedClass();
                if (validatorUncheckedClass != null) {
                    el.classList.add(validatorUncheckedClass);
                }
            }
        });
    }
    ResolveValidationID(sector, validationID, contextItem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Application.Parser.HasMustache(validationID))
                return (validationID);
            if (contextItem == null)
                return (yield this.Application.Storage.ResolveMustachesRecursive(sector, validationID));
            const validationIDContext = yield this.Application.Barber.ResolveControlFlowMustacheString(contextItem.Context, null, null, validationID, null, sector, false);
            return (validationIDContext);
        });
    }
    GetValidationTag(validations, validationType) {
        if (validationType === 'regex')
            return (this.Application.Solver.Get(validations, 'expression'));
        if (validationType === 'compare')
            return (this.Application.Solver.Get(validations, 'valuetocompare'));
        if (validationType === 'outside')
            return (this.Application.Solver.Get(validations, 'sector'));
        return (null);
    }
    IsValidationEventValid(el, sector, eventType, location, event, contextItem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el.getAttribute == null)
                return (true);
            const attribute = location == null ? 'd-validation-on-' + eventType : 'd-validation-on-' + location + '-' + eventType;
            const validation = el.getAttribute(attribute);
            if (validation == null)
                return (true);
            const isValid = yield this.IsValidationExpressionValid(el, sector, validation, contextItem, event);
            return (isValid);
        });
    }
    IsValidationExpressionValid(el, sector, validation, contextItem, event = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const uncheckedClass = yield this.Application.Config.GetValidatorUncheckedClass();
            const validClass = yield this.Application.Config.GetValidatorValidClass();
            const invalidClass = yield this.Application.Config.GetValidatorInvalidClass();
            const validations = yield this.ResolveValidations(sector, validation, contextItem);
            let isValid = true;
            for (let i = 0; i < validations.length; i++)
                if (!(yield this.IsValidationValid(sector, validations[i], el, event, isValid, uncheckedClass, validClass, invalidClass)))
                    isValid = false;
            return (isValid);
        });
    }
    UncheckValidationExpression(el, sector, validation, contextItem) {
        return __awaiter(this, void 0, void 0, function* () {
            const uncheckedClass = yield this.Application.Config.GetValidatorUncheckedClass();
            const validClass = yield this.Application.Config.GetValidatorValidClass();
            const invalidClass = yield this.Application.Config.GetValidatorInvalidClass();
            const validations = yield this.ResolveValidations(sector, validation, contextItem);
            for (let i = 0; i < validations.length; i++)
                this.UncheckValidation(sector, validations[i], uncheckedClass, validClass, invalidClass);
        });
    }
    GetSectorIndex(sector) {
        for (let i = 0; i < this._sectors.length; i++)
            if (this._sectors[i] === sector)
                return (i);
        return (null);
    }
    GetIndex(list, value) {
        for (let i = 0; i < list.length; i++)
            if (list[i] === value)
                return (i);
        return (null);
    }
    GetElement(elements, element) {
        for (let i = 0; i < elements.length; i++)
            if (elements[i] === element)
                return (i);
        return (null);
    }
    EnsureSector(sector) {
        const index = this.GetSectorIndex(sector);
        if (index !== null)
            return (index);
        this._sectors.push(sector);
        this._sectorsValidationRuleIDs.push([]);
        this._sectorsValidationRuleTypes.push([]);
        this._sectorsValidationRuleValues.push([]);
        this._sectorsValidationRuleTags.push([]);
        this._sectorsValidationRuleContexts.push([]);
        this._sectorsValidationGroupGroups.push([]);
        this._sectorsValidationGroupRules.push([]);
        this._sectorsValidationGroupContexts.push([]);
        this._sectorsValidationInterfaceIDs.push([]);
        this._sectorsValidationInterfaceElements.push([]);
        this._sectorsValidationInterfaceContexts.push([]);
        return (this._sectors.length - 1);
    }
    AddValidationRule(sector, validationID, validationType, validationValue, validationTag, contextItem) {
        const index = this.EnsureSector(sector);
        const ruleIDs = this._sectorsValidationRuleIDs[index];
        const ruleIDIndex = this.GetIndex(ruleIDs, validationID);
        if (ruleIDIndex !== null)
            return;
        const ruleTypes = this._sectorsValidationRuleTypes[index];
        const ruleValues = this._sectorsValidationRuleValues[index];
        const ruleTags = this._sectorsValidationRuleTags[index];
        const ruleContexts = this._sectorsValidationRuleContexts[index];
        ruleIDs.push(validationID);
        ruleTypes.push(validationType);
        ruleValues.push(validationValue);
        ruleTags.push(validationTag);
        ruleContexts.push(contextItem);
    }
    AddValidationGroups(sector, validationID, validationGroups, contextItem) {
        for (let i = 0; i < validationGroups.length; i++)
            this.AddValidationGroup(sector, validationID, validationGroups[i], contextItem);
    }
    AddValidationGroup(sector, validationID, validationGroup, contextItem) {
        const index = this.EnsureSector(sector);
        const groups = this._sectorsValidationGroupGroups[index];
        const groupsRules = this._sectorsValidationGroupRules[index];
        const groupsContext = this._sectorsValidationGroupContexts[index];
        const groupIndex = this.GetIndex(groups, validationGroup);
        if (groupIndex === null) {
            groups.push(validationGroup);
            groupsRules.push([validationID]);
            groupsContext.push([contextItem]);
        }
        else {
            const groupRules = groupsRules[groupIndex];
            const groupContext = groupsContext[groupIndex];
            const ruleIndex = this.GetIndex(groupRules, validationID);
            if (ruleIndex === null) {
                groupRules.push(validationID);
                groupContext.push(contextItem);
            }
        }
    }
    AddValidationInterface(sector, validationID, el, contextItem) {
        const index = this.EnsureSector(sector);
        const interfacesIDs = this._sectorsValidationInterfaceIDs[index];
        const interfacesElements = this._sectorsValidationInterfaceElements[index];
        const interfacesContexts = this._sectorsValidationInterfaceContexts[index];
        const idIndex = this.GetIndex(interfacesIDs, validationID);
        if (idIndex === null) {
            interfacesIDs.push(validationID);
            interfacesElements.push([el]);
            interfacesContexts.push([contextItem]);
        }
        else {
            const interfaceElements = interfacesElements[idIndex];
            const interfaceContexts = interfacesContexts[idIndex];
            const elementIndex = this.GetElement(interfaceElements, el);
            if (elementIndex === null) {
                interfaceElements.push(el);
                interfaceContexts.push(contextItem);
            }
        }
    }
    ExtractValidations(el) {
        const attributes = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attribute = el.attributes[i];
            const attributeProperty = this.ExtractValidationProperty(attribute.nodeName);
            if (attributeProperty != null)
                attributes.push([attributeProperty, attribute.nodeValue]);
        }
        return (attributes);
    }
    ExtractValidationProperty(property) {
        const parse = this.Application.Parser.ParseProperty(property);
        if (parse[0] != 'd')
            return (null);
        if (parse[1].toLowerCase() != 'validation')
            return (null);
        if (parse.length === 2)
            return ('');
        return (parse[2]);
    }
    ResolveValidations(sector, validation, contextItem) {
        return __awaiter(this, void 0, void 0, function* () {
            let validationResolved = null;
            if (this.Application.Parser.IsMustacheOnly(validation)) {
                validationResolved = yield this.Application.Barber.ResolveControlFlowMustacheString(contextItem == null ? null : contextItem.Context, null, null, validation, null, sector, false);
            }
            else {
                validationResolved = validation;
            }
            const validations = [];
            if (this.Application.Parser.IsValidatorArray(validationResolved)) {
                const validatorsArray = this.ExtractValidators(validationResolved);
                for (let i = 0; i < validatorsArray.length; i++) {
                    const validator = validatorsArray[i];
                    const validatorConditional = validator[1];
                    if ((validatorConditional != null) && (!(yield this.IsValidConditional(sector, validatorConditional, contextItem))))
                        continue;
                    validations.push(validator[0]);
                }
            }
            else {
                validations.push(validationResolved);
            }
            return (validations);
        });
    }
    ExtractValidators(validation) {
        const validators = [];
        const parsedValidators = this.Application.Parser.ParseValidatorsArray(validation);
        for (let i = 0; i < parsedValidators.length; i++) {
            const parsedValidator = parsedValidators[i];
            const parseValidator = this.Application.Parser.ParseValidator(parsedValidator);
            if (parseValidator != null)
                validators.push(parseValidator);
        }
        return (validators);
    }
    IsValidationValid(sector, validation, el, event, canFocus, uncheckedClass, validClass, invalidClass) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.IsValidationGroup(sector, validation))
                return (yield this.IsValidationGroupValid(sector, validation, el, event, canFocus, uncheckedClass, validClass, invalidClass));
            return (yield this.IsValidationRuleValid(sector, validation, el, event, canFocus, uncheckedClass, validClass, invalidClass));
        });
    }
    IsValidationGroup(sector, validation) {
        const index = this.GetSectorIndex(sector);
        if (index === null)
            return (false);
        const groups = this._sectorsValidationGroupGroups[index];
        const groupIndex = this.GetIndex(groups, validation);
        return (groupIndex !== null);
    }
    IsValidationGroupValid(sector, validation, el, event, canFocus, uncheckedClass, validClass, invalidClass) {
        return __awaiter(this, void 0, void 0, function* () {
            const rules = this.GetValidationGroupRules(sector, validation);
            let isValid = true;
            for (let i = 0; i < rules.length; i++)
                if (!(yield this.IsValidationRuleValid(sector, rules[i], el, event, (canFocus && isValid), uncheckedClass, validClass, invalidClass)))
                    isValid = false;
            return (isValid);
        });
    }
    GetValidationGroupRules(sector, validation) {
        const index = this.GetSectorIndex(sector);
        if (index === null)
            return ([]);
        const groups = this._sectorsValidationGroupGroups[index];
        const groupIndex = this.GetIndex(groups, validation);
        if (groupIndex === null)
            return ([]);
        const groupsRules = this._sectorsValidationGroupRules[index];
        const rules = groupsRules[groupIndex];
        return (rules);
    }
    IsValidationRuleValid(sector, validation, el, event, canFocus, uncheckedClass, validClass, invalidClass) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.IsRuleValid(sector, validation, canFocus, el, event);
            const addClass = isValid ? validClass : invalidClass;
            const removeClass = (!isValid) ? validClass : invalidClass;
            const elements = this.GetValidationRuleElements(sector, validation);
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (uncheckedClass != null)
                    element.classList.remove(uncheckedClass);
                element.classList.remove(removeClass);
                element.classList.add(addClass);
            }
            return (isValid);
        });
    }
    GetValidationRuleElements(sector, validation) {
        const index = this.GetSectorIndex(sector);
        if (index === null)
            return ([]);
        const interfacesIDs = this._sectorsValidationInterfaceIDs[index];
        const interfacesElements = this._sectorsValidationInterfaceElements[index];
        const idIndex = this.GetIndex(interfacesIDs, validation);
        if (idIndex === null)
            return ([]);
        const interfaceElements = interfacesElements[idIndex];
        return (interfaceElements);
    }
    IsRuleValid(sector, validation, canFocus, el, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.GetSectorIndex(sector);
            if (index === null)
                return (true);
            const ruleIDs = this._sectorsValidationRuleIDs[index];
            const ruleIDIndex = this.GetIndex(ruleIDs, validation);
            if (ruleIDIndex === null)
                return (true);
            const ruleTypes = this._sectorsValidationRuleTypes[index];
            const type = ruleTypes[ruleIDIndex];
            const ruleValues = this._sectorsValidationRuleValues[index];
            const value = ruleValues[ruleIDIndex];
            const ruleTags = this._sectorsValidationRuleTags[index];
            const tag = ruleTags[ruleIDIndex];
            const ruleContexts = this._sectorsValidationRuleContexts[index];
            const itemContext = ruleContexts[ruleIDIndex];
            const isValid = yield this.IsValid(sector, type, value, tag, itemContext, el, event);
            if ((!isValid) && (canFocus)) {
                const element = this.Application.Observer.GetElementByModel(sector, value);
                if (element != null)
                    element.focus();
            }
            return (isValid);
        });
    }
    IsValid(sector, type, value, tag, itemContext, el, event) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((type == null) || (type == 'conditional'))
                return (yield this.IsValidConditional(sector, value, itemContext));
            else if (type === 'regex')
                return (yield this.IsValidRegex(sector, value, tag, itemContext));
            else if (type === 'compare')
                return (yield this.IsValidCompare(sector, value, tag, itemContext));
            else if (type === 'outside')
                return (yield this.IsValidOutside(el, event, tag));
            yield this.Application.ExceptionHandler.HandleError('Drapo: There is no validation rule of type: {0}', type);
            return (false);
        });
    }
    IsValidConditional(sector, value, itemContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.CreateContext(itemContext);
            const valueResult = yield this.Application.Solver.ResolveConditional(value, null, sector, context);
            return (valueResult);
        });
    }
    IsValidRegex(sector, value, expression, itemContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.CreateContext(itemContext);
            const expressionsResolved = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, expression, null, false);
            const valueResolved = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, value, null, false);
            const regex = new RegExp(expressionsResolved);
            return (regex.test(valueResolved));
        });
    }
    IsValidCompare(sector, value, valueToCompare, itemContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.CreateContext(itemContext);
            const valueResolved = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, value, null, false);
            const valueToCompareResolved = yield this.Application.Barber.ResolveControlFlowMustacheStringFunction(sector, context, null, null, valueToCompare, null, false);
            return (valueResolved == valueToCompareResolved);
        });
    }
    CreateContext(itemContext) {
        const context = new DrapoContext(itemContext);
        return (context);
    }
    IsValidOutside(el, event, validSectors) {
        return __awaiter(this, void 0, void 0, function* () {
            let target = event.target;
            if (validSectors != null) {
                let sectorsAllowed = [];
                const sectorTarget = this.Application.Document.GetSector(target);
                const sectors = this.Application.Parser.ParseTags(validSectors);
                for (let i = 0; i < sectors.length; i++)
                    sectorsAllowed = this.Application.Solver.Join(sectorsAllowed, this.Application.Document.GetSectorAndChildren(sectors[i]));
                if (!this.Application.Solver.Contains(sectorsAllowed, sectorTarget))
                    return (false);
            }
            while (target != null) {
                if (el === target)
                    return (false);
                if (target.parentElement)
                    target = target.parentElement;
                else
                    target = null;
            }
            return (true);
        });
    }
    UncheckValidation(sector, validation, uncheckedClass, validClass, invalidClass) {
        if (this.IsValidationGroup(sector, validation))
            this.UncheckValidationGroup(sector, validation, uncheckedClass, validClass, invalidClass);
        else
            this.UncheckValidationRule(sector, validation, uncheckedClass, validClass, invalidClass);
    }
    UncheckValidationGroup(sector, validation, uncheckedClass, validClass, invalidClass) {
        const rules = this.GetValidationGroupRules(sector, validation);
        for (let i = 0; i < rules.length; i++)
            this.UncheckValidationRule(sector, rules[i], uncheckedClass, validClass, invalidClass);
    }
    UncheckValidationRule(sector, validation, uncheckedClass, validClass, invalidClass) {
        const elements = this.GetValidationRuleElements(sector, validation);
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element.classList.remove(validClass);
            element.classList.remove(invalidClass);
            if (uncheckedClass != null)
                element.classList.add(uncheckedClass);
        }
    }
    IsValidatorInterface(el) {
        const attributeValidation = el.getAttribute('d-validation');
        return ((attributeValidation != null) && (attributeValidation != ''));
    }
}
//# sourceMappingURL=DrapoValidator.js.map