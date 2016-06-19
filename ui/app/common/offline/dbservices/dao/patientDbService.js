'use strict';

angular.module('bahmni.common.offline')
    .service('patientDbService', ['chromeEncryptionService', function (chromeEncryptionService) {

        var getPatientByUuid = function (db, uuid) {
            var p = db.getSchema().table('patient');
            return db.select(p.patientJson.as('patient'))
                .from(p)
                .where(p.uuid.eq(uuid)).exec()
                .then(function (results) {
                    return results.length ? {"patient": chromeEncryptionService.decrypt(results[0].patient)} : undefined;
                });
        };

        var insertPatientData = function (db, patientData) {
            var patient = patientData.patient;
            var patientTable, patientIdentifier, person;
            patientTable = db.getSchema().table('patient');
            person = patient.person;
            var personName = person.names[0];
            patientIdentifier = patient.identifiers[0].identifier;
            var row = patientTable.createRow({
                'identifier': patientIdentifier,
                'uuid': patient.uuid,
                'givenName': personName.givenName,
                'middleName': personName.middleName,
                'familyName': personName.familyName,
                'gender': person.gender,
                'birthdate': new Date(person.birthdate),
                'dateCreated': new Date(patient.person.auditInfo.dateCreated),
                'patientJson': chromeEncryptionService.encrypt(JSON.stringify(patient))
            });
            return db.insertOrReplace().into(patientTable).values([row]).exec().then(function () {
                return patient.uuid;
            });
        };

        return {
            getPatientByUuid: getPatientByUuid,
            insertPatientData: insertPatientData
        }
    }]);