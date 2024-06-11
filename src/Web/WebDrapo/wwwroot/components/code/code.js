var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function codeConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new Code(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class Code {
    constructor(el, app) {
        this._el = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            const elContent = this.GetElementContent();
            const elCode = this.GetElementCode();
            const content = this._app.Document.GetHTML(elContent);
            const contentEncoded = this._app.Document.GetHTMLEncoded(content);
            this._app.Document.RemoveElement(elContent);
            this._app.Document.SetHTML(elCode, contentEncoded);
        });
    }
    GetElementContent() {
        return this._el.children[0];
    }
    GetElementCode() {
        return this._el.children[1];
    }
}
//# sourceMappingURL=code.js.map