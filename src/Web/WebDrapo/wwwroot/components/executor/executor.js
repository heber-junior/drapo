var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function executorConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new Executor(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class Executor {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this._app.Document.GetSector(this._el);
            const dataKeyClipboard = this._el.getAttribute('dc-clipboard');
            if (dataKeyClipboard != null && dataKeyClipboard.length > 0) {
                yield this._app.FunctionHandler.ResolveFunctionWithoutContext(this._sector, this._el, 'UpdateDataField(' + dataKeyClipboard + ',ExecutorSector,' + this._sector + ')');
            }
        });
    }
    Increment(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let valueNumber = this._app.Parser.GetStringAsNumber(value) + 1;
            return (valueNumber.toString());
        });
    }
}
//# sourceMappingURL=executor.js.map