'use strict';

angular.module('bahmni.common.offline')
    .service('observationDbService', ['chromeEncryptionService', function (chromeEncryptionService) {

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
                        observationJson: chromeEncryptionService.encrypt(JSON.stringify(observationData)).toString()
                    });
                    queries.push(db.insertOrReplace().into(observationTable).values([row]));
                }
                else {
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
                    var decryptedResults = [];
                    angular.forEach(results, function(result){
                        decryptedResults.push(chromeEncryptionService.decrypt(result.observation))
                    });
                    return decryptedResults;
                });
        };

        var removeObservationByObservationUuid = function(db, observationUuid){
            var obs = db.getSchema().table('observation');
            return db.delete()
                .from(obs)
                .where(obs.uuid.eq(observationUuid));
        };

        return {
            getObservationsFor: getObservationsFor,
            insertObservationsData: insertObservationsData
        }
    }]);