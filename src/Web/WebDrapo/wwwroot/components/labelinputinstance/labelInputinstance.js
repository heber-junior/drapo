var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function labelinputinstanceConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new LabelInputInstance(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class LabelInputInstance {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this._app.Document.GetSector(this._el);
            let dataKey = this._el.getAttribute("d-dataKeySource");
            let instance = this;
            this._app.Observer.SubscribeComponent(dataKey, this._el, function () { instance.Notify(); });
            yield this.Notify();
        });
    }
    Notify() {
        return __awaiter(this, void 0, void 0, function* () {
            let sector = this._app.Document.GetSector(this._el);
            let dataKey = this._el.getAttribute("d-dataKeySource");
            let dataField = this._el.getAttribute("d-dataKeyField");
            let caption = this._el.getAttribute("d-caption");
            let label = this._el.children[0];
            let input = this._el.children[this._el.children.length - 1];
            this._app.Document.SetHTML(label, caption);
            let dataItem = yield this._app.Storage.RetrieveData(dataKey, sector);
            let value = (dataItem != null) ? dataItem[dataField] : '';
            this._app.Document.SetHTML(input, value);
        });
    }
    Update(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataKey = this._el.getAttribute("d-dataKeySource");
            let dataField = this._el.getAttribute("d-dataKeyField");
            let mustache = '{{' + dataKey + '.' + dataField + '}}';
            let dataPath = this._app.Parser.ParseMustache(mustache);
            yield this._app.Storage.UpdateDataPath(this._sector, null, dataPath, value);
        });
    }
}
//# sourceMappingURL=labelInputinstance.js.map