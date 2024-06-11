var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function documentcounterConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new DocumentCounter(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class DocumentCounter {
    constructor(el, app) {
        this._el = null;
        this._app = null;
        this._counter = 0;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            document.addEventListener('mouseup', (evt) => __awaiter(this, void 0, void 0, function* () { return yield (this.HandleDocumentMouseUp(evt)); }), false);
            this._el.innerText = this._counter.toString();
        });
    }
    HandleDocumentMouseUp(evt) {
        return __awaiter(this, void 0, void 0, function* () {
            this._counter++;
            this._el.innerText = this._counter.toString();
        });
    }
}
//# sourceMappingURL=documentcounter.js.map