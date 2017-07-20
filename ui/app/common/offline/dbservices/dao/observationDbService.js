'use strict';

angular.module('bahmni.common.offline')
    .service('observationDbService', function () {
        var insertObservationsData = function (db, patientUuid, visitUuid, observationsDataList) {
            observationsDataList = JSON.parse(JSON.stringify(observationsDataList));
            var observationTable = db.getSchema().table('observation');
            var queries = [];
            _.each(observationsDataList, function (observationData) {
                if (observationData.groupMembers.length) {
                    var row = observationTable.createRow({
                        uuid: observationData.uuid,
                        patientUuid: patientUuid,
                        encounterUuid: observationData.encounterUuid,
                        visitUuid: visitUuid,
                        conceptName: observationData.concept.name,
                        observationJson: observationData
                    });
                    queries.push(db.insertOrReplace().into(observationTable).values([row]));
                } else {
                    var obsToBeRemoved = removeObservationByObservationUuid(db, observationData.uuid);
                    queries.push(obsToBeRemoved);
                }
            });
            var tx = db.createTransaction();
            return tx.exec(queries);
        };

        var getObservationsFor = function (db, params) {
            var obs = db.getSchema().table('observation');
            return db.select(obs.observationJson.as('observation'))
                .from(obs)
                .where(
                    lf.op.and(obs.patientUuid.eq(params.patientUuid), obs.conceptName.in(params.conceptNames), lf.op.or(obs.visitUuid.in(params.visitUuids), obs.visitUuid.eq(null)))
                )
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        var getObservationsForVisit = function (db, visitUuid) {
            var obs = db.getSchema().table('observation');
            return db.select(obs.observationJson.as('observation'))
                .from(obs)
                .where(obs.visitUuid.eq(visitUuid))
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        var removeObservationByObservationUuid = function (db, observationUuid) {
            var obs = db.getSchema().table('observation');
            return db.delete()
                .from(obs)
                .where(obs.uuid.eq(observationUuid));
        };

        return {
            getObservationsFor: getObservationsFor,
            insertObservationsData: insertObservationsData,
            getObservationsForVisit: getObservationsForVisit
        };
    });
