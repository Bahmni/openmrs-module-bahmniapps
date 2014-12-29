'use strict';

Bahmni.Common.Domain.RetrospectiveEntry = function() {
    var _encounterDate;
    var _isRetrospective;
    var self = this;

    Object.defineProperty(this, 'encounterDate', {
        get: function () {
            return self._encounterDate;
        },
        set: function (value) {
            if (value) {
                self._encounterDate = value;
                self._isRetrospective = value < Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());
            }
        }
    });

    Object.defineProperty(this, 'isRetrospective', {
        get: function () {
            return self._isRetrospective;
        }
    });

}

Bahmni.Common.Domain.RetrospectiveEntry.createFrom = function (retrospectiveEncounterDateCookie) {
    var obj = new Bahmni.Common.Domain.RetrospectiveEntry();
    obj.encounterDate = retrospectiveEncounterDateCookie;
    return obj;
};


