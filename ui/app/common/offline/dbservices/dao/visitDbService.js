'use strict';

angular.module('bahmni.common.offline')
    .service('visitDbService', ['chromeEncryptionService', function (chromeEncryptionService) {

        var insertVisitData = function (db, visit) {
            var visitTable = db.getSchema().table('visit');
            var row = visitTable.createRow({
                'uuid': visit.uuid,
                'patientUuid': visit.patient.uuid,
                'startDatetime': new Date(visit.startDatetime),
                'visitJson': chromeEncryptionService.encrypt(JSON.stringify(visit))
            });
            return db.insertOrReplace().into(visitTable).values([row]).exec().then(function () {
                return visit;
            });
        };

        var getVisitByUuid = function (db, uuid) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.visitJson.as('visit'))
                .from(visitTable)
                .where(visitTable.uuid.eq(uuid))
                .exec()
                .then(function (results) {
                    return results.length ? chromeEncryptionService.decrypt(results[0].visit) : undefined;
                });

        };

        var getVisitsByPatientUuid = function (db, patientUuid, numberOfVisits) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.uuid, visitTable.startDatetime)
                .from(visitTable)
                .where(visitTable.patientUuid.eq(patientUuid))
                .orderBy(visitTable.startDatetime, lf.Order.DESC)
                .limit(numberOfVisits)
                .exec()
                .then(function (visitUuids) {
                    return visitUuids;
                });
        };

        return {
            insertVisitData: insertVisitData,
            getVisitByUuid: getVisitByUuid,
            getVisitsByPatientUuid: getVisitsByPatientUuid
        }

    }]);