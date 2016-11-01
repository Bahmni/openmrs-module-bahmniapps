'use strict';

Bahmni.Clinical.RecordsMapper = function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var sortByDateTimeOrId = function (record1, record2) {
        return record2.imageObservation.observationDateTime !== record1.imageObservation.observationDateTime ?
            DateUtil.parse(record2.imageObservation.observationDateTime) - DateUtil.parse(record1.imageObservation.observationDateTime) :
            record2.id - record1.id;
    };

    this.map = function (records) {
        records = records.sort(sortByDateTimeOrId);
        return Bahmni.Common.Util.ArrayUtil.groupByPreservingOrder(records, function (record) { return record.concept.name; }, 'conceptName', 'records');
    };
};
