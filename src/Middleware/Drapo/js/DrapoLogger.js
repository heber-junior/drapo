"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DrapoLogger {
    get Application() {
        return (this._application);
    }
    set ShowHtml(value) {
        this._showHtml = value;
    }
    get ShowHTML() {
        return (this._showHtml);
    }
    set AllowVerbose(value) {
        this._allowVerbose = value;
    }
    get AllowVerbose() {
        return (this._allowVerbose);
    }
    set AllowError(value) {
        this._allowError = value;
    }
    get AllowError() {
        return (this._allowError);
    }
    constructor(application) {
        this._showHtml = false;
        this._allowVerbose = false;
        this._allowError = true;
        this._application = application;
    }
    WriteVerbose(message, ...parameters) {
        if (this.AllowVerbose)
            console.log(this.CreateMessage(message, parameters));
    }
    WriteError(message, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const error = this.CreateMessage(message, parameters);
            yield this.Application.Debugger.AddError(error);
            if (this.AllowError)
                console.log(error);
        });
    }
    CreateMessage(message, parameters) {
        let messageReplaced = message;
        for (let i = 0; i < parameters.length; i++)
            messageReplaced = messageReplaced.replace("{" + i + "}", parameters[i]);
        return (messageReplaced);
    }
}
//# sourceMappingURL=DrapoLogger.js.map