var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function labelcontextConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new LabelContext(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class LabelContext {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._model = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this._app._document.GetSector(this._el);
            this._model = this._el.getAttribute("dc-model");
            const elModel = this.GetElementModel();
            elModel.textContent = this._model.substring(2, this._model.length - 2);
            const labelContext = this;
            this._app._observer.SubscribeComponent(this._model, this._el, () => __awaiter(this, void 0, void 0, function* () { yield labelContext.Update(); }));
            yield this.Update();
        });
    }
    GetElementModel() {
        return this._el.children[0];
    }
    GetElementContent() {
        return this._el.children[1];
    }
    Update() {
        return __awaiter(this, void 0, void 0, function* () {
            const elContent = this.GetElementContent();
            const data = yield this._app._storage.RetrieveDataValue(this._sector, this._model);
            elContent.textContent = data;
        });
    }
}
//# sourceMappingURL=labelcontext.js.map