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
class DrapoExecutionContext {
    get HasError() {
        return (this._hasError);
    }
    set HasError(value) {
        this._hasError = value;
    }
    get CanReset() {
        return (this._canReset);
    }
    set CanReset(value) {
        this._canReset = value;
    }
    get HasBreakpoint() {
        return (this._hasBreakpoint);
    }
    set HasBreakpoint(value) {
        this._hasBreakpoint = value;
    }
    get Sector() {
        return (this._sector);
    }
    set Sector(value) {
        this._sector = value;
    }
    get DataKey() {
        return (this._dataKey);
    }
    set DataKey(value) {
        this._dataKey = value;
    }
    get Data() {
        return (this._data);
    }
    set Data(value) {
        this._data = value;
    }
    get Stack() {
        return (this._stack);
    }
    constructor(application) {
        this._application = null;
        this._hasError = false;
        this._canReset = false;
        this._hasBreakpoint = false;
        this._sector = '';
        this._dataKey = '';
        this._data = null;
        this._sectorContainer = [];
        this._windowsAutoClose = [];
        this._stack = new DrapoStack();
        this._application = application;
    }
    Continue() {
        return __awaiter(this, void 0, void 0, function* () {
            return (!this._hasError);
        });
    }
    AddSectorContainer(sector, containerCode) {
        for (let i = 0; i < this._sectorContainer.length; i++) {
            const tuple = this._sectorContainer[i];
            if (tuple[0] !== sector)
                continue;
            tuple[1] = containerCode;
            break;
        }
        this._sectorContainer.push([sector, containerCode]);
    }
    HasSectorContainer(sector) {
        for (let i = 0; i < this._sectorContainer.length; i++) {
            const tuple = this._sectorContainer[i];
            if (tuple[0] === sector)
                return (true);
        }
        return (false);
    }
    GetSectorContainer(sector) {
        for (let i = 0; i < this._sectorContainer.length; i++) {
            const tuple = this._sectorContainer[i];
            if (tuple[0] === sector)
                return (tuple[1]);
        }
        return (null);
    }
    AddWindowAutoClose(window) {
        this._windowsAutoClose.push(window);
    }
    GetWindowsAutoClose() {
        return (this._windowsAutoClose);
    }
}
//# sourceMappingURL=DrapoExecutionContext.js.map