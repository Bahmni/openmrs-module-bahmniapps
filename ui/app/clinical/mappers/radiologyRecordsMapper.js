Bahmni.Clinical.RadiologyRecordsMapper = function () {
    var result = [];

    var addRecordToResult = function (record) {
        var matchRecordIndex = null;
        result.some(function (resultRecord, index) {
            if (resultRecord.concept == record.concept.uuid) {
                return matchRecordIndex = index;
            }
            return false;
        });
        if (matchRecordIndex!=null) {
            result[matchRecordIndex]["records"].push(record);
        }
        else {
            result.push({"name": record.concept.name, "date": record.obsDatetime, "records": [record], "concept": record.concept.uuid, "visitUuid": record.visitUuid});
        }
        return record;
    };

    this.mapToDisplayItems = function (records) {
        var sortById = function (record1, record2) {
            return record1.id > record2.id ? -1: 1;
        };
        records = records.sort(sortById);
        records.map(addRecordToResult);
        return result;
    };

};
