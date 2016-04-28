'use strict';

angular.module('bahmni.common.offline')
    .service('encounterDbService', function () {

        var insertEncounterData = function(db, encounterData) {
            encounterData = JSON.parse(JSON.stringify(encounterData));
            var patientUuid = encounterData.patientUuid;
            var uuid = encounterData.encounterUuid;
            var encounterDateTime = encounterData.encounterDateTime;
            var encounterTable = db.getSchema().table('encounter');

            var row = encounterTable.createRow({
                uuid: uuid,
                patientUuid: patientUuid,
                encounterDateTime: new Date(encounterDateTime),
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

        var findActiveEncounter = function(db, params, encounterSessionDurationInMinutes) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var p = db.getSchema().table('encounter');
            return db.select(p.encounterJson.as('encounter'))
                .from(p)
                .where(lf.op.and(
                    p.patientUuid.eq(params.patientUuid), p.encounterDateTime.gte(DateUtil.addMinutes(new Date(), -1 * encounterSessionDurationInMinutes)) ))
                .exec()
                .then(function (result) {
                    return result;
                });
        };

        return {
            insertEncounterData: insertEncounterData,
            getEncountersByPatientUuid: getEncountersByPatientUuid,
            findActiveEncounter: findActiveEncounter
        }
    });
