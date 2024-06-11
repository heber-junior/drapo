var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function uploaderConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploader = new Uploader(el, app);
        yield uploader.Initalize();
        return (uploader);
    });
}
class Uploader {
    get Application() {
        return (this._app);
    }
    constructor(el, app) {
        this._el = null;
        this._sector = null;
        this._dataKeySource = null;
        this._dataFieldName = null;
        this._dataFieldData = null;
        this._dataMessage = null;
        this._dataFileExtensionType = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._sector = this.Application.Document.GetSector(this._el);
            this._dataKeySource = this._el.getAttribute("d-dataKeySource");
            this._dataFieldName = this._el.getAttribute("d-dataFieldName");
            this._dataFieldData = this._el.getAttribute("d-dataFieldData");
            this._dataMessage = this._el.getAttribute("d-dataMessage");
            this._dataFileExtensionType = this._el.getAttribute("d-dataFileExtensionType");
            const dataKeyFileExtensionsDefault = this._el.getAttribute('dc-fileextensionsdefault');
            if (this._app.Parser.IsMustache(this._dataFileExtensionType))
                this._dataFileExtensionType = yield this._app.Storage.RetrieveDataValue(this._sector, this._dataFileExtensionType);
            if ((this._dataFileExtensionType == null) || (this._dataFileExtensionType == '') && (dataKeyFileExtensionsDefault != ''))
                this._dataFileExtensionType = yield this._app.Storage.RetrieveDataValue(this._sector, dataKeyFileExtensionsDefault);
            const mustacheName = this.GetFileNameMustache();
            const uploader = this;
            this._el.addEventListener('dragover', (evt) => { uploader.HandleDragOver(evt); }, false);
            this._el.addEventListener('drop', (evt) => { uploader.HandleDrop(evt); }, false);
            const elDrop = this.GetElementDrop();
            elDrop.addEventListener('click', (evt) => { uploader.HandleClick(evt); }, false);
            const elFile = this.GetElementInputFile();
            elFile.addEventListener('change', (evt) => { uploader.HandleChange(evt); }, false);
            const elButton = this.GetElementButton();
            elButton.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { yield uploader.HandleDownload(evt); }), false);
            this.Application.Observer.SubscribeComponent(mustacheName, this._el, () => __awaiter(this, void 0, void 0, function* () { yield uploader.Notify(); }), this._el);
            yield this.DisableDownloadButton();
            return (this.Notify());
        });
    }
    GetElementInputFile() {
        const elinput = this._el.children[2];
        if (this._dataFileExtensionType !== '.*')
            elinput.setAttribute('accept', this._dataFileExtensionType);
        return elinput;
    }
    GetElementMessage() {
        return this._el.children[1].children[0];
    }
    GetElementDrop() {
        return this._el.children[1];
    }
    GetElementButton() {
        return this._el.children[0];
    }
    GetFileNameMustache() {
        if (this._dataKeySource != null)
            return ('{{' + this._dataKeySource + '.' + this._dataFieldName + '}}');
        return (this._dataFieldName);
    }
    GetName() {
        return __awaiter(this, void 0, void 0, function* () {
            const nameMustache = this.GetFileNameMustache();
            const nameMustachePath = this.Application.Parser.ParseMustache(nameMustache);
            const nameKey = this.Application.Solver.ResolveDataKey(nameMustachePath);
            const data = yield this.Application.Storage.RetrieveData(nameKey, this._sector);
            const name = this.Application.Solver.ResolveDataObjectPathObject(data, nameMustachePath);
            if ((name == null) || (name == ''))
                return ('');
            return (name);
        });
    }
    GetFileDataMustache() {
        if (this._dataKeySource != null)
            return ('{{' + this._dataKeySource + '.' + this._dataFieldData + '}}');
        return (this._dataFieldData);
    }
    DisableDownloadButton() {
        return __awaiter(this, void 0, void 0, function* () {
            const dataValue = yield this.GetValue();
            const downloadButton = yield this.GetElementButton();
            if (dataValue == null || dataValue == '') {
                downloadButton.setAttribute("class", "suDownloadDisabled");
            }
            else {
                downloadButton.setAttribute("class", "ppUploaderButton");
            }
        });
    }
    HandleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }
    HandleDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        const files = evt.dataTransfer.files;
        if ((files == null) || (files.length == 0))
            return;
        const file = files[0];
        this.HandleFile(file);
    }
    IsValidFileNameExtension(name) {
        if (this._dataFileExtensionType === '.*')
            return (true);
        const types = this._dataFileExtensionType.split(',');
        for (let i = 0; i < types.length; i++) {
            const type = types[i].trim();
            if (name.endsWith(type))
                return (true);
        }
        return (false);
    }
    HandleClick(evt) {
        const elementInputFile = this.GetElementInputFile();
        elementInputFile.click();
    }
    HandleChange(evt) {
        const files = evt.target.files;
        if ((files == null) || (files.length == 0))
            return;
        const file = files[0];
        this.HandleFile(file);
    }
    HandleDownload(evt) {
        return __awaiter(this, void 0, void 0, function* () {
            evt.stopPropagation();
            evt.preventDefault();
            const dataName = yield this.GetName();
            if ((dataName == null) || (dataName == ''))
                return;
            const dataValue = yield this.GetValue();
            this.Download(dataName, dataValue);
        });
    }
    GetValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const dataMustache = this.GetFileDataMustache();
            const dataMustachePath = this.Application.Parser.ParseMustache(dataMustache);
            const dataKey = this.Application.Solver.ResolveDataKey(dataMustachePath);
            const data = yield this.Application.Storage.RetrieveData(dataKey, this._sector);
            const dataValue = this.Application.Solver.ResolveDataObjectPathObject(data, dataMustachePath);
            return dataValue;
        });
    }
    Download(name, dataBase64) {
        const dataCharacters = atob(dataBase64);
        const dataBytes = new Array(dataCharacters.length);
        for (let i = 0; i < dataCharacters.length; i++) {
            dataBytes[i] = dataCharacters.charCodeAt(i);
        }
        const data = new Uint8Array(dataBytes);
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const navigator = window.navigator;
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, name);
        }
        else {
            const elDownloader = document.createElement('a');
            elDownloader.href = window.URL.createObjectURL(blob);
            elDownloader.download = name;
            elDownloader.style.display = 'none';
            document.body.appendChild(elDownloader);
            elDownloader.click();
            document.body.removeChild(elDownloader);
        }
    }
    Notify() {
        return __awaiter(this, void 0, void 0, function* () {
            const name = yield this.GetName();
            const elMessage = this.GetElementMessage();
            if ((name == null) || (name == '')) {
                const isMustache = this.Application.Parser.IsMustache(this._dataMessage);
                if (isMustache) {
                    const dataMessage = yield this.Application.Storage.RetrieveDataValue(this._sector, this._dataMessage);
                    elMessage.textContent = dataMessage;
                    elMessage.title = dataMessage;
                }
                else {
                    elMessage.textContent = this._dataMessage;
                    elMessage.title = this._dataMessage;
                }
            }
            else {
                elMessage.textContent = name;
                elMessage.title = name;
            }
        });
    }
    HandleFile(file) {
        const name = file.name;
        if (!this.IsValidFileNameExtension(name))
            return;
        const reader = new FileReader();
        const uploader = this;
        reader.addEventListener("load", () => __awaiter(this, void 0, void 0, function* () {
            yield uploader.UpdateData(file.name, uploader.ExtractBase64(reader.result));
        }), false);
        reader.readAsDataURL(file);
    }
    ExtractBase64(data) {
        const index = data.toString().indexOf('base64,');
        if (index == -1)
            return (data);
        return (data.toString().substr(index + 7));
    }
    UpdateData(fileName, fileData) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataMustache = this.GetFileDataMustache();
            const dataMustachePath = this.Application.Parser.ParseMustache(dataMustache);
            const dataKey = this.Application.Solver.ResolveDataKey(dataMustachePath);
            const dataPath = this.Application.Solver.ResolveDataFields(dataMustachePath);
            yield this.Application.Storage.SetDataKeyField(dataKey, this._sector, dataPath, fileData, true);
            const nameMustache = this.GetFileNameMustache();
            const nameMustachePath = this.Application.Parser.ParseMustache(nameMustache);
            const nameKey = this.Application.Solver.ResolveDataKey(nameMustachePath);
            const namePath = this.Application.Solver.ResolveDataFields(nameMustachePath);
            yield this.Application.Storage.SetDataKeyField(nameKey, this._sector, namePath, fileName, true);
            yield this.DisableDownloadButton();
        });
    }
}
//# sourceMappingURL=uploader.js.map