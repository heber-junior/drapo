var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function incrementConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new Increment(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class Increment {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._el = el;
        this._app = app;
        this._sector = app._document.GetSector(el);
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            let instance = this;
            const dataKey = this._el.getAttribute('dc-dataKey');
            this._app._observer.SubscribeComponent(dataKey, this._el, () => __awaiter(this, void 0, void 0, function* () { yield instance.Notify(); }));
        });
    }
    Notify() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._app._functionHandler.ResolveFunctionWithoutContext(this._sector, this._el, 'AddDataItem(data,any)');
        });
    }
}
//# sourceMappingURL=increment.js.map