var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function checkboxclassConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkbox = new CheckboxClass(el, app);
        yield checkbox.Initalize();
        return (checkbox);
    });
}
class CheckboxClass {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._notify = true;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this._app.Document.GetSector(this._el);
            this._notify = (this._el.getAttribute("dc-notify") === "true");
            const checkboxValue = this._el.getAttribute('dc-value');
            this._el.removeAttribute('dc-value');
            const checkboxLabel = this._el.getAttribute('dc-label');
            this._el.removeAttribute('dc-label');
            const functionClick = this._el.getAttribute('dc-onclick');
            this._el.removeAttribute('dc-onclick');
            const onClick = "ToggleItemField(" + checkboxValue + "," + this._notify + ")";
            let onClicking = "";
            if (functionClick.length > 0)
                onClicking = onClick + ";Execute(" + functionClick + ")";
            if (onClicking == "")
                onClicking = onClick;
            const elCheckbox = this._el.children[1].children[0].children[0];
            elCheckbox.setAttribute('d-model', checkboxValue);
            const elLabel = this._el.children[1].children[0].children[1];
            elLabel.setAttribute('d-model', checkboxLabel);
            elLabel.setAttribute('d-on-click', onClicking);
        });
    }
}
//# sourceMappingURL=checkboxclass.js.map