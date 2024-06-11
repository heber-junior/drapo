"use strict";
class DrapoContext {
    set Sector(value) {
        this._sector = value;
    }
    get Sector() {
        return (this._sector);
    }
    get Item() {
        return (this._itemCurrent);
    }
    get ItemsCurrentStack() {
        return (this._itemCurrentStack);
    }
    set Index(value) {
        this._index = value;
    }
    get Index() {
        return (this._index);
    }
    get IsEmpty() {
        return (this._index === -1);
    }
    set IndexRelative(value) {
        this._indexRelative = value;
    }
    get IndexRelative() {
        return (this._indexRelative);
    }
    get IndexRelatives() {
        return (this._indexRelatives);
    }
    get Level() {
        return (this._level);
    }
    get IsInsideRecursion() {
        return (this._level > 0);
    }
    set CheckMustacheNodes(value) {
        this._checkMustacheNodes = value;
    }
    get CheckMustacheNodes() {
        return ((!this._checkpoint) || (this._checkMustacheNodes));
    }
    set CheckMustacheAttributes(value) {
        this._checkMustacheAttributes = value;
    }
    get CheckMustacheAttributes() {
        return ((!this._checkpoint) || (this._checkMustacheAttributes));
    }
    set CheckModel(value) {
        this._checkModel = value;
    }
    get CheckModel() {
        return ((!this._checkpoint) || (this._checkModel));
    }
    set CheckID(value) {
        this._checkID = value;
    }
    get CheckID() {
        return ((!this._checkpoint) || (this._checkID));
    }
    set CheckAttribute(value) {
        this._checkAttribute = value;
    }
    get CheckAttribute() {
        return ((!this._checkpoint) || (this._checkAttribute));
    }
    set CheckClass(value) {
        this._checkClass = value;
    }
    get CheckClass() {
        return ((!this._checkpoint) || (this._checkClass));
    }
    set CheckEvent(value) {
        this._checkEvent = value;
    }
    get CheckEvent() {
        return (((!this._checkpoint) || (this._checkEvent)) && (!this.CanUpdateTemplate));
    }
    set CheckBehavior(value) {
        this._checkBehavior = value;
    }
    get CheckBehavior() {
        return (((!this._checkpoint) || (this._checkBehavior)) && (!this.CanUpdateTemplate));
    }
    set CheckComponent(value) {
        this._checkComponent = value;
    }
    get CheckComponent() {
        return (((!this._checkpoint) || (this._checkComponent)) && (!this.CanUpdateTemplate));
    }
    set CheckValidation(value) {
        this._checkValidation = value;
    }
    get CheckValidation() {
        return (((!this._checkpoint) || (this._checkValidation)) && (!this.CanUpdateTemplate));
    }
    get CanUpdateTemplate() {
        return (this._canUpdateTemplate);
    }
    set CanUpdateTemplate(value) {
        this._canUpdateTemplate = value;
    }
    constructor(item = null) {
        this._sector = null;
        this._itemsRoot = [];
        this._items = this._itemsRoot;
        this._itemParent = null;
        this._itemCurrent = null;
        this._itemCurrentStack = [];
        this._index = -1;
        this._level = 0;
        this._indexRelatives = [];
        this._indexRelative = -1;
        this._checkpoint = false;
        this._checkMustacheNodes = false;
        this._checkMustacheAttributes = false;
        this._checkModel = false;
        this._checkID = false;
        this._checkAttribute = false;
        this._checkClass = false;
        this._checkEvent = false;
        this._checkBehavior = false;
        this._checkComponent = false;
        this._checkValidation = false;
        this._canUpdateTemplate = false;
        this._templateKeys = [];
        this._templateDatas = [];
        if (item != null) {
            this._items.push(item);
            this._itemCurrent = item;
        }
    }
    Create(data, element, elementForTemplate, dataKey, key, iterator, index, elementOld = null) {
        const item = new DrapoContextItem(this, this._itemParent);
        item.Data = data;
        item.Element = element;
        item.ElementForTemplate = elementForTemplate;
        item.ElementOld = elementOld;
        item.DataKey = dataKey;
        item.Key = key;
        item.Iterator = iterator;
        item.Index = index;
        this._items.push(item);
        this._itemCurrent = item;
        this._index++;
        this._indexRelative++;
        return (item);
    }
    Initialize(count) {
        if (count <= 0)
            return;
        for (let i = 0; i < count; i++)
            this._items.push(null);
        this._index = count;
        this._indexRelative = count;
    }
    Pop() {
        if (this._itemCurrent == null)
            return (null);
        this._itemCurrent = this._items.length < 2 ? null : this._items[this._items.length - 2];
        return (this._items.pop());
    }
    Down() {
        if (this._itemCurrent == null)
            return (false);
        this._items = this._itemCurrent.Children;
        this._itemParent = this._itemCurrent;
        this._itemCurrentStack.push(this._itemCurrent);
        this._level++;
        this._indexRelatives.push(this._indexRelative);
        this._indexRelative = -1;
        return (true);
    }
    Up() {
        if (this._itemParent == null)
            return (false);
        this._itemParent = this._itemParent.Parent;
        this._items = this._itemParent == null ? this._itemsRoot : this._itemParent.Children;
        this._itemCurrent = this._itemCurrentStack.pop();
        this._level--;
        this._indexRelative = this._indexRelatives.pop();
        return (true);
    }
    GetElementTemplate(key) {
        let item = this.Item;
        let template = null;
        while (item != null) {
            if (item.Key == key)
                template = item.ElementForTemplate;
            item = item.Parent;
        }
        return (template);
    }
    IsElementTemplateRoot(key) {
        let item = this.Item;
        while (item != null) {
            if ((item.Parent === null) && (item.Key === key))
                return (true);
            item = item.Parent;
        }
        return (false);
    }
    IsKey(key) {
        return this.IsKeyInternal(this.Item, key);
    }
    IsParentKey(key) {
        return this.IsKeyInternal(this.Item.Parent, key);
    }
    IsKeyInternal(item, key) {
        while (item !== null) {
            if (item.Key === key)
                return (true);
            item = item.Parent;
        }
        return (false);
    }
    GetDataKeyRoot() {
        if (this._itemsRoot.length === 0)
            return (null);
        return (this._itemsRoot[0].DataKey);
    }
    Checkpoint() {
        if (this._checkpoint)
            return;
        if (this._level !== 0)
            return;
        this._checkpoint = true;
    }
    GetTemplateIndex(templateKey) {
        for (let i = 0; i < this._templateKeys.length; i++)
            if (this._templateKeys[i] === templateKey)
                return (i);
        return (null);
    }
    GetTemplate(templateKey) {
        const index = this.GetTemplateIndex(templateKey);
        if (index === null)
            return (null);
        return (this._templateDatas[index]);
    }
    AddTemplate(templateKey, templateData) {
        const index = this.GetTemplateIndex(templateKey);
        if (index === null) {
            this._templateKeys.push(templateKey);
            this._templateDatas.push(templateData);
        }
        else {
            this._templateDatas[index] = templateData;
        }
    }
    CanResolve(key) {
        if (!this._canUpdateTemplate)
            return (true);
        return (!this.IsElementTemplateRoot(key));
    }
    HasContextItemBefore() {
        return ((this.Item != null) && (this.Item.ElementOld != null));
    }
    GetIndex(key) {
        if (this.Item.Key === key)
            return (this.Index);
        for (let i = 0; i < this._itemCurrentStack.length; i++) {
            const itemCurrent = this._itemCurrentStack[i];
            if (itemCurrent.Key === key)
                return (itemCurrent.Index);
        }
        return (null);
    }
    GetIndexRelative(key) {
        if (this.Item.Key === key)
            return (this.IndexRelative);
        for (let i = 0; i < this._itemCurrentStack.length; i++) {
            const itemCurrent = this._itemCurrentStack[i];
            if (itemCurrent.Key === key)
                return (this._indexRelatives[i]);
        }
        return (null);
    }
}
//# sourceMappingURL=DrapoContext.js.map