var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function parsedateConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const value = el.getAttribute("dc-value");
        const culture = el.getAttribute("dc-culture");
        const format = el.getAttribute("dc-format");
        const date = app.Parser.ParseDateCulture(value, culture);
        const dateFormat = date != null ? app.Formatter.Format(date.toISOString(), format, culture) : 'invalid';
        el.textContent = dateFormat;
    });
}
//# sourceMappingURL=parsedate.js.map