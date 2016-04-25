'use strict';

angular.module('bahmni.common.offline')
    .service('encounterDbService', function () {

        var insertEncounterData = function(db, encounterData) {
            var patientUuid = encounterData.patientUuid;
            var uuid = encounterData.encounterUuid;
            var encounterTable = db.getSchema().table('encounter');

            var row = encounterTable.createRow({
                uuid: uuid,
                patientUuid: patientUuid,
                encounterJson: encounterData
            });
            return db.insertOrReplace().into(encounterTable).values([row]).exec().then(function () {
                return patientUuid;
            });
        };

        var getEncountersByPatientUuid = function (db, patientUuid) {
            var p = db.getSchema().table('encounter');
            return db.select(p.encounterJson.as('encounter'))
                .from(p)
                .where(p.patientUuid.eq(patientUuid)).exec()
                .then(function (results) {
                    return results;
                });
        };

        return {
            insertEncounterData: insertEncounterData,
            getEncountersByPatientUuid: getEncountersByPatientUuid
        }
    });
