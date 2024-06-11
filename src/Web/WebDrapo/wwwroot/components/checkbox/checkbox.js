var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function checkboxConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let checkbox = new Checkbox(el, app);
        yield checkbox.Initalize();
        return (checkbox);
    });
}
class Checkbox {
    constructor(el, app) {
        this._el = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            let checkboxValue = this._el.getAttribute('dc-value');
            this._el.removeAttribute('dc-value');
            let checkboxLabel = this._el.getAttribute('dc-label');
            this._el.removeAttribute('dc-label');
            let functionClick = this._el.getAttribute('dc-onclick');
            this._el.removeAttribute('dc-onclick');
            let onClick = "ToggleItemField(" + checkboxValue + ")";
            let onClicking = "";
            if (functionClick.length > 0)
                onClicking = onClick + ";Execute(" + functionClick + ")";
            if (onClicking == "")
                onClicking = onClick;
            let elCheckbox = this._el.children[0].children[0].children[0];
            elCheckbox.setAttribute('d-model', checkboxValue);
            let elLabel = this._el.children[0].children[0].children[1];
            elLabel.setAttribute('d-model', checkboxLabel);
            elLabel.setAttribute('d-on-click', onClicking);
        });
    }
}
//# sourceMappingURL=checkbox.js.map