'use strict';

Bahmni.Dhis.ReportParams = (function () {
    var ReportParams = function (startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    };

    ReportParams.prototype = {
        json: function () {
            return {"params": [
                {"name": "startDate", "value": Bahmni.Common.Util.DateUtil.getDateWithoutTime(this.startDate)},
                {"name": "endDate", "value": Bahmni.Common.Util.DateUtil.getDateWithoutTime(this.endDate)}
            ]};
        }
    };

    ReportParams.default = function () {
        return new ReportParams(new Date(), new Date());
    };

    return ReportParams;
})();

