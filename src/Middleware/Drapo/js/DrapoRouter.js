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
class DrapoRouter {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._routes = [];
        this._canUseRouter = null;
        this._application = application;
    }
    Create(url, sector, title, state) {
        const route = new DrapoRouteItem();
        route.Url = url;
        route.Sector = sector;
        route.Title = title;
        route.State = state;
        this._routes.push(route);
        return (route);
    }
    GetLastRouteUrlBySector(sector) {
        const route = this.GetLastRouteBySector(sector);
        if (route == null)
            return (null);
        return (route.Url);
    }
    GetLastRouteUrl() {
        for (let i = this._routes.length - 1; i >= 0; i--) {
            const route = this._routes[i];
            if (route.Url != null)
                return (route.Url);
        }
        return (null);
    }
    GetLastRouteBySector(sector) {
        for (let i = this._routes.length - 1; i >= 0; i--) {
            const route = this._routes[i];
            if (route.Sector === sector)
                return (route);
        }
        return (null);
    }
    GetLastRouteTitle() {
        for (let i = this._routes.length - 1; i >= 0; i--) {
            const route = this._routes[i];
            if (route.Title !== null)
                return (route.Title);
        }
        return (null);
    }
    CanUseRouter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._canUseRouter === null)
                this._canUseRouter = yield this.Application.Config.GetUseRouter();
            return (this._canUseRouter);
        });
    }
    Route(url, sector = null, title = null, state = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const canUseRouter = yield this.CanUseRouter();
            this.UpdateTitle(title);
            if (canUseRouter) {
                const route = this.Create(this.Application.Server.ResolveUrl(url), sector, title, state);
                history.pushState(null, route.Title, route.Url);
            }
            this._application.Log.WriteVerbose("Router - Route to {0}", url);
        });
    }
    OnPopState(e) {
        const route = this._routes.pop();
        if (route == null)
            return;
        const routePrevious = this.GetLastRouteBySector(route.Sector);
        const title = this.GetLastRouteTitle();
        this.UpdateTitle(title);
        this.Application.Document.StartUpdate(null);
        if (routePrevious == null) {
            this.Application.Document.LoadChildSectorDefault(route.Sector);
        }
        else {
            this.Application.Document.LoadChildSector(route.Sector, route.Url, route.Title, false);
        }
    }
    UpdateTitle(title) {
        if (title == null)
            return;
        if (title == '')
            return;
        if (title == '=')
            return;
        document.title = title;
    }
    UpdateURL(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlResolved = this.Application.Server.ResolveUrl(url);
            history.pushState(null, document.title, urlResolved);
        });
    }
}
//# sourceMappingURL=DrapoRouter.js.map