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
class DrapoSectorContainerHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this.CONTAINER_EQUAL = '=';
        this._containers = [];
        this._activeSectorContainers = [];
        this._sectorContexts = [];
        this._sectorContextsExpressions = [];
        this._sectorContextsValues = [];
        this._application = application;
    }
    IsElementContainerized(element) {
        const elRoot = this.GetElementRoot(element);
        if (elRoot === null)
            return (false);
        for (let i = this._containers.length - 1; i >= 0; i--) {
            const container = this._containers[i];
            if (container.Element === elRoot)
                return (true);
        }
        return (false);
    }
    GetElementRoot(el) {
        if (el == null)
            return (null);
        while (el.parentElement !== null) {
            el = el.parentElement;
            if (el.tagName === 'BODY')
                return (null);
        }
        return (el);
    }
    Switch(sector, containerCode = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let containerCodePrevious = null;
            for (let i = 0; i < this._activeSectorContainers.length; i++) {
                const activeSectorContainer = this._activeSectorContainers[i];
                if (activeSectorContainer[0] !== sector)
                    continue;
                containerCodePrevious = activeSectorContainer[1];
                if (containerCode !== this.CONTAINER_EQUAL)
                    this._activeSectorContainers.splice(i, 1);
                break;
            }
            if ((containerCodePrevious !== null) && (containerCode !== this.CONTAINER_EQUAL)) {
                const containerPrevious = this.CreateContainer(sector, containerCodePrevious);
                this._containers.push(containerPrevious);
            }
            yield this.UnloadSector(sector);
            if (containerCode === this.CONTAINER_EQUAL) {
                const el = this.Application.Document.GetSectorElementInner(sector);
                if ((el !== null) && (el.parentElement !== null))
                    el.parentElement.removeChild(el);
            }
            if ((containerCode === null) || (containerCode === this.CONTAINER_EQUAL)) {
                return (false);
            }
            let loaded = false;
            for (let i = 0; i < this._containers.length; i++) {
                const container = this._containers[i];
                if ((container.Sector !== sector) || (container.ContainerCode !== containerCode))
                    continue;
                this._containers.splice(i, 1);
                yield this.LoadContainer(container);
                loaded = true;
                break;
            }
            this._activeSectorContainers.push([sector, containerCode]);
            return (loaded);
        });
    }
    CreateContainer(sector, containerCode) {
        const el = this.Application.Document.GetSectorElementInner(sector);
        const canDetachElement = this.Application.Document.CanDetachElement(el);
        const sectorChildren = this.Application.Document.GetSectorAndChildren(sector);
        const storageItems = [];
        const sectorHierarchys = [];
        const sectorFriends = [];
        const componentSectors = [];
        const componentTags = [];
        const componentElements = [];
        const componentInstances = [];
        for (let i = 0; i < sectorChildren.length; i++) {
            const sectorCurrent = sectorChildren[i];
            this.Application.Storage.AppendCacheDataItemBySector(storageItems, sectorCurrent);
            this.Application.Document.AppendSectorHierarchyBySector(sectorHierarchys, sectorCurrent);
            this.Application.Document.AppendSectorFriendsBySector(sectorFriends, sectorCurrent);
            this.Application.ComponentHandler.AppendInstances(sectorCurrent, componentSectors, componentTags, componentElements, componentInstances);
        }
        return (new DrapoSectorContainerItem(sector, containerCode, storageItems, sectorHierarchys, sectorFriends, componentSectors, componentTags, componentElements, componentInstances, el, canDetachElement));
    }
    LoadContainer(container) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Application.Document.SetSectorElementInner(container.Sector, container.Element, container.CanDetachElement);
            yield this.Application.Storage.AddCacheDataItems(container.StorageItems);
            this.Application.Document.AddSectorHierarchys(container.SectorHierarchys);
            this.Application.Document.AddSectorFriendsRange(container.SectorFriends);
            yield this.Application.ComponentHandler.AddInstances(container);
            const sectorChildren = this.Application.Document.GetSectorAndChildren(container.Sector);
            for (let i = 0; i < sectorChildren.length; i++) {
                const sectorCurrent = sectorChildren[i];
                yield this.Application.Storage.FireEventOnAfterContainerLoad(sectorCurrent);
            }
        });
    }
    UnloadSector(sector) {
        return __awaiter(this, void 0, void 0, function* () {
            const sectorChildren = this.Application.Document.GetSectorAndChildren(sector);
            for (let i = 0; i < sectorChildren.length; i++) {
                const sectorCurrent = sectorChildren[i];
                yield this.Application.Storage.FireEventOnBeforeContainerUnload(sectorCurrent);
                this.Application.Validator.UnloadSector(sectorCurrent);
                this.Application.ComponentHandler.UnloadComponentInstances(sectorCurrent);
                yield this.Application.Storage.RemoveBySector(sectorCurrent);
                this.RemoveMustacheContextCache(sectorCurrent);
            }
            this.Application.Document.CleanSectorMetadata(sector);
            this.Application.Document.SetSectorElementInner(sector, null, null);
        });
    }
    RemoveByContainer(containerCode) {
        for (let i = this._activeSectorContainers.length - 1; i >= 0; i--) {
            const sectorContainer = this._activeSectorContainers[i];
            if (sectorContainer[1] !== containerCode)
                continue;
            const el = this.Application.Document.GetSectorElementInner(sectorContainer[0]);
            if ((el !== null) && (el.parentElement !== null))
                el.parentElement.removeChild(el);
            this._activeSectorContainers.splice(i, 1);
            break;
        }
        let removed = false;
        for (let i = this._containers.length - 1; i >= 0; i--) {
            const container = this._containers[i];
            if (container.ContainerCode !== containerCode)
                continue;
            if (container.Element != null && container.Element.parentElement != null)
                container.Element.parentElement.removeChild(container.Element);
            this._containers.splice(i, 1);
            removed = true;
            break;
        }
        return (removed);
    }
    RemoveBySector(sector) {
        for (let i = this._activeSectorContainers.length - 1; i >= 0; i--) {
            const sectorContainer = this._activeSectorContainers[i];
            if (sectorContainer[0] !== sector)
                continue;
            this._activeSectorContainers.splice(i, 1);
            break;
        }
        let removed = false;
        for (let i = this._containers.length - 1; i >= 0; i--) {
            const container = this._containers[i];
            if (container.Sector !== sector)
                continue;
            if ((!container.CanDetachElement) && (container.Element.parentElement != null))
                container.Element.parentElement.removeChild(container.Element);
            this._containers.splice(i, 1);
            removed = true;
        }
        return (removed);
    }
    GetStorageItem(sector, containerCode, dataKey) {
        for (let i = this._containers.length - 1; i >= 0; i--) {
            const container = this._containers[i];
            if ((container.Sector !== sector) || (container.ContainerCode !== containerCode))
                continue;
            for (let j = 0; j < container.StorageItems.length; j++) {
                const storageItem = container.StorageItems[j];
                if (storageItem.DataKey !== dataKey)
                    continue;
                if (storageItem.Sector !== sector)
                    continue;
                return (storageItem);
            }
            break;
        }
        return (null);
    }
    ReloadStorageItemByPipe(dataPipe) {
    }
    HasMustacheContextCache(sector, expression) {
        const indexSector = this.GetMustacheContextIndex(sector);
        if (indexSector === null)
            return (null);
        const indexExpression = this.GetMustacheContextExpressionIndex(indexSector, expression);
        if (indexExpression === null)
            return (null);
        return (this._sectorContextsValues[indexSector][indexExpression]);
    }
    RemoveMustacheContextCache(sector) {
        const indexSector = this.GetMustacheContextIndex(sector);
        if (indexSector === null)
            return;
        this._sectorContexts.splice(indexSector, 1);
        this._sectorContextsExpressions.splice(indexSector, 1);
        this._sectorContextsValues.splice(indexSector, 1);
    }
    AddMustacheContextCache(sector, expression, value) {
        let indexSector = this.GetMustacheContextIndex(sector);
        if (indexSector === null) {
            indexSector = this._sectorContexts.push(sector) - 1;
            this._sectorContextsExpressions.push([]);
            this._sectorContextsValues.push([]);
        }
        this._sectorContextsExpressions[indexSector].push(expression);
        this._sectorContextsValues[indexSector].push(value);
    }
    GetMustacheContextIndex(sector) {
        for (let i = 0; i < this._sectorContexts.length; i++)
            if (this._sectorContexts[i] === sector)
                return (i);
        return (null);
    }
    GetMustacheContextExpressionIndex(indexSector, expression) {
        const expressions = this._sectorContextsExpressions[indexSector];
        for (let i = 0; i < expressions.length; i++)
            if (expressions[i] === expression)
                return (i);
        return (null);
    }
}
//# sourceMappingURL=DrapoSectorContainerHandler.js.map