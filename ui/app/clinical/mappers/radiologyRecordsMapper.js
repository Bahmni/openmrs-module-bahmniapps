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
            return Date.parse(record2.obsDatetime) !==  Date.parse(record1.obsDatetime)?
                Date.parse(record2.obsDatetime) -  Date.parse(record1.obsDatetime):
                record2.id - record1.id;
        };
        records = records.sort(sortById);
        records.map(addRecordToResult);
        return result;
    };

};
