"use strict";
class DrapoSectorContainerItem {
    get Sector() {
        return (this._sector);
    }
    get ContainerCode() {
        return (this._containerCode);
    }
    get StorageItems() {
        return (this._storageItems);
    }
    get SectorHierarchys() {
        return this._sectorHierarchys;
    }
    get SectorFriends() {
        return this._sectorFriends;
    }
    get ComponentSectors() {
        return (this._componentSectors);
    }
    get ComponentTags() {
        return (this._componentTags);
    }
    get ComponentElements() {
        return (this._componentElements);
    }
    get ComponentInstances() {
        return (this._componentInstances);
    }
    get Element() {
        return this._element;
    }
    get CanDetachElement() {
        return this._canDetachElement;
    }
    constructor(sector, containerCode, storageItems, sectorHierarchys, sectorFriends, componentSectors, componentTags, componentElements, componentInstances, element, canDetachElement) {
        this._sector = null;
        this._containerCode = null;
        this._storageItems = [];
        this._sectorHierarchys = [];
        this._sectorFriends = [];
        this._componentSectors = [];
        this._componentTags = [];
        this._componentElements = [];
        this._componentInstances = [];
        this._element = null;
        this._canDetachElement = true;
        this._sector = sector;
        this._containerCode = containerCode;
        this._storageItems = storageItems;
        this._sectorHierarchys = sectorHierarchys;
        this._sectorFriends = sectorFriends;
        this._componentSectors = componentSectors;
        this._componentTags = componentTags;
        this._componentElements = componentElements;
        this._componentInstances = componentInstances;
        this._element = element;
        this._canDetachElement = canDetachElement;
    }
}
//# sourceMappingURL=DrapoSectorContainerItem.js.map