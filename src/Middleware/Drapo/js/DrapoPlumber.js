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
class DrapoPlumber {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._connection = null;
        this._lock = false;
        this._messages = [];
        this._actionPolling = null;
        this._pollingMessages = [];
        this._application = application;
    }
    CanUsePipes() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.Application.Config.GetUsePipes());
        });
    }
    ConnectPipe() {
        return __awaiter(this, void 0, void 0, function* () {
            const usePipes = yield this.CanUsePipes();
            if (!usePipes)
                return (false);
            const application = this.Application;
            const pipHubName = yield this.Application.Config.GetPipeHubName();
            const urlRelative = '~/' + pipHubName;
            const urlAbsolute = this.Application.Server.ResolveUrl(urlRelative);
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(urlAbsolute, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
                .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount < 10)
                        return (1000);
                    if (retryContext.previousRetryCount < 100)
                        return (10000);
                    return (60000);
                }
            })
                .build();
            this._connection = connection;
            yield connection.start();
            const actionNotify = yield this.Application.Config.GetPipeActionNotify();
            connection.on(actionNotify, (message) => {
                application.Plumber.NotifyPipe(message);
            });
            this._actionPolling = yield this.Application.Config.GetPipeActionPolling();
            connection.on(this._actionPolling, (message) => {
                application.Plumber.ReceivePollingPipe(message);
            });
            connection.onreconnected((connectionId) => __awaiter(this, void 0, void 0, function* () {
                yield this.RequestPipeRegister(connection);
                const onReconnect = yield this.Application.Config.GetOnReconnect();
                if ((onReconnect != null) && (onReconnect != ''))
                    yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, onReconnect);
            }));
            yield this.RequestPipeRegister(connection);
            return (true);
        });
    }
    RequestPipeRegister(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionRegister = yield this.Application.Config.GetPipeActionRegister();
            yield connection.send(actionRegister);
            yield this.WaitForRegister();
        });
    }
    WaitForRegister(retry = 1000, interval = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeHeaderConnectionId = yield this.Application.Config.GetPipeHeaderConnectionId();
            for (let i = 0; i < retry; i++) {
                const register = this.Application.Server.GetRequestHeader(pipeHeaderConnectionId);
                if (register != null)
                    return (register);
                yield this.Application.Document.Sleep(interval);
            }
            return (null);
        });
    }
    NotifyPipe(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this._lock) {
                    this._messages.push(message);
                    return;
                }
                if (message.Type == DrapoPipeMessageType.Storage)
                    yield this.NotifyPipeStorage(message);
                else if (message.Type == DrapoPipeMessageType.Register)
                    yield this.NofityPipeRegister(message);
                else if (message.Type == DrapoPipeMessageType.Execute)
                    yield this.NofityPipeExecute(message);
            }
            catch (e) {
                yield this.Application.ExceptionHandler.Handle(e, 'DrapoPlumber - NotifyPipe');
            }
        });
    }
    NotifyPipeStorage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPipes = this.Application.Parser.ParsePipes(message.Data);
            if (dataPipes == null)
                return;
            for (let i = 0; i < dataPipes.length; i++) {
                const dataPipe = dataPipes[i];
                yield this.Application.Debugger.AddPipe(dataPipe);
                yield this.Application.Storage.ReloadPipe(dataPipe);
                this.Application.SectorContainerHandler.ReloadStorageItemByPipe(dataPipe);
            }
        });
    }
    NofityPipeRegister(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeHeaderConnectionId = yield this.Application.Config.GetPipeHeaderConnectionId();
            this.Application.Server.AddRequestHeader(pipeHeaderConnectionId, message.Data);
        });
    }
    NofityPipeExecute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Application.FunctionHandler.ResolveFunctionWithoutContext(null, null, message.Data);
        });
    }
    SendPolling(pollingKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = this.GetMessagePolling(pollingKey);
            if (message === null) {
                message = new DrapoPipePollingMessage();
                message.Key = pollingKey;
                this._pollingMessages.push(message);
            }
            else {
                message.Hash = null;
            }
            yield this._connection.invoke(this._actionPolling, message);
            const pollingHash = yield this.WaitForMessagePollingHash(pollingKey);
            return (pollingHash);
        });
    }
    GetMessagePolling(key) {
        for (let i = this._pollingMessages.length - 1; i >= 0; i--) {
            const currentMessage = this._pollingMessages[i];
            if (currentMessage.Key !== key)
                continue;
            return (currentMessage);
        }
        return (null);
    }
    WaitForMessagePollingHash(pollingKey, retry = 1000, interval = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < retry; i++) {
                for (let j = this._pollingMessages.length - 1; j >= 0; j--) {
                    const currentMessage = this._pollingMessages[j];
                    if ((currentMessage.Key !== pollingKey) || (currentMessage.Hash === null))
                        continue;
                    this._pollingMessages.splice(j, 1);
                    return (currentMessage.Hash);
                }
                yield this.Application.Document.Sleep(interval);
            }
            return (null);
        });
    }
    ReceivePollingPipe(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMessage = this.GetMessagePolling(message.Key);
            if (currentMessage !== null)
                currentMessage.Hash = message.Hash;
        });
    }
    Lock() {
        if (this._lock)
            return (false);
        this._lock = true;
        return (true);
    }
    Unlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._lock)
                return (false);
            this._lock = false;
            for (let i = this._messages.length - 1; i >= 0; i--) {
                const message = this._messages[i];
                yield this.NotifyPipe(message);
            }
            this._messages.length = 0;
            return (true);
        });
    }
    Clear() {
        this._messages.length = 0;
    }
}
//# sourceMappingURL=DrapoPlumber.js.map