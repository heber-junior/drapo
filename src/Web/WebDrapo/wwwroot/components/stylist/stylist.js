var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function stylistConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new Stylist(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class Stylist {
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._size = null;
        this._color = null;
        this._name = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this._app._document.GetSector(this._el);
            this._size = this._el.getAttribute("dc-size");
            this._color = this._el.getAttribute("dc-color");
            this._name = this._el.getAttribute("dc-name");
            const elBlock = this._el.children[1].children[0];
            const values = [];
            values.push(['position', 'relative']);
            values.push(['float', 'left']);
            values.push(['margin', '5px']);
            values.push(['background-color', this._color]);
            values.push(['width', this._size]);
            values.push(['height', this._size]);
            this._name = this._app._stylist.Create(values, this._name);
            elBlock.className = this._name;
        });
    }
}
//# sourceMappingURL=stylist.js.map