"use strict";
class DrapoSerializer {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this.JSON_START = '{';
        this.JSON_END = '}';
        this.JSON_ARRAY_START = '[';
        this.JSON_ARRAY_END = ']';
        this._application = application;
    }
    IsJson(data) {
        return ((this.IsJsonInstance(data)) || (this.IsJsonArray(data)));
    }
    IsJsonInstance(data) {
        if (data === null)
            return (false);
        if (data.length < 2)
            return (false);
        return ((data.substr != null) && (data.substr(0, 1) == this.JSON_START) && (data.substr(data.length - 1, 1) == this.JSON_END));
    }
    IsJsonArray(data) {
        if (data === null)
            return (false);
        if (data.length < 2)
            return (false);
        return ((data.substr != null) && (data.substr(0, 1) == this.JSON_ARRAY_START) && (data.substr(data.length - 1, 1) == this.JSON_ARRAY_END));
    }
    Deserialize(data) {
        if (!this.IsJson(data))
            return (data);
        return (JSON.parse(data));
    }
    Serialize(data) {
        if (data == null)
            return (null);
        return (JSON.stringify(data));
    }
    SerializeObject(data) {
        if (typeof data === "string")
            return (data);
        return (this.Serialize(data));
    }
    EncodeHeaderFieldValue(data) {
        if (data == null)
            return (null);
        return (data.replace(/(\r\n\t|\n|\r\t)/gm, ""));
    }
    EnsureASCII(data) {
        if (this.HasUnicode(data))
            return (this.ConvertToASCII(data));
        return (data);
    }
    HasUnicode(data) {
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            const index = char.charCodeAt(0);
            if (index > 127)
                return (true);
        }
        return (false);
    }
    ConvertToASCII(data) {
        let encoded = '';
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            const index = char.charCodeAt(0);
            encoded += '\\u' + index.toString(16).toUpperCase();
        }
        return (encoded);
    }
    EnsureUrlDecoded(value) {
        if ((value == null) || (value == '') || (value.indexOf == null))
            return (value);
        const hasPercentage = value.indexOf('%') >= 0;
        if (!hasPercentage)
            return (value);
        return (decodeURIComponent(value));
    }
}
//# sourceMappingURL=DrapoSerializer.js.map