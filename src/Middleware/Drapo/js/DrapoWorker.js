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
class DrapoWorker {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._pollingItem = null;
        this._pollingTimeout = null;
        this._application = application;
    }
    Check() {
        const item = this.Application.Storage.GetCachedDataItemByDatePolling();
        if (item == null) {
            this.Destroy(true);
            return;
        }
        if ((this._pollingItem != null) && (this._pollingItem === item))
            return;
        this._pollingItem = item;
        const application = this.Application;
        this._pollingTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            application.Worker.Destroy(false);
            yield application.Worker.Work(item);
        }), item.PollingTimespan);
    }
    Destroy(cleanItem) {
        if (this._pollingTimeout !== null) {
            clearTimeout(this._pollingTimeout);
            this._pollingTimeout = null;
        }
        if (cleanItem)
            this._pollingItem = null;
    }
    Work(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.Application.Storage.ExistCachedDataItem(item)) {
                this.Check();
                return;
            }
            const pollingHash = yield this.Application.Plumber.SendPolling(item.PollingKey);
            if (!this.Application.Storage.ExistCachedDataItem(item)) {
                this.Check();
                return;
            }
            if (item.PollingHash !== pollingHash) {
                item.PollingHash = pollingHash;
                yield this.Application.Storage.ExecuteCachedDataItemPolling(item);
            }
            item.CheckpointPolling();
            this._pollingItem = null;
            this.Check();
        });
    }
}
//# sourceMappingURL=DrapoWorker.js.map