'use strict';

angular.module('bahmni.common.offline')
    .service('labOrderResultsDbService', function () {
        var insertLabOrderResults = function (db, patientUuid, labOrderResults) {
            var labOrderResultsJson = JSON.parse(JSON.stringify(labOrderResults));
            var labOrderResultTable = db.getSchema().table('lab_order_result');
            var row = labOrderResultTable.createRow({
                patientUuid: patientUuid,
                labOrderResultsJson: labOrderResultsJson
            });

            return db.insertOrReplace().into(labOrderResultTable).values([row]).exec().then(function () {
                return {
                    patientUuid: patientUuid,
                    labOrderResults: labOrderResultsJson
                };
            });
        };

        var getLabOrderResultsForPatient = function (db, params) {
            var labOrderResultTable = db.getSchema().table('lab_order_result');
            return db.select(labOrderResultTable.labOrderResultsJson.as('results'))
                .from(labOrderResultTable)
                .where(labOrderResultTable.patientUuid.eq(params.patientUuid))
                .exec()
                .then(function (results) {
                    return results[0] ? results[0] : { results: {"results": [], "tabularResult": {"dates": [], "orders": [], "values": []}}};
                });
        };

        return {
            getLabOrderResultsForPatient: getLabOrderResultsForPatient,
            insertLabOrderResults: insertLabOrderResults
        };
    });
