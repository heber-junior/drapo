var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function autoclickConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new AutoClick(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class AutoClick {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._model = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            const elButton = this.GetElementButton();
            elButton.setAttribute('d-attr-value', this._el.getAttribute('dc-model'));
            elButton.setAttribute('d-on-click', this._el.getAttribute('dc-click'));
        });
    }
    GetElementButton() {
        return this._el.children[0];
    }
}
//# sourceMappingURL=autoclick.js.map