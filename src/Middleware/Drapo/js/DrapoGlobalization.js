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
class DrapoGlobalization {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._culture = null;
        this._resourceDayOfWeekNameShort = [];
        this._resourceDayOfWeekName = [];
        this._resourceMonthNameShort = [];
        this._resourceMonthName = [];
        this._resourceDateFormat = [];
        this._resourceNumberSizeType = [];
        this._application = application;
        this.Initialize();
    }
    Initialize() {
        this.InitializeResource(this._resourceDayOfWeekNameShort, 'en', 'Sun_Mon_Tue_Wed_Thu_Fri_Sat');
        this.InitializeResource(this._resourceDayOfWeekName, 'en', 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday');
        this.InitializeResource(this._resourceMonthNameShort, 'en', 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec');
        this.InitializeResource(this._resourceMonthName, 'en', 'January_February_March_April_May_June_July_August_September_October_November_December');
        this.InitializeResource(this._resourceDayOfWeekNameShort, 'pt', 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb');
        this.InitializeResource(this._resourceDayOfWeekName, 'pt', 'Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado');
        this.InitializeResource(this._resourceMonthNameShort, 'pt', 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez');
        this.InitializeResource(this._resourceMonthName, 'pt', 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro');
        this.InitializeResource(this._resourceDayOfWeekNameShort, 'es', 'dom_lun_mar_mié_jue_vie_sáb');
        this.InitializeResource(this._resourceDayOfWeekName, 'es', 'domingo_lunes_martes_miércoles_jueves_viernes_sábado');
        this.InitializeResource(this._resourceMonthNameShort, 'es', 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic');
        this.InitializeResource(this._resourceMonthName, 'es', 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre');
        this.InitializeResourceDictionary(this._resourceDateFormat, 'en', [['d', 'MM/dd/yyyy'], ['D', 'dddd, dd MMMM yyyy'], ['t', 'HH:mm'], ['T', 'HH:mm:ss'], ['g', 'MM/dd/yyyy HH:mm'], ['G', 'MM/dd/yyyy HH:mm:ss'], ['r', 'ddd, dd MMM yyyy HH:mm:ss']]);
        this.InitializeResourceDictionary(this._resourceDateFormat, 'pt', [['d', 'dd/MM/yyyy'], ['D', 'dddd, dd MMMM yyyy'], ['t', 'HH:mm'], ['T', 'HH:mm:ss'], ['g', 'dd/MM/yyyy HH:mm'], ['G', 'dd/MM/yyyy HH:mm:ss'], ['r', 'ddd, dd MMM yyyy HH:mm:ss']]);
        this.InitializeResourceDictionary(this._resourceDateFormat, 'es', [['d', 'dd/MM/yyyy'], ['D', 'dddd, dd MMMM yyyy'], ['t', 'HH:mm'], ['T', 'HH:mm:ss'], ['g', 'dd/MM/yyyy HH:mm'], ['G', 'dd/MM/yyyy HH:mm:ss'], ['r', 'ddd, dd MMM yyyy HH:mm:ss']]);
        this.InitializeResource(this._resourceNumberSizeType, 'pt', '_mil_mi_bi_tri');
        this.InitializeResource(this._resourceNumberSizeType, 'en', '_K_M_B_T');
        this.InitializeResource(this._resourceNumberSizeType, 'es', '_K_M_B_T');
    }
    InitializeResource(resource, culture, values) {
        resource.push([culture, values.split('_')]);
    }
    InitializeResourceDictionary(resource, culture, values) {
        resource.push([culture, values]);
    }
    GetLanguage() {
        if (navigator.language != null)
            return (navigator.language);
        return (navigator.userLanguage);
    }
    GetCultureNeutral(culture) {
        const index = culture.indexOf('-');
        if (index < 0)
            return (culture);
        return (culture.substring(0, index));
    }
    GetCultureCookie() {
        const cookieData = this.Application.CookieHandler.RetrieveData();
        if (cookieData == null)
            return ('');
        return (cookieData.culture);
    }
    GetCultureLanguage() {
        const language = this.GetLanguage();
        if (language == null)
            return (null);
        const cultureNeutral = this.GetCultureNeutral(language);
        return (cultureNeutral);
    }
    ReloadCulture() {
        return __awaiter(this, void 0, void 0, function* () {
            const culture = this._culture;
            this._culture = null;
            if (culture === this.GetCulture())
                return (false);
            return (true);
        });
    }
    GetCulture() {
        if (this._culture !== null)
            return (this._culture);
        const cultureCookie = this.GetCultureCookie();
        if ((cultureCookie != null) && (cultureCookie != ''))
            return (this._culture = cultureCookie);
        const cultureLanguage = this.GetCultureLanguage();
        if ((cultureLanguage != null) && (cultureLanguage != ''))
            return (this._culture = cultureLanguage);
        this._culture = 'en';
        return (this._culture);
    }
    GetDelimiterDecimal(culture) {
        if (culture == null)
            culture = this.GetCulture();
        if (culture === 'en')
            return ('.');
        return (',');
    }
    GetDelimiterThousands(culture) {
        if (culture == null)
            culture = this.GetCulture();
        if (culture === 'en')
            return (',');
        return ('.');
    }
    GetDayOfWeekNameShort(day, culture) {
        if (culture == null)
            culture = this.GetCulture();
        return (this.GetResourceValue(this._resourceDayOfWeekNameShort, day, culture));
    }
    GetDayOfWeekName(day, culture) {
        if (culture == null)
            culture = this.GetCulture();
        return (this.GetResourceValue(this._resourceDayOfWeekName, day, culture));
    }
    GetMonthNameShort(day, culture) {
        if (culture == null)
            culture = this.GetCulture();
        return (this.GetResourceValue(this._resourceMonthNameShort, day, culture));
    }
    GetMonthName(day, culture) {
        if (culture == null)
            culture = this.GetCulture();
        return (this.GetResourceValue(this._resourceMonthName, day, culture));
    }
    GetResourceValue(resource, index, culture) {
        const resourceCulture = this.GetResourceCulture(resource, culture);
        if (resourceCulture === null)
            return ('');
        if (resourceCulture.length < index)
            return ('');
        return (resourceCulture[index]);
    }
    GetResourceCulture(resource, culture) {
        if (culture == null)
            culture = this.GetCulture();
        for (let i = 0; i < resource.length; i++) {
            const resourceEntry = resource[i];
            if (resourceEntry[0] === culture)
                return (resourceEntry[1]);
        }
        return (null);
    }
    GetDateFormat(dateFormatType, culture) {
        const dateFormatDictionary = this.GetResourceCultureDictionary(this._resourceDateFormat, culture);
        if (dateFormatDictionary == null)
            return ('');
        return (this.GetResourceValueDictionary(dateFormatDictionary, dateFormatType));
    }
    GetDateFormatsRegex(culture = null) {
        if (culture == null)
            culture = this.GetCulture();
        const formats = [this.GetDateFormat('d', culture)];
        let formatsRegex = '';
        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            const formatRegex = this.GetDateFormatRegex(format);
            if (formatsRegex.length > 0)
                formatsRegex += '|';
            formatsRegex += '(' + formatRegex + ')';
        }
        return ('^' + formatsRegex + '$');
    }
    GetDateFormatRegex(format) {
        format = format.replace(/\//g, '\\/');
        format = this.ReplaceDataFormatRegex(format, 'yyyy', 'year', '(\\d{4})');
        format = this.ReplaceDataFormatRegex(format, 'MM', 'month', '(\\d{1,2})');
        format = this.ReplaceDataFormatRegex(format, 'dd', 'day', '(\\d{1,2})');
        return (format);
    }
    GetDateFormatsRegularExpressions(culture = null) {
        if (culture == null)
            culture = this.GetCulture();
        const regularExpressions = [];
        if ((culture === 'pt') || (culture === 'es')) {
            const regularExpression = new DrapoRegularExpression();
            regularExpression.Expression = '^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})$';
            regularExpression.CreateItem('(\\d{1,2})', 'day');
            regularExpression.CreateItem('\\/');
            regularExpression.CreateItem('(\\d{1,2})', 'month');
            regularExpression.CreateItem('\\/');
            regularExpression.CreateItem('(\\d{4})', 'year');
            regularExpressions.push(regularExpression);
        }
        else if (culture === 'en') {
            const regularExpression = new DrapoRegularExpression();
            regularExpression.Expression = '^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})$';
            regularExpression.CreateItem('(\\d{1,2})', 'month');
            regularExpression.CreateItem('\\/');
            regularExpression.CreateItem('(\\d{1,2})', 'day');
            regularExpression.CreateItem('\\/');
            regularExpression.CreateItem('(\\d{4})', 'year');
            regularExpressions.push(regularExpression);
        }
        return (regularExpressions);
    }
    ReplaceDataFormatRegex(format, symbol, name, expression) {
        const regex = '(?<' + name + '>' + expression + ')';
        format = format.replace(symbol, regex);
        return (format);
    }
    GetResourceValueDictionary(dictonary, dateFormatType) {
        for (let i = 0; i < dictonary.length; i++) {
            const resourceEntry = dictonary[i];
            if (resourceEntry[0] === dateFormatType)
                return (resourceEntry[1]);
        }
        return ('');
    }
    GetResourceCultureDictionary(resource, culture) {
        if (culture == null)
            culture = this.GetCulture();
        for (let i = 0; i < resource.length; i++) {
            const resourceEntry = resource[i];
            if (resourceEntry[0] == culture)
                return (resourceEntry[1]);
        }
        return (null);
    }
    GetNumberSizeTypeName(type, culture = null) {
        if (culture == null)
            culture = this.GetCulture();
        return (this.GetResourceValue(this._resourceNumberSizeType, type, culture));
    }
}
//# sourceMappingURL=DrapoGlobalization.js.map