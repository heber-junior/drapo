"use strict";
class DrapoSearcher {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    FindDataKey(dataKey, sector) {
        const els = this.FindAllByAttributeAndValue('d-datakey', dataKey);
        const el = this.Filter(sector, els);
        return (el);
    }
    HasDataKeyElement(dataKey) {
        const el = this.FindByAttributeAndValue('d-datakey', dataKey);
        return (el != null);
    }
    Filter(sector, els) {
        const sectors = this.Application.Document.GetSectorsAllowed(sector);
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            const elSector = this.Application.Document.GetSector(el);
            if (elSector !== sector) {
                const elAccess = el.getAttribute('d-dataAccess');
                if (elAccess == 'private')
                    continue;
                const elType = el.getAttribute('d-dataType');
                if ((elAccess == null) && (elType === 'parent'))
                    continue;
            }
            if ((this.Application.Document.IsSectorAllowed(elSector, sectors)) && (!this.Application.Document.IsElementDetached(el)))
                return (el);
        }
        return (null);
    }
    CreateElementsList(nodes) {
        const els = [];
        for (let i = 0; i < nodes.length; i++)
            els.push(nodes[i]);
        return (els);
    }
    FindByAttributeAndValue(name, value) {
        const el = document.querySelector("[" + name + "='" + value + "']");
        return (el);
    }
    FindLastByAttributeAndValue(name, value) {
        const els = this.FindAllByAttributeAndValue(name, value);
        if ((els != null) && (els.length > 0))
            return (els[els.length - 1]);
        return (null);
    }
    FindAllByAttributeAndValue(name, value) {
        const nodes = document.querySelectorAll("[" + name + "='" + value + "']");
        return (this.CreateElementsList(nodes));
    }
    FindByAttributeAndValueFromParent(name, value, parent) {
        const el = parent.querySelector("[" + name + "='" + value + "']");
        return (el);
    }
    FindAllByAttribute(name) {
        const nodes = document.querySelectorAll("[" + name + "]");
        return (this.CreateElementsList(nodes));
    }
    FindAllByAttributeFromParent(name, parent) {
        const nodes = parent.querySelectorAll("[" + name + "]");
        return (this.CreateElementsList(nodes));
    }
    FindByTagName(tagName) {
        const el = document.querySelector(tagName);
        return (el);
    }
}
//# sourceMappingURL=DrapoSearcher.js.map