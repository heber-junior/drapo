var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function compositeConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new Composite(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class Composite {
    constructor(el, app) {
        this._el = null;
        this._dataKeySource = null;
        this._sector = null;
        this._sectors = false;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this._app._document.GetSector(this._el);
            this._dataKeySource = this._el.getAttribute("dc-dataKeySource");
            this._sectors = this._el.getAttribute("dc-sectors") === 'true';
            let instance = this;
            this._app._observer.SubscribeComponent(this._dataKeySource, this._el, () => __awaiter(this, void 0, void 0, function* () { return (yield instance.Render()); }));
            yield this.Render();
        });
    }
    GetElementItems() {
        return this._el.children[0];
    }
    GetCount() {
        return __awaiter(this, void 0, void 0, function* () {
            let dataValue = yield this._app._storage.RetrieveDataValue(this._sector, this._dataKeySource);
            return (Number(dataValue));
        });
    }
    Render() {
        return __awaiter(this, void 0, void 0, function* () {
            let elItems = this.GetElementItems();
            elItems.innerHTML = '';
            let fragment = document.createDocumentFragment();
            let count = yield this.GetCount();
            for (let i = 0; i < count; i++) {
                let elItem = document.createElement('div');
                if (this._sectors)
                    elItem.setAttribute('d-sector', '@');
                let elComponent = document.createElement('d-dataValue');
                elComponent.setAttribute('d-dataValue', this._dataKeySource);
                elItem.appendChild(elComponent);
                fragment.appendChild(elItem);
            }
            elItems.appendChild(fragment);
            return (count != 42);
        });
    }
}
//# sourceMappingURL=composite.js.map