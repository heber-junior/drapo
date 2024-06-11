var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function contextConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new Context(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class Context {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._model = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            const elFor = this.GetElementFor();
            const elComponent = this.GetElementComponent();
            elFor.setAttribute('d-for', elFor.getAttribute('d-for').replace('dc-for', this._el.getAttribute('dc-for')));
            elComponent.setAttribute('dc-model', elComponent.getAttribute('dc-model').replace('dc-property', this._el.getAttribute('dc-property')));
        });
    }
    GetElementFor() {
        return this._el.children[0];
    }
    GetElementComponent() {
        return this._el.children[0].children[0];
    }
}
//# sourceMappingURL=context.js.map