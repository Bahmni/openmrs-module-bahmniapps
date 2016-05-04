'use strict';

angular.module('bahmni.common.offline')
    .service('visitDbService', [function () {

        var insertVisitData = function (db, visit) {
            var visitTable = db.getSchema().table('visit');
            var row = visitTable.createRow({
                'uuid': visit.uuid,
                'patientUuid': visit.patient.uuid,
                'startDatetime': new Date(visit.startDatetime),
                'visitJson': visit
            });
            return db.insertOrReplace().into(visitTable).values([row]).exec().then(function () {
                return visit;
            });
        };

        var getVisitByUuid = function (db, uuid) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.value)
                .from(visitTable)
                .where(visitTable.uuid.eq(uuid))
                .exec()
                .then(function (visit) {
                    return visit[0];
                });

        };

        var getVisitUuidsByPatientUuid = function (db, patientUuid, numberOfVisits) {
            var visitTable = db.getSchema().table('visit');

            return db.select(visitTable.uuid)
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
            getVisitUuidsByPatientUuid: getVisitUuidsByPatientUuid
        }

    }]);