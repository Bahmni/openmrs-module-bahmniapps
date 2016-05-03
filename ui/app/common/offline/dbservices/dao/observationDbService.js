'use strict';

angular.module('bahmni.common.offline')
    .service('observationDbService', function () {

        var insertObservationData = function (db, patientUuid, visitUuid, observationData) {
            observationData = JSON.parse(JSON.stringify(observationData));
            var uuid = observationData.uuid;
            var patientUuid = patientUuid;
            var encounterUuid = observationData.encounterUuid;
            var visitUuid = visitUuid;
            var conceptName = observationData.concept.name;
            var observationTable = db.getSchema().table('observation');

            var row = observationTable.createRow({
                uuid: uuid,
                patientUuid: patientUuid,
                encounterUuid: encounterUuid,
                visitUuid: visitUuid,
                conceptName: conceptName,
                observationJson: observationData
            });
            return db.insertOrReplace().into(observationTable).values([row]).exec().then(function () {
                return observationData;
            });
        };

        var getObservationsFor = function (db, params) {
            var obs = db.getSchema().table('observation');
            return db.select(obs.observationJson.as('observation'))
                .from(obs)
                .where(
                    lf.op.and(obs.patientUuid.eq(params.patientUuid), obs.conceptName.in(params.conceptNames), obs.visitUuid.in(params.visitUuids))
                )
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        return {
            insertObservationData: insertObservationData,
            getObservationsFor: getObservationsFor
        }
    });