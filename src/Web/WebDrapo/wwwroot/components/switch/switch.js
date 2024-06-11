var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function switchConstructor(el, app) {
    return (switch_render(el, app));
}
function switch_render(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const mustacheModel = el.getAttribute('dc-model');
        const functionClick = el.getAttribute('dc-on-click');
        const valueTitleTurnOn = el.getAttribute('dc-titleTurnOn');
        const valueTitleTurnOff = el.getAttribute('dc-titleTurnOff');
        const valueTurnOn = el.getAttribute('dc-valueTurnOn');
        const valueTurnOff = el.getAttribute('dc-valueTurnOff');
        el.removeAttribute('dc-model');
        el.removeAttribute('dc-on-click');
        el.removeAttribute('dc-titleTurnOn');
        el.removeAttribute('dc-titleTurnOff');
        el.removeAttribute('dc-valueTurnOn');
        el.removeAttribute('dc-valueTurnOff');
        const elChild = el.children.item(0);
        elChild.setAttribute('d-model', mustacheModel);
        const elSpanOn = el.children.item(1);
        const elSpanOff = el.children.item(2);
        elSpanOn.setAttribute('d-attr-title', valueTitleTurnOff);
        elSpanOff.setAttribute('d-attr-title', valueTitleTurnOn);
        if (valueTurnOn || valueTurnOff) {
            const turnOnAction = `UpdateItemField(${mustacheModel},${valueTurnOn})`;
            const turnOffAction = `UpdateItemField(${mustacheModel},${valueTurnOff})`;
            const toogleSpanOn = functionClick
                ? `${turnOffAction};${functionClick}`
                : turnOffAction;
            const toogleSpanOff = functionClick
                ? `${turnOnAction};${functionClick}`
                : turnOnAction;
            elSpanOn.setAttribute('d-if', `${mustacheModel}=${valueTurnOn}`);
            elSpanOn.setAttribute('d-on-click', toogleSpanOn);
            elSpanOff.setAttribute('d-if', `${mustacheModel}=${valueTurnOff}`);
            elSpanOff.setAttribute('d-on-click', toogleSpanOff);
        }
        else {
            elSpanOn.setAttribute('d-if', mustacheModel);
            elSpanOn.setAttribute('d-on-click', functionClick);
            elSpanOff.setAttribute('d-if', ('!' + mustacheModel));
            elSpanOff.setAttribute('d-on-click', functionClick);
        }
    });
}
//# sourceMappingURL=switch.js.map