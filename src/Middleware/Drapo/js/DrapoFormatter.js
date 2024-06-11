"use strict";
class DrapoFormatter {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._application = application;
    }
    Format(value, format, culture = null, applyTimezone = null) {
        if ((value == null) || (value === ''))
            return ('');
        if (this.Application.Parser.IsBoolean(value))
            return (value);
        if (this.Application.Parser.IsNumber(value))
            return (this.FormatNumber(this.Application.Parser.ParseNumber(value), format, culture));
        return (this.FormatDate(value, format, culture, applyTimezone == null ? true : applyTimezone));
    }
    FormatDate(value, format, culture, applyTimezone) {
        const date = this.Application.Parser.ParseDate(value);
        if (date === null)
            return (value);
        if (applyTimezone) {
            const timeZone = this.Application.Config.GetTimezone();
            if (timeZone != null)
                date.setHours(date.getHours() + timeZone);
        }
        const formatConverted = this.ConvertDateFormat(format, culture);
        const formatTokens = this.Application.Parser.ParseFormat(formatConverted);
        const dateFormatted = this.GetDateFormattedTokens(date, formatTokens, culture);
        return (dateFormatted);
    }
    ConvertDateFormat(format, culture) {
        let formatConverted = format;
        switch (format) {
            case "d":
            case "D":
            case "t":
            case "T":
            case "g":
            case "G":
            case "r":
                formatConverted = this.Application.Globalization.GetDateFormat(format, culture);
                break;
        }
        return (formatConverted);
    }
    GetDateFormattedTokens(date, formatTokens, culture) {
        let dateCulture = '';
        for (let i = 0; i < formatTokens.length; i++) {
            const formatToken = formatTokens[i];
            dateCulture = dateCulture + this.GetDateFormattedToken(date, formatToken, culture);
        }
        return (dateCulture);
    }
    GetDateFormattedToken(date, formatToken, culture) {
        let dateFormat = formatToken;
        switch (formatToken) {
            case 'YYYY':
            case 'yyyy':
                dateFormat = date.getFullYear().toString();
                break;
            case 'YY':
            case 'yy':
                const yearFull = date.getFullYear().toString();
                dateFormat = yearFull.substring(2);
                break;
            case 'M':
                dateFormat = (date.getMonth() + 1).toString();
                break;
            case 'MM':
                dateFormat = this.EnsureLength((date.getMonth() + 1).toString());
                break;
            case 'MMM':
                dateFormat = this.Application.Globalization.GetMonthNameShort(date.getMonth(), culture);
                break;
            case 'MMMM':
                dateFormat = this.Application.Globalization.GetMonthName(date.getMonth(), culture);
                break;
            case 'D':
            case 'd':
                dateFormat = (date.getDate()).toString();
            case 'DD':
            case 'dd':
                dateFormat = this.EnsureLength((date.getDate()).toString());
                break;
            case 'DDD':
            case 'ddd':
                dateFormat = this.Application.Globalization.GetDayOfWeekNameShort(date.getDay(), culture);
                break;
            case 'DDDD':
            case 'dddd':
                dateFormat = this.Application.Globalization.GetDayOfWeekName(date.getDay(), culture);
                break;
            case 'h':
                let hours = date.getHours();
                if (hours > 12)
                    hours = hours - 12;
                dateFormat = hours.toString();
                break;
            case 'hh':
                let hoursDouble = date.getHours();
                if (hoursDouble > 12)
                    hoursDouble = hoursDouble - 12;
                dateFormat = this.EnsureLength(hoursDouble.toString());
                break;
            case 'H':
                dateFormat = date.getHours().toString();
                break;
            case 'HH':
                dateFormat = this.EnsureLength(date.getHours().toString());
                break;
            case 'm':
                dateFormat = date.getMinutes().toString();
                break;
            case 'mm':
                dateFormat = this.EnsureLength(date.getMinutes().toString());
                break;
            case 's':
                dateFormat = date.getSeconds().toString();
            case 'ss':
                dateFormat = this.EnsureLength(date.getSeconds().toString());
                break;
            case 'f':
            case 'F':
                dateFormat = this.EnsureLengthMax(date.getMilliseconds().toString(), 1);
                break;
            case 'ff':
            case 'FF':
                dateFormat = this.EnsureLengthMax(date.getMilliseconds().toString(), 2);
                break;
            case 'fff':
            case 'FFF':
                dateFormat = this.EnsureLengthMax(date.getMilliseconds().toString(), 3);
                break;
        }
        return (dateFormat);
    }
    EnsureLength(data, length = 2) {
        while (data.length < length)
            data = '0' + data;
        return (data);
    }
    EnsureLengthMax(data, length) {
        if (data.length > length)
            return (data.substring(0, length));
        return (data);
    }
    FormatNumber(value, format, culture) {
        const formatTokens = this.Application.Parser.ParseFormat(format);
        if (formatTokens.length == 0)
            return (value.toString());
        const formatTokenType = formatTokens[0];
        if ((formatTokenType === 'N') || (formatTokenType === 'n'))
            return (this.FormatNumberNumeric(value, formatTokens, culture));
        if ((formatTokenType === 'P') || (formatTokenType === 'p'))
            return (this.FormatNumberPercentage(value, formatTokens, culture));
        if ((formatTokenType === 'D') || (formatTokenType === 'd'))
            return (this.FormatNumberDecimal(value, formatTokens, culture));
        if ((formatTokenType === 'T') || (formatTokenType === 't'))
            return (this.FormatNumberTimespan(value, formatTokens, culture));
        if ((formatTokenType === 'S') || (formatTokenType === 's'))
            return (this.FormatNumberSize(value, formatTokens, culture));
        return (value.toString());
    }
    FormatNumberNumeric(value, formatTokens, culture) {
        const decimals = this.GetFormatTokenNumber(formatTokens, 1, 2);
        const isNegative = value < 0;
        const valueAbsolute = Math.abs(value);
        const valueDecimals = valueAbsolute.toFixed(decimals);
        const valueDecimalsWithCulture = this.GetNumberFormattedWithCulture(valueDecimals, culture);
        return ((isNegative ? '-' : '') + valueDecimalsWithCulture);
    }
    FormatNumberPercentage(value, formatTokens, culture) {
        const decimals = this.GetFormatTokenNumber(formatTokens, 1, 2);
        const isNegative = value < 0;
        const valueAbsolute = Math.abs(value);
        const valueDecimals = (valueAbsolute * 100).toFixed(decimals);
        const valueDecimalsWithCulture = this.GetNumberFormattedWithCulture(valueDecimals, culture);
        return ((isNegative ? '-' : '') + valueDecimalsWithCulture + ' %');
    }
    FormatNumberDecimal(value, formatTokens, culture) {
        const decimals = this.GetFormatTokenNumber(formatTokens, 1, 1);
        const isNegative = value < 0;
        const valueAbsolute = Math.abs(value);
        const valueDecimals = this.EnsureLength(valueAbsolute.toFixed(0), decimals);
        const valueDecimalsWithCulture = this.GetNumberFormattedWithCulture(valueDecimals, culture);
        return ((isNegative ? '-' : '') + valueDecimalsWithCulture);
    }
    FormatNumberTimespan(value, formatTokens, culture) {
        if (value === 0)
            return ('');
        if (value < 0)
            return (((formatTokens != null) && (formatTokens.length > 1)) ? formatTokens[1] : '');
        if (value < 1000)
            return (value.toString() + 'ms');
        if (value < (1000 * 60)) {
            const seconds = Math.floor(value / 1000);
            return (seconds.toString() + 's');
        }
        if (value < (1000 * 60 * 60)) {
            const minutes = Math.floor(value / (1000 * 60));
            return (minutes.toString() + 'm' + this.FormatNumberTimespan(value - (minutes * 1000 * 60), null, culture));
        }
        const hours = Math.floor(value / (1000 * 60 * 60));
        return (hours.toString() + 'h' + this.FormatNumberTimespan(value - (hours * 1000 * 60 * 60), null, culture));
    }
    FormatNumberSize(value, formatTokens, culture) {
        let type = 0;
        let valueSize = value;
        while (valueSize > 1000) {
            valueSize = valueSize / 1000;
            type++;
        }
        return (valueSize.toString() + this.Application.Globalization.GetNumberSizeTypeName(type, culture));
    }
    GetNumberFormattedWithCulture(value, culture) {
        const delimiterDecimal = this.Application.Globalization.GetDelimiterDecimal(culture);
        const delimiterThousandes = this.Application.Globalization.GetDelimiterThousands(culture);
        if (delimiterDecimal !== '.')
            value = value.replace('.', delimiterDecimal);
        let index = value.indexOf(delimiterDecimal);
        if (index === -1)
            index = value.length;
        for (let i = index - 3; i > 0; i = i - 3)
            value = value.substring(0, i) + delimiterThousandes + value.substring(i);
        return (value);
    }
    GetFormatTokenNumber(formatTokens, index, valueDefault) {
        if (index >= formatTokens.length)
            return (valueDefault);
        const token = formatTokens[index];
        return (this.Application.Parser.ParseNumber(token, valueDefault));
    }
}
//# sourceMappingURL=DrapoFormatter.js.map