'use strict';

angular.module('bahmni.common.offline')
    .service('encounterDbService', function () {
        var insertEncounterData = function (db, encounterData) {
            encounterData = JSON.parse(JSON.stringify(encounterData));
            var patientUuid = encounterData.patientUuid;
            var uuid = encounterData.encounterUuid;
            var encounterDateTime = encounterData.encounterDateTime;
            var encounterType = encounterData.encounterType ? encounterData.encounterType.toUpperCase() : null;
            var providerUuid = encounterData.providers[0].uuid;
            var visitUuid = encounterData.visitUuid;
            var encounterTable = db.getSchema().table('encounter');

            var row = encounterTable.createRow({
                uuid: uuid,
                patientUuid: patientUuid,
                encounterDateTime: new Date(encounterDateTime),
                encounterType: encounterType,
                providerUuid: providerUuid,
                visitUuid: visitUuid,
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

        var findActiveEncounter = function (db, params, encounterSessionDurationInMinutes) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var encounterType = params.encounterType ? params.encounterType.toUpperCase() : null;
            var p = db.getSchema().table('encounter');
            return db.select(p.encounterJson.as('encounter'))
                .from(p)
                .where(lf.op.and(
                    p.patientUuid.eq(params.patientUuid), p.providerUuid.eq(params.providerUuid), p.encounterType.match(encounterType), p.encounterDateTime.gte(DateUtil.addMinutes(new Date(), -1 * encounterSessionDurationInMinutes))))
                .exec()
                .then(function (result) {
                    return angular.copy(result[0]);
                });
        };

        var getEncounterByEncounterUuid = function (db, encounterUuid) {
            var en = db.getSchema().table('encounter');
            return db.select(en.encounterJson.as('encounter'))
                .from(en)
                .where(en.uuid.eq(encounterUuid)).exec()
                .then(function (result) {
                    return angular.copy(result[0]);
                });
        };

        var getEncountersByVisits = function (db, params) {
            var encounter = db.getSchema().table('encounter');
            return db.select(encounter.encounterJson.as('encounter'))
                .from(encounter)
                .where(
                    lf.op.and(encounter.patientUuid.eq(params.patientUuid), encounter.visitUuid.in(params.visitUuids)))
                .orderBy(encounter.encounterDateTime, lf.Order.DESC)
                .exec()
                .then(function (results) {
                    return results;
                });
        };

        return {
            insertEncounterData: insertEncounterData,
            getEncountersByPatientUuid: getEncountersByPatientUuid,
            findActiveEncounter: findActiveEncounter,
            getEncounterByEncounterUuid: getEncounterByEncounterUuid,
            getEncountersByVisits: getEncountersByVisits
        };
    });
