var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function parsenumberConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const value = el.getAttribute("dc-value");
        const culture = el.getAttribute("dc-culture");
        const numberParsed = app.Parser.ParseNumberCulture(value, culture);
        const valueFormat = app.Formatter.Format(numberParsed.toString(), "N2", "en");
        el.textContent = valueFormat;
    });
}
//# sourceMappingURL=parsenumber.js.map