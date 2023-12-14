async function labelmodeldatakeyConstructor(el: HTMLElement, app: DrapoApplication): Promise<Labelmodeldatakey> {
    //Initialize
    let instance: Labelmodeldatakey = new Labelmodeldatakey(el, app);
    await instance.Initalize();
    return (instance);
}

class Labelmodeldatakey {
    private _el: HTMLElement = null;
    private _app: DrapoApplication;
    private _sector: string = null;
    private _model: any = null;
    private _datakey: any = null;

    constructor(el: HTMLElement, app: DrapoApplication) {
        this._el = el;
        this._app = app;
        this._sector = app.Document.GetSector(el);
    }

    public async Initalize(): Promise<void> {
        this._datakey = this._el.getAttribute('dc-dataKey');
        this._model = this._el.getAttribute('dc-model');

        const elModel: HTMLSpanElement = this.GetElementModel();
        const dataModel: any = await this._app.Storage.RetrieveDataValue(this._sector, this._model);
        elModel.textContent = dataModel;

        const elDataKey: HTMLSpanElement = this.GetElementDataKey();
        const dataKey: any = await this._app.Storage.RetrieveDataValue(this._sector, this._datakey);
        elDataKey.textContent = dataKey;

        console.log(this._datakey + ' ' + this._model);
    }

    private GetElementModel(): HTMLSpanElement {
        return <HTMLSpanElement>this._el.children[1].children[1];
    }

    private GetElementDataKey(): HTMLSpanElement {
        return <HTMLSpanElement>this._el.children[1].children[3];
    }
}