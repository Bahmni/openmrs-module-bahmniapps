Bahmni.Clinical.RadiologyRecordsMapper = function () {
    var result = [];

    var isRecordVisitSame = function (record) {
        return result.filter(function (resultRecord) {
            if (resultRecord.visitUuid == record.visitUuid) {
                return true;
            }
        }).length == 0 ? false : true;
    };

    var isRecordConceptInResult = function (record) {
        return result.filter(function (resultRecord) {
            if (resultRecord.concept == record.concept.uuid) {
                return true;
            }
            return false;
        }).length == 0 ? false : true;
    };


    var addRecordToResult = function (record) {
        if (isRecordConceptInResult(record) && isRecordVisitSame(record)) {
            var resultRecord = result.filter(function (resultRecord) {
                if (resultRecord.concept == record.concept.uuid && resultRecord.visitUuid == record.visitUuid) {
                    return true;
                }
                else{
                    return false;
                }
            });
            var index = result.indexOf(resultRecord[0]);
            result[index]["records"].push(record);
        }
        else {
            result.push({"name": record.concept.name, "date": record.title.split(",")[1], "records": [record], "concept": record.concept.uuid, "visitUuid": record.visitUuid});
        }
        return record;
    };

    this.mapToDisplayItems = function (records) {
        var dateCompare = function (record1, record2) {
            return record1.obsDatetime > record2.obsDatetime ? -1: 1;
        };
        records = records.sort(dateCompare)
        records.map(addRecordToResult);
        return result;
    };


}
;