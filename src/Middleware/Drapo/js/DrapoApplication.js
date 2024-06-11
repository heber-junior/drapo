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
class DrapoApplication {
    get IsLoaded() {
        return (this._isLoaded);
    }
    get Log() {
        return (this._logger);
    }
    get Router() {
        return (this._router);
    }
    get Server() {
        return (this._server);
    }
    get Observer() {
        return (this._observer);
    }
    get Document() {
        return (this._document);
    }
    get ControlFlow() {
        return (this._controlFlow);
    }
    get Parser() {
        return (this._parser);
    }
    get Storage() {
        return (this._storage);
    }
    get Solver() {
        return (this._solver);
    }
    get Binder() {
        return (this._binder);
    }
    get Config() {
        return (this._config);
    }
    get Register() {
        return (this._register);
    }
    get Serializer() {
        return (this._serializer);
    }
    get Barber() {
        return (this._barber);
    }
    get Searcher() {
        return (this._searcher);
    }
    get ModelHandler() {
        return (this._modelHandler);
    }
    get AttributeHandler() {
        return (this._attributeHandler);
    }
    get ClassHandler() {
        return (this._classHandler);
    }
    get EventHandler() {
        return (this._eventHandler);
    }
    get FunctionHandler() {
        return (this._functionHandler);
    }
    get ComponentHandler() {
        return (this._componentHandler);
    }
    get CookieHandler() {
        return (this._cookieHandler);
    }
    get SectorContainerHandler() {
        return (this._sectorContainerHandler);
    }
    get WindowHandler() {
        return (this._windowHandler);
    }
    get BehaviorHandler() {
        return (this._behaviorHandler);
    }
    get Plumber() {
        return (this._plumber);
    }
    get Formatter() {
        return (this._formatter);
    }
    get Validator() {
        return (this._validator);
    }
    get ExceptionHandler() {
        return (this._exceptionHandler);
    }
    get Globalization() {
        return (this._globalization);
    }
    get Stylist() {
        return (this._stylist);
    }
    get ViewportHandler() {
        return (this._viewportHandler);
    }
    get CacheHandler() {
        return (this._cacheHandler);
    }
    get Worker() {
        return (this._worker);
    }
    get Debugger() {
        return (this._debugger);
    }
    constructor() {
        this._isLoaded = false;
        this._logger = new DrapoLogger(this);
        this._router = new DrapoRouter(this);
        this._server = new DrapoServer(this);
        this._observer = new DrapoObserver(this);
        this._document = new DrapoDocument(this);
        this._controlFlow = new DrapoControlFlow(this);
        this._parser = new DrapoParser(this);
        this._storage = new DrapoStorage(this);
        this._solver = new DrapoSolver(this);
        this._binder = new DrapoBinder(this);
        this._config = new DrapoConfig(this);
        this._register = new DrapoRegister(this);
        this._serializer = new DrapoSerializer(this);
        this._barber = new DrapoBarber(this);
        this._searcher = new DrapoSearcher(this);
        this._modelHandler = new DrapoModelHandler(this);
        this._attributeHandler = new DrapoAttributeHandler(this);
        this._classHandler = new DrapoClassHandler(this);
        this._eventHandler = new DrapoEventHandler(this);
        this._functionHandler = new DrapoFunctionHandler(this);
        this._componentHandler = new DrapoComponentHandler(this);
        this._cookieHandler = new DrapoCookieHandler(this);
        this._sectorContainerHandler = new DrapoSectorContainerHandler(this);
        this._windowHandler = new DrapoWindowHandler(this);
        this._behaviorHandler = new DrapoBehaviorHandler(this);
        this._plumber = new DrapoPlumber(this);
        this._formatter = new DrapoFormatter(this);
        this._validator = new DrapoValidator(this);
        this._exceptionHandler = new DrapoExceptionHandler(this);
        this._globalization = new DrapoGlobalization(this);
        this._stylist = new DrapoStylist(this);
        this._viewportHandler = new DrapoViewportHandler(this);
        this._cacheHandler = new DrapoCacheHandler(this);
        this._worker = new DrapoWorker(this);
        this._debugger = new DrapoDebugger(this);
    }
    OnLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.Log.WriteVerbose('Application - OnLoad - Started');
                yield this.Debugger.Initialize();
                yield this.Plumber.ConnectPipe();
                yield this.CacheHandler.Initialize();
                yield this.Document.Resolve();
                yield this.Document.StartUnitTest();
                yield this.Debugger.ConnectDebugger();
                this._isLoaded = true;
                this.Log.WriteVerbose('Application - OnLoad - Finished');
            }
            catch (e) {
                yield this.ExceptionHandler.Handle(e, 'OnLoad');
            }
        });
    }
    show() {
        this.Debugger.ShowDebugger();
        return ('');
    }
    close() {
        this.Debugger.CloseDebugger();
        return ('');
    }
}
window.onload = () => {
    const application = new DrapoApplication();
    const windowAny = window;
    windowAny.drapo = application;
    application.OnLoad();
};
window.onpopstate = (e) => {
    const windowAny = window;
    const application = windowAny.drapo;
    application.Router.OnPopState(e);
};
window.addEventListener('message', (event) => {
    const windowAny = window;
    const application = windowAny.drapo;
    application.Document.ReceiveMessage(event.data);
}, false);
//# sourceMappingURL=DrapoApplication.js.map