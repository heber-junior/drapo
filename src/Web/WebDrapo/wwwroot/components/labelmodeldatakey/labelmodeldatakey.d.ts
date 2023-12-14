/// <reference types="drapo" />
declare function labelmodeldatakeyConstructor(el: HTMLElement, app: DrapoApplication): Promise<Labelmodeldatakey>;
declare class Labelmodeldatakey {
    private _el;
    private _app;
    private _sector;
    private _model;
    private _datakey;
    constructor(el: HTMLElement, app: DrapoApplication);
    Initalize(): Promise<void>;
    private GetElementModel;
    private GetElementDataKey;
}
