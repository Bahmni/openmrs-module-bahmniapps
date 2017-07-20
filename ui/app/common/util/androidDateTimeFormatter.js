'use strict';

Bahmni.Common.Util.DateTimeFormatter = {

    getDateWithoutTime: function (date) {
        return date ? moment(date).format("MM-DD-YYYY") : null;
    }
};
